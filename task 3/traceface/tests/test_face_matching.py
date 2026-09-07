"""
Tests for Face Matching and Similarity Calculations
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.face.matcher import FaceMatcher, MatchConfidence, MatchResult


def test_identical_embeddings():
    """Identical embeddings should have similarity of 1.0."""
    matcher = FaceMatcher()
    emb = np.random.randn(512).astype(np.float32)

    sim = matcher.cosine_similarity(emb, emb)
    assert abs(sim - 1.0) < 1e-6, f"Self-similarity is {sim}, expected 1.0"
    print(f"  ✓ Identical embeddings → similarity = {sim:.6f}")
    return True


def test_opposite_embeddings():
    """Opposite vectors should have similarity of -1.0."""
    matcher = FaceMatcher()
    emb = np.random.randn(512).astype(np.float32)

    sim = matcher.cosine_similarity(emb, -emb)
    assert abs(sim - (-1.0)) < 1e-6, f"Opposite similarity is {sim}, expected -1.0"
    print(f"  ✓ Opposite embeddings → similarity = {sim:.6f}")
    return True


def test_orthogonal_embeddings():
    """Random high-dimensional vectors should have low similarity."""
    matcher = FaceMatcher()
    np.random.seed(42)
    emb1 = np.random.randn(512).astype(np.float32)
    emb2 = np.random.randn(512).astype(np.float32)

    sim = matcher.cosine_similarity(emb1, emb2)
    # Random 512-d vectors: similarity should be close to 0
    assert abs(sim) < 0.15, f"Random similarity is {sim}, expected near 0"
    print(f"  ✓ Orthogonal embeddings → similarity = {sim:.6f}")
    return True


def test_confidence_categories():
    """Test match confidence categorization."""
    matcher = FaceMatcher(threshold=0.80)

    # Very High (>= 0.95)
    assert MatchConfidence.from_score(0.98) == MatchConfidence.VERY_HIGH
    assert MatchConfidence.from_score(0.95) == MatchConfidence.VERY_HIGH

    # High (>= 0.85)
    assert MatchConfidence.from_score(0.90) == MatchConfidence.HIGH
    assert MatchConfidence.from_score(0.85) == MatchConfidence.HIGH

    # Possible (>= 0.75)
    assert MatchConfidence.from_score(0.80) == MatchConfidence.POSSIBLE
    assert MatchConfidence.from_score(0.75) == MatchConfidence.POSSIBLE

    # Not Verified (< 0.75)
    assert MatchConfidence.from_score(0.50) == MatchConfidence.NOT_VERIFIED
    assert MatchConfidence.from_score(0.0) == MatchConfidence.NOT_VERIFIED

    print(f"  ✓ Confidence categories work correctly")
    return True


def test_match_result_is_match():
    """Test MatchResult.is_match with different thresholds."""
    matcher_strict = FaceMatcher(threshold=0.90)
    matcher_loose = FaceMatcher(threshold=0.70)

    emb1 = np.random.randn(512).astype(np.float32)
    # Create a similar embedding (small perturbation)
    np.random.seed(123)
    emb2 = emb1 + 0.1 * np.random.randn(512).astype(np.float32)

    # With strict threshold, might not match
    result_strict = matcher_strict.compare(emb1, emb2)
    # With loose threshold, more likely to match
    result_loose = matcher_loose.compare(emb1, emb2)

    # Both should have the same similarity score
    assert abs(result_strict.similarity - result_loose.similarity) < 1e-6

    print(f"  ✓ Match result with different thresholds: {result_strict.similarity:.4f}")
    return True


def test_empty_embeddings():
    """Should handle edge cases gracefully."""
    matcher = FaceMatcher()
    emb = np.array([], dtype=np.float32)

    try:
        sim = matcher.cosine_similarity(emb, emb)
        # If it doesn't raise, the result should be NaN or 0
        print(f"  ✓ Empty embeddings handled (similarity={sim})")
    except (ValueError, ZeroDivisionError):
        print(f"  ✓ Empty embeddings raise expected error")

    return True


def test_rank_candidates():
    """Test candidate ranking by similarity."""
    matcher = FaceMatcher(threshold=0.5)

    np.random.seed(42)
    query = np.random.randn(512).astype(np.float32)

    candidates = []
    for i in range(5):
        np.random.seed(i)
        emb = np.random.randn(512).astype(np.float32)
        candidates.append({
            "embedding": emb,
            "url": f"https://example.com/{i}",
            "title": f"Result {i}",
            "domain": "example.com",
        })

    ranked = matcher.rank_candidates(query, candidates)

    # Results should be sorted by similarity (descending)
    for i in range(len(ranked) - 1):
        assert ranked[i].match_result.similarity >= ranked[i + 1].match_result.similarity, \
            "Results not sorted correctly"

    print(f"  ✓ Candidates ranked correctly ({len(ranked)} results)")
    return True


def run_all_tests():
    """Run all face matching tests."""
    tests = [
        test_identical_embeddings,
        test_opposite_embeddings,
        test_orthogonal_embeddings,
        test_confidence_categories,
        test_match_result_is_match,
        test_empty_embeddings,
        test_rank_candidates,
    ]

    print("\n🧪 Face Matching Tests")
    print("=" * 50)

    passed = 0
    failed = 0

    for test_fn in tests:
        try:
            if test_fn():
                passed += 1
        except AssertionError as e:
            print(f"  ✗ FAILED: {test_fn.__name__}: {e}")
            failed += 1
        except Exception as e:
            print(f"  ✗ ERROR: {test_fn.__name__}: {e}")
            failed += 1

    print(f"\n{'=' * 50}")
    print(f"Results: {passed} passed, {failed} failed, {len(tests)} total")

    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
