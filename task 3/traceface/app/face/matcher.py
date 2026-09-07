"""
Face Matching Module
Compares face embeddings using cosine similarity.
"""
import numpy as np
from dataclasses import dataclass
from typing import List, Optional
from enum import Enum


class MatchConfidence(Enum):
    """Confidence categories for face matches."""
    VERY_HIGH = "Very High Match"
    HIGH = "High Match"
    POSSIBLE = "Possible Match"
    NOT_VERIFIED = "Not Verified"

    @classmethod
    def from_score(cls, score: float, threshold: float = 0.80) -> "MatchConfidence":
        if score >= 0.95:
            return cls.VERY_HIGH
        elif score >= 0.85:
            return cls.HIGH
        elif score >= 0.75:
            return cls.POSSIBLE
        else:
            return cls.NOT_VERIFIED

    @property
    def emoji(self) -> str:
        mapping = {
            "Very High Match": "🟢",
            "High Match": "🔵",
            "Possible Match": "🟡",
            "Not Verified": "🔴",
        }
        return mapping.get(self.value, "⚪")


@dataclass
class MatchResult:
    """Result of comparing two face embeddings."""
    similarity: float
    confidence: MatchConfidence
    is_match: bool

    def __str__(self) -> str:
        status = "✓ MATCH" if self.is_match else "✗ NO MATCH"
        return f"{status} — {self.confidence.value} ({self.similarity:.1%})"


@dataclass
class CandidateMatch:
    """A candidate match with metadata."""
    match_result: MatchResult
    source_url: str
    source_title: str
    source_domain: str
    image_url: str
    thumbnail: Optional[bytes] = None


class FaceMatcher:
    """Compares face embeddings and ranks candidates."""

    def __init__(self, threshold: float = 0.80):
        self.threshold = threshold

    def cosine_similarity(self, emb1: np.ndarray, emb2: np.ndarray) -> float:
        """
        Compute cosine similarity between two embedding vectors.

        Args:
            emb1: First embedding (512-d)
            emb2: Second embedding (512-d)

        Returns:
            Cosine similarity in range [-1, 1]
        """
        # Normalize if not already normalized
        norm1 = emb1 / (np.linalg.norm(emb1) + 1e-8)
        norm2 = emb2 / (np.linalg.norm(emb2) + 1e-8)
        return float(np.dot(norm1, norm2))

    def compare(self, emb1: np.ndarray, emb2: np.ndarray) -> MatchResult:
        """
        Compare two face embeddings.

        Returns:
            MatchResult with similarity score and confidence
        """
        score = self.cosine_similarity(emb1, emb2)
        confidence = MatchConfidence.from_score(score, self.threshold)
        is_match = score >= self.threshold

        return MatchResult(
            similarity=score,
            confidence=confidence,
            is_match=is_match,
        )

    def rank_candidates(
        self,
        query_embedding: np.ndarray,
        candidate_embeddings: List[dict],
    ) -> List[CandidateMatch]:
        """
        Rank candidate results by face similarity.

        Args:
            query_embedding: The uploaded face embedding
            candidate_embeddings: List of dicts with 'embedding', 'url', 'title', etc.

        Returns:
            Sorted list of CandidateMatch (best match first)
        """
        results = []

        for candidate in candidate_embeddings:
            emb = candidate.get("embedding")
            if emb is None:
                continue

            match = self.compare(query_embedding, emb)
            results.append(CandidateMatch(
                match_result=match,
                source_url=candidate.get("url", ""),
                source_title=candidate.get("title", ""),
                source_domain=candidate.get("domain", ""),
                image_url=candidate.get("image_url", ""),
            ))

        # Sort by similarity descending
        results.sort(key=lambda c: c.match_result.similarity, reverse=True)
        return results
