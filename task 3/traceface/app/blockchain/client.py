"""
Blockchain Client
Handles communication with EVM-compatible blockchains (local or testnet).
Supports both local Hardhat nodes and public testnets (Base Sepolia, Polygon Amoy).
"""
import json
from pathlib import Path
from typing import Optional, Tuple
from dataclasses import dataclass
from datetime import datetime

from web3 import Web3

# Handle different web3 versions for POA middleware
try:
    from web3.middleware import geth_poa_middleware
except ImportError:
    try:
        from web3.middleware import ExtraDataToPOAMiddleware as geth_poa_middleware
    except ImportError:
        geth_poa_middleware = None

from ..config import config


# Load the contract ABI from the compiled JSON or inline
CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "bytes32", "name": "evidenceHash", "type": "bytes32"},
            {"internalType": "string", "name": "caseId", "type": "string"},
            {"internalType": "string", "name": "sourceFingerprint", "type": "string"},
        ],
        "name": "registerEvidence",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "bytes32", "name": "evidenceHash", "type": "bytes32"},
        ],
        "name": "verifyEvidence",
        "outputs": [
            {"internalType": "bool", "name": "found", "type": "bool"},
            {
                "components": [
                    {"internalType": "bytes32", "name": "evidenceHash", "type": "bytes32"},
                    {"internalType": "string", "name": "caseId", "type": "string"},
                    {"internalType": "string", "name": "sourceFingerprint", "type": "string"},
                    {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                    {"internalType": "address", "name": "submitter", "type": "address"},
                ],
                "internalType": "struct EvidenceRegistry.EvidenceRecord",
                "name": "record",
                "type": "tuple",
            },
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "bytes32", "name": "evidenceHash", "type": "bytes32"},
            {"indexed": False, "internalType": "string", "name": "caseId", "type": "string"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"indexed": True, "internalType": "address", "name": "submitter", "type": "address"},
        ],
        "name": "EvidenceRegistered",
        "type": "event",
    },
    {
        "inputs": [],
        "name": "getRecordCount",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "name": "exists",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function",
    },
]


@dataclass
class TransactionReceipt:
    """Receipt from a blockchain transaction."""
    tx_hash: str
    block_number: int
    timestamp: str
    from_address: str
    contract_address: str
    gas_used: int
    status: int  # 1 = success


class BlockchainClient:
    """EVM blockchain client for evidence registration and verification."""

    def __init__(
        self,
        rpc_url: Optional[str] = None,
        private_key: Optional[str] = None,
        contract_address: Optional[str] = None,
    ):
        self.rpc_url = rpc_url or config.get_rpc_url()
        self.private_key = private_key or config.PRIVATE_KEY
        self.contract_address = contract_address or config.CONTRACT_ADDRESS
        self._w3 = None
        self._contract = None
        self._account = None

    @property
    def is_testnet(self) -> bool:
        return config.is_testnet()

    @property
    def network_name(self) -> str:
        if config.is_local():
            return "Local Demonstration Chain (Hardhat)"
        # Try to identify the network from the RPC URL
        rpc = self.rpc_url.lower()
        if "base" in rpc and "sepolia" in rpc:
            return "Base Sepolia Testnet"
        elif "polygon" in rpc and "amoy" in rpc:
            return "Polygon Amoy Testnet"
        elif "sepolia" in rpc:
            return "Ethereum Sepolia Testnet"
        elif "goerli" in rpc:
            return "Ethereum Goerli Testnet"
        return "Public Testnet"

    @property
    def explorer_url(self) -> str:
        """Get block explorer URL for the current network."""
        rpc = self.rpc_url.lower()
        if "base" in rpc and "sepolia" in rpc:
            return "https://sepolia.basescan.org"
        elif "polygon" in rpc and "amoy" in rpc:
            return "https://amoy.polygonscan.com"
        elif "sepolia" in rpc:
            return "https://sepolia.etherscan.io"
        elif "goerli" in rpc:
            return "https://goerli.etherscan.io"
        return ""

    def connect(self) -> bool:
        """
        Connect to the blockchain node.

        Returns:
            True if connected successfully
        """
        try:
            self._w3 = Web3(Web3.HTTPProvider(self.rpc_url))

            # Add POA middleware for testnets that need it
            if geth_poa_middleware is not None:
                try:
                    self._w3.middleware_onion.inject(geth_poa_middleware, layer=0)
                except Exception:
                    pass  # Not all providers need this

            if not self._w3.is_connected():
                return False

            if self.private_key:
                self._account = self._w3.eth.account.from_key(self.private_key)
            elif self._w3.eth.accounts:
                # For local node, use first account
                self._account = type("Account", (), {"address": self._w3.eth.accounts[0]})()

            if self.contract_address and self.contract_address != "0x":
                self._contract = self._w3.eth.contract(
                    address=Web3.to_checksum_address(self.contract_address),
                    abi=CONTRACT_ABI,
                )

            return True

        except Exception as e:
            print(f"Blockchain connection failed: {e}")
            return False

    def is_connected(self) -> bool:
        """Check if connected to the blockchain."""
        if self._w3 is None:
            return False
        try:
            return self._w3.is_connected()
        except Exception:
            return False

    def get_account_address(self) -> str:
        """Get the current account address."""
        if self._account:
            return self._account.address
        return "Not configured"

    def register_evidence(
        self,
        evidence_hash_hex: str,
        case_id: str,
        source_fingerprint: str,
    ) -> Optional[TransactionReceipt]:
        """
        Register an evidence hash on the blockchain.

        Args:
            evidence_hash_hex: '0x'-prefixed hex hash
            case_id: Case identifier
            source_fingerprint: Description of the evidence

        Returns:
            TransactionReceipt or None on failure
        """
        if not self._w3 or not self._contract or not self._account:
            raise ConnectionError("Not connected to blockchain. Call connect() first.")

        try:
            # Convert hash to bytes32
            evidence_bytes = bytes.fromhex(evidence_hash_hex.replace("0x", ""))

            # Build transaction
            if hasattr(self._account, "private_key"):
                # We have a real account with private key
                nonce = self._w3.eth.get_transaction_count(self._account.address)
                chain_id = self._w3.eth.chain_id

                tx = self._contract.functions.registerEvidence(
                    evidence_bytes,
                    case_id,
                    source_fingerprint,
                ).build_transaction({
                    "from": self._account.address,
                    "nonce": nonce,
                    "gas": 500000,
                    "gasPrice": self._w3.eth.gas_price,
                    "chainId": chain_id,
                })

                signed_tx = self._w3.eth.account.sign_transaction(tx, self.private_key)
                tx_hash = self._w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            else:
                # Local node — use personal.sendTransaction or eth_sendTransaction
                tx_hash = self._contract.functions.registerEvidence(
                    evidence_bytes,
                    case_id,
                    source_fingerprint,
                ).transact({"from": self._account.address})

            # Wait for receipt
            receipt = self._w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)

            # Get block timestamp
            block = self._w3.eth.get_block(receipt["blockNumber"])
            timestamp = datetime.utcfromtimestamp(block["timestamp"]).isoformat() + "Z"

            return TransactionReceipt(
                tx_hash="0x" + receipt["transactionHash"].hex(),
                block_number=receipt["blockNumber"],
                timestamp=timestamp,
                from_address=receipt["from"],
                contract_address=receipt.get("contractAddress", self.contract_address),
                gas_used=receipt["gasUsed"],
                status=receipt["status"],
            )

        except Exception as e:
            print(f"Evidence registration failed: {e}")
            raise

    def verify_evidence(self, evidence_hash_hex: str) -> dict:
        """
        Verify whether an evidence hash exists on-chain.

        Args:
            evidence_hash_hex: '0x'-prefixed hex hash

        Returns:
            Dict with verification result
        """
        if not self._w3 or not self._contract:
            raise ConnectionError("Not connected to blockchain. Call connect() first.")

        try:
            evidence_bytes = bytes.fromhex(evidence_hash_hex.replace("0x", ""))

            found, record = self._contract.functions.verifyEvidence(evidence_bytes).call()

            if found:
                return {
                    "verified": True,
                    "evidence_hash": "0x" + record[0].hex(),
                    "case_id": record[1],
                    "source_fingerprint": record[2],
                    "timestamp": datetime.utcfromtimestamp(record[3]).isoformat() + "Z",
                    "submitter": record[4],
                }
            else:
                return {
                    "verified": False,
                    "evidence_hash": evidence_hash_hex,
                    "message": "Evidence hash not found on-chain",
                }

        except Exception as e:
            return {
                "verified": False,
                "error": str(e),
                "message": "Verification query failed",
            }


class LocalBlockchainClient(BlockchainClient):
    """Blockchain client configured for local Hardhat node."""

    def __init__(self):
        super().__init__(
            rpc_url=config.LOCAL_RPC_URL,
            private_key=None,  # Use local node accounts
            contract_address=config.CONTRACT_ADDRESS,
        )

    @property
    def network_name(self) -> str:
        return "Local Demonstration Chain (Hardhat)"


class TestnetBlockchainClient(BlockchainClient):
    """Blockchain client configured for public testnet."""

    def __init__(self):
        super().__init__(
            rpc_url=config.RPC_URL,
            private_key=config.PRIVATE_KEY,
            contract_address=config.CONTRACT_ADDRESS,
        )

    @property
    def network_name(self) -> str:
        return super().network_name


def get_blockchain_client() -> BlockchainClient:
    """Factory function to get the appropriate blockchain client."""
    if config.is_local():
        return LocalBlockchainClient()
    else:
        return TestnetBlockchainClient()
