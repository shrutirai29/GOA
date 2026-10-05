export interface PresetItem {
  id: string;
  label: string;
  command: string;
  iconName: string;
}

export const PRESETS: PresetItem[] = [
  {
    id: 'preset-vip',
    label: '3D Cyber VIP Pass',
    command: 'Create a 3D cyber VIP pass with holographic effects',
    iconName: 'Sparkles'
  },
  {
    id: 'preset-orb',
    label: 'Holographic AI Orb',
    command: 'Create a holographic AI orb with 440 hertz resonance',
    iconName: 'Rotate3D'
  },
  {
    id: 'preset-prd',
    label: 'Create a PRD',
    command: 'Create a PRD for a voice-controlled cybersecurity dashboard',
    iconName: 'FileText'
  },
  {
    id: 'preset-code',
    label: 'Write & Run Code',
    command: 'Create an LRU cache in JavaScript with capacity 5',
    iconName: 'Code2'
  },
  {
    id: 'preset-mindmap',
    label: 'Add MindMap Node',
    command: 'Add a Security branch with authentication to the mindmap',
    iconName: 'Brain'
  },
  {
    id: 'preset-maze',
    label: 'Start Maze Game',
    command: 'Start the maze and guide the player to the portal',
    iconName: 'Gamepad2'
  }
];

export const ROTATING_SUGGESTIONS = [
  'Create a 3D cyber VIP pass',
  'Generate a PRD for a security product',
  'Create an LRU cache in JavaScript',
  'Add an authentication branch to the mindmap',
  'Start the maze',
  'Set the orb frequency to 660 hertz',
  'Make the VIP card use vintage teal'
];
