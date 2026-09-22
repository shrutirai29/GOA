"""
TigerGraph Savanna & Community Edition Automated Ingestion Script
Deploys GSQL schema, loading jobs, and queries to a live TigerGraph instance.
"""

import os
import sys
import argparse

try:
    import pyTigerGraph as tg
except ImportError:
    print("pyTigerGraph is not installed. Run: pip install pyTigerGraph")
    sys.exit(1)

def deploy_to_tigergraph(host: str, username: str, password: str, graph_name: str = "FraudInvestigatorGraph"):
    print("=" * 75)
    print(f"  Deploying Fraud Investigation Graph to TigerGraph at {host}")
    print("=" * 75)

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    schema_path = os.path.join(base_dir, "tigergraph", "schema.gsql")
    queries_path = os.path.join(base_dir, "tigergraph", "queries.gsql")

    conn = tg.TigerGraphConnection(host=host, username=username, password=password)
    
    print("\n[1/3] Creating Graph and Deploying GSQL Schema...")
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_gsql = f.read()
    res = conn.gsql(schema_gsql)
    print("Schema Output:\n", res)

    print("\n[2/3] Connecting to Graph & Generating Token...")
    conn.graphname = graph_name
    conn.apiToken = conn.getToken()

    print("\n[3/3] Deploying and Installing GSQL Queries...")
    with open(queries_path, "r", encoding="utf-8") as f:
        queries_gsql = f.read()
    res_q = conn.gsql(queries_gsql)
    print("Queries Output:\n", res_q)

    print("\nTigerGraph deployment complete! Graph is ready for agentic investigations.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", type=str, default=os.getenv("TG_HOST", "http://127.0.0.1:14240"), help="TigerGraph Host URL")
    parser.add_argument("--username", type=str, default=os.getenv("TG_USERNAME", "tigergraph"), help="TG Username")
    parser.add_argument("--password", type=str, default=os.getenv("TG_PASSWORD", "tigergraph"), help="TG Password")
    args = parser.parse_args()

    deploy_to_tigergraph(args.host, args.username, args.password)
