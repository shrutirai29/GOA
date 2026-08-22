#!/usr/bin/env python3
"""
Build multilingual corpus from downloaded shards + start downloading missing ones.
Uses smaller sample sizes for practical CPU indexing.
"""
import json, os, sys, time, threading
from pathlib import Path
from datasets import load_dataset
from huggingface_hub import hf_hub_download

DATA_DIR = Path("data")
DATASET_DIR = DATA_DIR / "dataset" / "validation"
CORPUS_FILE = DATA_DIR / "corpus_multilingual.jsonl"
SAMPLES_PER_LANG = 500  # queries per language -> ~5K passages per lang

# Language code -> (parquet filename, human name)
LANGUAGES = {
    "asm": ("asmval.parquet", "Assamese"),
    "ben": ("benval.parquet", "Bengali"),
    "guj": ("gujval.parquet", "Gujarati"),
    "hin": ("hinval.parquet", "Hindi"),
    "kan": ("kanval.parquet", "Kannada"),
    "mal": ("malval.parquet", "Malayalam"),
    "mar": ("marval.parquet", "Marathi"),
    "nep": ("nepval.parquet", "Nepali"),
    "ori": ("orival.parquet", "Odia"),
    "pan": ("panval.parquet", "Punjabi"),
    "san": ("sanval.parquet", "Sanskrit"),
    "tam": ("tamval.parquet", "Tamil"),
    "tel": ("telval.parquet", "Telugu"),
    "urd": ("urdval.parquet", "Urdu"),
}

def download_shard(lang_code, filename):
    """Download a parquet shard if not already local."""
    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    
    # Check if we already have it as a numbered file
    for f in DATASET_DIR.glob("*.parquet"):
        try:
            ds = load_dataset("parquet", data_files=str(f), split="train[:1]")
            target = ds[0].get("target_lang", "")
            if target.startswith(lang_code):
                return str(f)
        except:
            pass
    
    # Check if named file exists
    target_path = DATASET_DIR / filename
    if target_path.exists() and target_path.stat().st_size > 10000:
        return str(target_path)
    
    # Download
    print(f"  📥 Downloading {filename}...")
    try:
        path = hf_hub_download(
            repo_id="ai4bharat/MSMARCO-XI",
            filename=f"validation/{filename}",
            repo_type="dataset",
        )
        # Copy to our data dir
        import shutil
        shutil.copy2(path, str(target_path))
        size_mb = target_path.stat().st_size / 1024 / 1024
        print(f"  ✓ Downloaded: {size_mb:.1f} MB")
        return str(target_path)
    except Exception as e:
        print(f"  ✗ Download failed: {e}")
        return None

def process_shard(shard_file, lang_code, lang_name):
    """Process a shard and return passages."""
    ds = load_dataset("parquet", data_files=shard_file, split=f"train[:{SAMPLES_PER_LANG}]")
    passages = []
    
    for row in ds:
        query = row.get("query", "")
        eng_query = row.get("Eng_Query", "")
        answer = row.get("Answer", "")
        query_type = row.get("query_type", "DESCRIPTION")
        qid = row.get("query_id", 0)
        target_lang = row.get("target_lang", "")
        
        psg_data = row.get("passages", {})
        eng_passages = psg_data.get("English_passages", [])
        trans_passages = psg_data.get("Translated_passages", [])
        is_selected = psg_data.get("is_selected", [])
        
        # Translated passages (target language)
        for j, psg in enumerate(trans_passages):
            if psg and psg.strip() and len(psg.strip()) > 10:
                passages.append({
                    "document_id": f"{lang_code.upper()}_{qid:06d}_{j}",
                    "text": psg.strip(),
                    "language": lang_code,
                    "script": target_lang,
                    "source_query": query,
                    "source_query_en": eng_query,
                    "query_type": query_type,
                    "answer": answer,
                    "is_selected": int(is_selected[j]) if j < len(is_selected) else 0,
                })
        
        # English passages (cross-lingual)
        for j, psg in enumerate(eng_passages):
            if psg and psg.strip() and len(psg.strip()) > 10:
                passages.append({
                    "document_id": f"{lang_code.upper()}_{qid:06d}_eng_{j}",
                    "text": psg.strip(),
                    "language": "eng",
                    "target_language": lang_code,
                    "source_query": query,
                    "source_query_en": eng_query,
                    "query_type": query_type,
                    "answer": answer,
                    "is_selected": int(is_selected[j]) if j < len(is_selected) else 0,
                })
    
    return passages

def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    # Clear old corpus
    if CORPUS_FILE.exists():
        os.remove(CORPUS_FILE)
    
    total = 0
    lang_stats = {}
    
    for lang_code, (filename, lang_name) in LANGUAGES.items():
        print(f"\n{'='*40}")
        print(f"🌍 {lang_name} ({lang_code})")
        
        shard_file = download_shard(lang_code, filename)
        if not shard_file:
            print(f"  ⚠️ Skipping {lang_name} — no data available")
            continue
        
        t0 = time.time()
        passages = process_shard(shard_file, lang_code, lang_name)
        
        # Write to corpus
        with open(CORPUS_FILE, "a", encoding="utf-8") as f:
            for doc in passages:
                f.write(json.dumps(doc, ensure_ascii=False) + "\n")
        
        elapsed = time.time() - t0
        total += len(passages)
        lang_stats[lang_code] = len(passages)
        print(f"  ✓ {len(passages)} passages in {elapsed:.1f}s")
    
    # Final report
    print(f"\n{'='*60}")
    print(f"📊 MULTILINGUAL CORPUS SUMMARY")
    print(f"{'='*60}")
    for lang, count in sorted(lang_stats.items()):
        name = LANGUAGES.get(lang, ("", lang))[1]
        print(f"  {lang:>5} ({name:>12}): {count:>5} passages")
    print(f"  {'':>5} {'':>12}  -----")
    print(f"  {'':>5} {'TOTAL':>12}: {total:>5} passages")
    print(f"  Languages: {len(lang_stats)}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
