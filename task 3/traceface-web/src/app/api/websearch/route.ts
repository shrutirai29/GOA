import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/websearch
 *
 * Performs a REAL full-web text search (SerpAPI `engine=google`) on a query
 * string. Used as the second, broader discovery stage of the pipeline:
 * after Google Lens finds visually similar public pages and a face match is
 * scored, this route searches the live web for the name/context stated on
 * the discovered public source, surfacing additional real pages that
 * mention that identity context.
 *
 * It NEVER fabricates results. Without a SERPAPI_KEY it returns an honest
 * `mode: "demo"` payload — no search is performed.
 *
 * Body: { q: string }
 */
interface WebResult {
  title: string;
  url: string;
  domain: string;
  snippet: string;
  position: number;
}

function safeDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const q = String(body.q || "").trim();

    if (!q) {
      return NextResponse.json(
        { error: "No query provided", results: [] },
        { status: 400 }
      );
    }
    if (q.length > 200) {
      return NextResponse.json(
        { error: "Query too long", results: [] },
        { status: 400 }
      );
    }

    const key = process.env.SERPAPI_KEY;
    if (!key) {
      return NextResponse.json({
        mode: "demo",
        provider: "Demo Mode (No API Key)",
        totalResults: 0,
        results: [],
        message:
          "No SERPAPI_KEY configured — this is demo mode, no real web search was performed.",
      });
    }

    const params = new URLSearchParams({
      engine: "google",
      q,
      api_key: key,
      num: "10",
      hl: "en",
    });

    const res = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Web search failed (${res.status}): ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(`SerpAPI: ${data.error}`);
    }

    const results: WebResult[] = [];
    for (const item of data.organic_results || []) {
      if (!item.link) continue;
      results.push({
        title: item.title || "Untitled",
        url: item.link,
        domain: safeDomain(item.link),
        snippet: item.snippet || "",
        position: results.length + 1,
      });
      if (results.length >= 10) break;
    }

    return NextResponse.json({
      mode: "live",
      provider: "SerpAPI (Google Web Search)",
      query: q,
      totalResults: results.length,
      results,
      message:
        results.length === 0
          ? "Live web search completed — no public results returned."
          : undefined,
    });
  } catch (error) {
    console.error("WebSearch API error:", error);
    return NextResponse.json(
      {
        error: "Web search failed",
        mode: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        results: [],
      },
      { status: 502 }
    );
  }
}
