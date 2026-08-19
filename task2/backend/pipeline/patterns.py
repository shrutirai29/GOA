"""Shared pattern constants for the query router and guardrails.

Boundary note: Python's ``re`` ``\\b`` treats Devanagari vowel marks
(category Mc, e.g. ा ी ु) as non-word characters, which fragments Hindi words
and breaks standard word boundaries. All patterns here therefore use a
*mark-inclusive* word-character class so boundaries work for both Devanagari
and Latin text. Every pattern is compiled case-insensitively (English queries
arrive capitalized).
"""

from __future__ import annotations

import re

# mark-inclusive word char (letters, digits, underscore + whole Devanagari block)
_WC = r"[\w\u0900-\u097F\u200C\u200D]"
_B_START = rf"(?<![{_WC[1:-1]}])"  # not preceded by a word-ish char
_B_END = rf"(?![{_WC[1:-1]}])"  # not followed by a word-ish char


def _phrase(*words: str) -> str:
    """Alternation of literal words with token boundaries (Hindi-safe)."""
    return _B_START + "(?:" + "|".join(re.escape(w) for w in words) + ")" + _B_END


def _compiled(*words: str) -> re.Pattern:
    return re.compile(_phrase(*words), re.IGNORECASE)


WHO = _compiled("कौन", "किसने", "who", "whom", "whose")
WHERE = _compiled("कहाँ", "कहां", "किस जगह", "where")
WHEN = _compiled("कब", "किस वर्ष", "किस साल", "किस तारीख", "when", "which year", "which date")
NUM = _compiled(
    "कितने", "कितनी", "कितना", "कितने साल", "कितना साल", "how many", "how much",
    "जनसंख्या", "आबादी", "population", "कीमत", "price", "cost", "दाम", "वज़न", "weight",
    "उम्र", "age", "ऊंचाई", "height", "लंबाई", "length", "चौड़ाई", "width", "दूरी", "distance",
    "गति", "speed", "तापमान", "temperature", "नंबर", "number", "कितनी तेजी",
)
CMP = _compiled(
    "की तुलना", "के बीच अंतर", "के बीच", "vs", "versus", "तुलना", "difference between",
    "better than", "compared to", "ज्यादा बेहतर", "कौन सा बेहतर", "अंतर", "difference",
)
EXPLAIN = _compiled(
    "कैसे", "क्यों", "क्योंकि", "explain", "how does", "how do", "why", "reason", "कारण",
    "समझाओ", "प्रक्रिया", "process", "mechanism", "तंत्र", "principle", "सिद्धांत", "लिखा",
)
CONCEPT = _compiled(
    "क्या है", "क्या होता है", "क्या होती है", "meaning", "अर्थ", "मतलब", "definition",
    "परिभाषा", "concept", "अवधारणा", "theory", "what is", "what are", "what does",
)
COMPLEX_HINT = _compiled("और", "तथा", "साथ ही", "as well as", "also", "moreover")

# Off-topic: greetings / chit-chat / self-referential meta queries.
OFFTOPIC = _compiled(
    "नमस्ते", "नमस्कार", "हैलो", "hello", "hi", "hey", "good morning", "good evening",
    "शुभ प्रभात", "how are you", "कैसे हो", "कैसी हो", "thank you", "धन्यवाद", "thanks",
    "bye", "अलविदा", "what can you do", "तुम क्या कर सकते हो", "who are you", "तुम कौन हो",
    "what is your name", "तुम्हारा नाम", "are you human", "क्या तुम इंसान हो", "good", "ok",
)

NUMERIC_TOKEN = re.compile(
    r"\d+(\.\d+)?\s*(%|₹|\$|km|kg|m|cm|mm|वर्ष|साल|रुपये|लाख|करोड़)?", re.IGNORECASE
)

ATTACK = re.compile(
    r"(ignore (all |the )?(previous|prior|above) instructions|ignore your (system )?prompt|"
    r"reveal (your |the )?(system )?prompt|disregard (the |all )?(retrieved )?context|"
    r"forget (everything|all previous)|jailbreak|you are now|act as (if )?|"
    r"अपने निर्देश|पिछले निर्देश|system prompt|सिस्टम प्रॉम्प्ट|अपना प्रॉम्प्ट|निर्देशों को अनदेखा)",
    re.IGNORECASE,
)

SAFETY = re.compile(
    r"(bomb|explosive|weapon|kill (someone|people)|hate speech|child porn|sexual content|"
    r"bomb बनाने|बम कैसे|बम बनाने|हथियार|मार डालो|मारना सिखाओ|मारना कैसे|"
    r"किसी को मारना|किसी को मार|मार दो|घायल करना|ज़ख्मी करना|नुकसान पहुँचाना|"
    r"आत्महत्या कैसे करें|how to commit suicide|"
    r"drugs (to )?make|meth recipe|identity theft|steal (credit|bank)|हैक कैसे करें|"
    r"how to hack|बनाना सीखाओ|बनाने का तरीका|"
    r"maarna|maar do|maar doon|maar dena|hathiyar|ghayal|zakhmi|"
    r"kisi ko maar|kisi ko maarna|suicide kaise|atmahatya)",
    re.IGNORECASE,
)
