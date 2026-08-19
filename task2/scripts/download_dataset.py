"""Download a bounded sample of the ai4bharat/MSMARCO-XI dataset.

The full dataset is ~55 GB and is never downloaded. This script pulls a
configurable number of *parquet shards* into ``data/dataset/``:

    * train shards  -> knowledge-base corpus (out-of-sample for eval queries)
    * validation shards -> evaluation queries (they carry ``is_selected``
                           ground-truth relevance labels)

Downloads are resumable (HTTP Range requests) so an interrupted run can be
re-run to pick up where it left off.

Usage:
    python scripts/download_dataset.py
    python scripts/download_dataset.py --train-shards 0000 0001 --validation-shards 0000
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data" / "dataset"

PARQUET_BASE = (
    "https://huggingface.co/datasets/ai4bharat/MSMARCO-XI/"
    "resolve/refs%2Fconvert%2Fparquet/default"
)

CHUNK = 1024 * 1024  # 1 MiB


def human(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024 or unit == "GB":
            return f"{n:.1f}{unit}" if unit != "B" else f"{n}B"
        n /= 1024
    return f"{n:.1f}GB"


def download(url: str, dest: Path) -> bool:
    """Resumable download. Returns True if the file is complete."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    existing = dest.stat().st_size if dest.exists() else 0

    headers = {"Range": f"bytes={existing}-"} if existing else {}
    with httpx.stream("GET", url, headers=headers, follow_redirects=True, timeout=300) as r:
        if r.status_code == 416:  # range not satisfiable -> already complete
            print(f"    already complete: {dest.name} ({human(existing)})")
            return True
        r.raise_for_status()

        total = int(r.headers.get("content-range", "").split("/")[-1] or r.headers.get("content-length", 0))
        mode = "ab" if existing else "wb"
        start = time.time()
        written = existing
        try:
            with open(dest, mode) as f:
                for chunk in r.iter_bytes(CHUNK):
                    f.write(chunk)
                    written += len(chunk)
                    if total and time.time() - start >= 10:
                        speed = (written - existing) / (time.time() - start) / 1024 / 1024
                        print(f"    {dest.name}: {human(written)} / {human(total)}  ({speed:.1f} MB/s)", flush=True)
                        start = time.time()
        except Exception:
            # leave the partial file on disk so the next run resumes it
            print(f"    interrupted at {human(written)}; will resume next run", flush=True)
            raise

    final = dest.stat().st_size
    ok = not total or final >= total
    print(f"    {'done' if ok else 'INCOMPLETE'}: {dest.name} {human(final)}")
    return ok


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--train-shards", nargs="*", default=["0000"], help="train shard names, e.g. 0000 0001")
    ap.add_argument("--validation-shards", nargs="*", default=["0000"], help="validation shard names")
    ap.add_argument("--max-attempts", type=int, default=50, help="resume attempts per file")
    args = ap.parse_args()

    for shard in args.train_shards:
        url = f"{PARQUET_BASE}/train/{shard}.parquet"
        for attempt in range(1, args.max_attempts + 1):
            print(f"[train] downloading {shard}.parquet (attempt {attempt}) ...", flush=True)
            try:
                download(url, DATA_DIR / "train" / f"{shard}.parquet")
                break
            except Exception as e:
                print(f"    attempt {attempt} failed: {type(e).__name__}; will resume", flush=True)

    for shard in args.validation_shards:
        url = f"{PARQUET_BASE}/validation/{shard}.parquet"
        for attempt in range(1, args.max_attempts + 1):
            print(f"[validation] downloading {shard}.parquet (attempt {attempt}) ...", flush=True)
            try:
                download(url, DATA_DIR / "validation" / f"{shard}.parquet")
                break
            except Exception as e:
                print(f"    attempt {attempt} failed: {type(e).__name__}; will resume", flush=True)

    print("Done. Shards are in data/dataset/")


if __name__ == "__main__":
    main()
