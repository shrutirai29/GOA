#!/usr/bin/env python3
"""
Download remaining language shards in background.
Resumes automatically — skips files already downloaded.
"""
import os, sys, time, json
from pathlib import Path
from huggingface_hub import hf_hub_download
from datasets import load_dataset

DATA_DIR = Path("data/dataset/validation")

# Map: shard_index -> (language_file, language_code, language_name)
MISSING_SHARDS = {
    4: ("kanval.parquet", "kan", "Kannada"),
    5: ("malval.parquet", "mal", "Malayalam"),
    8: ("orival.parquet", "ori", "Odia"),
    9: ("panval.parquet", "pan", "Punjabi"),
    10: ("sanval.parquet", "san", "Sanskrit"),
    11: ("tamval.parquet", "tam", "Tamil"),
    12: ("telval.parquet", "tel", "Telugu"),
    13: ("urdval.parquet", "urd", "Urdu"),
    6: ("marval.parquet", "mar", "Marathi"),
    7: ("nepval.parquet", "nep", "Nepali"),
}

def download_with_retry(filename, max_retries=3):
    """Download with retry and resume."""
    for attempt in range(max_retries):
        try:
            path = hf_hub_download(
                repo_id="ai4bharat/MSMARCO-XI",
                filename=f"validation/{filename}",
                repo_type="dataset",
                local_dir=str(DATA_DIR),
                local_dir_use_symlinks=False,
            )
            return path
        except Exception as e:
            print(f"  Attempt {attempt+1} failed: {e}")
            time.sleep(5 * (attempt + 1))
    return None

def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    # Check what we already have
    existing = set()
    for f in DATA_DIR.glob("*.parquet"):
        if f.stat().st_size > 10000:
            try:
                ds = load_dataset("parquet", data_files=str(f), split="train[:1]")
                lang = ds[0].get("target_lang", "")
                existing.add(lang.split("_")[0])
            except:
                pass
    
    print(f"Already have: {sorted(existing)}")
    
    downloaded = 0
    for shard_idx, (filename, lang_code, lang_name) in sorted(MISSING_SHARDS.items()):
        if lang_code in existing:
            print(f"  SKIP {lang_name} ({lang_code}) — already have it")
            continue
        
        target = DATA_DIR / filename
        if target.exists() and target.stat().st_size > 10000:
            print(f"  SKIP {lang_name} ({lang_code}) — file exists")
            continue
        
        print(f"\n  Downloading {lang_name} ({filename})...")
        t0 = time.time()
        path = download_with_retry(filename)
        
        if path:
            # The file may have been saved with a different name
            downloaded_path = Path(path)
            if downloaded_path != target:
                import shutil
                shutil.copy2(str(downloaded_path), str(target))
            
            size_mb = target.stat().st_size / 1024 / 1024
            elapsed = time.time() - t0
            print(f"  DONE {lang_name}: {size_mb:.0f}MB in {elapsed:.0f}s")
            downloaded += 1
        else:
            print(f"  FAILED {lang_name} after all retries")
    
    print(f"\n{'='*50}")
    print(f"Downloaded {downloaded} new shards")
    print(f"Total shards: {len(list(DATA_DIR.glob('*.parquet')))}")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
