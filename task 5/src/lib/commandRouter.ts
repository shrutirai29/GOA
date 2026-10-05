import { IntentType, WorkspaceType, BuildItem } from '../types';

export interface CommandParseResult {
  intent: IntentType;
  intentLabel: string;
  resultTitle: string;
  targetWorkspace: WorkspaceType;
  targetBuildItem: BuildItem;
  meta?: {
    theme?: 'light' | 'dark';
    frequency?: number;
    colorway?: string;
    mazeDirection?: 'up' | 'down' | 'left' | 'right';
    mindmapTopic?: string;
  };
}

export function parseCommand(rawText: string, currentWorkspace?: WorkspaceType): CommandParseResult {
  const text = rawText.toLowerCase().trim();

  // 1. Maze direction sub-commands if in play workspace
  if (currentWorkspace === 'play') {
    if (text.includes('up') || text === 'w' || text.includes('top')) {
      return {
        intent: 'MAZE',
        intentLabel: 'Maze Navigation',
        resultTitle: 'Move Up',
        targetWorkspace: 'play',
        targetBuildItem: 'none',
        meta: { mazeDirection: 'up' }
      };
    }
    if (text.includes('down') || text === 's' || text.includes('bottom')) {
      return {
        intent: 'MAZE',
        intentLabel: 'Maze Navigation',
        resultTitle: 'Move Down',
        targetWorkspace: 'play',
        targetBuildItem: 'none',
        meta: { mazeDirection: 'down' }
      };
    }
    if (text.includes('left') || text === 'a') {
      return {
        intent: 'MAZE',
        intentLabel: 'Maze Navigation',
        resultTitle: 'Move Left',
        targetWorkspace: 'play',
        targetBuildItem: 'none',
        meta: { mazeDirection: 'left' }
      };
    }
    if (text.includes('right') || text === 'd') {
      return {
        intent: 'MAZE',
        intentLabel: 'Maze Navigation',
        resultTitle: 'Move Right',
        targetWorkspace: 'play',
        targetBuildItem: 'none',
        meta: { mazeDirection: 'right' }
      };
    }
  }

  // 2. Theme Toggle
  if (text.includes('dark mode') || text.includes('dark theme') || text.includes('make it dark') || text.includes('turn off the lights') || text.includes('night mode')) {
    return {
      intent: 'THEME',
      intentLabel: 'Interface Theme',
      resultTitle: 'Switch to Dark Mode',
      targetWorkspace: currentWorkspace || 'build',
      targetBuildItem: 'none',
      meta: { theme: 'dark' }
    };
  }
  if (text.includes('light mode') || text.includes('light theme') || text.includes('make it bright') || text.includes('turn on the lights') || text.includes('day mode')) {
    return {
      intent: 'THEME',
      intentLabel: 'Interface Theme',
      resultTitle: 'Switch to Light Mode',
      targetWorkspace: currentWorkspace || 'build',
      targetBuildItem: 'none',
      meta: { theme: 'light' }
    };
  }

  // 3. Read aloud
  if (text.includes('read aloud') || text.includes('read this') || text.includes('speak this') || text.includes('say aloud') || text.includes('voice readout')) {
    return {
      intent: 'READ_ALOUD',
      intentLabel: 'Speech Synthesis',
      resultTitle: 'Voice Readout Activated',
      targetWorkspace: currentWorkspace || 'build',
      targetBuildItem: 'none'
    };
  }

  // 4. Holographic AI Orb
  if (
    text.includes('orb') ||
    text.includes('holographic orb') ||
    text.includes('plasma') ||
    text.includes('gyro') ||
    text.includes('sphere') ||
    text.includes('crystal ball') ||
    text.includes('glowing ball') ||
    text.includes('frequency') ||
    text.includes('resonance')
  ) {
    // Extract frequency if stated, e.g. "660 hertz" or "440 hz"
    const freqMatch = text.match(/(\d{3})\s*(hz|hertz)?/);
    const frequency = freqMatch ? parseInt(freqMatch[1], 10) : 440;

    return {
      intent: 'AI_ORB',
      intentLabel: '3D Spatial Experience',
      resultTitle: 'Holographic AI Orb',
      targetWorkspace: 'build',
      targetBuildItem: 'orb',
      meta: { frequency }
    };
  }

  // 5. 3D Cyber VIP Pass
  if (
    text.includes('vip') ||
    text.includes('pass') ||
    text.includes('card') ||
    text.includes('badge') ||
    text.includes('keycard') ||
    text.includes('ticket') ||
    text.includes('3d model') ||
    text.includes('show 3d') ||
    text.includes('something in 3d') ||
    text.includes('access card')
  ) {
    return {
      intent: 'UI_VIP_PASS',
      intentLabel: '3D UI Generation',
      resultTitle: '3D Cyber VIP Pass',
      targetWorkspace: 'build',
      targetBuildItem: 'vip_pass'
    };
  }

  // 6. PRD & Roadmap
  if (
    text.includes('prd') ||
    text.includes('product requirements') ||
    text.includes('roadmap') ||
    text.includes('user stories') ||
    text.includes('sprint plan') ||
    text.includes('milestone') ||
    text.includes('startup') ||
    text.includes('plan my product') ||
    text.includes('plan project') ||
    (text.includes('plan') && !text.includes('playground'))
  ) {
    return {
      intent: 'CREATE_PRD',
      intentLabel: 'PRD & Architecture',
      resultTitle: '3D Spatial Roadmap & PRD',
      targetWorkspace: 'plan',
      targetBuildItem: 'none'
    };
  }

  // 8. Voice-to-Code
  if (
    text.includes('code') ||
    text.includes('cache') ||
    text.includes('lru') ||
    text.includes('javascript') ||
    text.includes('python') ||
    text.includes('typescript') ||
    text.includes('sql') ||
    text.includes('algorithm') ||
    text.includes('function') ||
    text.includes('script')
  ) {
    return {
      intent: 'GENERATE_CODE',
      intentLabel: 'Voice-to-Code Compiler',
      resultTitle: 'Voice-to-Code Playground',
      targetWorkspace: 'code',
      targetBuildItem: 'none'
    };
  }

  // 9. MindMap
  if (
    text.includes('mindmap') ||
    text.includes('mind map') ||
    text.includes('idea') ||
    text.includes('branch') ||
    text.includes('node graph') ||
    text.includes('brainstorm') ||
    text.includes('think')
  ) {
    // Extract topic if user says "Add authentication to the mindmap" or "Add a security branch"
    let mindmapTopic = '';
    const addMatch = text.match(/add\s+(a\s+)?(branch\s+for\s+|branch\s+|idea\s+for\s+|idea\s+|node\s+)?([a-z0-9\s]+?)(\s+to\s+the\s+mindmap|\s+branch|\s+under|\s+node|$)/i);
    if (addMatch && addMatch[3]) {
      mindmapTopic = addMatch[3].trim();
    }

    return {
      intent: 'MINDMAP',
      intentLabel: 'Concept Graph',
      resultTitle: 'Voice MindMap Canvas',
      targetWorkspace: 'think',
      targetBuildItem: 'none',
      meta: { mindmapTopic }
    };
  }

  // 10. Maze Game
  if (
    text.includes('maze') ||
    text.includes('game') ||
    text.includes('play') ||
    text.includes('quest') ||
    text.includes('labyrinth') ||
    text.includes('start the maze')
  ) {
    return {
      intent: 'MAZE',
      intentLabel: 'Voice Game Engine',
      resultTitle: 'Voice Maze Runner',
      targetWorkspace: 'play',
      targetBuildItem: 'none'
    };
  }

  // 11. Navigation
  if (text.includes('open build') || text.includes('go to build')) {
    return {
      intent: 'NAVIGATE',
      intentLabel: 'Navigation',
      resultTitle: 'Switched to Build',
      targetWorkspace: 'build',
      targetBuildItem: 'none'
    };
  }
  if (text.includes('open plan') || text.includes('go to plan')) {
    return {
      intent: 'NAVIGATE',
      intentLabel: 'Navigation',
      resultTitle: 'Switched to Plan',
      targetWorkspace: 'plan',
      targetBuildItem: 'none'
    };
  }
  if (text.includes('open code') || text.includes('go to code')) {
    return {
      intent: 'NAVIGATE',
      intentLabel: 'Navigation',
      resultTitle: 'Switched to Code',
      targetWorkspace: 'code',
      targetBuildItem: 'none'
    };
  }
  if (text.includes('open think') || text.includes('go to think')) {
    return {
      intent: 'NAVIGATE',
      intentLabel: 'Navigation',
      resultTitle: 'Switched to Think',
      targetWorkspace: 'think',
      targetBuildItem: 'none'
    };
  }
  if (text.includes('open play') || text.includes('go to play')) {
    return {
      intent: 'NAVIGATE',
      intentLabel: 'Navigation',
      resultTitle: 'Switched to Play',
      targetWorkspace: 'play',
      targetBuildItem: 'none'
    };
  }

  // Fallback / Unknown intent
  return {
    intent: 'UNKNOWN',
    intentLabel: 'Natural Query',
    resultTitle: 'Custom Voice Prompt',
    targetWorkspace: currentWorkspace || 'build',
    targetBuildItem: 'vip_pass'
  };
}
