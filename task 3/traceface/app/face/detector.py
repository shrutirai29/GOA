"""
Face Detection Module
Uses InsightFace for reliable face detection and bounding box extraction.
"""
import cv2
import numpy as np
from dataclasses import dataclass
from typing import List, Optional, Tuple
import hashlib


@dataclass
class DetectedFace:
    """Represents a single detected face with its metadata."""
    bbox: Tuple[int, int, int, int]  # x1, y1, x2, y2
    confidence: float
    index: int
    crop: Optional[np.ndarray] = None

    @property
    def area(self) -> int:
        x1, y1, x2, y2 = self.bbox
        return max(0, x2 - x1) * max(0, y2 - y1)

    def crop_from_image(self, image: np.ndarray, padding: float = 0.2) -> np.ndarray:
        """Crop the face from the image with optional padding."""
        h, w = image.shape[:2]
        x1, y1, x2, y2 = self.bbox

        pad_w = int((x2 - x1) * padding)
        pad_h = int((y2 - y1) * padding)

        cx1 = max(0, x1 - pad_w)
        cy1 = max(0, y1 - pad_h)
        cx2 = min(w, x2 + pad_w)
        cy2 = min(h, y2 + pad_h)

        self.crop = image[cy1:cy2, cx1:cx2].copy()
        return self.crop


class FaceDetector:
    """Detects faces in images using InsightFace."""

    def __init__(self):
        self._app = None

    def _get_app(self):
        """Lazy-load InsightFace App to avoid startup delay."""
        if self._app is None:
            from insightface.app import FaceAnalysis
            self._app = FaceAnalysis(
                name="buffalo_l",
                providers=["CPUExecutionProvider"],
            )
            self._app.prepare(ctx_id=0, det_size=(640, 640))
        return self._app

    def detect(self, image: np.ndarray) -> List[DetectedFace]:
        """
        Detect all faces in an image.

        Args:
            image: BGR numpy array (as loaded by cv2.imread)

        Returns:
            List of DetectedFace objects sorted by confidence (descending)
        """
        app = self._get_app()
        faces = app.get(image)

        if not faces:
            return []

        detected = []
        for i, face in enumerate(faces):
            bbox = face.bbox.astype(int).tolist()
            detected.append(DetectedFace(
                bbox=tuple(bbox),
                confidence=float(face.det_score),
                index=i,
            ))

        # Sort by confidence (highest first)
        detected.sort(key=lambda f: f.confidence, reverse=True)

        # Re-index after sorting
        for i, f in enumerate(detected):
            f.index = i

        return detected

    def detect_and_crop(
        self,
        image: np.ndarray,
        face_index: int = 0,
        padding: float = 0.2,
    ) -> Optional[DetectedFace]:
        """
        Detect faces and return a specific face cropped from the image.

        Args:
            image: BGR numpy array
            face_index: Which face to crop (0 = highest confidence)
            padding: Padding around the face bounding box

        Returns:
            DetectedFace with crop populated, or None if no face found
        """
        faces = self.detect(image)
        if not faces or face_index >= len(faces):
            return None

        target = faces[face_index]
        target.crop_from_image(image, padding=padding)
        return target

    @staticmethod
    def draw_bboxes(image: np.ndarray, faces: List[DetectedFace]) -> np.ndarray:
        """Draw bounding boxes on a copy of the image."""
        vis = image.copy()
        for face in faces:
            x1, y1, x2, y2 = face.bbox
            color = (0, 255, 0) if face.confidence > 0.8 else (0, 165, 255)
            cv2.rectangle(vis, (x1, y1), (x2, y2), color, 2)
            label = f"Face {face.index}: {face.confidence:.1%}"
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
            cv2.rectangle(vis, (x1, y1 - th - 8), (x1 + tw + 4, y1), color, -1)
            cv2.putText(
                vis, label, (x1 + 2, y1 - 4),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1,
            )
        return vis

    @staticmethod
    def compute_image_hash(image: np.ndarray) -> str:
        """Compute SHA-256 hash of the image bytes."""
        _, buffer = cv2.imencode(".png", image)
        return hashlib.sha256(buffer.tobytes()).hexdigest()
