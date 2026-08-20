"""Build multilingual corpus from all available validation parquet shards.
Extracts both English and Translated passages, keeping selected (relevant) ones."""
import json
import os
import pyarrow.parquet as pq

LANG_MAP = {
    "0000.parquet": "asm",
    "0001.parquet": "ben",
    "0002.parquet": "guj",
    "0003.parquet": "hin",
    "marval.parquet": "mar",
    "nepval.parquet": "nep",
    "orival.parquet": "ori",
}

OUTFILE = "data/corpus_multilingual.jsonl"
MAX_PER_LANG = 2500

def main():
    shard_dir = "data/dataset/validation"
    all_passages = []
    
    for fn, lang in LANG_MAP.items():
        fp = os.path.join(shard_dir, fn)
        if not os.path.exists(fp):
            print(f"  SKIP {fn} (not downloaded)")
            continue
        
        print(f"  Processing {fn} ({lang})...", flush=True)
        pf = pq.ParquetFile(fp)
        count = 0
        
        # Get target_lang from file to confirm
        tbl_sample = pf.read_row_group(0, columns=["target_lang"])
        target = tbl_sample.column("target_lang")[0].as_py()
        print(f"    Target lang: {target}")
        
        for rg in range(pf.metadata.num_row_groups):
            tbl = pf.read_row_group(rg, columns=["passages", "query_type", "query_id", "query"])
            pcol = tbl.column("passages")
            qcol = tbl.column("query_type")
            qidcol = tbl.column("query_id")
            qtxtcol = tbl.column("query")
            
            for j in range(len(pcol)):
                ps = pcol[j].as_py()
                qt = qcol[j].as_py() or "UNKNOWN"
                qid = qidcol[j].as_py()
                query = qtxtcol[j].as_py() or ""
                
                eng_passages = ps.get("English_passages", [])
                trans_passages = ps.get("Translated_passages", [])
                is_selected = ps.get("is_selected", [])
                
                # Use translated passages (target language), fall back to English
                passages = trans_passages if trans_passages else eng_passages
                
                for k, text in enumerate(passages):
                    if text and len(text.strip()) > 50:
                        selected = is_selected[k] if k < len(is_selected) else 0
                        all_passages.append({
                            "document_id": f"{lang}_{qid:06d}_p{k}",
                            "text": text.strip()[:1000],
                            "language": lang,
                            "query_type": qt,
                            "query_id": qid,
                            "query": query,
                            "is_selected": selected,
                        })
                        count += 1
                
                if count >= MAX_PER_LANG:
                    break
            if count >= MAX_PER_LANG:
                break
        
        print(f"    -> {count} passages")
    
    # Write
    with open(OUTFILE, "w", encoding="utf-8") as f:
        for p in all_passages:
            f.write(json.dumps(p, ensure_ascii=False) + "\n")
    
    from collections import Counter
    langs = Counter(p["language"] for p in all_passages)
    print(f"\nTotal: {len(all_passages)} passages from {len(langs)} languages")
    print(f"By language: {dict(langs)}")
    print(f"Written to {OUTFILE}")

if __name__ == "__main__":
    main()
