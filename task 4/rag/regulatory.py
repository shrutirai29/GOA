"""
Regulatory Knowledge & SAR Standards (FinCEN, FATF, FFIEC)
Provides regulatory grounding and SAR narrative synthesis rules.
"""

from typing import Dict, List, Any, Tuple

REGULATORY_CORPUS = {
    "FinCEN_SAR_Narrative": "FinCEN Guidance: A complete SAR narrative must answer the six essential questions: Who conducted the activity, What instruments or mechanisms were used, When did the suspicious activity occur, Where did it take place, How was it completed, and Why does the institution consider it suspicious. Avoid jargon; provide exact transaction identifiers, amounts, and connected entities.",
    "FinCEN_ATO": "FinCEN Advisory on Account Takeover: ATO involves unauthorized acquisition of customer credentials used to initiate transactions across atypical channels or devices, often accompanied by changes to communication channels or proxy evasion.",
    "FATF_Cyber_Fraud": "FATF Cyber-Enabled Fraud: Typologies include automated credential stuffing, card testing bots targeting micro-merchants, and organized multi-account proxy rings routing transactions through masked IP infrastructures.",
    "FFIEC_Red_Flags": "FFIEC Red Flags: High-velocity transactions from single IP/device across multiple cards; rapid succession of transactions just beneath monitoring thresholds (structuring); transactions in disparate geographic regions within impossible travel intervals."
}

def should_file_sar(verdict: str, fraud_probability: float, exposure_usd: float, 
                    has_shared_device: bool, has_connected_cards: bool, 
                    is_undocumented: bool) -> Tuple[bool, str]:
    """
    Evaluates whether a Suspicious Activity Report (SAR) is legally required under Policy Section 3a:
    File when fraud is confirmed or strongly suspected AND at least one holds:
    - exposure exceeds $1,000
    - connects to shared device profile, shared region, or another customer's fraud
    - pattern is coordinated or undocumented (R9)
    """
    if verdict != "fraud" and fraud_probability < 0.70:
        return False, "Fraud not confirmed or strongly suspected; SAR not warranted."
    
    triggers = []
    if exposure_usd > 1000.0:
        triggers.append(f"exposure of ${exposure_usd:.2f} exceeds regulatory $1,000 reporting threshold")
    if has_shared_device or has_connected_cards:
        triggers.append("activity connects to shared device profile or multi-card syndicate")
    if is_undocumented:
        triggers.append("activity exhibits coordinated or undocumented evasion pattern (Rule R9)")

    if triggers:
        reason = f"Mandatory SAR filing required under Policy 3a and {'; '.join(triggers)}."
        return True, reason
    else:
        return False, "Exposure below $1,000 and no cross-card or coordinated syndicate detected."
