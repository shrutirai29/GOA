import { toPng } from "html-to-image";

export interface ExportOptions {
  pixelRatio?: number;
}

/**
 * Renders the live card DOM node to a high-res PNG data URL. The preview and
 * the exported image share the exact same markup, so WYSIWYG is guaranteed.
 */
export async function exportCardNode(
  node: HTMLElement,
  opts: ExportOptions = {},
): Promise<string> {
  const { pixelRatio = 2 } = opts;
  try {
    await document.fonts.ready;
  } catch {
    // Fonts are best-effort; proceed anyway.
  }
  return toPng(node, {
    pixelRatio,
    cacheBust: true,
    backgroundColor: "#05040a",
    // JPEG-derived photos are data URLs; nothing external to inline.
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function exportFilename(format: "id" | "pfp", name: string): string {
  const slug =
    name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "builder";
  return `hh-goa-2026-${slug}-${format}.png`;
}
