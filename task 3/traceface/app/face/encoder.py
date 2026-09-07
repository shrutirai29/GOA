"""
Face Encoding Module
Generates face embeddings (512-d vectors) using InsightFace.
"""
import numpy as np
from typing import Optional, List
import hashlib
import json


class FaceEncoder:
    """Encodes cropped face images into fixed-size embedding vectors."""

    EMBEDDING_DIM = 512

    def __init__(self):
        self._app = None

    def _get_app(self):
        """Lazy-load InsightFace for encoding."""
        if self._app is None:
            from insightface.app import FaceAnalysis
            self._app = FaceAnalysis(
                name="buffalo_l",
                providers=["CPUExecutionProvider"],
            )
            self._app.prepare(ctx_id=0, det_size=(640, 640))
        return self._app

    def encode(self, face_image: np.ndarray) -> Optional[np.ndarray]:
        """
        Generate an embedding vector for a face image.

        Args:
            face_image: BGR numpy array of a face (cropped)

        Returns:
            512-d numpy array or None if encoding fails
        """
        app = self._get_app()
        faces = app.get(face_image)

        if not faces:
            return None

        # Use the largest/best face detected in the crop
        best = max(faces, key=lambda f: f.det_score)
        embedding = best.normed_embedding

        if embedding is None:
            return None

        return embedding.astype(np.float32)

    def embedding_to_list(self, embedding: np.ndarray) -> List[float]:
        """Convert numpy embedding to a JSON-serializable list."""
        return embedding.tolist()

    def list_to_embedding(self, emb_list: List[float]) -> np.ndarray:
        """Convert a list back to a numpy embedding array."""
        return np.array(emb_list, dtype=np.float32)

    @staticmethod
    def compute_embedding_hash(embedding: np.ndarray) -> str:
        """
        Compute a deterministic SHA-256 hash of an embedding vector.
        Uses fixed-precision serialization for consistency.
        """
        # Round to 6 decimal places for determinism
        rounded = np.round(embedding, 6)
        data = json.dumps(rounded.tolist(), sort_keys=True).encode("utf-8")
        return hashlib.sha256(data).hexdigest()

    @staticmethod
    def embedding_summary(embedding: np.ndarray) -> str:
        """Return a short human-readable summary of the embedding."""
        return (
            f"Embedding(shape={embedding.shape}, "
            f"mean={embedding.mean():.4f}, "
            f"std={embedding.std():.4f}, "
            f"L2-norm={np.linalg.norm(embedding):.4f})"
        )
