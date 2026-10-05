# VOXFORGE — Voice-First Creative Development Studio

> **"Build. Plan. Code. Think. Play."**  
> *Your voice, your development studio.*

---

## What is VoxForge?

**VoxForge** is a production-quality, voice-first creative development playground designed to showcase how modern software engineering, spatial 3D architecture, product planning, and algorithmic logic can be driven directly by natural human speech.

Combining the tactile elegance of **1960s/70s Indian cinema studio craftsmanship** (*cream paper, royal maroon, muted gold, subtle film strips, and architectural arches*) with **high-precision modern WebGL and React Three Fiber rendering**, VoxForge treats voice not as a gimmick, but as an interactive development interface.

---

## Why Wispr Flow?

[Wispr Flow](https://wisprflow.ai) is an ultra-fast desktop speech dictation application engineered specifically for developers and technical creators. It understands developer syntax, algorithmic phrasing, and punctuation with sub-200ms transcription speed.

### How Wispr Flow Works with VoxForge
VoxForge does **not** pretend to embed a proprietary Wispr API or claim direct backend SDK access. Instead:
1. **Focus:** The developer places the cursor in VoxForge's persistent top command field.
2. **Speak:** The developer triggers Wispr Flow desktop dictation and speaks naturally.
3. **Insert:** Wispr Flow inserts the transcribed developer command into the input field.
4. **Understand & Execute:** VoxForge's centralized natural language router parses the intent, transitions the active workspace, and synthesizes 3D models, code sandboxes, roadmaps, or mindmaps.

```
┌─────────────────┐      Dictate      ┌─────────────────────────────┐
│   Wispr Flow    │ ────────────────► │  VoxForge Top Command Bar   │
│  (Desktop App)  │                   │     "VOICE READY"           │
└─────────────────┘                   └──────────────┬──────────────┘
                                                     │
                                             Intent Detection
                                                     │
                                                     ▼
                                      ┌─────────────────────────────┐
                                      │   Target Workspace Studio   │
                                      │   [BUILD • PLAN • CODE •    │
                                      │    THINK • PLAY]            │
                                      └─────────────────────────────┘
```

---

## Core Product Principles

1. **Speak → Understand → Build → Visualize → Execute:** Every action provides visible feedback through an animated laser scan progression (`VOICE RECEIVED` → `INTENT DETECTED` → `BUILDING` → `READY`).
2. **Single Active Experience:** No cluttered dashboards showing 10 components simultaneously. Choosing the VIP Pass shows *only* the VIP Pass; switching to the Orb transitions *cleanly* to the Orb.
3. **Zero External API Dependencies:** VoxForge runs completely offline immediately after `npm install`. No paid API keys or external server dependencies are required.
4. **Honest Audio Engineering:** Native Web Audio API synthesis for zero-asset sound effects and SpeechSynthesis for Text-to-Speech readout. The optional microphone canvas is clearly labelled as a *local visualizer*, not a fake Wispr API stream.

---

## Key Workspaces & Features

### 1. BUILD Workspace (3D Spatial Studio)
- **✨ 3D Cyber VIP Pass:**
  - Rendered in Three.js / React Three Fiber with physical clearcoat, reflective metallics, and subtle floating animation.
  - Interactive mouse-perspective tilt and 3D auto-rotate.
  - Front/Back 3D flip card mechanics (magnetic strip, voiceprint hash `0x7F9A2B44E8C1019`, barcode).
  - Biometric Voice Ping with verified sound chime.
  - Colorway switcher: Royal Maroon, Vintage Teal, Midnight Gold.
  - Export PNG snapshot.
- **🔮 Holographic AI Orb:**
  - Concentric triple gyro rings and inner pulsing plasma core.
  - Harmonic frequency slider ($100\text{ Hz} \to 880\text{ Hz}$). Gyro ring rotation velocity and luminosity scale directly with frequency.
  - Pulse Resonance and Voice Beacon broadcast triggers.
- **👟 3D Cyber Sneaker (CYBER-AIR WISPR V1):**
  - Procedural floating 3D sneaker model with outsole, translucent air cushion, dynamic swoosh, and soft contact shadow.
  - 360° spin mode.
  - Colorways: Cyber Emerald, Neon Cyan, Solar Amber.
  - Prototype Pre-order modal (email confirmation without fake payment gateways).
- **💻 Generated Code Panel:**
  - Compact code inspector with React, HTML, CSS, and Three.js tabs, line numbers, and expandable full-screen editor.

### 2. PLAN Workspace (PRD & Delivery Roadmap)
- Automatically generated Product Requirements Document with Executive Overview, Problem Statement, Objectives, and User Stories with Acceptance Criteria.
- **Delivery Roadmap:** 5 phases (*Idea*, *Prototype*, *MVP*, *Testing*, *Launch*) with owner tags, deadlines, and animated progress bars.
- **Interactive Critical Path:** Checkpoints with live completion sound and status toast.
- **1-Click Exports:** Copy Markdown, Copy Executive Summary, and Export `.md` file.

### 3. CODE Workspace (Voice-to-Code Playground)
- Multi-language templates: **JavaScript (ES6)**, **Python 3**, **TypeScript**, and **PostgreSQL**.
- **Safe Sandboxed Execution Console:** Executes JavaScript logic (O(1) LRU Cache with capacity 5) in browser without affecting the global window.
- Displays real cache hits, evictions, and clearly labelled demo runtime metrics ($< 4\text{ms}$).

### 4. THINK Workspace (Voice MindMap Canvas)
- Dynamic node graph connected via curved Bezier links.
- Draggable physics nodes with collision radius.
- Voice-expansion: speaking *"Add a Security branch"* or *"Under Security add Authentication"* dynamically spawns child nodes.
- **Export PNG** for high-resolution graphics and **Copy Structure** for text export.

### 5. PLAY Workspace (Voice Quest Maze Runner)
- Canvas cyber-labyrinth styled in VoxForge retro cinema aesthetic.
- **Voice Navigation:** speak `"UP"`, `"DOWN"`, `"LEFT"`, `"RIGHT"`, or `"RESET"`.
- Dual controls: keyboard Arrow keys / WASD and on-screen tactile D-Pad.
- Sound crystal pickups ($+50\text{ pts}$ each) and Wispr Exit Portal ($+200\text{ pts}$ victory fanfare with confetti).

### 6. Voice Activity Timeline
- Right-hand live activity panel recording every spoken command.
- Formatted timeline showing timestamp, dictated text, detected intent, and completion status (collapsible up to 6 recent items).

---

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 18 + Vite** | Fast modern frontend architecture & HMR |
| **TypeScript** | Strict end-to-end type safety |
| **Three.js** | 3D WebGL scenes, lighting, materials, and geometry |
| **@react-three/fiber & @react-three/drei** | Declarative React Three.js renderer and helpers |
| **Tailwind CSS** | Custom vintage cinema color palette and styling |
| **Lucide React** | Consistent SVG iconography |
| **Web Audio API** | Zero-dependency native sound synthesis (chimes, clicks, pings) |
| **SpeechSynthesis API** | Native Text-to-Speech (Read Aloud) |
| **Canvas Confetti** | Celebration visual feedback |

---

## Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node `v24.14.1`)
- npm `v9+` or `v11+`

### Installation
```bash
# Clone repository
git clone https://github.com/shrutirai29/GOA.git
cd "task 5"

# Install dependencies
npm install

# Start development server
npm run dev
```

VoxForge will start on **`http://localhost:8080`**.

---

## Step-by-Step Demo Flow for Evaluators

1. **Launch VoxForge:** Open `http://localhost:8080` in your browser. Notice the default warm cream paper background, architectural arches, and clean empty state (*"What will you build?"*).
2. **Focus Command Bar:** Click into the top command field (*"Speak with Wispr Flow..."*).
3. **Start Wispr Flow:** Press your Wispr Flow desktop dictation shortcut.
4. **Dictate VIP Pass:** Speak:
   > *"Create a 3D cyber VIP pass with holographic effects"*
5. **Execute:** Let Wispr Flow insert the text, then press **Enter** or click **Execute**.
6. **Observe Progression:** Notice the laser scan line and states: `VOICE RECEIVED` → `INTENT DETECTED` → `BUILDING` → `READY`.
7. **Interact with VIP Pass:**
   - Move your mouse to tilt the card with 3D perspective physics.
   - Click **Flip 3D Card** to reveal the security magnetic strip and barcode.
   - Click **Play Voice Ping** for synthesized biometric confirmation.
   - Switch colorways to **Vintage Teal** or **Midnight Gold**.
8. **Dictate LRU Cache:** Click into the command bar and speak:
   > *"Create an LRU cache in JavaScript with capacity five"*
9. **Observe Code Workspace:** Notice the automatic intent routing to the **CODE** workspace. Click **▶ Run Code** to execute the LRU cache live in the browser console.
10. **Dictate PRD:** Speak:
    > *"Create a PRD for a voice-controlled cybersecurity dashboard"*
11. **Review Plan Workspace:** Inspect the generated user stories, delivery roadmap, and check off milestones in the Critical Path.
12. **Dictate Maze Quest:** Speak:
    > *"Start the maze"*
13. **Play through Voice:** Speak `"RIGHT"`, `"DOWN"`, `"UP"` into Wispr Flow to collect sound crystals and navigate to the portal!

---

## Limitations & Future Roadmap

- **External AI LLM Integration:** Currently uses deterministic local generation templates to guarantee 100% offline reliability without API keys. Future updates will support custom local Ollama / Gemini API keys via `.env`.
- **Custom GLB Model Importer:** Future iterations will allow dragging custom `.glb` 3D files into the build canvas.

---

## License

MIT License © 2026 VoxForge. Built with Wispr Flow for Hacker House Goa.
