import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/search
 *
 * Performs a real reverse-image / visual search using the uploaded image.
 * Accepts base64-encoded image data (data:image/...;base64,...) from the client.
 *
 * Provider priority:
 *   1. Bing Visual Search (BING_API_KEY) — accepts file upload directly
 *   2. SerpAPI Google Lens (SERPAPI_KEY) — upload via /image endpoint → image_id → google_lens
 *   3. If a key IS configured but the provider call fails → mode "error" (real reason shown)
 *   4. If NO key is configured → mode "demo" (clearly labeled, no real search performed)
 *
 * Body: { imageBase64: string }
 */

interface SearchResult {
  title: string;
  url: string;
  imageUrl: string;
  domain: string;
  snippet: string;
  provider: string;
  position: number;
}

// ─── Bing Visual Search ─────────────────────────────────────────────
async function searchBing(
  imageBuffer: Buffer,
  mimeType: string
): Promise<{ results: SearchResult[]; provider: string }> {
  const key = process.env.BING_API_KEY!;
  const form = new FormData();
  form.append("image", new Blob([new Uint8Array(imageBuffer)], { type: mimeType }), "image.png");

  const res = await fetch(
    "https://api.bing.microsoft.com/v7.0/images/visualsearch",
    {
      method: "POST",
      headers: { "Ocp-Apim-Subscription-Key": key },
      body: form,
      signal: AbortSignal.timeout(30000),
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Bing Visual Search returned ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const results: SearchResult[] = [];

  for (const tag of data.tags || []) {
    const actions = tag.actions || [];
    for (const action of actions) {
      if (
        action.actionType === "VisualSearch" ||
        action.actionType === "PagesWithMatchingImages"
      ) {
        const pages = action.data?.value || action.value || [];
        for (const page of pages) {
          results.push({
            title: page.name || page.displayText || "Untitled",
            url: page.url || page.hostPageUrl || "",
            imageUrl: page.thumbnailUrl || page.contentUrl || "",
            domain: safeDomain(page.url || page.hostPageUrl || ""),
            snippet: page.snippet || page.dateLastCrawled || "",
            provider: "Bing Visual Search",
            position: results.length + 1,
          });
        }
      }
    }
  }

  const webPages = data.image?.insightsMetadata?.pagesWithMatchingImages || [];
  for (const page of webPages) {
    if (!results.some((r) => r.url === page.url)) {
      results.push({
        title: page.name || "Untitled",
        url: page.url || "",
        imageUrl: page.thumbnailUrl || "",
        domain: safeDomain(page.url || ""),
        snippet: page.snippet || "",
        provider: "Bing Visual Search",
        position: results.length + 1,
      });
    }
  }

  return { results: results.slice(0, 20), provider: "Bing Visual Search" };
}

// ─── SerpAPI Google Lens ────────────────────────────────────────────
//
// Current flow (per https://serpapi.com/google-lens-upload-an-image):
//   1. POST https://serpapi.com/image  (multipart: image + api_key)  → { image_id }
//      Note: uploads are limited to 500 KB — clients must compress first.
//   2. GET https://serpapi.com/search.json?engine=google_lens&image_id=...&api_key=...
//      → visual_matches[]
//
async function searchSerpApi(
  imageBuffer: Buffer,
  mimeType: string
): Promise<{ results: SearchResult[]; provider: string }> {
  const key = process.env.SERPAPI_KEY!;

  // Step 1: Upload image → get image_id
  const uploadForm = new FormData();
  uploadForm.append(
    "image",
    new Blob([new Uint8Array(imageBuffer)], { type: mimeType }),
    "image.jpg"
  );
  uploadForm.append("api_key", key);

  const uploadRes = await fetch("https://serpapi.com/image", {
    method: "POST",
    body: uploadForm,
    signal: AbortSignal.timeout(30000),
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text().catch(() => "");
    throw new Error(`SerpAPI image upload failed (${uploadRes.status}): ${errText.slice(0, 200)}`);
  }

  const uploadData = await uploadRes.json();
  if (uploadData.error) {
    throw new Error(`SerpAPI upload error: ${uploadData.error}`);
  }
  const imageId = uploadData.image_id;
  if (!imageId) {
    throw new Error("SerpAPI image upload returned no image_id");
  }

  // Step 2: Run Google Lens search with the uploaded image_id
  const searchParams = new URLSearchParams({
    engine: "google_lens",
    image_id: imageId,
    api_key: key,
  });

  const searchRes = await fetch(
    `https://serpapi.com/search.json?${searchParams.toString()}`,
    { signal: AbortSignal.timeout(45000) }
  );

  if (!searchRes.ok) {
    const errText = await searchRes.text().catch(() => "");
    throw new Error(`SerpAPI Google Lens search failed (${searchRes.status}): ${errText.slice(0, 200)}`);
  }

  const data = await searchRes.json();
  if (data.error) {
    // e.g. invalid key, quota exceeded, "Google hasn't returned any results"
    throw new Error(`SerpAPI: ${data.error}`);
  }

  const results: SearchResult[] = [];
  for (const match of data.visual_matches || []) {
    if (!match.link) continue;
    results.push({
      title: match.title || "Untitled",
      url: match.link,
      imageUrl: match.image || match.thumbnail || "",
      domain: safeDomain(match.link),
      snippet: match.snippet || match.source || "",
      provider: "SerpAPI (Google Lens)",
      position: results.length + 1,
    });
  }

  return { results: results.slice(0, 20), provider: "SerpAPI (Google Lens)" };
}

// ─── Helpers ────────────────────────────────────────────────────────
function safeDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function decodeBase64Image(dataUrl: string): { buffer: Buffer; mime: string } {
  const match = dataUrl.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image format. Expected data:image/...;base64,...");
  }
  return {
    buffer: Buffer.from(match[2], "base64"),
    mime: match[1],
  };
}

// ─── Main handler ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image provided", results: [] },
        { status: 400 }
      );
    }

    const { buffer, mime } = decodeBase64Image(imageBase64);
    const bingKey = process.env.BING_API_KEY;
    const serpKey = process.env.SERPAPI_KEY;

    // If no provider key is configured at all → honest demo mode.
    if (!bingKey && !serpKey) {
      return NextResponse.json({
        mode: "demo",
        provider: "Demo Mode (No API Key)",
        totalResults: 0,
        results: [],
        message:
          "No search API key configured. Set SERPAPI_KEY or BING_API_KEY " +
          "environment variables for real web searches. " +
          "This is demo mode — no actual web search was performed.",
      });
    }

    // A key IS configured → attempt the real search.
    let lastError: unknown = null;

    // 1. Try Bing Visual Search
    if (bingKey) {
      try {
        const { results, provider } = await searchBing(buffer, mime);
        return NextResponse.json({
          mode: "live",
          provider,
          totalResults: results.length,
          results,
          message:
            results.length === 0
              ? "Live search completed — no public visual matches found."
              : undefined,
        });
      } catch (err) {
        console.error("Bing Visual Search error:", err);
        lastError = err;
      }
    }

    // 2. Try SerpAPI Google Lens
    if (serpKey) {
      try {
        const { results, provider } = await searchSerpApi(buffer, mime);
        return NextResponse.json({
          mode: "live",
          provider,
          totalResults: results.length,
          results,
          message:
            results.length === 0
              ? "Live search completed — no public visual matches found."
              : undefined,
        });
      } catch (err) {
        console.error("SerpAPI error:", err);
        lastError = err;
      }
    }

    // A key existed but every provider call failed → report the real error.
    return NextResponse.json(
      {
        mode: "error",
        provider: "Search provider",
        totalResults: 0,
        results: [],
        message:
          lastError instanceof Error ? lastError.message : "Search provider failed.",
      },
      { status: 502 }
    );
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      {
        error: "Search failed",
        mode: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        results: [],
      },
      { status: 500 }
    );
  }
}
