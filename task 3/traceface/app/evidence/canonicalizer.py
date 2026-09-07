"""
Evidence Canonicalizer
Converts evidence packages to deterministic canonical JSON for hashing.
"""
import json
from typing import Any


def canonical_json(obj: Any) -> str:
    """
    Produce a deterministic JSON string from any JSON-serializable object.

    Rules:
    - Dict keys are sorted recursively
    - No whitespace (compact format)
    - Floats are NOT rounded (hash must match exactly)
    - Lists preserve order

    Args:
        obj: JSON-serializable Python object

    Returns:
        Deterministic JSON string
    """
    return json.dumps(_sort_keys(obj), separators=(",", ":"), ensure_ascii=True)


def _sort_keys(obj: Any) -> Any:
    """Recursively sort dictionary keys."""
    if isinstance(obj, dict):
        return {k: _sort_keys(v) for k, v in sorted(obj.items())}
    elif isinstance(obj, list):
        return [_sort_keys(item) for item in obj]
    return obj


def canonical_bytes(obj: Any) -> bytes:
    """Return the canonical JSON as UTF-8 bytes."""
    return canonical_json(obj).encode("utf-8")
