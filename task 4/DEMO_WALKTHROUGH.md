# 3–5 Minute Demo Video Walkthrough Script

> **Project**: TigerGraph Agentic Fraud Investigation Copilot  
> **Hackathon**: Hacker House Goa 2026 (Task 4)  
> **Target Duration**: 3:30 to 4:30 minutes  

---

## ⏱️ Video Structure Breakdown

| Timestamp | Section | Visual Focus | Key Audio Points |
|:---:|:---|:---|:---|
| **0:00 - 0:40** | **The Problem & Solution Overview** | Terminal / Dashboard Home | The analyst bottleneck; alerts vs verdicts; introducing our TigerGraph Agentic Copilot. |
| **0:40 - 1:30** | **Benchmark Matrix & Calibration** | Streamlit Overview Page | 20 cases overview; 50/50 split; why an agent that blocks everything fails. |
| **1:30 - 2:40** | **Deep Dive: Undocumented Fraud (`HHG-006` / `HHG-014`)** | Case Inspector + Subgraph Viz | Structuring under $500; 2-hop device traversal; multi-card syndicate; dual-stage actions. |
| **2:40 - 3:30** | **Legitimate Case Handling (`HHG-001` / `HHG-007`)** | Case Inspector (`HHG-007`) | R1 compliance; customer verification; zero false blocks; closing no fraud. |
| **3:30 - 4:15** | **FinCEN SAR Filing & TigerGraph Case Memory** | SAR Drawer + TigerGraph Schema | Standalone SAR narrative; writing case back to TigerGraph memory. |
| **4:15 - 4:45** | **Conclusion & Submission Summary** | Validation Terminal + GitHub Repo | 100% schema validation; TigerGraph MCP; thank you & wrap-up. |

---

## 🎙️ Detailed Speaking Script

### 0:00 - 0:40 | Introduction: The Fraud Analyst's Dilemma
- **[VISUAL]**: Show the project title on the Streamlit Dashboard (`http://localhost:8501`).
- **[AUDIO]**:
  > *"Hello everyone! In financial institutions today, fraud detection models generate thousands of risk alerts every day. But a risk score is just a reason to look—it is never a verdict.
  >
  > Fraud analysts are forced into slow, manual workflows: piecing together transaction histories, checking device fingerprints, reviewing hundreds of pages of bank policies, and deciding whether to freeze an account. By the time they finish, the stolen funds have already vanished.
  >
  > For Hacker House Goa 2026, we built the **TigerGraph Agentic Fraud Investigation Copilot**—an autonomous AI agent that investigates fraud triggers in milliseconds, navigates deep graph relationships, calibrates uncertainty, recommends policy-routed next-best actions, and writes findings into permanent graph case memory."*

---

### 0:40 - 1:30 | The Benchmark Matrix: Accurate Calibration
- **[VISUAL]**: Scroll across the Overview Page metric cards (20 Evaluated Cases, 50% Fraud, 50% Legitimate, Total Exposure $3,504, 4 SARs filed) and the benchmark table.
- **[AUDIO]**:
  > *"Here is our executive dashboard evaluating all 20 official benchmark cases from `case_pack.csv`.
  >
  > The first thing judges will notice is our strict calibration: exactly 10 cases confirmed as fraud, and 10 cases cleared as legitimate.
  >
  > As the competition rules state: half the cases are legitimate, and an agent that blocks everything scores badly. Our agent never blindly trusts a machine learning score. For example, in case `HHG-007`, the model scored a transaction at 0.87. But our agent traversed TigerGraph, discovered region 264 is the customer's primary home region with over 2,000 past purchases, verified the customer, and cleared the alert with zero customer disruption."*

---

### 1:30 - 2:40 | Deep Dive: Detecting Undocumented Fraud (`HHG-006`)
- **[VISUAL]**: Switch to **Case Deep Dive & Subgraph**, select `HHG-006`. Show the Subgraph Visualizer and the Dual-Stage Next Best Action cards.
- **[AUDIO]**:
  > *"Let's look at a critical case: `HHG-006`. This was triggered by a customer dispute for $482.12.
  >
  > When our agent called TigerGraph's `card_window` tool, it made a major discovery: four online purchases occurred within 30 minutes, each just under $500—$478, $456, $488, and $482, totaling $1,906.
  >
  > The agent recognized this as an **undocumented pattern**: intentional threshold evasion (structuring) designed to stay under a bank's $500 single-transaction trigger! It retrieved historical precedent cases `CC-3748` and `CC-3841` from TigerGraph case memory that showed this exact same typology.
  >
  > Notice our **Dual-Stage Next Best Actions**:
  > - In **Stage 1 (Initial)**, before customer response, the agent recommends `DECLINE_TRANSACTION` with route `L1` (Team Lead) and `VERIFY_WITH_CUSTOMER` (route `auto`).
  > - In **Stage 2 (Final)**, following customer denial, the agent escalates: recommending `BLOCK_CARD` (route `L1`), `CREATE_CASE` (route `auto`), `FILE_REPORT` (route `L2`, Fraud Manager), `MONITOR_CONNECTED_CARDS`, and `ESCALATE_TO_ANALYST` under Rule R9.
  >
  > The interactive subgraph shows the primary card, the four structured transactions, and the shared device profile connecting to other syndicate cards across the bank."*

---

### 2:40 - 3:30 | Multi-Card Syndicate Discovery (`HHG-014`)
- **[VISUAL]**: Select `HHG-014`. Highlight the 51 connected cards and the device profile.
- **[AUDIO]**:
  > *"Next, look at `HHG-014`. This was an analyst request where the machine learning risk score was only 0.05!
  >
  > An ordinary system would have ignored it. But our agent ran TigerGraph's 2-hop `device_neighbors` query and discovered that the device profile—a Samsung SM-G935F behind an anonymous proxy—is actively shared across **51 connected cards** in the bank!
  >
  > Under Rule R6 and R9, the agent placed all connected accounts under monitoring, blocked the card, and flagged the syndicate for human analyst review."*

---

### 3:30 - 4:15 | Automated FinCEN SAR Filing & TigerGraph Case Memory
- **[VISUAL]**: Scroll to the **Suspicious Activity Report (SAR)** box on `HHG-006` or `HHG-014`.
- **[AUDIO]**:
  > *"When policy calls for a regulatory report, our agent automatically generates a complete, standalone Suspicious Activity Report (SAR) narrative.
  >
  > As required by FinCEN guidance, this narrative answers the essential six questions: Who, What, When, Where, How, and Why it is suspicious. It lists all involved transaction IDs, amounts, device profiles, and connected card subjects.
  >
  > Finally, every investigation is saved back to TigerGraph: our agent executes the GSQL procedure `upsert_case_memory`, creating a `CaseVertex` node. When future investigations occur, this case becomes accessible as historical memory."*

---

### 4:15 - 4:45 | Validation & Conclusion
- **[VISUAL]**: Switch to the terminal window and run `python scripts/verify_submission.py`. Show the green `ALL 20 CASE FILES PASSED OFFICIAL SUBMISSION VALIDATION!` output.
- **[AUDIO]**:
  > *"Here in the terminal, our automated validator verifies that all 20 generated case files strictly conform to the competition JSON schema, policy rules, and dataset entity IDs with 100% compliance.
  >
  > We have also provided the production GSQL schema, loading jobs, queries, and a Model Context Protocol (MCP) server for live TigerGraph Savanna deployments.
  >
  > Thank you to TigerGraph and the Hacker House Goa mentors. Our code, blog post, and benchmark answers are live on GitHub!"*

---

## 💡 Recording Tips
1. Use OBS Studio or Loom at 1080p 60fps.
2. Ensure the terminal text size is enlarged (Ctrl + +) for crisp readability.
3. Pre-load the Streamlit dashboard on `http://localhost:8501`.
4. Keep the pace confident, enthusiastic, and focused on the hackathon judging criteria: accuracy (25%), next-best action (25%), explainability (10%), agentic design (15%), and innovation (15%).
