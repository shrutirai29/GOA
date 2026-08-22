#!/usr/bin/env python3
"""Build a compact multilingual corpus using pyarrow (no HF datasets cache)."""
import pyarrow.parquet as pq
import json, os, sys

CORPUS = "data/corpus.jsonl"
ROWS_PER_LANG = 200  # ~800 passages per lang, ~3200 total

SHARDS = {
    "0000.parquet": "asm",
    "0001.parquet": "ben",
    "0002.parquet": "guj",
    "0003.parquet": "hin",
}

total = 0
with open(CORPUS, "w", encoding="utf-8") as out:
    for shard_file, lc in SHARDS.items():
        sp = os.path.join("data/dataset/validation", shard_file)
        if not os.path.exists(sp):
            print(f"SKIP {lc}")
            continue
        
        pf = pq.ParquetFile(sp)
        count = 0
        # Read first row group only
        tbl = pf.read_row_group(0, columns=["query_id", "passages"])
        
        for i in range(min(ROWS_PER_LANG, len(tbl))):
            qid = tbl.column("query_id")[i].as_py()
            psg = tbl.column("passages")[i].as_py()
            trans = psg.get("Translated_passages", []) if isinstance(psg, dict) else []
            
            for j, p in enumerate(trans):
                if p and len(str(p).strip()) > 10:
                    doc = {
                        "document_id": f"{lc.upper()}_{qid:06d}_{j}",
                        "text": str(p).strip(),
                        "language": lc,
                    }
                    out.write(json.dumps(doc, ensure_ascii=False) + "\n")
                    count += 1
        
        total += count
        print(f"  {lc}: {count} passages")
    
print(f"\nTotal: {total} passages across {len(SHARDS)} languages")
