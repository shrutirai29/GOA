export type WorkspaceType = 'build' | 'plan' | 'code' | 'think' | 'play';

export type BuildItem = 'none' | 'vip_pass' | 'orb' | 'custom';

export type IntentType =
  | 'UI_VIP_PASS'
  | 'AI_ORB'
  | 'CUSTOM_3D'
  | 'CREATE_PRD'
  | 'GENERATE_CODE'
  | 'MINDMAP'
  | 'MAZE'
  | 'NAVIGATE'
  | 'THEME'
  | 'READ_ALOUD'
  | 'RESET'
  | 'UNKNOWN';

export interface Generated3DExperience {
  id: string;
  userPrompt: string;
  title: string;
  category: string;
  subtitle: string;
  objectType: 'watch' | 'sword' | 'drone' | 'bottle' | 'flower' | 'trophy' | 'ring' | 'helmet' | 'tech' | 'abstract';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
  metalness: number;
  roughness: number;
  glass: boolean;
  wireframe: boolean;
  specs: string[];
  colorways: Array<{ name: string; primary: string; secondary: string; accent: string; glow: string }>;
}

export interface VoiceActivityItem {
  id: string;
  timestamp: string;
  rawText: string;
  intent: IntentType;
  intentLabel: string;
  resultTitle: string;
  status: 'received' | 'processing' | 'done';
}

export type ProcessingStep = 'idle' | 'received' | 'understanding' | 'building' | 'ready';

export interface ToastItem {
  id: string;
  text: string;
  type?: 'info' | 'success' | 'warning';
}

// PRD types
export interface Milestone {
  id: string;
  name: string;
  phase: 'Idea' | 'Prototype' | 'MVP' | 'Testing' | 'Launch';
  status: 'Complete' | 'Active' | 'Scheduled';
  progress: number;
  owner: string;
  deadline: string;
}

export interface Checkpoint {
  id: string;
  label: string;
  checked: boolean;
}

export interface PRDData {
  title: string;
  overview: string;
  problem: string;
  goals: string[];
  targetUsers: string[];
  userStories: Array<{ id: string; role: string; action: string; benefit: string; criteria: string[] }>;
  milestones: Milestone[];
  checkpoints: Checkpoint[];
  markdownContent: string;
}

// Code types
export type CodeLanguage = 'javascript' | 'python' | 'typescript' | 'sql';

export interface CodeData {
  language: CodeLanguage;
  code: string;
  description: string;
}

// Mindmap types
export interface MindMapNodeItem {
  id: string;
  label: string;
  x: number;
  y: number;
  category: string;
  color: string;
  parentId?: string;
}

// Maze types
export interface MazePosition {
  x: number;
  y: number;
}

export interface CrystalItem {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

export interface MazeState {
  player: MazePosition;
  portal: MazePosition;
  score: number;
  moves: number;
  crystals: CrystalItem[];
  isWon: boolean;
  grid: number[][]; // 0 = path, 1 = wall
}
