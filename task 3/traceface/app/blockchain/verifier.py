"""
Evidence Verifier
Handles re-verification of evidence against blockchain records
and tampering detection demonstrations.
"""
import copy
import json
from datetime import datetime
from typing import Optional, Tuple

from ..evidence.models import EvidencePackage
from ..evidence.hasher import EvidenceHasher
from .contract_interface import ContractInterface


class EvidenceVerifier:
    """Verifies evidence packages against blockchain records."""

    def __init__(self, contract: ContractInterface):
        self.contract = contract

    def verify_package(self, package: EvidencePackage) -> dict:
        """
        Full verification flow: hash the package and check on-chain.

        Returns:
            Dict with verification result
        """
        # 1. Compute hash of the provided package
        calculated_hash = EvidenceHasher.hash_hex_0x(package)
        calculated_hash_plain = EvidenceHasher.hash_package(package)

        # 2. Query blockchain
        chain_result = self.contract.verify(calculated_hash)

        # 3. Determine if hashes match
        on_chain_hash = chain_result.get("evidence_hash", "").lower()
        calculated = calculated_hash.lower()

        hashes_match = on_chain_hash == calculated

        return {
            "verified": chain_result.get("verified", False) and hashes_match,
            "calculated_hash": calculated_hash_plain,
            "calculated_hash_0x": calculated_hash,
            "on_chain_hash": chain_result.get("evidence_hash", "N/A"),
            "case_id": package.case_id,
            "evidence_id": package.evidence_id,
            "chain_result": chain_result,
            "hashes_match": hashes_match,
            "message": self._get_message(
                chain_result.get("verified", False), hashes_match
            ),
        }

    @staticmethod
    def _get_message(found_on_chain: bool, hashes_match: bool) -> str:
        if not found_on_chain:
            return "Evidence hash NOT found on blockchain. The evidence may not have been registered."
        elif not hashes_match:
            return "Evidence hash found on blockchain but DOES NOT MATCH. The data may have been tampered with."
        else:
            return "Evidence hash matches the blockchain record. Data integrity verified."

    def demonstrate_tampering(
        self,
        package: EvidencePackage,
        field: str = "source_url",
    ) -> dict:
        """
        Simulate tampering by modifying a field and showing hash mismatch.

        Args:
            package: Original evidence package
            field: Which field to tamper with

        Returns:
            Dict with original hash, tampered hash, and verification result
        """
        # 1. Get original hash
        original_hash = EvidenceHasher.hash_hex_0x(package)

        # 2. Create a tampered copy
        tampered = package.model_copy(deep=True)
        tampered_dict = tampered.model_dump()

        # Modify the specified field
        if field in tampered_dict:
            original_value = tampered_dict[field]
            if isinstance(original_value, str):
                setattr(tampered, field, original_value + " [TAMPERED]")
            elif isinstance(original_value, float):
                setattr(tampered, field, original_value * 0.5)
            elif isinstance(original_value, int):
                setattr(tampered, field, original_value + 999)
        else:
            # Tamper with metadata
            tampered.metadata["tampered"] = True

        # 3. Compute tampered hash
        tampered_hash = EvidenceHasher.hash_hex_0x(tampered)

        # 4. Try to verify the tampered package
        verification = self.verify_package(tampered)

        return {
            "original_hash": original_hash,
            "tampered_hash": tampered_hash,
            "tampered_field": field,
            "hashes_match": original_hash == tampered_hash,
            "verified": verification["verified"],
            "message": (
                "❌ TAMPERING DETECTED — The modified data produces a different hash "
                "and fails blockchain verification."
                if original_hash != tampered_hash
                else "⚠️ Hash unexpectedly matches — tampering may not have changed the canonical form."
            ),
        }
