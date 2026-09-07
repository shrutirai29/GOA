"""
Search Result Processor
Downloads candidate images and computes face embeddings for matching.
"""
import hashlib
from typing import List, Optional, Tuple

import cv2
import httpx
import numpy as np

from .base import SearchResult
from ..face.detector import FaceDetector
from ..face.encoder import FaceEncoder


class ResultProcessor:
    """Processes search results by downloading images and computing embeddings."""

    def __init__(self, detector: FaceDetector, encoder: FaceEncoder):
        self.detector = detector
        self.encoder = encoder

    def download_image(self, url: str, timeout: float = 10.0) -> Optional[np.ndarray]:
        """
        Download an image from a URL and decode it.

        Args:
            url: Image URL
            timeout: Request timeout in seconds

        Returns:
            BGR numpy array or None if download/decode fails
        """
        if not url or url.startswith("data:"):
            return None

        try:
            with httpx.Client(timeout=timeout, follow_redirects=True) as client:
                response = client.get(url)
                response.raise_for_status()

                content_type = response.headers.get("content-type", "")
                if "image" not in content_type and not url.lower().endswith((".jpg", ".jpeg", ".png", ".gif", ".webp")):
                    return None

                arr = np.frombuffer(response.content, dtype=np.uint8)
                image = cv2.imdecode(arr, cv2.IMREAD_COLOR)
                return image

        except Exception:
            return None

    def process_results(
        self,
        results: List[SearchResult],
        query_embedding: np.ndarray,
        max_results: int = 20,
    ) -> List[dict]:
        """
        Process search results: download images, detect faces, compute embeddings.

        Args:
            results: List of SearchResult from the search provider
            query_embedding: The uploaded face embedding to compare against
            max_results: Maximum number of results to process

        Returns:
            List of dicts with results enriched with embeddings and similarity scores
        """
        processed = []

        for result in results[:max_results]:
            enriched = {
                "title": result.title,
                "url": result.source_url,
                "image_url": result.image_url,
                "domain": result.source_domain,
                "snippet": result.snippet,
                "provider": result.provider,
                "search_timestamp": result.search_timestamp,
                "relevance_score": result.relevance_score,
                "image_downloaded": False,
                "face_detected": False,
                "embedding": None,
                "similarity": None,
                "image_sha256": None,
            }

            # Use pre-downloaded image (demo mode) or download
            image = result.downloaded_image
            if image is None and result.image_url:
                image = self.download_image(result.image_url)

            if image is None:
                processed.append(enriched)
                continue

            enriched["image_downloaded"] = True

            # Compute image hash
            _, buf = cv2.imencode(".png", image)
            enriched["image_sha256"] = hashlib.sha256(buf.tobytes()).hexdigest()

            # Detect face in the result image
            faces = self.detector.detect(image)
            if not faces:
                processed.append(enriched)
                continue

            enriched["face_detected"] = True

            # Get the best face
            best_face = faces[0]
            crop = best_face.crop_from_image(image)

            if crop is not None and crop.size > 0:
                # Compute embedding
                embedding = self.encoder.encode(crop)
                if embedding is not None:
                    enriched["embedding"] = embedding

                    # Compute similarity to query
                    from ..face.matcher import FaceMatcher
                    matcher = FaceMatcher()
                    match = matcher.compare(query_embedding, embedding)
                    enriched["similarity"] = match.similarity
                    enriched["match_confidence"] = match.confidence.value
                    enriched["is_match"] = match.is_match

            processed.append(enriched)

        # Sort by similarity (None values last)
        processed.sort(
            key=lambda x: x["similarity"] if x["similarity"] is not None else -1,
            reverse=True,
        )

        return processed

    @staticmethod
    def compute_image_hash(image: np.ndarray) -> str:
        """Compute SHA-256 hash of an image."""
        _, buf = cv2.imencode(".png", image)
        return hashlib.sha256(buf.tobytes()).hexdigest()
