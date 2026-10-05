import { PRDData } from '../types';

export function generatePRDData(prompt: string): PRDData {
  const isCyberSec = prompt.toLowerCase().includes('security') || prompt.toLowerCase().includes('cyber');

  const title = isCyberSec
    ? 'Product Requirements Document: Voice-Controlled Cybersecurity Operations Hub'
    : 'Product Requirements Document: VoxForge Voice-First Development Engine';

  const overview = isCyberSec
    ? 'Deliver an enterprise-grade voice-controlled command center allowing security response engineers to execute incident triage, run forensic lookups, and orchestrate access lockdowns with sub-200ms latency via Wispr Flow.'
    : 'Deliver a next-generation voice-driven development studio combining vintage cinema aesthetic craftsmanship with modern interactive software generation powered by Wispr Flow.';

  const markdownContent = `# ${title}

## 1. Executive Summary
${overview}

## 2. Problem Statement
Developers and engineers face cognitive fragmentation when repeatedly context-switching between code editors, design tools, PRD documentation, and terminal consoles. Manual boilerplate authoring consumes 30%+ of active engineering sprint bandwidth.

## 3. High-Level Goals
- Sub-200ms spoken command ingestion via Wispr Flow desktop dictation.
- Zero-ambiguity intent parsing across 3D visualization, code compilation, and architectural mindmaps.
- High-aesthetic vintage Indian studio tactile design language with modern WebGL capabilities.

## 4. Target Personas
- **Lead AI / Frontend Engineer:** Dictates UI components and state machines hands-free.
- **Product Manager / Tech Lead:** Synthesizes brain-dumps directly into structured milestone roadmaps.
- **Security & Infrastructure Specialist:** Queries telemetry and activates emergency sandboxes via voice.

## 5. User Stories
### US-101: Voice-Driven Dictation
- **As a** developer using Wispr Flow
- **I want to** speak feature specifications naturally
- **So that** VoxForge translates my thoughts into functioning interfaces without typing boilerplate.
- **Acceptance Criteria:**
  - [x] Unbuffered audio intake without clipping.
  - [x] Real-time command box update.
  - [x] Instant visual feedback upon execution.

### US-102: Interactive 3D Spatial Artifacts
- **As a** product designer
- **I want to** review 3D prototypes with mouse-perspective lighting
- **So that** stakeholders experience physical fidelity before production code is committed.

## 6. Milestones & Delivery Schedule
- **Idea Phase:** Core architecture & command routing grammar.
- **Prototype Phase:** 3D VIP Pass & Holographic AI Orb models.
- **MVP Phase:** Voice-to-Code sandbox & MindMap canvas.
- **Testing Phase:** End-to-end voice latency verification (< 200ms).
- **Launch Target:** General availability across developer workspaces.
`;

  return {
    title,
    overview,
    problem: 'Context switching and manual ticket authoring slows down developer velocity.',
    goals: [
      'Sub-200ms voice dictation via Wispr Flow',
      'Instant conversion of spoken prompts to 3D and code',
      'Zero-dependency local execution runtime'
    ],
    targetUsers: ['Full-stack Developers', 'Product Architects', 'Creative Technologists'],
    userStories: [
      {
        id: 'US-101',
        role: 'Creative Engineer',
        action: 'dictate components into the focused command bar',
        benefit: 'watch 3D artifacts synthesize in real time',
        criteria: ['Zero transcription drop', 'Deterministic routing', '< 200ms processing']
      },
      {
        id: 'US-102',
        role: 'Engineering Lead',
        action: 'convert brainstorming sessions into roadmaps',
        benefit: 'unblock sprint dependencies immediately',
        criteria: ['Structured markdown generation', 'Interactive critical path tracking']
      }
    ],
    milestones: [
      {
        id: 'm-1',
        name: 'Audio Ingestion Pipeline',
        phase: 'Idea',
        status: 'Complete',
        progress: 100,
        owner: 'Shruti Rai',
        deadline: 'Sprint Take 01'
      },
      {
        id: 'm-2',
        name: '3D Spatial Visualizers',
        phase: 'Prototype',
        status: 'Complete',
        progress: 100,
        owner: 'Aarav V.',
        deadline: 'Sprint Take 02'
      },
      {
        id: 'm-3',
        name: 'Voice-to-Code Sandbox',
        phase: 'MVP',
        status: 'Active',
        progress: 88,
        owner: 'Meera K.',
        deadline: 'Sprint Take 03'
      },
      {
        id: 'm-4',
        name: 'Latency SLA Verification',
        phase: 'Testing',
        status: 'Scheduled',
        progress: 60,
        owner: 'Dev P.',
        deadline: 'Sprint Take 04'
      },
      {
        id: 'm-5',
        name: 'Production Studio Release',
        phase: 'Launch',
        status: 'Scheduled',
        progress: 25,
        owner: 'Priya S.',
        deadline: 'Sprint Take 05'
      }
    ],
    checkpoints: [
      { id: 'cp-1', label: 'Wispr Flow dictation into focused command bar', checked: true },
      { id: 'cp-2', label: 'Intent detection & workspace routing', checked: true },
      { id: 'cp-3', label: '3D Cyber VIP Pass perspective tilt & flip', checked: true },
      { id: 'cp-4', label: 'Voice-to-Code sandbox execution', checked: true },
      { id: 'cp-5', label: 'Voice Maze Runner labyrinth navigation', checked: true },
      { id: 'cp-6', label: 'Zero-API key deterministic offline execution', checked: true }
    ],
    markdownContent
  };
}
