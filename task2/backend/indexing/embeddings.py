"""Embedding wrapper.

Design rules (from the spec):

* document/chunk embeddings are computed **offline** only;
* only the **query** is embedded at request time;
* query embeddings are cached (LRU) to save time on repeated queries.
"""

from __future__ import annotations

from collections import OrderedDict

import numpy as np

from backend.config import settings


class Embedder:
    def __init__(
        self,
        model_name: str | None = None,
        device: str = "cpu",
        cache_dir: str | None = None,
        query_prefix: str = "query: ",
        passage_prefix: str = "passage: ",
        cache_size: int = 256,
    ) -> None:
        from sentence_transformers import SentenceTransformer  # lazy import

        self.model_name = model_name or settings.embedding_model
        self.device = device
        self.query_prefix = query_prefix
        self.passage_prefix = passage_prefix
        self._cache: OrderedDict[str, np.ndarray] = OrderedDict()
        self._cache_size = cache_size
        self.model = SentenceTransformer(
            self.model_name,
            device=device,
            cache_folder=cache_dir or str(settings.model_cache_dir),
        )
        try:
            self.model.max_seq_length = settings.embedding_max_seq_length
        except Exception:  # pragma: no cover
            pass
        self.dim = self.model.get_sentence_embedding_dimension()

    # ------------------------------------------------------------------ batch
    def encode_passages(self, texts: list[str], batch_size: int | None = None) -> np.ndarray:
        """Embed documents/chunks (offline). Normalised vectors → cosine = IP.

        Length-aware batching: texts are grouped by (whitespace) length so
        padding waste inside a batch is minimal — this is the dominant CPU
        cost for mostly-short passages.
        """
        batch = batch_size or settings.embedding_batch_size
        prefixed = [self.passage_prefix + t for t in texts] if self.passage_prefix else list(texts)

        order = sorted(range(len(prefixed)), key=lambda i: len(prefixed[i].split()))
        out = np.empty((len(prefixed), self.dim), dtype=np.float32)
        for start in range(0, len(order), batch):
            idx = order[start : start + batch]
            vectors = self.model.encode(
                [prefixed[i] for i in idx],
                batch_size=len(idx),
                normalize_embeddings=True,
                convert_to_numpy=True,
                show_progress_bar=False,
            )
            out[idx] = np.asarray(vectors, dtype=np.float32)
        return out

    # ------------------------------------------------------------------ query
    def encode_query(self, text: str) -> np.ndarray:
        key = text.strip()
        if key in self._cache:
            self._cache.move_to_end(key)
            return self._cache[key]
        prefixed = self.query_prefix + key if self.query_prefix else key
        vec = self.model.encode(
            [prefixed], normalize_embeddings=True, convert_to_numpy=True
        )[0].astype(np.float32)
        self._cache[key] = vec
        if len(self._cache) > self._cache_size:
            self._cache.popitem(last=False)
        return vec

    def embed(self, texts: list[str]) -> np.ndarray:  # alias used by SemanticChunker
        return self.encode_passages(texts)
