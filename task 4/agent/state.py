"""
Investigation State & Official Answer Schema Models
Strictly mirrors the official Answer Format required by Hacker House Goa 2026.
"""

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field

class EvidenceItem(BaseModel):
    claim: str
    source: Literal["graph", "document", "customer", "external"]
    ref: str
    entity_ids: List[str]

class CasePart(BaseModel):
    status: Literal["open", "closed_fraud", "closed_legitimate", "escalated"]
    verdict: Literal["fraud", "legitimate", "uncertain"]
    fraud_probability: float = Field(..., ge=0.0, le=1.0)
    pattern: Literal[
        "card_testing", 
        "card_not_present_fraud", 
        "card_not_present_new_device", 
        "out_of_region_use", 
        "account_takeover", 
        "undocumented", 
        "none"
    ]
    pattern_description: str = ""
    affected_txn_ids: List[str] = Field(default_factory=list)
    first_suspicious_txn_id: str = ""
    connected_card_ids: List[str] = Field(default_factory=list)
    connected_device_profiles: List[str] = Field(default_factory=list)
    exposure_usd: float = 0.0
    evidence: List[EvidenceItem] = Field(default_factory=list)
    similar_prior_cases: List[str] = Field(default_factory=list)
    summary: str
    written_to_graph: bool = True
    graph_case_id: str = ""

class SARPart(BaseModel):
    file: bool
    reason: str
    narrative: str = ""
    subjects: List[str] = Field(default_factory=list)
    total_amount_usd: float = 0.0
    activity_dates: List[str] = Field(default_factory=list)

class ActionItem(BaseModel):
    action: str
    route: Literal["auto", "L1", "L2"]
    reason: str

class NextBestActionsPart(BaseModel):
    initial: List[ActionItem] = Field(default_factory=list)
    final: List[ActionItem] = Field(default_factory=list)
    what_changed: str = "nothing"

class EvidenceRequestItem(BaseModel):
    type: Literal["customer_validation", "step_up_auth", "analyst_info"]
    asked_after_step: int
    assumed_response: str

class InvestigationResult(BaseModel):
    case_id: str
    case: CasePart
    evidence_requests: List[EvidenceRequestItem] = Field(default_factory=list)
    next_best_actions: NextBestActionsPart
    sar: SARPart
    stop_reason: str
    tool_calls: int = 0
    tokens: int = 0
    latency_s: float = 0.0
