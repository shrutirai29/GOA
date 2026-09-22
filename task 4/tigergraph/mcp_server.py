"""
TigerGraph Model Context Protocol (MCP) Server
Exposes TigerGraph graph traversal, similarity search, and case memory tools to AI Agents.
Compliant with the MCP JSON-RPC specification.
"""

import json
import os
import sys
from typing import Dict, Any, List, Optional
from datetime import datetime

# Add task 4 root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tigergraph.client import TigerGraphClient

class TigerGraphMCPServer:
    def __init__(self, tg_client: Optional[TigerGraphClient] = None):
        self.tg_client = tg_client or TigerGraphClient()
        self.tools = {
            "card_window": {
                "description": "GSQL card_window: Retrieves chronological transactions on a card around a target timestamp.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "customer_id": {"type": "string", "description": "Customer ID (e.g. C12382)"},
                        "center_ts": {"type": "string", "description": "ISO timestamp of the trigger transaction"},
                        "hours": {"type": "integer", "description": "Window span in hours (default 48)"}
                    },
                    "required": ["customer_id", "center_ts"]
                }
            },
            "device_neighbors": {
                "description": "GSQL device_neighbors: Traverses 2 hops to discover all cards and customers sharing a device profile.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "device_profile": {"type": "string", "description": "Full DeviceProfile string"}
                    },
                    "required": ["device_profile"]
                }
            },
            "customer_history": {
                "description": "Calculates customer historical baseline spending, normal billing regions, and channels.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "customer_id": {"type": "string", "description": "Customer ID"},
                        "before_ts": {"type": "string", "description": "ISO timestamp cutoff"}
                    },
                    "required": ["customer_id", "before_ts"]
                }
            },
            "search_similar_cases": {
                "description": "GraphRAG similarity retrieval across 5,565 historical closed cases.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pattern_hint": {"type": "string", "description": "Suspected fraud pattern name"},
                        "device_info": {"type": "string", "description": "Hardware device info string"},
                        "card_id": {"type": "string", "description": "Card identifier"},
                        "limit": {"type": "integer", "description": "Max results to return (default 5)"}
                    }
                }
            },
            "upsert_case_memory": {
                "description": "GSQL upsert_case_memory: Writes the finalized investigation case vertex to TigerGraph case memory.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "case_record": {"type": "object", "description": "Complete case JSON record"}
                    },
                    "required": ["case_record"]
                }
            }
        }

    def list_tools(self) -> List[Dict[str, Any]]:
        """Returns the list of available MCP tools."""
        return [{"name": name, **meta} for name, meta in self.tools.items()]

    def call_tool(self, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Dispatches an MCP tool call to the TigerGraph client."""
        if name not in self.tools:
            return {"error": f"Tool '{name}' not found on TigerGraph MCP server."}

        try:
            if name == "card_window":
                ts = datetime.fromisoformat(str(arguments["center_ts"]))
                hours = int(arguments.get("hours", 48))
                txns = self.tg_client.get_card_window(arguments["customer_id"], ts, hours)
                # Format timestamps as strings
                for t in txns:
                    t['ts'] = str(t['ts'])
                return {"result": txns, "count": len(txns)}

            elif name == "device_neighbors":
                res = self.tg_client.get_device_neighbors(arguments["device_profile"])
                return {"result": res}

            elif name == "customer_history":
                ts = datetime.fromisoformat(str(arguments["before_ts"]))
                res = self.tg_client.get_customer_history(arguments["customer_id"], ts)
                return {"result": res}

            elif name == "search_similar_cases":
                res = self.tg_client.search_similar_closed_cases(
                    pattern_hint=arguments.get("pattern_hint"),
                    device_info=arguments.get("device_info"),
                    card_id=arguments.get("card_id"),
                    limit=arguments.get("limit", 5)
                )
                return {"result": res, "count": len(res)}

            elif name == "upsert_case_memory":
                graph_case_id = self.tg_client.upsert_case_memory(arguments["case_record"])
                return {"status": "success", "graph_case_id": graph_case_id}

            return {"error": f"Unhandled tool '{name}'"}

        except Exception as e:
            return {"error": str(e)}

if __name__ == "__main__":
    server = TigerGraphMCPServer()
    print("TigerGraph MCP Server initialized with tools:")
    for t in server.list_tools():
        print(f" - {t['name']}: {t['description']}")
