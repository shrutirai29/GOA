"""Fast script-based language detection for Indian languages.

Uses Unicode script ranges to identify the dominant script in a query,
then maps script to language. No ML model needed — pure character
counting, runs in microseconds.
"""
from __future__ import annotations

import re
from collections import Counter

# Unicode script ranges for Indian languages
SCRIPT_RANGES = {
    "deva": (0x0900, 0x097F),   # Devanagari: Hindi, Marathi, Nepali, Sanskrit
    "beng": (0x0980, 0x09FF),   # Bengali: Bengali, Assamese
    "guru": (0x0A00, 0x0A7F),   # Gurmukhi: Punjabi
    "gujr": (0x0A80, 0x0AFF),   # Gujarati: Gujarati
    "orya": (0x0B00, 0x0B7F),   # Oriya: Odia
    "taml": (0x0B80, 0x0BFF),   # Tamil: Tamil
    "telu": (0x0C00, 0x0C7F),   # Telugu: Telugu
    "knda": (0x0C80, 0x0CFF),   # Kannada: Kannada
    "mlym": (0x0D00, 0x0D7F),   # Malayalam: Malayalam
    "arab": (0x0600, 0x06FF),   # Arabic: Urdu (when in Indic context)
}

# Script -> primary language mapping (most common language for each script)
SCRIPT_TO_LANG = {
    "deva": "hi",   # Hindi (most common Devanagari user)
    "beng": "ben",  # Bengali (Assamese also uses Bengali script but less common)
    "guru": "pan",  # Punjabi
    "gujr": "guj",  # Gujarati
    "orya": "ori",  # Odia
    "taml": "tam",  # Tamil
    "telu": "tel",  # Telugu
    "knda": "kan",  # Kannada
    "mlym": "mal",  # Malayalam
    "arab": "urd",  # Urdu
}

# All supported languages (for the corpus)
ALL_LANGUAGES = ["hi", "ben", "asm", "guj", "kan", "mal", "mar", "nep", "ori", "pan", "san", "tam", "tel", "urd", "eng"]


def detect_language(text: str) -> str:
    """Detect the dominant language of a text query.
    
    Returns a language code: 'hi', 'ben', 'guj', 'eng', etc.
    Uses script-based detection which is fast and accurate for
    Indic languages (each has a unique script).
    """
    if not text or not text.strip():
        return "hi"  # default
    
    script_counts: Counter[str] = Counter()
    latin_count = 0
    total_alpha = 0
    
    for ch in text:
        cp = ord(ch)
        if cp < 0x41:  # skip punctuation, numbers, spaces
            continue
        
        total_alpha += 1
        
        # Check Latin (English)
        if (0x41 <= cp <= 0x5A) or (0x61 <= cp <= 0x7A):
            latin_count += 1
            continue
        
        # Check each Indic script
        for script, (start, end) in SCRIPT_RANGES.items():
            if start <= cp <= end:
                script_counts[script] += 1
                break
    
    if total_alpha == 0:
        return "hi"
    
    # If majority is Latin -> English
    if latin_count > total_alpha * 0.5:
        return "eng"
    
    # Find dominant Indic script
    if script_counts:
        dominant_script = script_counts.most_common(1)[0][0]
        return SCRIPT_TO_LANG.get(dominant_script, "hi")
    
    # Fallback: if no script detected but not mostly Latin, assume Hindi
    # (could be transliterated Hindi)
    return "hi"


def detect_script(text: str) -> str:
    """Return the Unicode script name of the dominant script."""
    script_counts: Counter[str] = Counter()
    for ch in text:
        cp = ord(ch)
        for script, (start, end) in SCRIPT_RANGES.items():
            if start <= cp <= end:
                script_counts[script] += 1
                break
    if script_counts:
        return script_counts.most_common(1)[0][0]
    return "latn"
