const TITLE_MAP: Array<[RegExp, string]> = [
  [/full ?stack|fullstack/i, "SHIP IT MACHINE"],
  [/react|next\.?js|frontend|front-end|css|html|\bui\b|\bweb\b/i, "THE UI ALCHEMIST"],
  [/python|automation|scrap|bot/i, "THE AUTOMATION WIZARD"],
  [/cyber|security|pentest|hack|exploit|forensic/i, "THE DIGITAL GUARDIAN"],
  [/ai|ml|machine learning|llm|gpt|neural|data sci|genai|openai/i, "THE NEURAL ARCHITECT"],
  [/backend|api|server|node|express|spring|go\b|rust|java|\.net/i, "THE SYSTEMS BUILDER"],
  [/javascript|typescript|js\b|ts\b|ecma/i, "THE SCRIPT SORCERER"],
  [/devops|deploy|cloud|aws|gcp|azure|docker|k8s|kubernetes|sre|terraform|ci\b|cd\b/i, "THE DEPLOYMENT MACHINE"],
  [/blockchain|web3|solidity|defi|chain|ethereum/i, "THE CHAIN EXPLORER"],
  [/design|figma|creative|brand|art|motion/i, "THE PIXEL ARCHITECT"],
  [/flutter|react native|mobile|android|ios|swift|kotlin/i, "THE MOBILE FORGE"],
  [/game|unity|unreal|three\.?js|webgl|blender/i, "THE REALITY WEAVER"],
  [/hardware|iot|embedded|arduino|esp|raspberry/i, "THE HARDWARE HACKER"],
  [/sql|database|postgres|mysql|mongo|redis|dynamo|db\b/i, "THE DATA CARTOGRAPHER"],
  [/developer|software|engineer|programmer|stack/i, "THE CODE ARCHITECT"],
];

const FALLBACK_TITLES = [
  "THE BUILDER",
  "SHIP IT MACHINE",
  "THE BUG HUNTER",
  "CODE ARCHITECT",
  "TERMINAL WARRIOR",
  "FULL STACK MENACE",
  "PRODUCT BUILDER",
  "THE DEBUGGER",
  "FEATURE FORGE",
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** All plausible titles for a stack, matched title first. */
export function generateTitleCandidates(stack: string): string[] {
  const s = (stack ?? "").trim();
  if (!s) return [...FALLBACK_TITLES];
  for (const [re, title] of TITLE_MAP) {
    if (re.test(s)) return [title, ...FALLBACK_TITLES.filter((t) => t !== title)];
  }
  const offset = hashStr(s) % FALLBACK_TITLES.length;
  return [...FALLBACK_TITLES.slice(offset), ...FALLBACK_TITLES.slice(0, offset)];
}

export function generateTitle(stack: string): string {
  return generateTitleCandidates(stack)[0];
}

/** Next title in the rotation for the given stack, starting after `current`. */
export function nextTitle(stack: string, current: string): string {
  const candidates = generateTitleCandidates(stack);
  const idx = candidates.indexOf(current);
  return candidates[(idx + 1) % candidates.length];
}
