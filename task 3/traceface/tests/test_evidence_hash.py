"""
Tests for Evidence Hashing and Canonicalization
"""
import hashlib
import json
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.evidence.models import EvidencePackage
from app.evidence.hasher import EvidenceHasher
from app.evidence.canonicalizer import canonical_json, canonical_bytes


def make_test_package(**overrides) -> EvidencePackage:
    """Create a test evidence package with deterministic values."""
    defaults = {
        "case_id": "test-case-001",
        "created_at": "2026-09-01T12:00:00Z",
        "input_image_sha256": "a" * 64,
        "selected_face_embedding_hash": "b" * 64,
        "search_provider": "SerpAPI (Google Lens)",
        "search_timestamp": "2026-09-01T12:01:00Z",
        "result_title": "Test Result",
        "source_url": "https://example.com/test",
        "source_domain": "example.com",
        "result_image_sha256": "c" * 64,
        "similarity_score": 0.914,
        "metadata": {"test": True},
    }
    defaults.update(overrides)
    return EvidencePackage(**defaults)


def test_same_package_same_hash():
    """The same evidence package must always produce the same hash."""
    pkg1 = make_test_package()
    pkg2 = make_test_package()

    hash1 = EvidenceHasher.hash_package(pkg1)
    hash2 = EvidenceHasher.hash_package(pkg2)

    assert hash1 == hash2, "Same package produced different hashes!"
    print(f"  ✓ Same package → same hash: {hash1[:16]}...")
    return True


def test_different_package_different_hash():
    """Different evidence packages must produce different hashes."""
    pkg1 = make_test_package()
    pkg2 = make_test_package(source_url="https://different.com/test")

    hash1 = EvidenceHasher.hash_package(pkg1)
    hash2 = EvidenceHasher.hash_package(pkg2)

    assert hash1 != hash2, "Different packages produced the same hash!"
    print(f"  ✓ Different package → different hash")
    return True


def test_tamper_detection_source_url():
    """Tampering with source_url must change the hash."""
    original = make_test_package()
    tampered = make_test_package(source_url="https://tampered.com/evil")

    h1 = EvidenceHasher.hash_package(original)
    h2 = EvidenceHasher.hash_package(tampered)

    assert h1 != h2, "Tampering with source_url did NOT change the hash!"
    print(f"  ✓ Tamper source_url → hash changed")
    return True


def test_tamper_detection_similarity_score():
    """Tampering with similarity_score must change the hash."""
    original = make_test_package()
    tampered = make_test_package(similarity_score=0.999)

    h1 = EvidenceHasher.hash_package(original)
    h2 = EvidenceHasher.hash_package(tampered)

    assert h1 != h2, "Tampering with similarity_score did NOT change the hash!"
    print(f"  ✓ Tamper similarity_score → hash changed")
    return True


def test_tamper_detection_metadata():
    """Tampering with metadata must change the hash."""
    original = make_test_package()
    tampered = make_test_package(metadata={"test": True, "tampered": True})

    h1 = EvidenceHasher.hash_package(original)
    h2 = EvidenceHasher.hash_package(tampered)

    assert h1 != h2, "Tampering with metadata did NOT change the hash!"
    print(f"  ✓ Tamper metadata → hash changed")
    return True


def test_canonical_json_deterministic():
    """Canonical JSON must be deterministic regardless of input dict order."""
    d1 = {"z": 1, "a": 2, "m": {"b": 3, "a": 1}}
    d2 = {"a": 2, "z": 1, "m": {"a": 1, "b": 3}}

    j1 = canonical_json(d1)
    j2 = canonical_json(d2)

    assert j1 == j2, "Canonical JSON is not deterministic!"
    print(f"  ✓ Canonical JSON is deterministic")
    return True


def test_canonical_json_sorted_keys():
    """Canonical JSON sorts keys alphabetically."""
    d = {"banana": 1, "apple": 2, "cherry": 3}
    j = canonical_json(d)

    # Keys should be in alphabetical order
    assert j.index('"apple"') < j.index('"banana"') < j.index('"cherry"'), \
        "Canonical JSON keys are not sorted!"
    print(f"  ✓ Canonical JSON sorts keys")
    return True


def test_hash_is_valid_sha256():
    """Evidence hash must be a valid SHA-256 hex string (64 chars)."""
    pkg = make_test_package()
    h = EvidenceHasher.hash_package(pkg)

    assert len(h) == 64, f"Hash length is {len(h)}, expected 64"
    assert all(c in "0123456789abcdef" for c in h), "Hash contains non-hex characters"

    # Verify it matches raw SHA-256
    canonical = canonical_bytes(pkg.to_canonical_dict())
    expected = hashlib.sha256(canonical).hexdigest()
    assert h == expected, "Hash doesn't match raw SHA-256"
    print(f"  ✓ Hash is valid SHA-256 (64 hex chars)")
    return True


def test_hash_hex_0x_format():
    """Evidence hash with 0x prefix must be correctly formatted."""
    pkg = make_test_package()
    h = EvidenceHasher.hash_hex_0x(pkg)

    assert h.startswith("0x"), "Hash doesn't start with 0x"
    assert len(h) == 66, f"0x-prefixed hash length is {len(h)}, expected 66"
    print(f"  ✓ 0x-prefixed hash is correct format")
    return True


def test_verify_hash_match():
    """verify_hash should return True for matching hash."""
    pkg = make_test_package()
    h = EvidenceHasher.hash_package(pkg)

    match, actual = EvidenceHasher.verify_hash(pkg, h)
    assert match, "verify_hash returned False for matching hash!"
    assert actual == h
    print(f"  ✓ verify_hash matches correctly")
    return True


def test_verify_hash_mismatch():
    """verify_hash should return False for non-matching hash."""
    pkg = make_test_package()
    fake_hash = "0" * 64

    match, actual = EvidenceHasher.verify_hash(pkg, fake_hash)
    assert not match, "verify_hash returned True for non-matching hash!"
    print(f"  ✓ verify_hash detects mismatch")
    return True


def test_evidence_id_format():
    """Evidence ID should follow TF-XXXXXXXX format."""
    pkg = make_test_package()
    eid = pkg.evidence_id
    assert eid.startswith("TF-"), f"Evidence ID doesn't start with TF-: {eid}"
    assert len(eid) == 11, f"Evidence ID length is {len(eid)}, expected 11 (TF-XXXXXXXX)"
    print(f"  ✓ Evidence ID format: {eid}")
    return True


def run_all_tests():
    """Run all evidence hash tests."""
    tests = [
        test_same_package_same_hash,
        test_different_package_different_hash,
        test_tamper_detection_source_url,
        test_tamper_detection_similarity_score,
        test_tamper_detection_metadata,
        test_canonical_json_deterministic,
        test_canonical_json_sorted_keys,
        test_hash_is_valid_sha256,
        test_hash_hex_0x_format,
        test_verify_hash_match,
        test_verify_hash_mismatch,
        test_evidence_id_format,
    ]

    print("\n🧪 Evidence Hash Tests")
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
