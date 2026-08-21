"""Rebuild BM25 indexes with the fixed multilingual tokenizer."""

import json
import pickle
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.chunking.base import tokenize
from backend.indexing.bm25_index import Bm25Index


def rebuild_bm25(index_dir: Path):
    """Rebuild BM25 index from chunks.jsonl using current tokenizer."""
    chunks_path = index_dir / "chunks.jsonl"
    if not chunks_path.exists():
        print(f"  SKIP: {chunks_path} not found")
        return

    # Load chunks
    chunks = []
    with open(chunks_path, "r", encoding="utf-8") as f:
        for line in f:
            chunks.append(json.loads(line.strip()))

    texts = [c.get("text", "") for c in chunks]
    print(f"  {len(texts)} chunks")

    # Build BM25 with current tokenizer
    bm25 = Bm25Index()
    bm25.build(texts)

    # Verify tokenization quality
    sample_toks = bm25.tokenized[:3]
    for i, toks in enumerate(sample_toks):
        print(f"  Sample {i}: {toks[:8]}")

    # Check for character-level tokenization (broken)
    char_level = sum(1 for toks in bm25.tokenized if all(len(t) == 1 for t in toks))
    print(f"  Character-level docs: {char_level}/{len(bm25.tokenized)}")

    # Save
    bm25.save(index_dir)
    print(f"  Saved {index_dir / 'bm25.pkl'}")


if __name__ == "__main__":
    index_dir = Path("data/indexes")
    views = ["fixed", "sentence", "semantic", "hierarchical"]

    for view in views:
        d = index_dir / view
        if d.exists():
            print(f"\nRebuilding BM25 for {view}:")
            rebuild_bm25(d)
        else:
            print(f"\nSkipping {view} (not found)")
