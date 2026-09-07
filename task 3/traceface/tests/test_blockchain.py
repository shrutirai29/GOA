"""
Tests for Blockchain Registration and Verification
These tests work with the local blockchain mode (mock/direct).
"""
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch
from dataclasses import dataclass

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.evidence.models import EvidencePackage
from app.evidence.hasher import EvidenceHasher
from app.blockchain.verifier import EvidenceVerifier


def make_test_package(**overrides) -> EvidencePackage:
    """Create a deterministic test package."""
    defaults = dict(
        case_id="test-blockchain-001",
        created_at="2026-09-01T12:00:00Z",
        input_image_sha256="a" * 64,
        selected_face_embedding_hash="b" * 64,
        search_provider="SerpAPI (Google Lens)",
        search_timestamp="2026-09-01T12:01:00Z",
        result_title="Test Blockchain Result",
        source_url="https://example.com/test",
        source_domain="example.com",
        result_image_sha256="c" * 64,
        similarity_score=0.914,
        metadata={"test": True},
    )
    defaults.update(overrides)
    return EvidencePackage(**defaults)


@dataclass
class MockReceipt:
    tx_hash: str = "0x" + "ab" * 32
    block_number: int = 42
    timestamp: str = "2026-09-01T12:00:00Z"
    from_address: str = "0x" + "11" * 20
    contract_address: str = "0x" + "22" * 20
    gas_used: int = 21000
    status: int = 1


def test_evidence_hash_is_deterministic():
    """Evidence hash must be deterministic across calls."""
    pkg = make_test_package()
    h1 = EvidenceHasher.hash_hex_0x(pkg)
    h2 = EvidenceHasher.hash_hex_0x(pkg)

    assert h1 == h2, "Evidence hash is not deterministic!"
    print(f"  ✓ Evidence hash is deterministic: {h1[:20]}...")
    return True


def test_evidence_hash_is_32_bytes():
    """Evidence hash must be exactly 32 bytes for bytes32."""
    pkg = make_test_package()
    h = EvidenceHasher.hash_bytes32(pkg)

    assert len(h) == 32, f"Hash is {len(h)} bytes, expected 32"
    print(f"  ✓ Hash is exactly 32 bytes")
    return True


def test_evidence_hash_hex_format():
    """0x-prefixed hex hash must be correctly formatted."""
    pkg = make_test_package()
    h = EvidenceHasher.hash_hex_0x(pkg)

    assert h.startswith("0x"), "Hash doesn't start with 0x"
    assert len(h) == 66, f"0x hash length is {len(h)}, expected 66"
    print(f"  ✓ 0x-prefixed hex hash format correct")
    return True


def test_verify_hash_with_matching():
    """verify_hash should return True for matching hash."""
    pkg = make_test_package()
    h = EvidenceHasher.hash_hex_0x(pkg)

    match, actual = EvidenceHasher.verify_hash(pkg, h)
    assert match, "verify_hash should return True for matching hash"
    print(f"  ✓ verify_hash matches correctly")
    return True


def test_verify_hash_with_mismatch():
    """verify_hash should return False for non-matching hash."""
    pkg = make_test_package()
    fake = "0x" + "ff" * 32

    match, actual = EvidenceHasher.verify_hash(pkg, fake)
    assert not match, "verify_hash should return False for non-matching hash"
    print(f"  ✓ verify_hash detects mismatch")
    return True


def test_tamper_detection_via_verifier():
    """Tampered package should fail verification."""
    pkg = make_test_package()
    hash_original = EvidenceHasher.hash_hex_0x(pkg)

    # Create a mock contract interface that "stores" the original hash
    mock_contract = MagicMock()
    mock_contract.is_connected = True

    # When verify is called with the original hash, return found
    def mock_verify(hash_hex):
        if hash_hex.lower() == hash_original.lower():
            return {
                "verified": True,
                "evidence_hash": hash_original,
                "case_id": pkg.case_id,
                "source_fingerprint": "test",
            }
        return {"verified": False, "message": "Not found"}

    mock_contract.verify.side_effect = mock_verify

    verifier = EvidenceVerifier(mock_contract)

    # Verify original — should pass
    result = verifier.verify_package(pkg)
    assert result["verified"], "Original package should verify"
    print(f"  ✓ Original package verifies correctly")

    # Tamper and verify — should fail
    tampered_result = verifier.demonstrate_tampering(pkg, field="source_url")
    assert not tampered_result["hashes_match"], "Tampered hash should not match original"
    print(f"  ✓ Tampered package detected correctly")
    return True


def test_mock_blockchain_registration():
    """Test evidence registration flow with mock blockchain."""
    pkg = make_test_package()
    evidence_hash_0x = EvidenceHasher.hash_hex_0x(pkg)

    # Simulate registration
    stored = {}

    def register(hash_hex, case_id, fingerprint):
        if hash_hex in stored:
            return False, None, "Already registered"
        stored[hash_hex] = {
            "case_id": case_id,
            "fingerprint": fingerprint,
        }
        return True, MockReceipt(), "Registered"

    success, receipt, msg = register(evidence_hash_0x, pkg.case_id, "test")
    assert success, f"Registration failed: {msg}"
    assert receipt.status == 1
    assert evidence_hash_0x in stored
    print(f"  ✓ Mock registration successful (block #{receipt.block_number})")

    # Verify
    if evidence_hash_0x in stored:
        record = stored[evidence_hash_0x]
        assert record["case_id"] == pkg.case_id
        print(f"  ✓ Mock verification successful")
    else:
        raise AssertionError("Hash not found after registration")

    return True


def test_multiple_registrations_unique():
    """Different evidence packages must produce different hashes."""
    pkg1 = make_test_package()
    pkg2 = make_test_package(case_id="test-blockchain-002")

    h1 = EvidenceHasher.hash_hex_0x(pkg1)
    h2 = EvidenceHasher.hash_hex_0x(pkg2)

    assert h1 != h2, "Different packages produced the same hash!"
    print(f"  ✓ Different packages produce different hashes")
    return True


def test_tamper_detection_similarity_score():
    """Changing similarity score must be detected."""
    pkg = make_test_package()
    original_hash = EvidenceHasher.hash_hex_0x(pkg)

    # Tamper with similarity_score
    tampered = make_test_package(similarity_score=0.5)
    tampered_hash = EvidenceHasher.hash_hex_0x(tampered)

    assert original_hash != tampered_hash, "Similarity tampering not detected!"
    print(f"  ✓ Similarity score tampering detected")
    return True


def test_tamper_detection_timestamp():
    """Changing timestamp must be detected."""
    pkg = make_test_package()
    original_hash = EvidenceHasher.hash_hex_0x(pkg)

    tampered = make_test_package(created_at="2026-09-02T00:00:00Z")
    tampered_hash = EvidenceHasher.hash_hex_0x(tampered)

    assert original_hash != tampered_hash, "Timestamp tampering not detected!"
    print(f"  ✓ Timestamp tampering detected")
    return True


def run_all_tests():
    """Run all blockchain tests."""
    tests = [
        test_evidence_hash_is_deterministic,
        test_evidence_hash_is_32_bytes,
        test_evidence_hash_hex_format,
        test_verify_hash_with_matching,
        test_verify_hash_with_mismatch,
        test_tamper_detection_via_verifier,
        test_mock_blockchain_registration,
        test_multiple_registrations_unique,
        test_tamper_detection_similarity_score,
        test_tamper_detection_timestamp,
    ]

    print("\n🧪 Blockchain Tests")
    print("=" * 50)

    passed = 0
    failed = 0

    for test_fn in tests:
        try:
            if test_fn():
                passed += 1
        except AssertionError as e:
            print(f"  ✗ FAILED: {test_fn.__name__}: {e}")
            failed += 1
        except Exception as e:
            print(f"  ✗ ERROR: {test_fn.__name__}: {e}")
            failed += 1

    print(f"\n{'=' * 50}")
    print(f"Results: {passed} passed, {failed} failed, {len(tests)} total")

    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
