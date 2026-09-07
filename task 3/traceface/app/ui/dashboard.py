"""
TraceFace Dashboard
Main Streamlit application providing the full investigation pipeline.
"""
import io
import json
import time
from datetime import datetime
from typing import Optional

import cv2
import numpy as np
import pandas as pd
import plotly.graph_objects as go
import streamlit as st
from PIL import Image

# Project imports
from ..config import config
from ..face.detector import FaceDetector, DetectedFace
from ..face.encoder import FaceEncoder
from ..face.matcher import FaceMatcher, MatchConfidence
from ..search.base import SearchResult
from ..search.provider import get_provider
from ..search.result_processor import ResultProcessor
from ..evidence.models import EvidencePackage
from ..evidence.hasher import EvidenceHasher
from ..blockchain.client import get_blockchain_client
from ..blockchain.contract_interface import ContractInterface
from ..blockchain.verifier import EvidenceVerifier


# ─── Page Config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="TraceFace — Discover. Verify. Prove.",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─── Custom CSS ────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        padding: 1.5rem 2rem;
        border-radius: 12px;
        margin-bottom: 1.5rem;
        border-left: 4px solid #e94560;
    }
    .main-header h1 { color: #ffffff; margin: 0; font-size: 2rem; }
    .main-header p { color: #a0a0c0; margin: 0.3rem 0 0 0; font-size: 1.1rem; }
    .tagline { color: #e94560 !important; font-weight: 600; }

    .pipeline-step {
        background: #1e1e30;
        border-radius: 10px;
        padding: 1rem 1.2rem;
        margin: 0.5rem 0;
        border-left: 3px solid #444;
    }
    .pipeline-step.active { border-left-color: #4ade80; background: #1e2e1e; }
    .pipeline-step.pending { border-left-color: #666; opacity: 0.6; }

    .metric-card {
        background: #1e1e30;
        border-radius: 10px;
        padding: 1rem;
        text-align: center;
        border: 1px solid #333;
    }
    .metric-value { font-size: 1.8rem; font-weight: 700; color: #4ade80; }
    .metric-label { font-size: 0.85rem; color: #888; margin-top: 0.3rem; }

    .match-card {
        background: linear-gradient(135deg, #1e2e1e, #1e1e30);
        border-radius: 12px;
        padding: 1.2rem;
        border: 1px solid #4ade80;
        margin: 0.8rem 0;
    }
    .match-card.no-match { border-color: #ef4444; }

    .evidence-hash {
        font-family: 'Courier New', monospace;
        font-size: 0.85rem;
        background: #0a0a15;
        padding: 0.5rem;
        border-radius: 6px;
        word-break: break-all;
        color: #4ade80;
    }

    .blockchain-badge {
        display: inline-block;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    .badge-testnet { background: #1e3a5f; color: #60a5fa; }
    .badge-local { background: #3a2e1e; color: #fbbf24; }
</style>
""", unsafe_allow_html=True)


# ─── Session State Initialization ─────────────────────────────────────────────
def init_session_state():
    defaults = {
        "step": 0,  # 0=upload, 1=search, 2=match, 3=evidence, 4=blockchain, 5=verify
        "uploaded_image": None,
        "faces": [],
        "selected_face_index": 0,
        "face_crop": None,
        "face_embedding": None,
        "image_hash": None,
        "search_results": None,
        "processed_results": None,
        "selected_result": None,
        "evidence_package": None,
        "evidence_hash": None,
        "blockchain_receipt": None,
        "verification_result": None,
        "demo_log": [],
        "pipeline_complete": False,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


def log_step(message: str, status: str = "pending"):
    """Add a timestamped log entry."""
    ts = datetime.utcnow().strftime("%H:%M:%S")
    icon = {"complete": "✅", "active": "🔄", "error": "❌", "info": "ℹ️"}.get(status, "⏳")
    st.session_state.demo_log.append({"time": ts, "icon": icon, "message": message})


# ─── Pipeline Components ──────────────────────────────────────────────────────

def render_header():
    st.markdown("""
    <div class="main-header">
        <h1>🔍 TraceFace</h1>
        <p class="tagline">Discover. Verify. Prove.</p>
        <p>Face Identification & Blockchain Verification Platform</p>
    </div>
    """, unsafe_allow_html=True)


def render_pipeline_sidebar():
    """Render the pipeline progress in the sidebar."""
    with st.sidebar:
        st.markdown("## 🔗 Investigation Pipeline")

        steps = [
            ("📤 Upload & Detect", 0),
            ("🌐 Web Search", 1),
            ("🎯 Match Results", 2),
            ("📦 Evidence Package", 3),
            ("⛓️ Blockchain", 4),
            ("✅ Verification", 5),
        ]

        current = st.session_state.step

        for name, step_num in steps:
            if step_num < current:
                st.markdown(f"✅ {name}")
            elif step_num == current:
                st.markdown(f"**▶ {name}**")
            else:
                st.markdown(f"⬜ {name}")

        st.markdown("---")

        # Blockchain mode indicator
        mode = config.BLOCKCHAIN_MODE
        if mode == "testnet":
            badge_class = "badge-testnet"
            mode_label = "PUBLIC TESTNET"
        else:
            badge_class = "badge-local"
            mode_label = "LOCAL DEMONSTRATION CHAIN"

        st.markdown(f"""
        <div style="margin-top: 1rem;">
            <small>Blockchain Mode</small><br>
            <span class="blockchain-badge {badge_class}">● {mode_label}</span>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("---")

        # Demo checklist
        st.markdown("## 📋 Demo Checklist")
        checks = [
            ("Face identification", st.session_state.face_embedding is not None),
            ("Web search performed", st.session_state.search_results is not None),
            ("Match discovered", st.session_state.selected_result is not None),
            ("Evidence fingerprint", st.session_state.evidence_package is not None),
            ("Blockchain upload", st.session_state.blockchain_receipt is not None),
            ("On-chain verified", st.session_state.verification_result is not None and st.session_state.verification_result.get("verified")),
            ("Tampering detection", any("TAMPER" in str(l) for l in st.session_state.demo_log)),
        ]

        for label, done in checks:
            icon = "✅" if done else "⬜"
            st.markdown(f"{icon} {label}")


def step_upload_and_detect():
    """Step 1: Upload image and detect faces."""
    st.markdown("## Step 1: Upload & Face Detection")

    col1, col2 = st.columns([1, 1])

    with col1:
        uploaded = st.file_uploader(
            "Upload an image containing a face",
            type=["jpg", "jpeg", "png", "webp", "bmp"],
            help="Supported formats: JPG, PNG, WebP, BMP",
        )

        if uploaded is not None:
            # Read image
            img_bytes = uploaded.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if image is None:
                st.error("❌ Could not decode the uploaded image. Please try a different file.")
                return

            st.session_state.uploaded_image = image

            # Compute image hash
            import hashlib
            st.session_state.image_hash = hashlib.sha256(img_bytes).hexdigest()

            # Detect faces
            with st.spinner("🔍 Detecting faces..."):
                try:
                    detector = FaceDetector()
                    faces = detector.detect(image)
                    st.session_state.faces = faces
                except Exception as e:
                    st.error(f"❌ Face detection failed: {e}")
                    return

            if not faces:
                st.warning("⚠️ No faces detected in this image. Please upload a clear face photo.")
                return

            log_step(f"Image loaded: {uploaded.name} ({len(img_bytes)} bytes)", "complete")
            log_step(f"Image SHA-256: {st.session_state.image_hash[:16]}...", "info")
            log_step(f"{len(faces)} face(s) detected", "complete")

            st.success(f"✅ Detected {len(faces)} face(s)")

    with col2:
        if st.session_state.uploaded_image is not None:
            # Show annotated image
            detector = FaceDetector()
            annotated = detector.draw_bboxes(st.session_state.uploaded_image, st.session_state.faces)
            st.image(
                cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB),
                caption="Detected Faces",
                use_container_width=True,
            )

            # Show image hash
            if st.session_state.image_hash:
                st.markdown("**Image SHA-256:**")
                st.code(st.session_state.image_hash, language=None)

    # Face selection and encoding
    if st.session_state.faces:
        st.markdown("---")

        if len(st.session_state.faces) > 1:
            st.markdown("**Multiple faces detected. Select one:**")
            options = {
                f"Face {i} (confidence: {f.confidence:.1%})": i
                for i, f in enumerate(st.session_state.faces)
            }
            selected = st.radio("Select face:", list(options.keys()), horizontal=True)
            face_index = options[selected]
        else:
            face_index = 0
            st.markdown(f"**Face 0** — Confidence: {st.session_state.faces[0].confidence:.1%}")

        st.session_state.selected_face_index = face_index

        # Crop and encode
        if st.button("🚀 Crop & Encode Selected Face", type="primary"):
            with st.spinner("🧬 Generating face embedding..."):
                try:
                    detector = FaceDetector()
                    encoder = FaceEncoder()

                    # Crop face
                    face = st.session_state.faces[face_index]
                    crop = face.crop_from_image(st.session_state.uploaded_image)
                    st.session_state.face_crop = crop

                    # Encode
                    embedding = encoder.encode(crop)
                    if embedding is None:
                        st.error("❌ Failed to generate face embedding. The face may be too small or unclear.")
                        return

                    st.session_state.face_embedding = embedding
                    log_step(f"Face {face_index} cropped and encoded", "complete")
                    log_step(f"Embedding: {encoder.embedding_summary(embedding)}", "info")
                    st.session_state.step = 1

                    st.rerun()

                except Exception as e:
                    st.error(f"❌ Encoding failed: {e}")
                    return

        # Show cropped face preview
        if st.session_state.face_crop is not None:
            st.markdown("**Selected Face Crop:**")
            st.image(
                cv2.cvtColor(st.session_state.face_crop, cv2.COLOR_BGR2RGB),
                caption=f"Face {st.session_state.selected_face_index}",
                width=200,
            )
            st.markdown(f"**Embedding hash:** `{EvidenceHasher.hash_package.__func__}`")
            emb_hash = EvidenceHasher.hash_package.__func__  # This is wrong, use encoder
            from ..face.encoder import FaceEncoder
            enc = FaceEncoder()
            emb_hash = enc.compute_embedding_hash(st.session_state.face_embedding)
            st.markdown(f"**Embedding hash:** `{emb_hash[:32]}...`")


def step_web_search():
    """Step 2: Perform web search."""
    st.markdown("## Step 2: Web Search")

    if st.session_state.face_embedding is None:
        st.warning("⚠️ Please complete Step 1 first (upload and encode a face).")
        return

    # Show face info
    col1, col2 = st.columns(2)
    with col1:
        if st.session_state.face_crop is not None:
            st.image(
                cv2.cvtColor(st.session_state.face_crop, cv2.COLOR_BGR2RGB),
                caption="Search query face",
                width=200,
            )
    with col2:
        from ..face.encoder import FaceEncoder
        enc = FaceEncoder()
        emb_hash = enc.compute_embedding_hash(st.session_state.face_embedding)
        st.markdown(f"""
        **Face ready for search**

        Embedding dimension: `{st.session_state.face_embedding.shape}`

        Embedding hash: `{emb_hash[:32]}...`
        """)

    st.markdown("---")

    # Search provider info
    provider = get_provider()
    is_real = provider.is_real_search

    if is_real:
        st.success(f"🌐 **Real search mode** — Using: {provider.name}")
    else:
        st.warning(
            f"⚠️ **Demo fallback mode** — Provider: {provider.name}\n\n"
            "Results below are SYNTHETIC and clearly labeled. "
            "Set `SEARCH_PROVIDER` and `SEARCH_API_KEY` in `.env` for real searches."
        )

    # Search button
    if st.button("🔍 SEARCH THE WEB", type="primary", disabled=st.session_state.search_results is not None):
        log_step("Starting web search...", "active")

        with st.spinner("🌐 Searching the web for visual matches..."):
            try:
                # Get search results
                search_provider = get_provider()
                results = search_provider.search(
                    st.session_state.uploaded_image,
                    query="face visual match",
                )
                st.session_state.search_results = results
                log_step(f"{len(results)} results returned from {search_provider.name}", "complete")

                st.rerun()

            except Exception as e:
                st.error(f"❌ Search failed: {e}")
                log_step(f"Search error: {e}", "error")
                return

    # Process results if available
    if st.session_state.search_results is not None and st.session_state.processed_results is None:
        with st.spinner("🧬 Processing results — downloading images and comparing faces..."):
            try:
                detector = FaceDetector()
                encoder = FaceEncoder()
                processor = ResultProcessor(detector, encoder)

                processed = processor.process_results(
                    st.session_state.search_results,
                    st.session_state.face_embedding,
                    max_results=15,
                )
                st.session_state.processed_results = processed

                n_with_emb = sum(1 for p in processed if p["embedding"] is not None)
                n_matches = sum(1 for p in processed if p.get("is_match"))

                log_step(f"Processed {len(processed)} results", "complete")
                log_step(f"{n_with_emb} faces extracted and compared", "complete")
                log_step(f"{n_matches} candidate match(es) found", "complete")

                st.rerun()

            except Exception as e:
                st.error(f"❌ Result processing failed: {e}")
                log_step(f"Processing error: {e}", "error")

    # Display search results
    if st.session_state.processed_results is not None:
        st.markdown("---")
        st.markdown("### 📊 Search Results")

        results = st.session_state.processed_results

        # Summary metrics
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Results Found", len(results))
        c2.metric("Faces Extracted", sum(1 for r in results if r["face_detected"]))
        c3.metric("Embeddings Compared", sum(1 for r in results if r["embedding"] is not None))
        c4.metric("Matches", sum(1 for r in results if r.get("is_match")))

        # Show each result
        for i, result in enumerate(results):
            with st.expander(
                f"{'🟢' if result.get('is_match') else '⚪'} "
                f"Result {i+1}: {result['title'][:50]} — "
                f"Similarity: {(result['similarity'] or 0):.1%}",
                expanded=result.get("is_match", False),
            ):
                col1, col2 = st.columns([1, 2])

                with col1:
                    if result["image_downloaded"] and result.get("face_detected"):
                        st.markdown("*Face detected in result*")
                    elif result["image_downloaded"]:
                        st.markdown("*Image downloaded but no face detected*")
                    else:
                        st.markdown("*Image not available*")

                with col2:
                    st.markdown(f"**Title:** {result['title']}")
                    st.markdown(f"**Source:** [{result['domain']}]({result['url']})")
                    st.markdown(f"**Snippet:** {result['snippet'][:200]}")
                    st.markdown(f"**Provider:** {result['provider']}")
                    st.markdown(f"**Timestamp:** {result['search_timestamp']}")

                    if result["similarity"] is not None:
                        score = result["similarity"]
                        conf = MatchConfidence.from_score(score, config.FACE_MATCH_THRESHOLD)
                        st.markdown(f"**Similarity:** {conf.emoji} {score:.1%} — {conf.value}")

                        if result.get("is_match"):
                            # Select button
                            if st.button(
                                f"✅ Select this result",
                                key=f"select_{i}",
                            ):
                                st.session_state.selected_result = result
                                st.session_state.step = 2
                                log_step(f"Result selected: {result['title'][:40]}", "complete")
                                st.rerun()
                    else:
                        st.markdown("**Similarity:** N/A (no face detected)")

        # Select top match automatically if no manual selection
        if st.session_state.processed_results and st.session_state.selected_result is None:
            top = st.session_state.processed_results[0]
            if top.get("similarity") is not None and top.get("is_match"):
                st.info("💡 Click 'Select this result' on any match to proceed to evidence generation.")


def step_match_results():
    """Step 3: Review matching results."""
    st.markdown("## Step 3: Match Review")

    if st.session_state.selected_result is None:
        st.warning("⚠️ Please select a result from Step 2.")
        return

    result = st.session_state.selected_result

    st.markdown("### 🎯 Selected Match")

    col1, col2 = st.columns([1, 1])

    with col1:
        st.markdown(f"""
        <div class="match-card">
            <h4>MATCH FOUND</h4>
            <p><strong>Similarity:</strong> {result['similarity']:.1%}</p>
            <p><strong>Confidence:</strong> {result.get('match_confidence', 'N/A')}</p>
            <p><strong>Source:</strong> Public web result</p>
            <p><strong>Title:</strong> {result['title']}</p>
            <p><strong>URL:</strong> <a href="{result['url']}" target="_blank">{result['url'][:60]}...</a></p>
            <p><strong>Domain:</strong> {result['domain']}</p>
            <p><strong>Discovered:</strong> Current session</p>
            <p><strong>Search Provider:</strong> {result['provider']}</p>
            <p><strong>Timestamp:</strong> {result['search_timestamp']}</p>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("**Result Image:**")
        st.markdown(f"Image URL: `{result['image_url'][:80]}...`")

    st.markdown("---")

    if st.button("📦 Generate Evidence Package", type="primary"):
        with st.spinner("📦 Creating cryptographic evidence package..."):
            try:
                # Compute embedding hash
                from ..face.encoder import FaceEncoder
                enc = FaceEncoder()
                emb_hash = enc.compute_embedding_hash(st.session_state.face_embedding)

                # Create evidence package
                package = EvidencePackage(
                    input_image_sha256=st.session_state.image_hash,
                    selected_face_embedding_hash=emb_hash,
                    search_provider=result["provider"],
                    search_timestamp=result["search_timestamp"],
                    result_title=result["title"],
                    source_url=result["url"],
                    source_domain=result["domain"],
                    result_image_sha256=result.get("image_sha256", ""),
                    similarity_score=result["similarity"],
                    metadata={
                        "match_confidence": result.get("match_confidence", ""),
                        "is_match": result.get("is_match", False),
                        "face_detected_in_result": result.get("face_detected", False),
                    },
                )

                evidence_hash = EvidenceHasher.hash_package(package)
                evidence_hash_0x = EvidenceHasher.hash_hex_0x(package)

                st.session_state.evidence_package = package
                st.session_state.evidence_hash = evidence_hash

                log_step(f"Evidence package created: {package.evidence_id}", "complete")
                log_step(f"Evidence hash: {evidence_hash[:32]}...", "complete")
                st.session_state.step = 3

                st.rerun()

            except Exception as e:
                st.error(f"❌ Evidence generation failed: {e}")
                log_step(f"Evidence error: {e}", "error")

    # Show evidence package if generated
    if st.session_state.evidence_package is not None:
        st.markdown("---")
        st.markdown("### 📦 Evidence Package")

        package = st.session_state.evidence_package
        st.markdown(f"**Evidence ID:** `{package.evidence_id}`")
        st.markdown(f"**Case ID:** `{package.case_id}`")
        st.markdown(f"**Created:** `{package.created_at}`")

        st.markdown("**Evidence Hash (SHA-256):**")
        st.markdown(f"""
        <div class="evidence-hash">{st.session_state.evidence_hash}</div>
        """, unsafe_allow_html=True)

        # Show canonical JSON
        with st.expander("📄 View Canonical Evidence Package (JSON)"):
            st.json(package.to_canonical_dict())

        if st.button("⛓️ Upload to Blockchain", type="primary"):
            st.session_state.step = 4
            st.rerun()


def step_blockchain():
    """Step 4: Blockchain registration."""
    st.markdown("## Step 4: Blockchain Registration")

    if st.session_state.evidence_package is None:
        st.warning("⚠️ Please complete Step 3 first (generate evidence).")
        return

    package = st.session_state.evidence_package
    evidence_hash_0x = EvidenceHasher.hash_hex_0x(package)

    # Show evidence hash
    st.markdown(f"**Evidence to register:** `{package.evidence_id}`")
    st.markdown(f"**Hash:**")
    st.code(evidence_hash_0x, language=None)

    # Connect to blockchain
    with st.spinner("🔗 Connecting to blockchain..."):
        try:
            client = get_blockchain_client()
            connected = client.connect()

            if not connected:
                st.error(
                    f"❌ Cannot connect to blockchain at `{client.rpc_url}`\n\n"
                    "**Troubleshooting:**\n"
                    "- For local mode: Start Hardhat node with `npx hardhat node`\n"
                    "- For testnet: Check your RPC_URL and network status\n"
                    "- Ensure sufficient funds for gas fees"
                )
                return

            contract = ContractInterface(client)
            contract._connected = True

            st.success(f"🔗 Connected to: {client.network_name}")
            st.markdown(f"**Account:** `{client.get_account_address()}`")

            # Show network info
            c1, c2, c3 = st.columns(3)
            c1.markdown(f"**Network:** {client.network_name}")
            c2.markdown(f"**Mode:** {'TESTNET' if client.is_testnet else 'LOCAL'}")
            if client.explorer_url:
                c3.markdown(f"**Explorer:** [{client.explorer_url}]({client.explorer_url})")

        except Exception as e:
            st.error(f"❌ Blockchain connection failed: {e}")
            return

    st.markdown("---")

    if st.session_state.blockchain_receipt is None:
        if st.button("⛓️ Register Evidence on Blockchain", type="primary"):
            with st.spinner("⛓️ Submitting transaction to blockchain..."):
                log_step("Submitting evidence hash to blockchain...", "active")

                try:
                    success, receipt, message = contract.register(
                        evidence_hash_hex=evidence_hash_0x,
                        case_id=package.case_id,
                        source_fingerprint=f"TraceFace Evidence: {package.evidence_id}",
                    )

                    if success:
                        st.session_state.blockchain_receipt = receipt
                        log_step(f"Transaction confirmed in block #{receipt.block_number}", "complete")
                        log_step(f"TX hash: {receipt.tx_hash[:20]}...", "complete")
                        st.session_state.step = 4
                        st.rerun()
                    else:
                        st.error(f"❌ {message}")
                        log_step(f"Blockchain error: {message}", "error")

                except Exception as e:
                    st.error(f"❌ Transaction failed: {e}")
                    log_step(f"Transaction error: {e}", "error")

    # Show receipt
    if st.session_state.blockchain_receipt is not None:
        receipt = st.session_state.blockchain_receipt

        st.markdown("### ✅ Evidence Registered Successfully")

        col1, col2 = st.columns(2)

        with col1:
            st.markdown(f"""
            | Field | Value |
            |-------|-------|
            | **Evidence Hash** | `{st.session_state.evidence_hash[:32]}...` |
            | **Case ID** | `{package.case_id}` |
            | **Network** | {client.network_name} |
            | **Transaction Hash** | `{receipt.tx_hash}` |
            | **Block Number** | {receipt.block_number} |
            | **Timestamp** | {receipt.timestamp} |
            | **Wallet** | `{receipt.from_address}` |
            """)

        with col2:
            st.markdown(f"**Gas Used:** {receipt.gas_used}")
            st.markdown(f"**Status:** {'✅ Success' if receipt.status == 1 else '❌ Failed'}")

            if client.explorer_url:
                st.markdown(f"**[View on Explorer]({client.explorer_url}/tx/{receipt.tx_hash})**")

        st.markdown("---")

        if st.button("✅ Proceed to Verification", type="primary"):
            st.session_state.step = 5
            st.rerun()


def step_verification():
    """Step 5: Re-verification and tampering detection."""
    st.markdown("## Step 5: Verification & Tampering Detection")

    if st.session_state.evidence_package is None:
        st.warning("⚠️ Please complete the pipeline first.")
        return

    package = st.session_state.evidence_package

    # Initialize verifier
    client = get_blockchain_client()
    if not client.connect():
        st.error("❌ Cannot connect to blockchain for verification.")
        return

    contract = ContractInterface(client)
    contract._connected = True
    verifier = EvidenceVerifier(contract)

    # ─── Re-verification ─────────────────────────────────────────────────
    st.markdown("### 🔍 Re-Verify Evidence")

    if st.button("🔍 Re-Verify Against Blockchain", type="primary"):
        with st.spinner("🔍 Verifying evidence against blockchain record..."):
            result = verifier.verify_package(package)
            st.session_state.verification_result = result

            if result["verified"]:
                log_step("Evidence successfully re-verified ✅", "complete")
            else:
                log_step(f"Verification issue: {result['message']}", "error")

    if st.session_state.verification_result is not None:
        result = st.session_state.verification_result

        if result["verified"]:
            st.success("🟢 **VERIFIED** — The supplied evidence matches the blockchain record.")
        else:
            st.error("🔴 **FAILED VERIFICATION** — " + result["message"])

        col1, col2 = st.columns(2)
        with col1:
            st.markdown(f"**Calculated Hash:**")
            st.code(result["calculated_hash"], language=None)
        with col2:
            st.markdown(f"**On-Chain Hash:**")
            st.code(result["on_chain_hash"], language=None)

        st.markdown(f"**Hashes Match:** {'✅ Yes' if result['hashes_match'] else '❌ No'}")

    st.markdown("---")

    # ─── Tampering Detection Demo ────────────────────────────────────────
    st.markdown("### 🧪 Tampering Detection Demo")

    st.markdown("Modify a field to demonstrate how tampering is detected:")

    tamper_field = st.selectbox(
        "Field to tamper:",
        ["source_url", "similarity_score", "result_title", "source_domain"],
    )

    if st.button("🧪 SIMULATE TAMPERING", type="secondary"):
        with st.spinner("Simulating data tampering..."):
            tamper_result = verifier.demonstrate_tampering(package, field=tamper_field)

            st.markdown("---")
            st.markdown("### 🧪 Tampering Result")

            col1, col2 = st.columns(2)

            with col1:
                st.markdown("**Original Hash:**")
                st.code(tamper_result["original_hash"], language=None)

            with col2:
                st.markdown("**Tampered Hash:**")
                st.code(tamper_result["tampered_hash"], language=None)

            if not tamper_result["hashes_match"]:
                st.error(
                    f"❌ **BLOCKCHAIN VERIFICATION FAILED**\n\n"
                    f"Field `{tamper_field}` was modified.\n"
                    f"Original and tampered hashes are **different**.\n\n"
                    f"This proves the evidence is tamper-evident."
                )
                log_step("Tampering detection demonstrated", "complete")
            else:
                st.warning("Hashes unexpectedly match — tampering may not have affected the canonical form.")

            st.markdown(f"**Tampered field:** `{tamper_field}`")
            st.markdown(tamper_result["message"])

    # ─── Pipeline Complete ────────────────────────────────────────────────
    st.markdown("---")
    st.markdown("### 🎉 Pipeline Complete")

    st.markdown("""
    <div style="background: linear-gradient(135deg, #1e2e1e, #1e1e30); border-radius: 12px; padding: 1.5rem; border: 1px solid #4ade80; text-align: center;">
        <h2 style="color: #4ade80;">🏆 Investigation Complete</h2>
        <p style="color: #aaa;">All pipeline steps have been successfully executed.</p>
        <p style="color: #888; font-size: 0.9rem;">
            Face Detection → Web Search → Match Discovery → Evidence Hash → Blockchain Registration → Verification
        </p>
    </div>
    """, unsafe_allow_html=True)


def render_log_panel():
    """Render the live pipeline log."""
    if st.session_state.demo_log:
        st.markdown("### 📜 Pipeline Log")
        for entry in st.session_state.demo_log[-20:]:  # Last 20 entries
            st.markdown(f"`{entry['time']}` {entry['icon']} {entry['message']}")


# ─── Main Application ────────────────────────────────────────────────────────

def main():
    """Main Streamlit application entry point."""
    render_header()
    render_pipeline_sidebar()

    # Step-based routing
    step = st.session_state.step

    if step == 0:
        step_upload_and_detect()
    elif step == 1:
        step_web_search()
    elif step == 2:
        step_match_results()
    elif step == 3:
        step_blockchain()
    elif step == 4:
        step_verification()
    elif step >= 5:
        step_verification()

    # Pipeline log at the bottom
    st.markdown("---")
    render_log_panel()

    # Footer
    st.markdown("---")
    st.markdown(
        "**TraceFace** — *Discover. Verify. Prove.* | "
        "The system performs visual similarity matching against publicly returned search results. "
        "A visual match should not automatically be treated as proof of a person's real-world identity."
    )


# Initialize and run
init_session_state()
main()
