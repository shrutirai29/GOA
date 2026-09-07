"""
TraceFace Configuration
Loads settings from environment variables with sensible defaults.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")


class Config:
    """Application configuration singleton."""

    # Search Provider
    SEARCH_PROVIDER: str = os.getenv("SEARCH_PROVIDER", "demo")
    SEARCH_API_KEY: str = os.getenv("SEARCH_API_KEY", "")

    # Blockchain
    BLOCKCHAIN_MODE: str = os.getenv("BLOCKCHAIN_MODE", "local")
    RPC_URL: str = os.getenv("RPC_URL", "https://sepolia.base.org")
    PRIVATE_KEY: str = os.getenv("PRIVATE_KEY", "")
    CONTRACT_ADDRESS: str = os.getenv("CONTRACT_ADDRESS", "")
    LOCAL_RPC_URL: str = os.getenv("LOCAL_RPC_URL", "http://127.0.0.1:8545")

    # Face Recognition
    FACE_MATCH_THRESHOLD: float = float(os.getenv("FACE_MATCH_THRESHOLD", "0.80"))

    # Application
    APP_HOST: str = os.getenv("APP_HOST", "0.0.0.0")
    APP_PORT: int = int(os.getenv("APP_PORT", "8501"))

    @classmethod
    def get_rpc_url(cls) -> str:
        """Return the appropriate RPC URL based on blockchain mode."""
        if cls.BLOCKCHAIN_MODE == "local":
            return cls.LOCAL_RPC_URL
        return cls.RPC_URL

    @classmethod
    def is_testnet(cls) -> bool:
        return cls.BLOCKCHAIN_MODE == "testnet"

    @classmethod
    def is_local(cls) -> bool:
        return cls.BLOCKCHAIN_MODE == "local"

    @classmethod
    def has_search_api_key(cls) -> bool:
        return bool(cls.SEARCH_API_KEY)

    @classmethod
    def get_search_provider(cls) -> str:
        if cls.SEARCH_PROVIDER != "demo" and not cls.has_search_api_key():
            return "demo"
        return cls.SEARCH_PROVIDER


config = Config()
