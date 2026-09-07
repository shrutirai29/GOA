"""
Contract Interface
High-level interface for interacting with the EvidenceRegistry contract.
"""
from typing import Optional, Tuple
from .client import BlockchainClient, get_blockchain_client, TransactionReceipt


class ContractInterface:
    """High-level wrapper around BlockchainClient for evidence operations."""

    def __init__(self, client: Optional[BlockchainClient] = None):
        self.client = client or get_blockchain_client()
        self._connected = False

    def initialize(self) -> bool:
        """Connect to the blockchain and verify contract availability."""
        self._connected = self.client.connect()
        return self._connected

    @property
    def is_connected(self) -> bool:
        return self._connected and self.client.is_connected()

    @property
    def network_name(self) -> str:
        return self.client.network_name

    @property
    def is_testnet(self) -> bool:
        return self.client.is_testnet

    @property
    def account_address(self) -> str:
        return self.client.get_account_address()

    def register(
        self,
        evidence_hash_hex: str,
        case_id: str,
        source_fingerprint: str,
    ) -> Tuple[bool, Optional[TransactionReceipt], str]:
        """
        Register evidence on the blockchain.

        Returns:
            Tuple of (success, receipt_or_none, message)
        """
        if not self.is_connected:
            return False, None, "Not connected to blockchain"

        try:
            receipt = self.client.register_evidence(
                evidence_hash_hex=evidence_hash_hex,
                case_id=case_id,
                source_fingerprint=source_fingerprint,
            )

            if receipt and receipt.status == 1:
                return True, receipt, "Evidence registered successfully"
            else:
                return False, receipt, "Transaction failed or reverted"

        except Exception as e:
            return False, None, f"Registration error: {str(e)}"

    def verify(self, evidence_hash_hex: str) -> dict:
        """
        Verify evidence against the blockchain.

        Returns:
            Dict with verification details
        """
        if not self.is_connected:
            return {
                "verified": False,
                "message": "Not connected to blockchain",
            }

        return self.client.verify_evidence(evidence_hash_hex)
