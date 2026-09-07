"""
Evidence Hasher
Computes SHA-256 hashes of evidence packages for blockchain anchoring.
"""
import hashlib
import json
from typing import Tuple

from .canonicalizer import canonical_json, canonical_bytes
from .models import EvidencePackage


class EvidenceHasher:
    """Creates and verifies cryptographic hashes of evidence packages."""

    @staticmethod
    def hash_package(package: EvidencePackage) -> str:
        """
        Compute the SHA-256 hash of an evidence package.

        Args:
            package: EvidencePackage instance

        Returns:
            Hex-encoded SHA-256 hash string
        """
        canonical = canonical_bytes(package.to_canonical_dict())
        return hashlib.sha256(canonical).hexdigest()

    @staticmethod
    def hash_bytes32(package: EvidencePackage) -> bytes:
        """
        Compute hash as 32-byte value for Ethereum bytes32.

        Returns:
            32 bytes
        """
        canonical = canonical_bytes(package.to_canonical_dict())
        return hashlib.sha256(canonical).digest()

    @staticmethod
    def hash_hex_0x(package: EvidencePackage) -> str:
        """
        Compute hash with 0x prefix for Ethereum.

        Returns:
            '0x' prefixed hex hash
        """
        digest = EvidenceHasher.hash_bytes32(package)
        return "0x" + digest.hex()

    @staticmethod
    def verify_hash(package: EvidencePackage, expected_hash: str) -> Tuple[bool, str]:
        """
        Verify that a package matches an expected hash.

        Args:
            package: EvidencePackage to verify
            expected_hash: The hash to compare against (with or without 0x prefix)

        Returns:
            Tuple of (is_match, calculated_hash)
        """
        actual = EvidenceHasher.hash_package(package)

        # Normalize expected hash
        normalized = expected_hash.lower().replace("0x", "")

        return actual.lower() == normalized.lower(), actual

    @staticmethod
    def create_evidence_from_dict(data: dict) -> EvidencePackage:
        """
        Reconstruct an EvidencePackage from a dictionary.
        Used for re-verification flows.
        """
        return EvidencePackage(**data)
