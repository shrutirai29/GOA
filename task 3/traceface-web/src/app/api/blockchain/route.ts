import { NextRequest, NextResponse } from "next/server";

/**
 * EvidenceRegistry ABI (minimal interface)
 */
const ABI = [
  "function registerEvidence(bytes32 evidenceHash, string caseId, string sourceFingerprint) external",
  "function verifyEvidence(bytes32 evidenceHash) external view returns (bool found, tuple(bytes32 evidenceHash, string caseId, string sourceFingerprint, uint256 timestamp, address submitter) record)",
  "function exists(bytes32 evidenceHash) external view returns (bool)",
];

/**
 * POST /api/blockchain
 *
 * Actions:
 *   register — Store evidence hash on-chain
 *   verify   — Check if evidence hash exists on-chain
 *   status   — Check blockchain connection status
 *
 * Body: { action: string, evidenceHash?: string, caseId?: string, sourceFingerprint?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, evidenceHash, caseId, sourceFingerprint } = body;

    const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const blockchainMode = process.env.BLOCKCHAIN_MODE || "demo";

    // ─── STATUS CHECK ─────────────────────────────────────────────
    if (action === "status") {
      if (!contractAddress || blockchainMode === "demo") {
        return NextResponse.json({
          connected: false,
          mode: "demo",
          networkName: "Demo Mode (No Blockchain Configured)",
          message:
            "Set BLOCKCHAIN_MODE, RPC_URL, PRIVATE_KEY, and CONTRACT_ADDRESS for real blockchain integration.",
        });
      }

      try {
        const { ethers } = await import("ethers");
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const network = await provider.getNetwork();
        return NextResponse.json({
          connected: true,
          mode: blockchainMode,
          networkName:
            blockchainMode === "testnet"
              ? `Public Testnet (Chain ${network.chainId})`
              : "Local Demonstration Chain",
          chainId: network.chainId.toString(),
          rpcUrl,
          contractAddress,
        });
      } catch (err) {
        return NextResponse.json({
          connected: false,
          mode: blockchainMode,
          networkName: "Connection Failed",
          message:
            err instanceof Error ? err.message : "Failed to connect to RPC",
        });
      }
    }

    // ─── DEMO MODE — simulate blockchain operations ───────────────
    if (!contractAddress || blockchainMode === "demo") {
      if (action === "register") {
        // Generate a realistic-looking demo receipt
        const demoHash =
          evidenceHash ||
          "0x" + Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
        const demoTxHash =
          "0x" + Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
        const blockNum = Math.floor(Math.random() * 100000) + 1;

        return NextResponse.json({
          success: true,
          mode: "demo",
          txHash: demoTxHash,
          blockNumber: blockNum,
          timestamp: new Date().toISOString(),
          from: "0x0000000000000000000000000000000000000000",
          contractAddress: "0x0000000000000000000000000000000000000000",
          networkName: "Demo Mode (Simulated Chain)",
          gasUsed: 52000,
          status: "confirmed",
          message:
            "Demo mode: This is a simulated blockchain transaction. Configure BLOCKCHAIN_MODE, RPC_URL, PRIVATE_KEY, and CONTRACT_ADDRESS for real on-chain registration.",
        });
      }

      if (action === "verify") {
        // In demo mode, verification always succeeds for the hash we registered
        return NextResponse.json({
          verified: true,
          mode: "demo",
          evidenceHash: evidenceHash,
          caseId: caseId || "demo-case",
          timestamp: new Date().toISOString(),
          submitter: "0x0000000000000000000000000000000000000000",
          message: "Demo mode: Simulated verification.",
        });
      }
    }

    // ─── REAL BLOCKCHAIN OPERATIONS ───────────────────────────────
    if (!privateKey) {
      return NextResponse.json(
        {
          error: "No private key",
          message: "Set PRIVATE_KEY environment variable.",
        },
        { status: 400 }
      );
    }

    const { ethers } = await import("ethers");
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress as string, ABI, wallet);

    // Convert hash string to bytes32
    const toBytes32 = (hash: string) => {
      const cleaned = hash.replace("0x", "").slice(0, 64);
      return ethers.zeroPadValue("0x" + cleaned, 32);
    };

    // ─── REGISTER ─────────────────────────────────────────────────
    if (action === "register") {
      if (!evidenceHash) {
        return NextResponse.json(
          { error: "Missing evidenceHash" },
          { status: 400 }
        );
      }

      const hashBytes = toBytes32(evidenceHash);
      const tx = await contract.registerEvidence(
        hashBytes,
        caseId || "",
        sourceFingerprint || ""
      );
      const receipt = await tx.wait();

      // Get block info
      const block = await provider.getBlock(receipt.blockNumber);
      const network = await provider.getNetwork();

      return NextResponse.json({
        success: true,
        mode: "live",
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: block
          ? new Date(Number(block.timestamp) * 1000).toISOString()
          : new Date().toISOString(),
        from: receipt.from,
        contractAddress,
        networkName:
          blockchainMode === "testnet"
            ? `Public Testnet (Chain ${network.chainId})`
            : "Local Chain",
        gasUsed: Number(receipt.gasUsed),
        status: receipt.status === 1 ? "confirmed" : "failed",
      });
    }

    // ─── VERIFY ───────────────────────────────────────────────────
    if (action === "verify") {
      if (!evidenceHash) {
        return NextResponse.json(
          { error: "Missing evidenceHash" },
          { status: 400 }
        );
      }

      const hashBytes = toBytes32(evidenceHash);
      const [found, record] = await contract.verifyEvidence(hashBytes);

      if (found) {
        return NextResponse.json({
          verified: true,
          mode: "live",
          evidenceHash: "0x" + record.evidenceHash.slice(2),
          caseId: record.caseId,
          sourceFingerprint: record.sourceFingerprint,
          timestamp: new Date(Number(record.timestamp) * 1000).toISOString(),
          submitter: record.submitter,
        });
      }

      return NextResponse.json({
        verified: false,
        mode: "live",
        message: "Evidence hash not found on-chain.",
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'register', 'verify', or 'status'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Blockchain API error:", error);
    return NextResponse.json(
      {
        error: "Blockchain operation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
