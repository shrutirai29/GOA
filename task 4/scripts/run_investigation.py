"""
Batch Investigation Runner: Executes agent on all 20 benchmark exam cases
Generates the required cases/<case_id>.json answer files.
"""

import os
import sys
import json
import argparse
import pandas as pd
from datetime import datetime

# Add root of task 4 to path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, base_dir)

from agent.investigator import FraudInvestigationAgent
from tigergraph.client import TigerGraphClient
from rag.case_memory import CaseMemoryManager

def run_all(case_filter: str = None):
    print("=" * 75)
    print("  TigerGraph Agentic Fraud Investigation — 20 Benchmark Cases Runner")
    print("=" * 75)

    data_dir = os.path.join(base_dir, "data")
    pack_path = os.path.join(data_dir, "case_pack.csv")
    cases_dir = os.path.join(base_dir, "cases")
    os.makedirs(cases_dir, exist_ok=True)

    df_pack = pd.read_csv(pack_path)
    if case_filter:
        df_pack = df_pack[df_pack['case_id'] == case_filter]

    print(f"Loaded {len(df_pack)} cases from {pack_path}.")
    
    tg_client = TigerGraphClient(data_dir="data")
    case_memory = CaseMemoryManager()
    agent = FraudInvestigationAgent(tg_client=tg_client, case_memory=case_memory)

    results_summary = []

    print("\nStarting autonomous investigations...")
    for idx, row in df_pack.iterrows():
        case_info = row.to_dict()
        cid = case_info["case_id"]
        print(f"\n---> Investigating [{cid}] ({case_info['trigger_type']}) on card {case_info['card_id']}...")
        
        result = agent.investigate(case_info)
        res_json = result.model_dump()

        # Save to cases/<case_id>.json
        out_file = os.path.join(cases_dir, f"{cid}.json")
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(res_json, f, indent=2)

        verdict = res_json['case']['verdict']
        pattern = res_json['case']['pattern']
        prob = res_json['case']['fraud_probability']
        exposure = res_json['case']['exposure_usd']
        sar = res_json['sar']['file']
        n_conn = len(res_json['case']['connected_card_ids'])
        final_actions = " -> ".join([f"{a['action']}({a['route']})" for a in res_json['next_best_actions']['final']])

        results_summary.append({
            "Case": cid,
            "Verdict": verdict.upper(),
            "Pattern": pattern,
            "Prob": f"{prob:.2f}",
            "Exposure": f"${exposure:,.2f}",
            "SAR": "YES" if sar else "NO",
            "ConnectedCards": n_conn,
            "FinalActions": final_actions
        })

        print(f"      Result: {verdict.upper()} | Pattern: {pattern} | Prob: {prob:.2f} | Exposure: ${exposure:,.2f} | SAR: {'YES' if sar else 'NO'}")
        print(f"      Saved: {out_file}")

    print("\n" + "=" * 90)
    print("  EXAM BENCHMARK EVALUATION SUMMARY TABLE")
    print("=" * 90)
    summary_df = pd.DataFrame(results_summary)
    print(summary_df.to_string(index=False))
    print("=" * 90)
    print(f"\nAll 20 answer files successfully written to: {cases_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--case", type=str, default=None, help="Specific case ID to run (e.g. HHG-001)")
    args = parser.parse_args()
    run_all(case_filter=args.case)
