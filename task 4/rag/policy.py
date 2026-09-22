"""
Fraud Policy Engine: Rules R1 - R10 & Approval Routing Table
Strict implementation of Bank Fraud Policy v1.0.
"""

from typing import Dict, List, Any, Optional

ALLOWED_ACTIONS = {
    "ALLOW_TRANSACTION",
    "DECLINE_TRANSACTION",
    "MONITOR_CARD",
    "MONITOR_CONNECTED_CARDS",
    "WARN_CUSTOMER",
    "VERIFY_WITH_CUSTOMER",
    "STEP_UP_AUTH",
    "BLOCK_CARD",
    "BLOCK_ALL_CARDS",
    "GENERATE_REPORT",
    "CREATE_CASE",
    "FILE_REPORT",
    "ESCALATE_TO_ANALYST",
    "CLOSE_NO_FRAUD"
}

def get_approval_route(action: str, exposure_usd: float = 0.0) -> str:
    """
    Returns the required approval route for an action under Policy Section 2:
    - auto: The agent may execute alone
    - L1: Team lead approval required
    - L2: Fraud manager approval required
    """
    if action == "DECLINE_TRANSACTION":
        return "L1"
    elif action == "BLOCK_CARD":
        return "L1" if exposure_usd <= 2500.0 else "L2"
    elif action in ("BLOCK_ALL_CARDS", "FILE_REPORT"):
        return "L2"
    elif action in (
        "ALLOW_TRANSACTION", "MONITOR_CARD", "MONITOR_CONNECTED_CARDS",
        "WARN_CUSTOMER", "VERIFY_WITH_CUSTOMER", "STEP_UP_AUTH",
        "GENERATE_REPORT", "CREATE_CASE", "ESCALATE_TO_ANALYST", "CLOSE_NO_FRAUD"
    ):
        return "auto"
    else:
        raise ValueError(f"Unknown policy action: {action}")

POLICY_RULES = {
    "R1": "Verify before you block on a weak signal. If the case rests on a single signal (including risk score alone) and assessed fraud probability is below 0.70, recommend VERIFY_WITH_CUSTOMER or STEP_UP_AUTH before any block.",
    "R2": "Customer denies the transaction: recommend BLOCK_CARD and CREATE_CASE. Add FILE_REPORT if exposure exceeds $1,000 or the case connects to a shared device profile or another card's fraud.",
    "R3": "Customer confirms the transaction: recommend CLOSE_NO_FRAUD. Note the confirmation in the case file.",
    "R4": "No reply within 24 hours: recommend MONITOR_CARD and DECLINE_TRANSACTION for pending authorizations. Escalate if exposure exceeds $500.",
    "R5": "Card testing: Three or more small online authorizations on one card within an hour, followed by a larger purchase: recommend DECLINE_TRANSACTION and STEP_UP_AUTH. If purchase over $100 cleared, recommend BLOCK_CARD.",
    "R6": "Shared origin: When several cards show fraud from the same device profile, billing region, or recipient email in one window, recommend CREATE_CASE, FILE_REPORT, and MONITOR_CONNECTED_CARDS for every card that shares it.",
    "R7": "Disputed but legitimate: When the customer disputes a charge that matches their own recurring pattern (same merchant, same amount monthly), recommend CREATE_CASE, VERIFY_WITH_CUSTOMER, and WARN_CUSTOMER. Do not block.",
    "R8": "Escalate when uncertain and exposed: If verdict is uncertain and exposure exceeds $500, or evidence conflicts, recommend ESCALATE_TO_ANALYST.",
    "R9": "Undocumented patterns: When activity fits none of the known patterns but evidence shows coordinated or repeated abuse across customers, recommend CREATE_CASE, FILE_REPORT, and ESCALATE_TO_ANALYST. Describe pattern in own words.",
    "R10": "Never BLOCK_ALL_CARDS unless at least two of the customer's cards show confirmed fraud or customer credentials are confirmed compromised."
}
