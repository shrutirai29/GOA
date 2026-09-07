"""
TraceFace — Main Application Entry Point
Launches the Streamlit dashboard.
"""
import subprocess
import sys
from pathlib import Path


def main():
    """Launch the TraceFace Streamlit dashboard."""
    dashboard_path = Path(__file__).parent / "ui" / "dashboard.py"

    print("=" * 60)
    print("  🔍 TraceFace — Discover. Verify. Prove.")
    print("=" * 60)
    print(f"\n  Starting dashboard: {dashboard_path}")
    print(f"  Open http://localhost:8501 in your browser\n")

    subprocess.run(
        [
            sys.executable,
            "-m",
            "streamlit",
            "run",
            str(dashboard_path),
            "--server.headless", "true",
            "--theme.base", "dark",
        ],
        check=True,
    )


if __name__ == "__main__":
    main()
