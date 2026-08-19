# data/

Local, reproducible artifacts — **nothing here is committed** (see `.gitignore`).

| path                  | contents                                        | produced by                          |
| --------------------- | ----------------------------------------------- | ------------------------------------ |
| `dataset/`            | downloaded MSMARCO-XI parquet shards            | `scripts/download_dataset.py`        |
| `corpus.jsonl`        | deduped knowledge-base passages                 | `scripts/build_index.py --shard ...` |
| `queries.jsonl`       | eval queries with gold relevance labels         | `scripts/build_index.py --shard ...` |
| `indexes/<view>/`     | FAISS + BM25 + metadata per chunking view       | `scripts/build_index.py`             |
| `indexes/overview.json`| build manifest                                  | `scripts/build_index.py`             |

## Reproducing

```bash
# 1. download one validation shard (resumable; ~470 MB)
python scripts/download_dataset.py --shards 0003

# 2. build corpus + all four retrieval views (offline; can take a while)
python scripts/build_index.py --shard data/dataset/validation/0003.parquet

# 3. rebuild a single view later (resumable)
python scripts/build_index.py --skip-corpus --views semantic
```

`scripts/inspect_dataset.py` prints a dataset summary (schema, languages,
lengths, duplicates, missing values) before any assumptions are made.
