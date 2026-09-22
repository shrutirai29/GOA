"""
Case Memory & Historical Precedent Retrieval
Indexes 5,565 closed investigations and manages dynamic case memory.
"""

import os
import pandas as pd
from typing import List, Dict, Any, Optional

class CaseMemoryManager:
    def __init__(self, data_path: Optional[str] = None):
        if not data_path:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            data_path = os.path.join(os.path.dirname(base_dir), "data", "closed_cases_history.csv")
            
        print(f"[Case Memory] Loading closed cases from {data_path}...")
        self.df = pd.read_csv(data_path)
        self.cases = self.df.to_dict('records')
        
        # Build index by pattern
        self.by_pattern = {}
        for c in self.cases:
            pat = c.get('pattern')
            if pat not in self.by_pattern:
                self.by_pattern[pat] = []
            self.by_pattern[pat].append(c)

        # Dynamic memory for newly resolved cases
        self.dynamic_memory = {}
        print(f"[Case Memory] Successfully indexed {len(self.cases):,} historical closed cases.")

    def retrieve_similar(self, pattern: str, device_profile: Optional[str] = None, 
                         exposure: Optional[float] = None, limit: int = 3) -> List[str]:
        """
        Retrieves IDs of the most relevant historical closed cases for memory citation.
        Returns a list of Case IDs (e.g. ['CC-0141', 'CC-2649']).
        """
        scored = []
        clean_dev = (device_profile or "").split("|")[0].strip()

        # Prioritize matching cases
        candidates = self.cases
        if pattern in self.by_pattern:
            candidates = self.by_pattern[pattern] + [c for c in self.cases if c.get('pattern') != pattern][:200]

        for c in candidates:
            score = 0
            notes = str(c.get('analyst_notes', ''))
            
            # Exact device hardware match
            if clean_dev and len(clean_dev) > 3 and clean_dev in notes:
                score += 15
            # Pattern match
            if c.get('pattern') == pattern:
                score += 8
            # Exposure proximity
            if exposure and pd.notna(c.get('exposure_usd')):
                c_exp = float(c['exposure_usd'])
                if abs(c_exp - exposure) < 100:
                    score += 4
            # Undocumented keyword matches
            if pattern == "undocumented":
                if "proxy" in notes.lower():
                    score += 10
                if "threshold" in notes.lower() or "stay under" in notes.lower() or "forty minutes" in notes.lower():
                    score += 10

            if score > 0:
                scored.append((score, c['case_id']))

        scored.sort(key=lambda x: x[0], reverse=True)
        unique_ids = []
        for _, cid in scored:
            if cid not in unique_ids:
                unique_ids.append(cid)
            if len(unique_ids) >= limit:
                break
        return unique_ids

    def register_closed_case(self, case_record: Dict[str, Any]):
        """Registers newly resolved case into dynamic memory."""
        cid = case_record.get('case_id')
        self.dynamic_memory[cid] = case_record
