"""
Demo Search Provider (Fallback Mode)
Clearly labeled as a demonstration mode — NEVER pretends to be a real search.
Used when no API key is available or during offline demos.
"""
import hashlib
import os
import tempfile
from datetime import datetime
from typing import List
from urllib.parse import urlparse

import cv2
import numpy as np

from .base import BaseSearchProvider, SearchResult


class DemoSearchProvider(BaseSearchProvider):
    """
    DEMO FALLBACK — Not a real web search.

    This provider generates synthetic search results based on the input image.
    It is clearly labeled and should NEVER be mistaken for a real search.
    """

    # Demo results that are structurally realistic but synthetic
    DEMO_RESULTS = [
        {
            "title": "Public figure — stock photo sample (DEMO)",
            "url": "https://example.com/demo/result-1",
            "domain": "example.com",
            "snippet": "This is a synthetic demo result for development purposes.",
        },
        {
            "title": "Sample stock image result (DEMO)",
            "url": "https://demo.example.org/visual-match",
            "domain": "demo.example.org",
            "snippet": "Demo result generated during offline mode.",
        },
        {
            "title": "Example web result — demonstration only (DEMO)",
            "url": "https://sample.dev/results/demo-face",
            "domain": "sample.dev",
            "snippet": "This is not a real search result.",
        },
    ]

    @property
    def name(self) -> str:
        return "DEMO MODE (Not a real search)"

    @property
    def is_real_search(self) -> bool:
        return False

    def requires_api_key(self) -> bool:
        return False

    def search(self, image: np.ndarray, query: str = "") -> List[SearchResult]:
        """
        Generate demo results. Clearly marked as synthetic.

        ⚠️ This does NOT perform any web search. Results are generated locally.
        """
        # Create a derivative of the input image to simulate "finding" it
        h, w = image.shape[:2]

        results = []
        for i, demo in enumerate(self.DEMO_RESULTS):
            # Generate a slight transform of the input as a "found" image
            # This is only for demo UI purposes — clearly labeled
            angle = (i - 1) * 5  # Slight rotation
            M = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)
            result_image = cv2.warpAffine(image, M, (w, h))

            results.append(SearchResult(
                title=demo["title"],
                source_url=demo["url"],
                image_url=demo["url"],
                source_domain=demo["domain"],
                snippet=demo["snippet"],
                provider=self.name,
                relevance_score=0.9 - (i * 0.1),
                downloaded_image=result_image,
            ))

        return results
