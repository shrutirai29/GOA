"""
Base Search Provider
Abstract interface that all search providers must implement.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime
import numpy as np


@dataclass
class SearchResult:
    """A single search result from any provider."""
    title: str
    source_url: str
    image_url: str
    source_domain: str
    snippet: str
    search_timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    provider: str = "unknown"
    relevance_score: float = 0.0
    downloaded_image: Optional[np.ndarray] = None  # BGR numpy array
    face_embedding: Optional[np.ndarray] = None

    def to_dict(self) -> dict:
        """Serialize to dict (excludes numpy arrays)."""
        return {
            "title": self.title,
            "source_url": self.source_url,
            "image_url": self.image_url,
            "source_domain": self.source_domain,
            "snippet": self.snippet,
            "search_timestamp": self.search_timestamp,
            "provider": self.provider,
            "relevance_score": self.relevance_score,
        }


class BaseSearchProvider(ABC):
    """Abstract base class for search providers."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable provider name."""
        ...

    @property
    @abstractmethod
    def is_real_search(self) -> bool:
        """Whether this provider performs a genuine web search."""
        ...

    @abstractmethod
    def search(self, image: np.ndarray, query: str = "") -> List[SearchResult]:
        """
        Search the web using the provided image.

        Args:
            image: BGR numpy array of the search image
            query: Optional text query to supplement the image search

        Returns:
            List of SearchResult objects
        """
        ...

    def requires_api_key(self) -> bool:
        """Whether this provider needs an API key."""
        return True
