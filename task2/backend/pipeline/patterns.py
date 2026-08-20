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
    # Hindi
    "नमस्ते", "नमस्कार", "हैलो", "शुभ प्रभात", "कैसे हो", "कैसी हो",
    "धन्यवाद", "अलविदा", "तुम क्या कर सकते हो", "तुम कौन हो",
    "तुम्हारा नाम", "क्या तुम इंसान हो",
    # English
    "hello", "hi", "hey", "good morning", "good evening",
    "how are you", "thank you", "thanks", "bye",
    "what can you do", "who are you", "what is your name",
    "are you human", "good", "ok",
    # Bengali
    "নমস্কার", "কেমন আছেন", "ধন্যবাদ", "বিদায়",
    # Gujarati
    "નમસ્તે", "કેમ છો", "આભાર", "અલવિદા",
    # Tamil
    "வணக்கம்", "நன்றி", "பிரியாவிடை",
    # Telugu
    "నమస్కారం", "ధన్యవాదాలు", "వీడ్కోలు",
    # Kannada
    "ನಮಸ್ಕಾರ", "ಧನ್ಯವಾದ", "ವಿದಾಯ",
    # Malayalam
    "നമസ്കാരം", "നന്ദി", "വിടപറയുന്നു",
    # Punjabi
    "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", "ਧੰਨਵਾਦ", "ਅਲਵਿਦਾ",
    # Marathi
    "नमस्कार", "धन्यवाद", "गोडबाय",
    # Nepali
    "नमस्ते", "धन्यवाद", "अलविदा",
    # Odia
    "ନମସ୍କାର", "ଧନ୍ୟବାଦ",
    # Sanskrit
    "नमस्ते", "धन्यवाद",
    # Urdu (Roman)
    "salaam", "shukriya", "khuda hafiz",
)

NUMERIC_TOKEN = re.compile(
    r"\d+(\.\d+)?\s*(%|₹|\$|km|kg|m|cm|mm|वर्ष|साल|रुपये|लाख|करोड़)?", re.IGNORECASE
)

ATTACK = re.compile(
    # English
    r"(ignore (all |the )?(previous|prior|above) instructions|ignore your (system )?prompt|"
    r"reveal (your |the )?(system )?prompt|disregard (the |all )?(retrieved )?context|"
    r"forget (everything|all previous)|jailbreak|you are now|act as (if )?|"
    # Hindi
    r"अपने निर्देश|पिछले निर्देश|system prompt|सिस्टम प्रॉम्प्ट|अपना प्रॉम्प्ट|निर्देशों को अनदेखा|"
    # Bengali
    r"নির্দেশনা উপেক্ষা করো|সিস্টেম প্রম্পট|"
    # Gujarati
    r"સૂચનાઓ અવગણો|સિસ્ટમ પ્રોમ્પ્ટ|"
    # Tamil
    r"வழிகாட்டிகளை புறக்கணி|சிஸ்டம் ப்ராம்ப்ட்|"
    # Telugu
    r"సూచనలను ఉల్లంఘించు|సిస్టమ్ ప్రాంప్ట్|"
    # Kannada
    r"ಸೂಚನೆಗಳನ್ನು ನಿರ್ಲಕ್ಷಿಸಿ|ಸಿಸ್ಟಮ್ ಪ್ರಾಂಪ್ಟ್|"
    # Malayalam
    r"നിർദ്ദേശങ്ങൾ അവഗണിക്കുക|സിസ്റ്റം പ്രോംപ്റ്റ്|"
    # Punjabi
    r"ਹਦਾਇਤਾਂ ਨਜ਼ਰਅੰਦਾਜ਼ ਕਰੋ|ਸਿਸਟਮ ਪ੍ਰਾਂਪਟ|"
    # Marathi
    r"सूचना दुर्लक्ष करा|सिस्टम प्रॉम्प्ट|"
    # Nepali
    r"निर्देशन बेवास्ता गर|सिस्टम प्रम्प्ट|"
    # Odia
    r"ନିର୍ଦ୍ଦେଶ ଅବମାନ କର|ସିଷ୍ଟମ ପ୍ରମ୍ପଟ|"
    # Urdu (Roman)
    r"hidayat nazar andaz|system prompt)",
    re.IGNORECASE,
)

SAFETY = re.compile(
    r"(bomb|explosive|weapon|kill (someone|people)|hate speech|child porn|sexual content|"
    r"how to commit suicide|drugs (to )?make|meth recipe|identity theft|"
    r"steal (credit|bank)|how to hack|how to murder|how to kill|"
    r"make a bomb|build a bomb|poison someone|assault someone|"
    r"terrorist attack|shoot someone|stab someone|"
    r"bomb बनाने|बम कैसे|बम बनाने|हथियार|मार डालो|मारना सिखाओ|मारना कैसे|"
    r"किसी को मारना|किसी को मार|मार दो|घायल करना|ज़ख्मी करना|नुकसान पहुँचाना|"
    r"आत्महत्या कैसे करें|हैक कैसे करें|बनाना सीखाओ|बनाने का तरीका|"
    r"maarna|maar do|maar doon|maar dena|hathiyar|ghayal|zakhmi|"
    r"kisi ko maar|kisi ko maarna|suicide kaise|atmahatya|"
    r"বোমা তৈরি|বোমা কিভাবে|হত্যা করো|হত্যা কিভাবে|অস্ত্র|"
    r"બોમ્બ બનાવો|હત્યા કરો|હત્યા કેવી રીતે|હથિયાર|"
    r"குண்டு தயாரிக்க|கொல்ல எப்படி|ஆயுதம்|"
    r"బాంబు తయారు చేయి|చంపడం ఎలా|ఆయుధం|"
    r"ಬಾಂಬ್ ಮಾಡು|ಕೊಲ್ಲುವುದು ಹೇಗೆ|ಆಯುಧ|"
    r"ബോംബ് ഉണ്ടാക്കുക|കൊല്ലാൻ എങ്ങനെ|ആയുധം|"
    r"ਬੰਬ ਬਣਾਓ|ਮਾਰ ਕਿਵੇਂ|ਹਥਿਆਰ|"
    r"qatal kaise|bandooq|hatyar)",
    re.IGNORECASE,
)
