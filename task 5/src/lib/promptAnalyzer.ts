import { Generated3DExperience } from '../types';

export function analyzeUserPrompt(prompt: string): Generated3DExperience {
  const text = prompt.toLowerCase();

  // 1. Determine Archetype
  let objectType: Generated3DExperience['objectType'] = 'abstract';
  let category = 'Kinetic 3D Sculpture';

  if (/(watch|clock|rolex|timepiece|chronometer|wrist)/i.test(text)) {
    objectType = 'watch';
    category = 'Haute Horlogerie 3D';
  } else if (/(sword|blade|katana|saber|lightsaber|dagger|weapon|rapier)/i.test(text)) {
    objectType = 'sword';
    category = 'Spatial Armory & Relics';
  } else if (/(drone|ship|spaceship|hovercar|car|vehicle|jet|ufo|shuttle|aircraft)/i.test(text)) {
    objectType = 'drone';
    category = 'Aerospace Cybernetics';
  } else if (/(bottle|perfume|potion|flask|fragrance|vial|vessel)/i.test(text)) {
    objectType = 'bottle';
    category = 'Luxury Crystalline Vessels';
  } else if (/(flower|lotus|rose|blossom|plant|petal|flora|bloom)/i.test(text)) {
    objectType = 'flower';
    category = 'Bio-Cybernetic Botanical';
  } else if (/(trophy|award|cup|medal|sculpture|monolith|statue|plinth)/i.test(text)) {
    objectType = 'trophy';
    category = 'Ceremonial Monuments';
  } else if (/(ring|diamond|jewel|jewelry|gem|crown|necklace|pendant)/i.test(text)) {
    objectType = 'ring';
    category = 'Precious Spatial Gemology';
  } else if (/(helmet|skull|mask|visor|head|cyborg|android|face)/i.test(text)) {
    objectType = 'helmet';
    category = 'Biomechanical Helmets';
  } else if (/(speaker|headphone|headset|audio|synth|hardware|device|gadget|camera)/i.test(text)) {
    objectType = 'tech';
    category = 'Acoustic Spatial Hardware';
  }

  // 2. Determine Primary & Glow Color Palette
  let primaryColor = '#D4AF37'; // Imperial Gold default
  let secondaryColor = '#7C263D'; // Royal Maroon
  let accentColor = '#FFF1C5';
  let glowColor = '#FDE047';
  let paletteName = 'Imperial Gold';

  if (/(emerald|green|mint|jade|lime)/i.test(text)) {
    primaryColor = '#059669';
    secondaryColor = '#064E3B';
    accentColor = '#6EE7B7';
    glowColor = '#34D399';
    paletteName = 'Cyber Emerald';
  } else if (/(ruby|crimson|red|maroon|wine|blood)/i.test(text)) {
    primaryColor = '#7C263D';
    secondaryColor = '#4C0519';
    accentColor = '#FECDD3';
    glowColor = '#FB7185';
    paletteName = 'Royal Ruby';
  } else if (/(cyan|blue|neon|sapphire|ice|azure|aqua)/i.test(text)) {
    primaryColor = '#0284C7';
    secondaryColor = '#0C4A6E';
    accentColor = '#BAE6FD';
    glowColor = '#38BDF8';
    paletteName = 'Neon Sapphire';
  } else if (/(purple|violet|amethyst|magenta|lavender)/i.test(text)) {
    primaryColor = '#7C3AED';
    secondaryColor = '#4C1D95';
    accentColor = '#DDD6FE';
    glowColor = '#C084FC';
    paletteName = 'Electric Amethyst';
  } else if (/(silver|white|chrome|platinum|snow)/i.test(text)) {
    primaryColor = '#E2E8F0';
    secondaryColor = '#475569';
    accentColor = '#FFFFFF';
    glowColor = '#38BDF8';
    paletteName = 'Liquid Chrome';
  } else if (/(black|obsidian|stealth|dark|shadow)/i.test(text)) {
    primaryColor = '#1E1E24';
    secondaryColor = '#0A0A0F';
    accentColor = '#D4AF37';
    glowColor = '#FDE047';
    paletteName = 'Obsidian Stealth';
  } else if (/(pink|rose|copper|peach)/i.test(text)) {
    primaryColor = '#E11D48';
    secondaryColor = '#881337';
    accentColor = '#FFE4E6';
    glowColor = '#FB7185';
    paletteName = 'Rose Gold Nebula';
  }

  // 3. Extract Clean Display Title
  const cleanTitle = generateDisplayTitle(prompt, objectType);

  // 4. Colorway Presets
  const colorways = [
    {
      name: paletteName,
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      glow: glowColor
    },
    {
      name: 'Imperial Gold & Maroon',
      primary: '#D4AF37',
      secondary: '#7C263D',
      accent: '#FFF1C5',
      glow: '#FDE047'
    },
    {
      name: 'Cyberpunk Neon Teal',
      primary: '#0D9488',
      secondary: '#134E4A',
      accent: '#99F6E4',
      glow: '#2DD4BF'
    }
  ];

  // 5. Specs
  const specs = [
    `Procedural geometry synthesized for: "${prompt}"`,
    `Physical shading with PBR metalness & micro-facet reflections`,
    `Real-time multi-axis physics & dynamic studio lighting`
  ];

  return {
    id: `gen-${Date.now()}`,
    userPrompt: prompt,
    title: cleanTitle,
    category,
    subtitle: `Synthesized live from your voice command: "${prompt}"`,
    objectType,
    primaryColor,
    secondaryColor,
    accentColor,
    glowColor,
    metalness: /(glass|crystal|gem|potion|bottle)/i.test(text) ? 0.2 : 0.85,
    roughness: /(glass|mirror|chrome|diamond)/i.test(text) ? 0.1 : 0.25,
    glass: /(glass|crystal|translucent|bottle|perfume|ice)/i.test(text),
    wireframe: false,
    specs,
    colorways
  };
}

function generateDisplayTitle(prompt: string, objectType: string): string {
  // Strip common conversational filler words
  const cleaned = prompt
    .replace(/^(create|make|generate|build|give me|show me|design|render|i want|please)\s+(a|an|the)?\s*/i, '')
    .trim();

  if (cleaned.length > 3) {
    // Capitalize words
    const words = cleaned.split(' ').slice(0, 5).join(' ');
    return words.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const fallbacks: Record<string, string> = {
    watch: 'Cyber Chronometer Mk-I',
    sword: 'Holographic Plasma Blade',
    drone: 'Autonomous Quantum Drone',
    bottle: 'Artisanal Crystal Vessel',
    flower: 'Bio-Luminescent Lotus',
    trophy: 'Grand Apex Monument',
    ring: 'Prismatic Diamond Solitaire',
    helmet: 'Tactical Cybernetic Visor',
    tech: 'Spatial Acoustic Transducer',
    abstract: 'Kinetic Harmonic Monolith'
  };

  return fallbacks[objectType] || 'Spatial 3D Synthesis';
}
