"""FAISS-backed dense vector index.

Vectors are L2-normalised and indexed with inner product, so search scores
are cosine similarities in [-1, 1]. External chunk ids are kept in a sidecar
list aligned to the internal FAISS positional ids.

Indexes are persisted so application startup does not rebuild them.
"""

from __future__ import annotations

import json
from pathlib import Path

import faiss
import numpy as np


class VectorIndex:
    def __init__(self, dim: int, index_type: str = "flat") -> None:
        self.dim = dim
        self.index_type = index_type
        if index_type == "flat":
            self.index = faiss.IndexFlatIP(dim)
        elif index_type == "ivf":
            quantizer = faiss.IndexFlatIP(dim)
            self.index = faiss.IndexIVFFlat(quantizer, dim, 64, faiss.METRIC_INNER_PRODUCT)
            self.index.nprobe = 8
            self._needs_training = True
        else:
            raise ValueError(f"unsupported index_type: {index_type}")
        self.ids: list[str] = []
        self._needs_training = False

    # ------------------------------------------------------------------ build
    def train_if_needed(self, vectors: np.ndarray) -> None:
        if getattr(self, "_needs_training", False) and self.index.ntotal == 0:
            self.index.train(vectors)
            self._needs_training = False

    def add(self, vectors: np.ndarray, ids: list[str]) -> None:
        if len(vectors) != len(ids):
            raise ValueError("vectors and ids length mismatch")
        self.train_if_needed(vectors)
        self.index.add(vectors)
        self.ids.extend(ids)

    # ------------------------------------------------------------------ search
    def search(self, vector: np.ndarray, k: int) -> tuple[list[str], list[float]]:
        k = min(k, self.index.ntotal)
        if k <= 0:
            return [], []
        scores, positions = self.index.search(np.asarray([vector], dtype=np.float32), k)
        pos = positions[0].tolist()
        out_ids: list[str] = []
        out_scores: list[float] = []
        for p, s in zip(pos, scores[0].tolist()):
            if p < 0 or p >= len(self.ids):
                continue
            out_ids.append(self.ids[p])
            out_scores.append(float(s))
        return out_ids, out_scores

    # --------------------------------------------------------------- persist
    def save(self, directory: Path) -> None:
        directory.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(directory / "faiss.index"))
        (directory / "ids.json").write_text(json.dumps(self.ids, ensure_ascii=False), encoding="utf-8")
        (directory / "meta.json").write_text(
            json.dumps({"dim": self.dim, "index_type": self.index_type, "n": len(self.ids)}),
            encoding="utf-8",
        )

    @classmethod
    def load(cls, directory: Path) -> "VectorIndex":
        meta = json.loads((directory / "meta.json").read_text(encoding="utf-8"))
        idx = cls(dim=meta["dim"], index_type=meta["index_type"])
        idx.index = faiss.read_index(str(directory / "faiss.index"))
        idx.ids = json.loads((directory / "ids.json").read_text(encoding="utf-8"))
        return idx
