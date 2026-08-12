export interface ShareDetails {
  name: string;
  title: string;
  stack: string;
  handle: string;
}

export function buildShareCaption(d: ShareDetails): string {
  const name = d.name.trim() || "a builder";
  const title = d.title.trim() || "THE BUILDER";
  const stack = d.stack.trim();
  const handle = d.handle.trim().replace(/^@/, "");
  const lines = [
    `Just unlocked my HH Goa 2026 builder identity ⚡`,
    ``,
    `${name} — ${title}${stack ? ` · ${stack}` : ""}`,
    ``,
    `See you in Goa.`,
    ``,
    `#FrameInGoa #HHGoa2026`,
  ];
  if (handle) lines.splice(4, 0, `@${handle} on X.`);
  return lines.join("\n");
}

/** Opens X's compose window with the caption pre-filled. */
export function openXIntent(caption: string) {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;
  window.open(url, "_blank", "noopener,noreferrer,width=620,height=620");
}

export async function copyCaption(caption: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(caption);
    return true;
  } catch {
    return false;
  }
}
