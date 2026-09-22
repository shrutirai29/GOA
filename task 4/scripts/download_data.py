"""
Dataset Downloader for Task 4
Downloads the IEEE-CIS Fraud Detection dataset files from Google Drive.
"""

import os
import sys

FILES = {
    "README.md": "1-a1N26_O_wmvf2gtAuTP00jf124vbqhC",
    "case_pack.csv": "11GAxXOPWCxrB1EfePMHB9IquGJ9rDIod",
    "closed_cases_history.csv": "1S05ULujpOwSlv_YSrcDbVJcyS3JpTOZT",
    "identity.csv": "1zsMMY7lnnjZWsubsO25D9n2ZiZHSU8J_",
    "transactions.csv": "1svn7YqgPlJ-Iv3A8ar1Lh91eVWp6sukR"
}

def download_dataset():
    try:
        import gdown
    except ImportError:
        print("gdown not installed. Installing gdown...")
        os.system("pip install gdown")
        import gdown

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")
    os.makedirs(data_dir, exist_ok=True)

    print("=" * 70)
    print(" Downloading HHGOA IEEE-CIS Fraud Investigation Dataset")
    print("=" * 70)

    for fname, file_id in FILES.items():
        out_path = os.path.join(data_dir, fname)
        if os.path.exists(out_path):
            print(f"[EXISTS] {fname} ({os.path.getsize(out_path):,} bytes)")
            continue
        print(f"\n[DOWNLOADING] {fname}...")
        gdown.download(id=file_id, output=out_path, quiet=False)

    print("\nDataset ready in data/ folder!")

if __name__ == "__main__":
    download_dataset()
