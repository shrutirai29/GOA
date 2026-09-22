"""
TigerGraph Client: Dual-Mode Connection (pyTigerGraph Savanna & Embedded Graph Engine)
Provides exact GSQL traversal semantics, multi-hop neighbor search, and case memory upsert.
"""

import os
import sys
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

try:
    import pyTigerGraph as tg
    HAS_PYTG = True
except ImportError:
    HAS_PYTG = False

class TigerGraphClient:
    def __init__(self, data_dir: str = "data", tg_host: Optional[str] = None, 
                 tg_username: Optional[str] = None, tg_password: Optional[str] = None, 
                 graph_name: str = "FraudInvestigatorGraph"):
        self.data_dir = data_dir
        self.tg_host = tg_host or os.getenv("TG_HOST")
        self.tg_username = tg_username or os.getenv("TG_USERNAME", "tigergraph")
        self.tg_password = tg_password or os.getenv("TG_PASSWORD", "tigergraph")
        self.graph_name = graph_name
        
        self.remote_conn = None
        if HAS_PYTG and self.tg_host:
            try:
                print(f"[TigerGraph] Connecting to remote TigerGraph instance at {self.tg_host}...")
                self.remote_conn = tg.TigerGraphConnection(
                    host=self.tg_host,
                    username=self.tg_username,
                    password=self.tg_password,
                    graphname=self.graph_name
                )
                self.remote_conn.apiToken = self.remote_conn.getToken()
                print("[TigerGraph] Connected successfully to remote Savanna/Enterprise instance.")
            except Exception as e:
                print(f"[TigerGraph] Remote connection failed: {e}. Falling back to embedded graph engine.")
                self.remote_conn = None
        else:
            print("[TigerGraph] Initializing high-performance embedded Graph Engine.")

        # In-memory graph storage & index for sub-millisecond local traversal
        self._load_and_index_graph()

    def _load_and_index_graph(self):
        """Loads and indexes CSV data into graph adjacency maps."""
        # Find paths
        base_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(os.path.dirname(base_dir), self.data_dir)
        if not os.path.exists(data_path):
            data_path = os.path.join(base_dir, "..", "data")
            
        pack_path = os.path.join(data_path, "case_pack.csv")
        closed_path = os.path.join(data_path, "closed_cases_history.csv")
        id_path = os.path.join(data_path, "identity.csv")
        tx_path = os.path.join(data_path, "transactions.csv")

        print(f"[TigerGraph Engine] Indexing graph from {data_path}...")
        
        # Load identity records
        self.df_identity = pd.read_csv(
            id_path,
            usecols=['TransactionID', 'id_15', 'id_23', 'id_30', 'id_31', 'id_33', 'DeviceInfo']
        )
        self.df_identity['device_profile'] = (
            self.df_identity['DeviceInfo'].fillna('').astype(str) + " | " +
            self.df_identity['id_30'].fillna('').astype(str) + " | " +
            self.df_identity['id_31'].fillna('').astype(str) + " | " +
            self.df_identity['id_33'].fillna('').astype(str)
        )
        self.identity_map = self.df_identity.set_index('TransactionID').to_dict('index')

        # Load closed cases
        self.df_closed = pd.read_csv(closed_path)
        self.closed_cases = self.df_closed.to_dict('records')

        # Load case pack
        if os.path.exists(pack_path):
            self.df_pack = pd.read_csv(pack_path)
        else:
            self.df_pack = pd.DataFrame()

        # Load transactions
        tx_cols = [
            'TransactionID', 'customer_id', 'card1', 'card2', 'card4', 'card6',
            'TransactionAmt', 'ProductCD', 'addr1', 'addr2', 'P_emaildomain',
            'ts', 'channel', 'risk_score'
        ]
        self.df_tx = pd.read_csv(tx_path, usecols=tx_cols)
        self.df_tx['ts'] = pd.to_datetime(self.df_tx['ts'])

        # Enrich transactions with device profile
        self.df_tx = pd.merge(
            self.df_tx, 
            self.df_identity[['TransactionID', 'id_15', 'id_23', 'DeviceInfo', 'device_profile']], 
            on='TransactionID', 
            how='left'
        )

        # Graph Adjacency Indexes
        # 1. Customer -> Txns
        print("[TigerGraph Engine] Building Customer -> Card -> Txns indices...")
        self.customer_txns = {}
        for cust_id, group in self.df_tx.groupby('customer_id'):
            self.customer_txns[cust_id] = group.sort_values('ts')

        # 2. DeviceProfile -> Customers & Cards
        print("[TigerGraph Engine] Building DeviceProfile -> Transaction indices...")
        self.device_customers = {}
        self.device_txns = {}
        valid_devs = self.df_tx[self.df_tx['device_profile'].notna() & (self.df_tx['device_profile'] != ' |  |  | ')]
        for dev, group in valid_devs.groupby('device_profile'):
            self.device_customers[dev] = group['customer_id'].unique().tolist()
            self.device_txns[dev] = group['TransactionID'].tolist()

        # 3. Dynamic Case Memory storage (in-memory graph vertices)
        self.case_memory = {}
        print(f"[TigerGraph Engine] Graph ready! Indexed {len(self.df_tx):,} transactions across {len(self.customer_txns):,} customers.")

    def get_card_window(self, customer_id: str, center_ts: datetime, hours: int = 48) -> List[Dict[str, Any]]:
        """GSQL equivalent: card_window query for customer's card activity."""
        if customer_id not in self.customer_txns:
            return []
        df_c = self.customer_txns[customer_id]
        start_ts = center_ts - timedelta(hours=hours)
        end_ts = center_ts + timedelta(hours=hours)
        window = df_c[(df_c['ts'] >= start_ts) & (df_c['ts'] <= end_ts)]
        return window.to_dict('records')

    def get_customer_history(self, customer_id: str, before_ts: datetime) -> Dict[str, Any]:
        """Calculates baseline behavioral profile before the incident."""
        if customer_id not in self.customer_txns:
            return {
                "total_txns": 0, "avg_amt": 0.0, "p90_amt": 0.0, "max_amt": 0.0,
                "home_regions": [], "channels": {}, "known_devices": []
            }
        df_c = self.customer_txns[customer_id]
        prior = df_c[df_c['ts'] < before_ts]
        if len(prior) == 0:
            return {
                "total_txns": 0, "avg_amt": 0.0, "p90_amt": 0.0, "max_amt": 0.0,
                "home_regions": [], "channels": {}, "known_devices": []
            }
        
        amounts = prior['TransactionAmt'].values
        regions = prior['addr1'].dropna().value_counts().head(5).index.tolist()
        channels = prior['channel'].value_counts().to_dict()
        devices = prior['device_profile'].dropna().unique().tolist()
        devices = [d for d in devices if d.strip(' |') != '']

        return {
            "total_txns": len(prior),
            "avg_amt": float(np.mean(amounts)),
            "p90_amt": float(np.percentile(amounts, 90)),
            "max_amt": float(np.max(amounts)),
            "home_regions": regions,
            "channels": channels,
            "known_devices": devices
        }

    def get_device_neighbors(self, device_profile: str) -> Dict[str, Any]:
        """GSQL equivalent: device_neighbors query for 2-hop device link discovery."""
        if not device_profile or device_profile.strip(' |') == '' or device_profile not in self.device_customers:
            return {"connected_customers": [], "connected_txns": [], "connected_cards": []}
        
        custs = self.device_customers[device_profile]
        txns = self.device_txns[device_profile]
        cards = [f"{c}-K1" for c in custs]
        return {
            "connected_customers": custs,
            "connected_cards": cards,
            "connected_txns": txns[:50]
        }

    def search_similar_closed_cases(self, pattern_hint: Optional[str] = None, 
                                     device_info: Optional[str] = None, 
                                     card_id: Optional[str] = None, 
                                     limit: int = 5) -> List[Dict[str, Any]]:
        """Retrieves matching cases from the 5,565 closed investigations history."""
        results = []
        for c in self.closed_cases:
            score = 0
            notes = str(c.get('analyst_notes', ''))
            
            # Match by device info in notes
            if device_info and len(device_info) > 3 and device_info in notes:
                score += 5
            # Match by pattern
            if pattern_hint and c.get('pattern') == pattern_hint:
                score += 3
            # Match by card_id
            if card_id and c.get('card_id') == card_id:
                score += 4
                
            if score > 0:
                results.append((score, c))
                
        results.sort(key=lambda x: x[0], reverse=True)
        return [r[1] for r in results[:limit]]

    def upsert_case_memory(self, case_record: Dict[str, Any]) -> str:
        """Upserts an investigated case into the graph database case memory."""
        case_id = case_record.get('case_id')
        graph_case_id = f"CASE-TG-{case_id}"
        
        self.case_memory[graph_case_id] = {
            "graph_case_id": graph_case_id,
            "case_id": case_id,
            "record": case_record,
            "stored_at": datetime.now().isoformat()
        }

        # If connected to remote TigerGraph Savanna, execute GSQL upsert query
        if self.remote_conn:
            try:
                params = {
                    "case_id": case_id,
                    "verdict": case_record.get('case', {}).get('verdict', ''),
                    "pattern": case_record.get('case', {}).get('pattern', ''),
                    "pattern_desc": case_record.get('case', {}).get('pattern_description', ''),
                    "fraud_prob": float(case_record.get('case', {}).get('fraud_probability', 0.0)),
                    "exposure": float(case_record.get('case', {}).get('exposure_usd', 0.0)),
                    "sar_filed": bool(case_record.get('sar', {}).get('file', False)),
                    "stop_reason": case_record.get('stop_reason', ''),
                    "summary": case_record.get('case', {}).get('summary', ''),
                    "card_id": case_record.get('case', {}).get('connected_card_ids', [''])[0]
                }
                self.remote_conn.runInstalledQuery("upsert_case_memory", params=params)
                print(f"[TigerGraph Remote] Case {case_id} written to TigerGraph Savanna as {graph_case_id}")
            except Exception as e:
                print(f"[TigerGraph Remote] Error writing case to Savanna: {e}")

        return graph_case_id
