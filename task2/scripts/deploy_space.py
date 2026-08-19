"""Deploy the RAG app to a Hugging Face Docker Space.

The Space builds the self-contained Dockerfile and serves the whole app
(API + React UI) at https://huggingface.co/spaces/<user>/task2-rag.

Usage:
    HF_TOKEN=hf_xxx python scripts/deploy_space.py --space <user>/task2-rag
    python scripts/deploy_space.py --dry-run          # list what would upload

Only explicitly whitelisted files are uploaded: the local .gitignore would
otherwise silently skip data/indexes, data/*.jsonl and frontend/dist, which
the Docker image needs. `--watch` polls the Space until it is running.
"""

from __future__ import annotations

import argparse
import os
import shutil
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

INCLUDE_FILES = ["Dockerfile", "requirements.txt"]
INCLUDE_DIRS = ["backend", "scripts"]
INCLUDE_DATA = ["data/indexes", "data/corpus.jsonl", "data/queries.jsonl"]
INCLUDE_FRONTEND = ["frontend/dist"]
SKIP_SUFFIXES = {".pyc", ".pyo"}
SKIP_DIRS = {"__pycache__", ".pytest_cache"}


def collect() -> list[Path]:
    files: list[Path] = []
    for rel in INCLUDE_FILES:
        p = ROOT / rel
        if p.exists():
            files.append(p)
        else:
            print(f"WARNING: missing {rel} — skipping")
    for rel in INCLUDE_DIRS + INCLUDE_DATA + INCLUDE_FRONTEND:
        src = ROOT / rel
        if not src.exists():
            print(f"WARNING: missing {rel} — skipping")
            continue
        if src.is_dir():
            for p in sorted(src.rglob("*")):
                if (
                    p.is_file()
                    and p.suffix not in SKIP_SUFFIXES
                    and not any(part in SKIP_DIRS for part in p.parts)
                ):
                    files.append(p)
        else:
            files.append(src)
    return files


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--space", default=os.environ.get("HF_SPACE_ID", ""),
                    help="Space repo id, e.g. username/task2-rag")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--watch", action="store_true", help="poll build until running")
    args = ap.parse_args()

    files = collect()
    total = sum(f.stat().st_size for f in files)
    print(f"{len(files)} files, {total / 1e6:.1f} MB")
    for f in files:
        print("  ", f.relative_to(ROOT))

    if args.dry_run:
        return 0

    token = os.environ.get("HF_TOKEN", "")
    if not token:
        print("HF_TOKEN not set", file=sys.stderr)
        return 1
    if not args.space:
        print("--space <user>/task2-rag required (or HF_SPACE_ID env)", file=sys.stderr)
        return 1

    from huggingface_hub import HfApi

    api = HfApi(token=token)
    me = api.whoami()["name"]
    if "/" not in args.space:
        args.space = f"{me}/{args.space}"
    print(f"creating/updating Space {args.space}")
    api.create_repo(repo_id=args.space, repo_type="space", space_sdk="docker", exist_ok=True)

    # stage an explicit copy — upload_folder would otherwise honor the local
    # .gitignore and drop the indexes/UI the image needs
    with tempfile.TemporaryDirectory(prefix="hf_space_") as tmp:
        staging = Path(tmp)
        for f in files:
            rel = f.relative_to(ROOT)
            dest = staging / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(f, dest)
        (staging / "README.md").write_text(
            "# Voice-Enabled RAG — HH Goa 2026, Task 2\n\n"
            "Hindi voice/text Q&A over MSMARCO-XI with hybrid retrieval, "
            "grounded generation and abstention.\n",
            encoding="utf-8",
        )
        print("uploading staged folder ...")
        api.upload_folder(
            folder_path=str(staging),
            repo_id=args.space,
            repo_type="space",
            commit_message="Deploy voice RAG (indexes + model baked)",
        )
    print(f"pushed → https://huggingface.co/spaces/{args.space}")

    if args.watch:
        print("watching build (first build installs torch + downloads the model)...")
        deadline = time.time() + 45 * 60
        while time.time() < deadline:
            info = api.space_info(args.space)
            stage = info.runtime.stage
            print(f"  stage: {stage}")
            if stage in ("RUNNING", "APP_STARTING", "RUNNING_BUILDING"):
                if stage == "RUNNING":
                    print("Space is running!")
                    return 0
            elif stage in ("ERROR", "DELETED", "PAUSED", "STOPPED"):
                print(f"Space ended in stage {stage} — check the Space page.", file=sys.stderr)
                return 1
            time.sleep(30)
        print("still building after 45 min — check https://huggingface.co/spaces/" + args.space,
              file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
