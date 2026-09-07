"""
Evidence Package Data Models
Pydantic models for the tamper-evident evidence package.
"""
from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
import uuid


class EvidencePackage(BaseModel):
    """
    Cryptographic evidence package for a face match result.
    This is the core data structure that gets hashed and stored on-chain.
    """
    case_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")

    # Input data
    input_image_sha256: str
    selected_face_embedding_hash: str

    # Search data
    search_provider: str
    search_timestamp: str

    # Result data
    result_title: str
    source_url: str
    source_domain: str
    result_image_sha256: str
    similarity_score: float

    # Additional metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)

    @property
    def evidence_id(self) -> str:
        """Generate a readable evidence ID from case_id."""
        short_id = self.case_id[:8].upper()
        return f"TF-{short_id}"

    def to_canonical_dict(self) -> dict:
        """
        Create a deterministic canonical dictionary for hashing.
        Fields are sorted alphabetically, nested dicts are also sorted.
        """
        d = self.model_dump()
        return self._canonicalize(d)

    @staticmethod
    def _canonicalize(obj: Any) -> Any:
        """Recursively sort all dict keys for deterministic serialization."""
        if isinstance(obj, dict):
            return {k: EvidencePackage._canonicalize(v) for k, v in sorted(obj.items())}
        elif isinstance(obj, list):
            return [EvidencePackage._canonicalize(item) for item in obj]
        return obj
