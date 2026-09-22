"""
Automated Submission Validator
Validates all 20 answer files against the official hackathon schema, policy rules, and dataset constraints.
"""

import os
import sys
import json
import pandas as pd
from typing import Dict, List, Any

# Add root of task 4 to path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, base_dir)

from rag.policy import ALLOWED_ACTIONS, get_approval_route

EXPECTED_PATTERNS = {
    "card_testing", 
    "card_not_present_fraud", 
    "card_not_present_new_device", 
    "out_of_region_use", 
    "account_takeover", 
    "undocumented", 
    "none"
}

def validate_submission():
    cases_dir = os.path.join(base_dir, "cases")
    data_dir = os.path.join(base_dir, "data")
    pack_path = os.path.join(data_dir, "case_pack.csv")
    
    if not os.path.exists(pack_path):
        print(f"ERROR: {pack_path} does not exist.")
        return False
        
    df_pack = pd.read_csv(pack_path)
    expected_case_ids = df_pack['case_id'].tolist()
    
    print("=" * 80)
    print(f"  Validating 20 Case Answers in: {cases_dir}")
    print("=" * 80)

    errors = []
    warnings = []
    valid_count = 0

    for cid in expected_case_ids:
        cfile = os.path.join(cases_dir, f"{cid}.json")
        if not os.path.exists(cfile):
            errors.append(f"Missing answer file: {cid}.json")
            continue

        try:
            with open(cfile, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            errors.append(f"{cid}.json invalid JSON: {e}")
            continue

        # 1. Top Level Fields
        required_top = ["case_id", "case", "evidence_requests", "next_best_actions", "sar", "stop_reason", "tool_calls", "tokens", "latency_s"]
        for rf in required_top:
            if rf not in data:
                errors.append(f"[{cid}] Missing top-level field: {rf}")

        if data.get("case_id") != cid:
            errors.append(f"[{cid}] case_id mismatch: expected '{cid}', got '{data.get('case_id')}'")

        # 2. Case Part Fields
        cpart = data.get("case", {})
        required_case = [
            "status", "verdict", "fraud_probability", "pattern", "pattern_description",
            "affected_txn_ids", "first_suspicious_txn_id", "connected_card_ids",
            "connected_device_profiles", "exposure_usd", "evidence", "similar_prior_cases",
            "summary", "written_to_graph", "graph_case_id"
        ]
        for cf in required_case:
            if cf not in cpart:
                errors.append(f"[{cid}] Missing case field: {cf}")

        verdict = cpart.get("verdict")
        if verdict not in ["fraud", "legitimate", "uncertain"]:
            errors.append(f"[{cid}] Invalid verdict: {verdict}")

        pattern = cpart.get("pattern")
        if pattern not in EXPECTED_PATTERNS:
            errors.append(f"[{cid}] Invalid pattern: {pattern}")

        if pattern == "undocumented" and not cpart.get("pattern_description"):
            errors.append(f"[{cid}] pattern is 'undocumented' but pattern_description is empty.")

        prob = cpart.get("fraud_probability", -1)
        if not (0.0 <= prob <= 1.0):
            errors.append(f"[{cid}] fraud_probability {prob} must be between 0 and 1.")

        # Legitimate verdict constraints
        if verdict == "legitimate":
            if cpart.get("affected_txn_ids") != []:
                errors.append(f"[{cid}] Legitimate verdict must have empty affected_txn_ids.")
            if cpart.get("exposure_usd") != 0.0:
                errors.append(f"[{cid}] Legitimate verdict must have exposure_usd == 0.")
            if data.get("sar", {}).get("file") is not False:
                errors.append(f"[{cid}] Legitimate verdict must have sar.file == false.")

        # 3. SAR Part
        sar = data.get("sar", {})
        if "file" not in sar or "reason" not in sar or "narrative" not in sar or "subjects" not in sar or "total_amount_usd" not in sar or "activity_dates" not in sar:
            errors.append(f"[{cid}] SAR part missing required fields.")

        if sar.get("file") is True:
            if not sar.get("narrative") or len(sar.get("narrative")) < 50:
                errors.append(f"[{cid}] SAR file is true but narrative is missing or too short.")
            if not sar.get("subjects"):
                errors.append(f"[{cid}] SAR file is true but subjects list is empty.")
            if sar.get("total_amount_usd", 0) <= 0:
                errors.append(f"[{cid}] SAR file is true but total_amount_usd <= 0.")
            if len(sar.get("activity_dates", [])) != 2:
                errors.append(f"[{cid}] SAR file is true but activity_dates does not contain exactly 2 dates.")
        else:
            if sar.get("narrative") != "":
                errors.append(f"[{cid}] SAR file is false but narrative is not empty string.")
            if sar.get("subjects") != []:
                errors.append(f"[{cid}] SAR file is false but subjects is not empty list.")
            if sar.get("total_amount_usd") != 0.0:
                errors.append(f"[{cid}] SAR file is false but total_amount_usd != 0.")
            if sar.get("activity_dates") != []:
                errors.append(f"[{cid}] SAR file is false but activity_dates is not empty list.")

        # 4. Next Best Actions Part
        nba = data.get("next_best_actions", {})
        if "initial" not in nba or "final" not in nba or "what_changed" not in nba:
            errors.append(f"[{cid}] next_best_actions missing initial, final, or what_changed.")

        has_file_report = any(a.get("action") == "FILE_REPORT" for a in nba.get("final", []))
        if sar.get("file") != has_file_report:
            errors.append(f"[{cid}] sar.file ({sar.get('file')}) must match presence of FILE_REPORT in final actions ({has_file_report}).")

        for phase in ["initial", "final"]:
            for item in nba.get(phase, []):
                act = item.get("action")
                route = item.get("route")
                if act not in ALLOWED_ACTIONS:
                    errors.append(f"[{cid}] Unknown action: {act}")
                if route not in ["auto", "L1", "L2"]:
                    errors.append(f"[{cid}] Invalid route: {route}")

        valid_count += 1

    print(f"\nValidated {valid_count} / {len(expected_case_ids)} case files.")
    if errors:
        print(f"\nFAILED with {len(errors)} error(s):")
        for err in errors:
            print(f" - {err}")
        return False
    else:
        print("\nALL 20 CASE FILES PASSED OFFICIAL SUBMISSION VALIDATION!")
        return True

if __name__ == "__main__":
    success = validate_submission()
    sys.exit(0 if success else 1)
