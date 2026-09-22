# Agentic Fraud Investigation at Scale: Building an Autonomous Financial Crimes Copilot with TigerGraph and GraphRAG

> *By Shrut Rai — Hacker House Goa 2026 Submission*  
> *Tag: `@TigerGraphDB` #GraphAI #Fintech #AgenticAI #FraudInvestigation #HHGoa2026*

---

## 1. The Financial Crimes Bottleneck

In modern financial institutions, fraud detection models generate hundreds of thousands of alerts daily. Yet, an alert is simply a score—a reason to look, never a verdict.

When an alert fires, human fraud analysts are trapped in a slow, fragmented workflow:
- Manually pulling transaction history across 60 days
- Tracing money movement across merchant networks
- Cross-referencing device profiles, IPs, and proxies
- Reviewing hundreds of pages of bank policies (e.g. BSA/AML, FinCEN advisories)
- Determining whether to block a card, request step-up authentication, or file a Suspicious Activity Report (SAR)

Because this investigative loop takes hours per case, money is often long gone before action can be taken. Worse, crude threshold models either let complex fraud syndicates slip through or embarrass legitimate VIP customers with false card blocks.

To solve this, we built the **Agentic Fraud Investigation Copilot** powered natively by **TigerGraph**, **GraphRAG**, and **TigerGraph MCP**.

---

## 2. What We Built

Our system is an end-to-end autonomous agent that investigates incoming fraud triggers, navigates massive multi-hop graph networks, calibrates decision uncertainty, recommends defensible next-best actions, drafts regulatory SAR filings, and commits closed findings back into graph memory.

### Core Capabilities:
1. **Multi-Source Trigger Ingestion**: Processes machine-learning risk scores, customer dispute messages, and senior analyst inquiries.
2. **Deep Graph Traversal**: Queries card time windows, customer behavioral baselines, device fingerprints, and shared-origin syndicates across 590,000+ transactions.
3. **GraphRAG Knowledge Grounding**: Fuses dynamic graph subgraphs with bank fraud policies (Rules R1 to R10), regulatory advisories (FinCEN, FATF, FFIEC), and 5,565 historical closed cases.
4. **Controlled Policy Action Routing**: Implements a strict two-stage decision loop (`Initial Recommendation` before customer outreach vs. `Final Recommendation` post-evidence), routing actions to `auto`, `L1` (Team Lead), and `L2` (Fraud Manager).
5. **Novel Undocumented Pattern Discovery**: Natively detects uncataloged fraud syndicates—such as multi-card structuring beneath $500 authorization thresholds (`HHG-006`) and anonymous proxy rings (`HHG-014`).
6. **Regulatory SAR Narrative Generation**: Drafts standalone, 6–12 sentence FinCEN-compliant narratives answering *Who, What, When, Where, How, and Why*.
7. **TigerGraph Case Memory**: Writes resolved cases back to TigerGraph as `CaseVertex` nodes, creating dynamic organizational memory for future investigations.

---

## 3. System Architecture & The Investigative Loop

```
[ Trigger Alert ] ──► [ TigerGraph MCP ] ──► [ GraphRAG Engine ]
                            │                        │
                            ▼                        ▼
                [ Multi-Hop Graph Traversal ]   [ Policy R1-R10 Evaluation ]
                            │                        │
                            └───────────┬────────────┘
                                        ▼
                        [ Stage 1: Initial Actions (auto/L1/L2) ]
                                        │
                                        ▼
                        [ Controlled Evidence Request ]
                                        │
                                        ▼
                        [ Stage 2: Final Actions & SAR Filing ]
                                        │
                                        ▼
                        [ Write to TigerGraph Case Memory ]
```

### The 5-Stage Agentic Lifecycle:
1. **Triage & Ingest**: When a trigger arrives, the agent queries the flagged transaction and computes historical customer baselines (average amount, 90th percentile, home billing regions, known channels).
2. **Graph Traversal (`card_window` & `device_neighbors`)**: The agent inspects a ±48-hour window on the card and traverses two hops from `Transaction -> DeviceProfile -> Connected Transactions -> Connected Cards`.
3. **Stage 1 Next Best Action**: The agent evaluates policy rules. If the signal is weak or solitary (Rule R1), the agent recommends non-intrusive actions: `VERIFY_WITH_CUSTOMER` (route `auto`) and `MONITOR_CARD` (route `auto`), deliberately refusing to block legitimate customers prematurely.
4. **Controlled Evidence Integration**: The agent submits an evidence request (e.g. customer validation) and simulates the cardholder's response based on grounded facts.
5. **Stage 2 Final Action & SAR**: If the customer confirms the charge, the agent closes the case as `CLOSE_NO_FRAUD` (Rule R3). If denied, the agent escalates fraud probability, executes `BLOCK_CARD` (routed to `L1` or `L2`), triggers `MONITOR_CONNECTED_CARDS` for shared-device neighbors (Rule R6), drafts a FinCEN SAR narrative, and commits the investigation to TigerGraph case memory.

---

## 4. How TigerGraph Powers the Solution

Graph technology is the beating heart of this solution. Relational databases choke on multi-hop entity resolution; TigerGraph executes deep graph traversals in milliseconds.

### A. Graph Schema Design
- **Vertices**: `Customer`, `Card`, `Transaction`, `DeviceProfile`, `BillingRegion`, `EmailDomain`, `ClosedCase`, and `CaseVertex`.
- **Edges**: `OWNS`, `MADE`, `FROM_DEVICE`, `BILLED_IN`, `PURCHASER_EMAIL`, `NEXT_TXN`, `CASE_INVOLVES`, `CASE_ON_CARD`, `CASE_DEVICE`.

### B. High-Performance GSQL Queries
1. **`card_window`**: Retrieves chronological transaction sequences within a time window for velocity analysis.
2. **`device_neighbors`**: 2-hop traversal `(DeviceProfile <- FROM_DEVICE - Transaction <- MADE - Card)` discovering all other accounts sharing the exact same device signature.
3. **`find_similar_closed_cases`**: Vector & pattern similarity search across the 5,565 closed cases.
4. **`upsert_case_memory`**: Inserts newly resolved cases into TigerGraph, linking them to involved transactions and cards.

### C. TigerGraph MCP (Model Context Protocol) Server
We wrapped the graph queries in an MCP server conforming to the Model Context Protocol specification. This allows any LLM agent to invoke TigerGraph tools (`card_window`, `device_neighbors`, `customer_history`, `upsert_case_memory`) seamlessly using standardized tool definitions.

---

## 5. Benchmark Performance: Zero False Blocks on 20 Exam Cases

Evaluating on the official 20 benchmark cases (`HHG-001` to `HHG-020`):

- **Calibrated 50/50 Split**: Exactly 10 cases cleared as `legitimate` and 10 cases confirmed as `fraud`.
- **Zero Legitimate False Blocks**: Adhering to Rule R1 and R3, cases like `HHG-001` (travel across regions) and `HHG-007` (high score on primary home billing region 264) were verified and cleared without disruption.
- **Undocumented Pattern Detection**:
  - **`HHG-006` (Structuring / Threshold Evasion)**: Four online authorizations within 30 minutes, each between $450 and $490 (total $1,906.07). The agent recognized intentional evasion of the bank's $500 monitoring threshold, classified it as `undocumented` under Rule R9, filed a regulatory SAR, and blocked the card.
  - **`HHG-014` (Anonymous Proxy Syndicate)**: Triggered by an analyst inquiry with an ML score of only 0.05, the agent traced the device profile (`SM-G935F` behind `IP_PROXY:ANONYMOUS`) to 51 connected cards across the bank, matching closed precedent cases `CC-2649` and `CC-2971`.
- **Sub-Second Execution**: Graph traversal and policy evaluation execute in under 30 milliseconds per case.

---

## 6. What We Learned & Future Improvements

### What We Learned:
- **GraphRAG is far superior to vector RAG alone**: In fraud, connection topology is ground truth. A vector embedding cannot discover a 51-card proxy ring; a 2-hop TigerGraph traversal discovers it instantly.
- **Uncertainty is a feature, not a bug**: Fraud signals are noisy. By dividing next-best actions into `Initial` and `Final` stages with explicit policy routing (`auto`, `L1`, `L2`), the agent operates safely within compliance boundaries.

### What We Would Improve with More Time:
1. **Dynamic Community Detection**: Implement Louvain or Weakly Connected Components (WCC) inside GSQL to cluster emerging fraud rings in real-time before transactions clear.
2. **Streaming Kafka Ingestion**: Connect TigerGraph directly to Kafka transaction streams for sub-second pre-authorization fraud blocking.
3. **Graph Neural Networks (GNNs)**: Train a TigerGraph Graph Convolutional Network (GCN) embedding node representations directly in Savanna for zero-shot anomaly detection.

---

## 7. Conclusion

By combining **TigerGraph's massive graph traversal speed**, **GraphRAG policy grounding**, and **agentic uncertainty calibration**, we transformed fraud investigation from a slow, reactive chore into a proactive, autonomous copilot.

Check out the code, run the interactive dashboard, and inspect the 20 benchmark files on GitHub!
