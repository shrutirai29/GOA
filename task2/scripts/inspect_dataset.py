"""Inspect the ai4bharat/MSMARCO-XI dataset.

The full dataset is ~55 GB, so this script never materializes it. It reports:

  1. Hub-level metadata (splits, sizes, declared schema) from the Hub API.
  2. Per-shard stats over *local* parquet files (downloaded by
     ``scripts/download_dataset.py``): language distribution, query types,
     passage lengths, relevance labels, missing values, duplicates and sample
     rows.

Nothing about the schema is hard-coded before inspection.

Usage:
    PYTHONIOENCODING=utf-8 python scripts/inspect_dataset.py
    PYTHONIOENCODING=utf-8 python scripts/inspect_dataset.py --shards data/dataset/validation/0003.parquet
"""

from __future__ import annotations

import argparse
import collections
import json
import statistics
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from datasets import get_dataset_config_info  # noqa: E402

DEFAULT_DATASET = "ai4bharat/MSMARCO-XI"


def fmt(n: int) -> str:
    return f"{n:,}"


def hub_metadata(dataset: str) -> None:
    print("=" * 72)
    print(f"[1] HUB METADATA for {dataset}")
    print("=" * 72)
    try:
        info = get_dataset_config_info(dataset, config_name="default")
        print("\n  splits (rows / bytes):")
        for name, split in info.splits.items():
            print(f"    {name:<12} rows={fmt(split.num_examples):>12}  bytes={fmt(split.num_bytes):>16}")
        print("\n  declared features:")
        for fname, ftype in info.features.items():
            if fname == "meta":
                print("    meta: dict")
                for k, v in info.features["meta"].items():
                    print(f"      {k:<22} {v}")
            elif fname == "passages":
                print("    passages: dict of lists")
                for k, v in info.features["passages"].items():
                    print(f"      {k:<22} list[{v.feature.dtype}]")
            else:
                print(f"    {fname:<22} {ftype}")
        print(f"\n  total download size: {fmt(info.download_size)} bytes")
    except Exception as e:  # pragma: no cover - offline mode
        print(f"  (hub metadata unavailable: {e})")


def shard_stats(shards: list[Path]) -> None:
    print("\n" + "=" * 72)
    print("[2] LOCAL SHARD STATS")
    print("=" * 72)

    import pyarrow.parquet as pq

    for path in shards:
        print(f"\n  --- {path} ---")
        try:
            pf = pq.ParquetFile(path)
        except Exception as e:
            print(f"    ERROR: cannot read parquet: {e}")
            continue
        df = pf.read().to_pandas()
        print(f"  rows: {fmt(len(df))}  row_groups: {pf.metadata.num_row_groups}")

        langs = collections.Counter(df["target_lang"])
        print(f"  target_lang: {dict(langs.most_common(12))}")

        qtypes = collections.Counter(str(x) for x in df["query_type"].dropna())
        print(f"  query_type: {dict(qtypes.most_common(12))}")

        # passages + relevance
        pass_lens: list[int] = []
        selected_hist: collections.Counter = collections.Counter()
        n_passages = 0
        seen: set[str] = set()
        dup_passages = 0
        for _, row in df.iterrows():
            ps = row["passages"]
            trans = [str(t) for t in ps["Translated_passages"]]
            selected = [int(s) for s in ps["is_selected"]]
            n_passages += len(trans)
            selected_hist[sum(1 for s in selected if s)] += 1
            for p in trans:
                norm = " ".join(p.split())
                pass_lens.append(len(p.split()))
                if norm in seen:
                    dup_passages += 1
                seen.add(norm)
        if pass_lens:
            print(f"  translated passages: {fmt(n_passages)} unique: {fmt(len(seen))} dup: {fmt(dup_passages)}")
            print(f"  passage words: mean={statistics.mean(pass_lens):.1f} median={statistics.median(pass_lens)} "
                  f"max={max(pass_lens)}")
        print(f"  selected-passages-per-row: {dict(sorted(selected_hist.items()))}")

        missing = {c: int(df[c].isna().sum()) for c in df.columns if df[c].isna().any()}
        print(f"  missing values: {missing if missing else 'none'}")

        dup_rows = int(df.duplicated(subset=["query_id"]).sum())
        print(f"  duplicate query_ids: {fmt(dup_rows)}")

        print("\n  sample row:")
        row = df.iloc[0]
        ps = row["passages"]

        def py(v):  # convert numpy scalars/arrays to plain python
            import numpy as np

            if isinstance(v, np.ndarray):
                return [py(x) for x in v]
            if isinstance(v, (np.integer,)):
                return int(v)
            if isinstance(v, (np.floating,)):
                return float(v)
            return v

        sample = {
            "query_id": int(row["query_id"]),
            "query_type": py(row["query_type"]),
            "query": py(row["query"]),
            "Eng_Query": py(row["Eng_Query"]),
            "Answer": py(row["Answer"]),
            "Eng_Answer": py(row["Eng_Answer"]),
            "source_lang": py(row["source_lang"]),
            "target_lang": py(row["target_lang"]),
            "meta": py(dict(row["meta"])),
            "passages": {
                "Translated_passages": list(ps["Translated_passages"])[:2],
                "English_passages": list(ps["English_passages"])[:2],
                "is_selected": py(list(ps["is_selected"])),
            },
        }
        print(json.dumps(sample, ensure_ascii=False, indent=2, default=lambda o: o.item() if hasattr(o, "item") else str(o))[:3000])


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dataset", default=DEFAULT_DATASET)
    ap.add_argument("--shards", nargs="*", default=None, help="local parquet paths; defaults to data/dataset/validation/*.parquet")
    args = ap.parse_args()

    hub_metadata(args.dataset)

    if args.shards:
        paths = [Path(p) for p in args.shards]
    else:
        default_dir = ROOT / "data" / "dataset" / "validation"
        paths = sorted(default_dir.glob("*.parquet")) if default_dir.exists() else []
    if paths:
        shard_stats(paths)
    else:
        print("\nNo local shards found. Run scripts/download_dataset.py first.")

    print("\nDone.")


if __name__ == "__main__":
    main()
