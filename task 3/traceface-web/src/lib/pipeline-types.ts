/**
 * Pipeline State Management
 * Manages the entire investigation pipeline state machine.
 */

"use client";

import { useState, useCallback } from "react";
import type { DetectedFace } from "./face-detect";

/* ─── Types ─────────────────────────────────────────────────────── */

export interface SearchResult {
  title: string;
  url: string;
  imageUrl: string;
  domain: string;
  snippet: string;
  provider: string;
  position: number;
}

export interface ProcessedResult extends SearchResult {
  imageDownloaded: boolean;
  faceInResult: boolean;
  similarity: number | null;
  matchConfidence: string;
  resultImageHash: string;
  selected?: boolean;
}

export interface EvidencePackage {
  caseId: string;
  createdAt: string;
  inputImageHash: string;
  faceDescriptorHash: string;
  searchProvider: string;
  searchTimestamp: string;
  resultTitle: string;
  sourceUrl: string;
  sourceDomain: string;
  resultImageHash: string;
  similarityScore: number;
  metadata: Record<string, unknown>;
}

export interface BlockchainReceipt {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  contractAddress: string;
  networkName: string;
  explorerUrl?: string;
  gasUsed?: number;
  status: string;
}

export interface VerificationResult {
  verified: boolean;
  calculatedHash: string;
  onChainHash: string;
  message: string;
}

export interface TamperResult {
  originalHash: string;
  tamperedHash: string;
  tamperedField: string;
  verified: boolean;
  message: string;
}

export interface PipelineState {
  step: number;
  loading: boolean;
  error: string | null;
  // Step 1: Face
  uploadedImage: string | null;
  imageFile: File | null;
  imageHash: string;
  faces: DetectedFace[];
  selectedFaceIndex: number;
  faceDescriptor: number[];
  faceDescriptorHash: string;
  // Step 2: Search
  searchProvider: string;
  searchMode: "live" | "demo" | null;
  searchResults: SearchResult[];
  // Step 3: Match
  processedResults: ProcessedResult[];
  selectedResult: ProcessedResult | null;
  // Step 4: Evidence
  evidencePackage: EvidencePackage | null;
  evidenceHash: string;
  // Step 5: Blockchain
  blockchainMode: string;
  blockchainReceipt: BlockchainReceipt | null;
  // Step 6: Verify
  verificationResult: VerificationResult | null;
  tamperResult: TamperResult | null;
  // Logs
  logs: string[];
}

const INITIAL_STATE: PipelineState = {
  step: 0,
  loading: false,
  error: null,
  uploadedImage: null,
  imageFile: null,
  imageHash: "",
  faces: [],
  selectedFaceIndex: 0,
  faceDescriptor: [],
  faceDescriptorHash: "",
  searchProvider: "",
  searchMode: null,
  searchResults: [],
  processedResults: [],
  selectedResult: null,
  evidencePackage: null,
  evidenceHash: "",
  blockchainMode: "",
  blockchainReceipt: null,
  verificationResult: null,
  tamperResult: null,
  logs: [],
};

export function usePipeline() {
  const [state, setState] = useState<PipelineState>(INITIAL_STATE);

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setState((prev) => ({
      ...prev,
      logs: [...prev.logs, `[${ts}] ${msg}`],
    }));
  }, []);

  const update = useCallback((patch: Partial<PipelineState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { state, addLog, update, reset };
}
