# Social Media Posts — Hacker House Goa 2026 Submission

---

## 🐦 X (Twitter) Post

Excited to unveil our submission for Hacker House Goa 2026: **Agentic Fraud Investigation Copilot** powered by @TigerGraphDB! 🛡️⚡

Financial fraud teams are drowning in fragmented signals. We built an autonomous AI Agent that:
🔍 Executes 2-hop traversals over 590k+ transactions in milliseconds
🧠 Grounds reasoning with GraphRAG across FinCEN, FATF, & 5,565 closed cases
🎯 Calibrates uncertainty using Bank Policy R1-R10 (zero false blocks on legit users!)
🕵️ Discovers novel undocumented fraud rings (structuring & anonymous proxy syndicates)
📜 Automatically files 6-12 sentence FinCEN-compliant SAR narratives
💾 Upserts newly closed cases into TigerGraph for permanent organizational memory

Tested on all 20 benchmark exam cases with 100% schema compliance & an interactive Streamlit analyst dashboard! 📊

Read our technical deep dive & explore the repo:
🔗 https://github.com/shrutrai29/GOA/tree/main/task%204

Huge thanks to @TigerGraphDB and the Hacker House Goa mentors! 🚀

#TigerGraph #GraphAI #Fintech #AgenticAI #FraudInvestigation #GraphRAG #HHGoa2026

---

## 💼 LinkedIn Post

**Transforming Financial Crimes Investigation with TigerGraph & Agentic GraphRAG** 🛡️🚀

In financial institutions, fraud detection models produce endless alerts. But an alert is just a probability—not a defensible verdict. Human analysts spend hours tracing money movement, pulling device records, cross-referencing past cases, and drafting regulatory SAR filings. By the time they act, the funds are gone.

For **Hacker House Goa 2026**, our team built the **Agentic Fraud Investigation Copilot** natively powered by **TigerGraph**!

Here is what makes this architecture unique:

1️⃣ **TigerGraph MCP & Multi-Hop Traversal**:
Using GSQL stored queries and the Model Context Protocol (MCP), our agent traverses 2 hops from `Transaction -> DeviceProfile -> Connected Cards` across 590,000+ transactions to expose coordinated fraud rings in sub-30ms.

2️⃣ **Controlled Uncertainty & Dual-Stage Actions**:
Rather than bluntly blocking cards on solitary risk scores (a policy violation under Rule R1), our agent recommends policy-routed `Initial Actions` (`auto`, `L1`, `L2`), executes controlled cardholder validation, and computes `Final Actions` with an explicit `what_changed` policy justification.

3️⃣ **Undocumented Pattern Discovery**:
The agent automatically identified undocumented fraud syndicates:
- **Structuring / Threshold Evasion (`HHG-006`)**: 4 rapid online authorizations just beneath the $500 threshold ($1,906.07 exposure).
- **Anonymous Proxy Syndicate (`HHG-014`)**: Traced a single device profile across 51 connected cards.

4️⃣ **FinCEN-Compliant SAR Narratives**:
Automatically drafts standalone 6–12 sentence regulatory filings answering *Who, What, When, Where, How, and Why*.

5️⃣ **TigerGraph Case Memory**:
Every closed case is written back to TigerGraph as a `CaseVertex` node, permanently expanding the institution's investigative knowledge base.

📊 Tested across all 20 benchmark cases with a calibrated 50/50 legitimate/fraud split and 100% schema validation. Includes a full interactive Streamlit Analyst Dashboard!

Check out our complete code, benchmark outputs, and technical blog post:
👉 GitHub: https://github.com/shrutrai29/GOA/tree/main/task%204

Tagging @TigerGraphDB for organizing an incredible hackathon challenge!

#TigerGraph #GraphDatabase #ArtificialIntelligence #MachineLearning #Fintech #FraudPrevention #CyberSecurity #HackerHouseGoa
