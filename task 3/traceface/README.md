# TraceFace 🔍

**Discover. Verify. Prove.**

> Face Identification & Blockchain Verification Platform

TraceFace is a digital investigation and verification platform that combines computer vision, real web search, cryptographic evidence packaging, and blockchain anchoring into a single end-to-end pipeline.

---

## 🎯 Problem Statement

In an era of digital misinformation, there is a critical need for tools that can:

1. **Discover** the origin and public presence of face images
2. **Verify** the authenticity and integrity of discovered data
3. **Prove** that findings have not been tampered with using blockchain anchoring

TraceFace addresses this by building a transparent, auditable pipeline from face detection to blockchain-registered evidence.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TraceFace Pipeline                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📤 UPLOAD FACE                                             │
│     ├─ Face Detection (InsightFace)                         │
│     ├─ Face Selection (multi-face support)                  │
│     └─ Face Encoding (512-d embedding)                      │
│                        ↓                                    │
│  🌐 WEB SEARCH                                              │
│     ├─ Reverse Image Search (SerpAPI / Bing / Demo)         │
│     ├─ Result Download & Processing                         │
│     └─ Candidate Face Extraction                            │
│                        ↓                                    │
│  🎯 MATCH RESULTS                                           │
│     ├─ Cosine Similarity Comparison                         │
│     ├─ Confidence Categorization                            │
│     └─ Ranked Result Display                                │
│                        ↓                                    │
│  📦 EVIDENCE PACKAGE                                        │
│     ├─ Canonical JSON Serialization                         │
│     ├─ SHA-256 Hash Generation                              │
│     └─ Tamper-Evident Fingerprinting                        │
│                        ↓                                    │
│  ⛓️ BLOCKCHAIN                                              │
│     ├─ Solidity Smart Contract (EvidenceRegistry)           │
│     ├─ Local Hardhat Node OR Public Testnet                 │
│     └─ On-Chain Registration                                │
│                        ↓                                    │
│  ✅ VERIFICATION                                            │
│     ├─ Re-Verify Evidence Against Chain                     │
│     ├─ Hash Comparison                                      │
│     └─ Tampering Detection Demo                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technologies Used

| Layer | Technology |
|-------|-----------|
| **Face Detection & Encoding** | InsightFace (buffalo_l), OpenCV, ONNX Runtime |
| **Web Search** | SerpAPI (Google Lens), Bing Visual Search, Demo Fallback |
| **Image Processing** | OpenCV, NumPy, Pillow |
| **Evidence Hashing** | Python hashlib (SHA-256), Canonical JSON |
| **Blockchain** | Solidity 0.8.20, Web3.py, Hardhat |
| **Smart Contract** | EvidenceRegistry (EVM-compatible) |
| **UI Dashboard** | Streamlit |
| **Backend** | Python 3.10+ |

---

## 📦 Installation

### Prerequisites

- Python 3.10 or higher
- Node.js 18+ (for Hardhat, optional for local blockchain)
- Git

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd "task 3/traceface"

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows

# Install Python dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env
# Edit .env with your settings (see Configuration below)

# Run the application
python -m app.main
# Or directly:
streamlit run app/ui/dashboard.py --theme.base dark
```

### Optional: Blockchain Setup

```bash
# Install Node.js dependencies (for Hardhat)
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv

# Start local Hardhat node (in a separate terminal)
npx hardhat node

# Deploy the contract to local node
npx hardhat run scripts/deploy_contract.js --network localhost
```

---

## ⚙️ Environment Configuration

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

### Search Provider Configuration

| Variable | Options | Description |
|----------|---------|-------------|
| `SEARCH_PROVIDER` | `serpapi`, `bing`, `demo` | Which search provider to use |
| `SEARCH_API_KEY` | API key string | API key for the chosen provider |

**For real web searches:**
- **SerpAPI** (Google Lens): Get a key at [serpapi.com](https://serpapi.com)
  - Set `SEARCH_PROVIDER=serpapi` and `SEARCH_API_KEY=your_key`
- **Bing Visual Search**: Get a key from Azure Cognitive Services
  - Set `SEARCH_PROVIDER=bing` and `SEARCH_API_KEY=your_key`

**For demo mode:**
- Set `SEARCH_PROVIDER=demo` (or leave unset)
- Results are clearly labeled as SYNTHETIC — never pretends to be a real search

### Blockchain Configuration

| Variable | Options | Description |
|----------|---------|-------------|
| `BLOCKCHAIN_MODE` | `local`, `testnet` | Which blockchain to use |
| `RPC_URL` | URL | RPC endpoint for testnet |
| `PRIVATE_KEY` | Hex string | Wallet private key (testnet only) |
| `CONTRACT_ADDRESS` | `0x...` | Deployed contract address |
| `LOCAL_RPC_URL` | URL | Local node RPC (default: `http://127.0.0.1:8545`) |

**For local mode:**
```env
BLOCKCHAIN_MODE=local
LOCAL_RPC_URL=http://127.0.0.1:8545
```

**For testnet mode (e.g., Base Sepolia):**
```env
BLOCKCHAIN_MODE=testnet
RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=0x_deployed_contract_address
```

### Face Recognition

| Variable | Default | Description |
|----------|---------|-------------|
| `FACE_MATCH_THRESHOLD` | `0.80` | Minimum cosine similarity for a match |

---

## 🔗 Blockchain Contract

### Smart Contract: EvidenceRegistry

The Solidity contract (`contracts/EvidenceRegistry.sol`) provides:

- **`registerEvidence(bytes32, string, string)`** — Store an evidence hash on-chain
- **`verifyEvidence(bytes32)`** — Check if a hash exists on-chain
- **`exists(bytes32)`** — Quick existence check

### Deploying the Contract

**Local (Hardhat node):**
```bash
# Terminal 1: Start node
npx hardhat node

# Terminal 2: Deploy
npx hardhat run scripts/deploy_contract.js --network localhost

# Copy the contract address to your .env
```

**Testnet:**
```bash
npx hardhat run scripts/deploy_contract.js --network baseSepolia
```

The deployment script will output the contract address — paste it into your `.env` as `CONTRACT_ADDRESS`.

---

## 🚀 Running the Application

### Start the Dashboard

```bash
# Option 1: Using the module
python -m app.main

# Option 2: Direct Streamlit
streamlit run app/ui/dashboard.py --theme.base dark

# Option 3: With custom port
streamlit run app/ui/dashboard.py --server.port 8502
```

Open `http://localhost:8501` in your browser.

### Start Local Blockchain (Optional)

```bash
# In a separate terminal
npx hardhat node
```

Then deploy the contract:
```bash
npx hardhat run scripts/deploy_contract.js --network localhost
```

---

## ✅ Blockchain Verification

### How It Works

1. **Evidence Package** is created from the investigation data
2. **Canonical JSON** is computed (deterministic, sorted keys)
3. **SHA-256 Hash** is generated from the canonical form
4. **Hash is registered** on-chain via `registerEvidence()`
5. **Re-verification** queries the blockchain with the same hash
6. **Tamper detection** shows that any modification produces a different hash

### Verification Flow

```
Original Evidence → Canonical JSON → SHA-256 → 0xABC123...
                                                    ↓
                                          Blockchain Lookup
                                                    ↓
                                          ✅ VERIFIED or ❌ FAILED
```

### Tamper Detection

Any modification to the evidence package (even a single character) changes the hash:

```
Original:  0xabc123...  → ✅ VERIFIED
Tampered:  0xdef456...  → ❌ BLOCKCHAIN VERIFICATION FAILED
```

---

## ⚠️ Known Limitations

1. **Face Recognition Accuracy**: InsightFace works best with clear, frontal face images. Side profiles, heavy occlusion, or very low resolution may fail.

2. **Search Provider Limitations**: The demo mode generates synthetic results. For real investigations, a valid API key for SerpAPI or Bing Visual Search is required.

3. **Image Download Restrictions**: Some websites block automated image downloads. The system gracefully handles these cases.

4. **Gas Costs**: On public testnets, each registration requires gas fees. Ensure sufficient testnet ETH.

5. **Embedding Dimensionality**: The 512-d embedding space may not perfectly separate all face variations. Results are probabilistic, not definitive.

6. **No Real-Time Monitoring**: Blockchain verification is on-demand, not real-time monitoring.

---

## 🔒 Privacy and Ethical Considerations

> **"The system performs visual similarity matching against publicly returned search results. A visual match should not automatically be treated as proof of a person's real-world identity."**

### Key Principles

1. **No Identity Claims**: TraceFace never identifies a person by name from the local face recognition model. Identity context comes only from public search results.

2. **Visual Similarity Only**: Match scores indicate visual/face similarity, not confirmed identity.

3. **Public Data Only**: The search component only queries publicly available web results.

4. **Evidence Integrity**: Blockchain anchoring proves data integrity, not truthfulness.

5. **Transparency**: All pipeline steps are visible to the user. Demo mode clearly labels synthetic results.

6. **User Responsibility**: Users are responsible for ethical use of the platform.

### Recommended Use Cases

- ✅ Verifying the source of public images
- ✅ Creating tamper-evident records of digital investigations
- ✅ Demonstrating blockchain-based data integrity
- ✅ Academic research on face similarity matching
- ❌ Surveillance or tracking individuals
- ❌ Making definitive identity claims from visual similarity alone

---

## 🔧 Troubleshooting

### Common Issues

**"No face detected"**
- Ensure the image contains a clear, frontal face
- Try higher resolution images
- Check that the face is not heavily occluded

**"Face detection failed: ONNX error"**
- Reinstall onnxruntime: `pip install --force-reinstall onnxruntime`
- On Apple Silicon, try: `pip install onnxruntime-silicon`

**"Search failed: No API key"**
- Set `SEARCH_PROVIDER=demo` for offline testing
- Or configure a valid API key in `.env`

**"Blockchain connection failed"**
- Local: Ensure Hardhat node is running (`npx hardhat node`)
- Testnet: Check RPC_URL and network status
- Verify PRIVATE_KEY matches the account with funds

**"Transaction failed"**
- Check account balance (need ETH for gas)
- Verify CONTRACT_ADDRESS is correct
- Check that the contract is deployed on the correct network

**Import errors**
- Ensure you're in the project root directory
- Verify virtual environment is activated
- Run `pip install -r requirements.txt` again

---

## 🎬 Demo Workflow

### Quick Demo (3-5 minutes)

1. **Launch**: `streamlit run app/ui/dashboard.py --theme.base dark`

2. **Upload**: Upload a face image → Watch detection + encoding

3. **Search**: Click "SEARCH THE WEB" → See live pipeline progress

4. **Review**: Examine search results and similarity scores

5. **Select**: Click "Select this result" on a match

6. **Evidence**: Click "Generate Evidence Package" → View hash

7. **Blockchain**: Click "Upload to Blockchain" → Watch transaction

8. **Verify**: Click "Re-Verify Against Blockchain" → See verification

9. **Tamper**: Click "Simulate Tampering" → See tamper detection

### Demo Checklist (shown in sidebar)

```
✅ Face identification
✅ Web search performed
✅ Match discovered
✅ Evidence fingerprint
✅ Blockchain upload
✅ On-chain verified
✅ Tampering detection
```

---

## 📝 License

MIT License — See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [InsightFace](https://github.com/deepinsight/insightface) for face detection and encoding
- [SerpAPI](https://serpapi.com) for Google Lens reverse image search
- [Hardhat](https://hardhat.org) for Ethereum development environment
- [Streamlit](https://streamlit.io) for rapid UI development

---

**TraceFace** — *Discover. Verify. Prove.* 🔍
