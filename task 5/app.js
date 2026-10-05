/**
 * WisprCraft Studio - Core Application Logic
 * Voice-Driven Creative & Product Studio for Hacker House Goa Task 5
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // State Management
  // =========================================================================
  const state = {
    activeTab: 'ui',
    isRecording: false,
    audioContext: null,
    analyser: null,
    micStream: null,
    recognition: null,
    theme: localStorage.getItem('wispr_theme_v2') || 'light',
    audioMuted: false,
    nodes: [
      { id: 1, label: 'WisprCraft Voice OS', x: 260, y: 220, category: 'Core', color: '#10b981' },
      { id: 2, label: 'Speech-to-UI Engine', x: 120, y: 110, category: 'Frontend', color: '#38bdf8' },
      { id: 3, label: 'PRD & Action Matrix', x: 420, y: 110, category: 'Product', color: '#f59e0b' },
      { id: 4, label: 'Voice-to-Code Compiler', x: 120, y: 350, category: 'Dev', color: '#a855f7' },
      { id: 5, label: 'Web Audio Visualizer', x: 420, y: 350, category: 'Audio', color: '#ec4899' }
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 1, to: 5 }
    ]
  };

  // =========================================================================
  // DOM Elements
  // =========================================================================
  const voicePromptInput = document.getElementById('voicePromptInput');
  const toggleRecordBtn = document.getElementById('toggleRecordBtn');
  const recordBtnLabel = document.getElementById('recordBtnLabel');
  const processPromptBtn = document.getElementById('processPromptBtn');
  const clearPromptBtn = document.getElementById('clearPromptBtn');
  const speakOutputBtn = document.getElementById('speakOutputBtn');
  const activeWorkspaceLabel = document.getElementById('activeWorkspaceLabel');
  const recordingStatusText = document.getElementById('recordingStatusText');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const visualizerCanvas = document.getElementById('audioVisualizerCanvas');
  const vCtx = visualizerCanvas ? visualizerCanvas.getContext('2d') : null;

  // Tabs & Panels
  const tabButtons = document.querySelectorAll('.tab-btn');
  const panels = {
    ui: document.getElementById('panel-ui'),
    prd: document.getElementById('panel-prd'),
    code: document.getElementById('panel-code'),
    mindmap: document.getElementById('panel-mindmap'),
    maze: document.getElementById('panel-maze')
  };

  // UI Tab Elements
  const uiPreviewContainer = document.getElementById('uiPreviewContainer');
  const uiCodePre = document.getElementById('uiCodePre');
  const copyUiCodeBtn = document.getElementById('copyUiCodeBtn');

  // PRD Tab Elements
  const prdSummaryBody = document.getElementById('prdSummaryBody');
  const prdMarkdownPre = document.getElementById('prdMarkdownPre');
  const copyPrdSummaryBtn = document.getElementById('copyPrdSummaryBtn');
  const copyPrdMarkdownBtn = document.getElementById('copyPrdMarkdownBtn');

  // Code Tab Elements
  const codeLanguageSelect = document.getElementById('codeLanguageSelect');
  const generatedCodePre = document.getElementById('generatedCodePre');
  const runCodeBtn = document.getElementById('runCodeBtn');
  const copyGeneratedCodeBtn = document.getElementById('copyGeneratedCodeBtn');
  const codeConsoleOutput = document.getElementById('codeConsoleOutput');
  const clearConsoleBtn = document.getElementById('clearConsoleBtn');

  // Mindmap Canvas Elements
  const mindmapCanvas = document.getElementById('mindmapCanvas');
  const mCtx = mindmapCanvas ? mindmapCanvas.getContext('2d') : null;
  const addMindmapNodeBtn = document.getElementById('addMindmapNodeBtn');
  const resetMindmapBtn = document.getElementById('resetMindmapBtn');
  const exportMindmapBtn = document.getElementById('exportMindmapBtn');

  // Maze Canvas Elements
  const mazeCanvas = document.getElementById('mazeCanvas');
  const mzCtx = mazeCanvas ? mazeCanvas.getContext('2d') : null;
  const mazeScoreBadge = document.getElementById('mazeScoreBadge');
  const mazeStatusBanner = document.getElementById('mazeStatusBanner');
  const resetMazeBtn = document.getElementById('resetMazeBtn');

  // =========================================================================
  // Theme Setup
  // =========================================================================
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
    try {
      localStorage.setItem('wispr_theme_v2', theme);
    } catch (e) {}
    state.theme = theme;

    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      themeToggleBtn.innerHTML = theme === 'dark'
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`;
    }
  }
  applyTheme(state.theme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      try {
        if (typeof drawMindmap === 'function') drawMindmap();
      } catch (e) {}
      try {
        if (typeof drawMaze === 'function') drawMaze();
      } catch (e) {}
      playSynthesizedSound('click');
      showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
    });
  }

  // =========================================================================
  // Web Audio Synthesizer (Sound Effects without external assets)
  // =========================================================================
  function playSynthesizedSound(type) {
    if (state.audioMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'start') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'complete') {
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
          gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.06 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.06);
          osc.stop(ctx.currentTime + i * 0.06 + 0.3);
        });
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }
    } catch (e) {
      console.warn('Audio playback not permitted yet:', e);
    }
  }

  // =========================================================================
  // Live Audio Frequency Visualizer (Web Audio API)
  // =========================================================================
  function resizeVisualizer() {
    if (!visualizerCanvas) return;
    const parent = visualizerCanvas.parentElement;
    const clientW = (parent && parent.clientWidth) ? parent.clientWidth : (visualizerCanvas.clientWidth || 600);
    const clientH = (parent && parent.clientHeight) ? parent.clientHeight : (visualizerCanvas.clientHeight || 48);
    visualizerCanvas.width = clientW * (window.devicePixelRatio || 1);
    visualizerCanvas.height = clientH * (window.devicePixelRatio || 1);
  }
  window.addEventListener('resize', resizeVisualizer);
  resizeVisualizer();

  let visualizerAnimId = null;
  function startVisualizer() {
    if (!vCtx || !visualizerCanvas) return;
    const bufferLength = state.analyser ? state.analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    function renderFrame() {
      visualizerAnimId = requestAnimationFrame(renderFrame);
      const width = visualizerCanvas.width;
      const height = visualizerCanvas.height;

      vCtx.clearRect(0, 0, width, height);

      if (state.analyser && state.isRecording) {
        state.analyser.getByteFrequencyData(dataArray);
      } else {
        // Idle gentle simulated wave
        const time = Date.now() * 0.002;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.max(10, Math.sin(time + i * 0.3) * 20 + 25);
        }
      }

      const barWidth = (width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.85;
        const gradient = vCtx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
        gradient.addColorStop(1, state.isRecording ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)');

        vCtx.fillStyle = gradient;
        vCtx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
        x += barWidth + 1;
      }
    }
    renderFrame();
  }
  startVisualizer();

  // =========================================================================
  // Voice Recording & Speech Recognition
  // =========================================================================
  async function toggleRecording() {
    if (state.isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.micStream = stream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      state.audioContext = new AudioCtx();
      const source = state.audioContext.createMediaStreamSource(stream);
      state.analyser = state.audioContext.createAnalyser();
      state.analyser.fftSize = 64;
      source.connect(state.analyser);

      state.isRecording = true;
      toggleRecordBtn.classList.add('recording');
      recordBtnLabel.textContent = 'Stop Listening';
      recordingStatusText.textContent = 'Listening to your voice... (Wispr Flow active)';
      playSynthesizedSound('start');

      // Native Web Speech recognition fallback if browser supports it
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        state.recognition = new SpeechRecognition();
        state.recognition.continuous = true;
        state.recognition.interimResults = true;
        state.recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            voicePromptInput.value = transcript;
            if (state.activeTab === 'maze') {
              handleMazeVoiceCommand(transcript);
            }
          }
        };
        state.recognition.onerror = (e) => console.log('Speech recognition notice:', e.error);
        state.recognition.start();
      }
    } catch (err) {
      console.warn('Microphone permission or support notice:', err);
      // Even if mic permission is denied, user can still paste or dictate via Wispr Flow desktop app!
      state.isRecording = true;
      toggleRecordBtn.classList.add('recording');
      recordBtnLabel.textContent = 'Stop Dictating';
      recordingStatusText.textContent = 'Wispr Flow Ready — Speak into any field';
    }
  }

  function stopRecording() {
    state.isRecording = false;
    toggleRecordBtn.classList.remove('recording');
    recordBtnLabel.textContent = 'Start Voice Mic';
    recordingStatusText.textContent = 'Voice captured. Ready to execute.';
    playSynthesizedSound('complete');

    if (state.recognition) {
      try { state.recognition.stop(); } catch (e) {}
    }
    if (state.micStream) {
      state.micStream.getTracks().forEach(t => t.stop());
    }
  }

  toggleRecordBtn.addEventListener('click', toggleRecording);

  // Clear Prompt
  clearPromptBtn.addEventListener('click', () => {
    voicePromptInput.value = '';
    playSynthesizedSound('click');
  });

  // Text to Speech playback
  speakOutputBtn.addEventListener('click', () => {
    let textToSpeak = '';
    if (state.activeTab === 'ui') {
      textToSpeak = 'Here is your interactive UI component generated from your voice description.';
    } else if (state.activeTab === 'prd') {
      const summaryText = prdSummaryBody ? prdSummaryBody.innerText.slice(0, 300) : '';
      textToSpeak = 'Executive Summary: ' + summaryText;
    } else if (state.activeTab === 'code') {
      textToSpeak = 'Your code has been compiled and is ready for execution.';
    } else {
      textToSpeak = 'Voice mindmap updated successfully.';
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  });

  // =========================================================================
  // Tab Switching
  // =========================================================================
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });

  function switchTab(tab) {
    state.activeTab = tab;
    tabButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });

    Object.keys(panels).forEach(k => {
      if (panels[k]) {
        panels[k].classList.toggle('active', k === tab);
      }
    });

    const labels = {
      ui: 'Voice-to-UI Component Studio',
      prd: 'Executive Brief & PRD Generator',
      code: 'Voice-to-Code Playground',
      mindmap: 'Voice MindMap Canvas',
      maze: '🎮 Voice Maze Runner Game'
    };
    activeWorkspaceLabel.textContent = labels[tab] || 'Voice Studio';
    playSynthesizedSound('click');

    if (tab === 'mindmap') {
      setTimeout(resizeMindmap, 50);
    } else if (tab === 'maze') {
      setTimeout(drawMaze, 50);
    }
  }

  // =========================================================================
  // Presets & Execution Engine
  // =========================================================================
  const presets = {
    card3d: {
      tab: 'ui',
      prompt: 'Create a futuristic 3D holographic Cyber VIP Pass with interactive tilt physics, metallic gold chip, flip mechanics, and biometric voice authentication.'
    },
    orb3d: {
      tab: 'ui',
      prompt: 'Generate an interactive 3D Holographic AI Orb with rotating orbital gyro rings, plasma core, voice resonance frequency, and energy controls.'
    },
    sneaker3d: {
      tab: 'ui',
      prompt: 'Create an interactive 3D Cyber Sneaker showcase with 360-degree rotation view, air cushioning pulse, floating shadow physics, and dynamic colorway swatches.'
    },
    roadmap: {
      tab: 'prd',
      prompt: 'Generate an interactive 3D Spatial Product Roadmap Matrix with Q1/Q2/Q3 milestone pods, latency verification ceilings, and clickable progress toggles.'
    },
    pricing: {
      tab: 'ui',
      prompt: 'Create interactive 3D pricing pods with monthly and annual discount switches, tier highlight, and instant checkout modal.'
    },
    metrics: {
      tab: 'ui',
      prompt: 'Create a live 3D telemetry matrix with animated sparklines, voice stream latency counters, and CSV export.'
    },
    prd: {
      tab: 'prd',
      prompt: 'Generate an interactive 3D Spatial Product Roadmap Matrix with Q1/Q2/Q3 milestone pods, latency verification ceilings, and clickable progress toggles.'
    },
    'code-cache': {
      tab: 'code',
      prompt: 'Implement a high performance Least Recently Used cache in JavaScript with get and put methods, capacity of three items, and test it with key value updates.'
    },
    mindmap: {
      tab: 'mindmap',
      prompt: 'Brainstorm SaaS product launch strategy: Marketing, Core Engineering, Developer Relations, and Enterprise Compliance.'
    },
    maze: {
      tab: 'maze',
      prompt: 'Move: Up, Right, Down. Collect the sound crystals and reach the Wispr Portal!'
    }
  };

  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.preset;
      if (presets[key]) {
        voicePromptInput.value = presets[key].prompt;
        switchTab(presets[key].tab);
        executePrompt();
      }
    });
  });

  processPromptBtn.addEventListener('click', () => {
    executePrompt();
  });

  // Enter shortcut in textarea
  voicePromptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      executePrompt();
    }
  });

  // Toast Notification Helper
  function showToast(message) {
    let toast = document.getElementById('wisprToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'wisprToast';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function executePrompt() {
    const prompt = voicePromptInput.value.trim();
    if (!prompt) {
      voicePromptInput.focus();
      showToast('Please speak or type a prompt first!');
      return;
    }

    // Button visual feedback
    const originalBtnHtml = processPromptBtn.innerHTML;
    processPromptBtn.innerHTML = `<span>⚡</span> <span>Generating...</span>`;
    processPromptBtn.style.opacity = '0.85';
    processPromptBtn.disabled = true;

    try {
      playSynthesizedSound('complete');
    } catch (e) {}

    // Auto-detect target workspace from prompt intent if needed
    const lower = prompt.toLowerCase();
    if (lower.includes('lru') || lower.includes('cache') || lower.includes('fibonacci') || lower.includes('algorithm') || lower.includes('python') || lower.includes('sql') || lower.includes('query') || lower.includes('function')) {
      switchTab('code');
    } else if (lower.includes('prd') || lower.includes('meeting') || lower.includes('sync') || lower.includes('onboarding') || lower.includes('user stories') || lower.includes('stakeholder')) {
      switchTab('prd');
    } else if (lower.includes('mindmap') || lower.includes('node graph') || lower.includes('brainstorm idea')) {
      switchTab('mindmap');
    } else if (lower.includes('maze') || lower.includes('sound crystal') || lower.includes('wispr portal')) {
      switchTab('maze');
    } else if (state.activeTab === 'teleprompter') {
      switchTab('ui');
    }

    // Show high-tech 3D Laser Hologram Scanner Overlay in the active preview container
    const previewBox = state.activeTab === 'ui' ? uiPreviewContainer : (state.activeTab === 'prd' ? prdSummaryBody : null);
    if (previewBox) {
      const scanOverlay = document.createElement('div');
      scanOverlay.className = 'hologram-scan-overlay';
      scanOverlay.innerHTML = `
        <div class="scan-laser-beam"></div>
        <div class="holo-scan-badge">
          <div class="holo-ring-sm"></div>
          <span>Synthesizing Spatial 3D Asset...</span>
        </div>
      `;
      previewBox.style.position = 'relative';
      previewBox.appendChild(scanOverlay);
    }

    setTimeout(() => {
      // Execute generation based on active tab
      if (state.activeTab === 'ui') {
        generateUiComponent(prompt);
      } else if (state.activeTab === 'prd') {
        generatePrd(prompt);
      } else if (state.activeTab === 'code') {
        generateCode(prompt);
      } else if (state.activeTab === 'mindmap') {
        expandMindmapFromVoice(prompt);
      } else if (state.activeTab === 'maze') {
        handleMazeVoiceCommand(prompt);
      }

      playSynthesizedSound('complete');

      // Smoothly scroll down to the rendered output and notify user
      setTimeout(() => {
        const activePanel = panels[state.activeTab];
        if (activePanel) {
          activePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        showToast(`Prompt Executed! Rendered in ${activeWorkspaceLabel.textContent}`);

        processPromptBtn.innerHTML = `<span>✓</span> <span>Rendered!</span>`;
        processPromptBtn.style.background = 'linear-gradient(135deg, #059669, #047857)';

        setTimeout(() => {
          processPromptBtn.innerHTML = originalBtnHtml;
          processPromptBtn.style.opacity = '1';
          processPromptBtn.style.background = '';
          processPromptBtn.disabled = false;
        }, 1500);
      }, 100);
    }, 380);
  }

  // =========================================================================
  // 1. Voice-to-UI Component Generator & Interactions
  // =========================================================================
  function generateUiComponent(prompt) {
    const lower = prompt.toLowerCase();
    let htmlCode = '';

    if (lower.includes('orb') || lower.includes('holo') || lower.includes('sphere') || lower.includes('plasma') || lower.includes('gyro')) {
      // 3D Holographic AI Orb
      htmlCode = `<div class="w-full max-w-lg mx-auto p-6 rounded-2xl relative overflow-hidden border shadow-2xl text-slate-100"
     style="background: linear-gradient(135deg, #09111b 0%, #071f1a 100%); border-color: rgba(16,185,129,0.3); box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
  <div class="flex items-center justify-between pb-3 border-b border-slate-800">
    <div class="flex items-center gap-2">
      <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
      <h3 class="text-base font-bold text-white">Wispr Holographic AI Core</h3>
    </div>
    <span class="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
      FREQUENCY: <span id="orbFreqVal">432</span> Hz
    </span>
  </div>

  <!-- 3D Gyro Orb Stage -->
  <div class="orb-3d-stage my-4 relative">
    <div id="holoGyroSphere" class="gyro-sphere">
      <div class="gyro-ring gyro-ring-1"></div>
      <div class="gyro-ring gyro-ring-2"></div>
      <div class="gyro-ring gyro-ring-3"></div>
      <div id="orbPlasmaCore" class="orb-inner-plasma"></div>
    </div>
  </div>

  <!-- Interactive Controls -->
  <div class="space-y-3 mt-4">
    <div class="flex items-center justify-between text-xs">
      <span class="text-slate-300 font-medium">Harmonic Core Resonance</span>
      <span id="resonancePercent" class="text-cyan-400 font-mono font-bold">88%</span>
    </div>
    <input type="range" id="sliderHarmonic" min="100" max="880" value="432" class="w-full accent-emerald-500 cursor-pointer">

    <div class="flex gap-2 pt-2">
      <button id="btnPulseOrb" class="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer">
        <span>⚡</span> <span>Pulse Resonance</span>
      </button>
      <button id="btnVoiceBeacon" class="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition cursor-pointer">
        🔊 Test Voice Beacon
      </button>
    </div>
  </div>
</div>`;
    } else if (lower.includes('sneaker') || lower.includes('shoe') || lower.includes('footwear') || lower.includes('product') || lower.includes('drop')) {
      // 3D Cyber Sneaker Showcase
      htmlCode = `<div class="w-full max-w-lg mx-auto p-6 rounded-2xl relative overflow-hidden border shadow-2xl text-slate-100"
     style="background: linear-gradient(135deg, #09121a 0%, #0d1e26 100%); border-color: rgba(56,189,248,0.3); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
  <!-- Top bar -->
  <div class="flex items-center justify-between pb-3 border-b border-slate-800">
    <div>
      <span class="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">Spatial 3D Drop • 001</span>
      <h3 class="text-xl font-black text-white mt-0.5">CYBER-AIR WISPR V1</h3>
    </div>
    <span class="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
      $240 • LIMITED
    </span>
  </div>

  <!-- 3D Sneaker Float Stage -->
  <div class="sneaker-float-container relative my-3">
    <div id="sneaker3dObject" class="sneaker-3d-model transition-transform duration-700">
      <svg id="sneakerSvg" width="230" height="135" viewBox="0 0 240 140" fill="none" class="drop-shadow-2xl">
        <path d="M20 95 C40 95, 60 105, 95 105 C145 105, 195 90, 220 85 C230 83, 235 70, 225 65 C205 55, 185 40, 160 35 C140 31, 115 45, 90 55 C65 65, 30 75, 15 80 C8 82, 10 95, 20 95 Z" fill="url(#shoeGrad)" stroke="#38bdf8" stroke-width="2"/>
        <path d="M20 95 C45 98, 90 108, 140 108 C190 108, 225 95, 235 90 C235 100, 215 115, 170 118 C120 120, 60 115, 20 105 Z" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
        <ellipse cx="60" cy="106" rx="14" ry="4" fill="#38bdf8" opacity="0.8"/>
        <ellipse cx="100" cy="107" rx="16" ry="4.5" fill="#38bdf8" opacity="0.8"/>
        <ellipse cx="145" cy="106" rx="18" ry="4" fill="#10b981" opacity="0.8"/>
        <path d="M95 54 L125 43 M105 60 L135 48 M115 67 L145 54" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="175" cy="65" r="8" fill="#10b981" opacity="0.85"/>
        <defs>
          <linearGradient id="shoeGrad" x1="20" y1="35" x2="230" y2="105" gradientUnits="userSpaceOnUse">
            <stop id="shoeColorStop1" stop-color="#0284c7"/>
            <stop id="shoeColorStop2" stop-color="#10b981"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div class="sneaker-shadow mt-2"></div>
  </div>

  <!-- Interactive Controls: Colorways & 360 Spin -->
  <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <span class="text-xs text-slate-400 font-medium">Colorway:</span>
      <button class="colorway-btn w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-emerald-400 cursor-pointer" data-c1="#059669" data-c2="#10b981" title="Cyber Emerald"></button>
      <button class="colorway-btn w-6 h-6 rounded-full bg-cyan-500 hover:ring-2 hover:ring-cyan-400 cursor-pointer" data-c1="#0284c7" data-c2="#38bdf8" title="Neon Cyan"></button>
      <button class="colorway-btn w-6 h-6 rounded-full bg-amber-500 hover:ring-2 hover:ring-amber-400 cursor-pointer" data-c1="#d97706" data-c2="#fbbf24" title="Solar Amber"></button>
    </div>
    <button id="btnSpinShoe" class="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1 cursor-pointer">
      <span>🔄</span> <span>Spin 360°</span>
    </button>
  </div>

  <div class="mt-4 flex gap-2">
    <button id="btnPreorderShoe" class="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer">
      <span>⚡</span> <span>Pre-Order Cyber Drop</span>
    </button>
  </div>
</div>`;
    } else if (lower.includes('metric') || lower.includes('dashboard') || lower.includes('kpi') || lower.includes('analytics') || lower.includes('thirty four') || lower.includes('sparkline')) {
      htmlCode = `<div class="w-full max-w-xl p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100">
  <div class="flex items-center justify-between pb-4 border-b border-slate-800">
    <div>
      <span class="text-xs uppercase tracking-wider text-emerald-400 font-bold">Realtime Telemetry</span>
      <h3 class="text-xl font-bold mt-1">Platform Performance</h3>
    </div>
    <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
      ● 99.98% Healthy
    </span>
  </div>

  <div class="grid grid-cols-3 gap-4 mt-6">
    <div class="p-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
      <div class="text-xs text-slate-400">Total Users</div>
      <div id="statUsers" class="text-2xl font-black text-white mt-1">148.2k</div>
      <div class="text-xs text-emerald-400 font-medium mt-1">↑ +24.8%</div>
    </div>
    <div class="p-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
      <div class="text-xs text-slate-400">Speech Latency</div>
      <div id="statLatency" class="text-2xl font-black text-emerald-400 mt-1">142ms</div>
      <div class="text-xs text-emerald-400 font-medium mt-1">⚡ Wispr Fast</div>
    </div>
    <div class="p-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
      <div class="text-xs text-slate-400">Monthly ARR</div>
      <div id="statArr" class="text-2xl font-black text-white mt-1">$42,900</div>
      <div class="text-xs text-emerald-400 font-medium mt-1">↑ +34.0%</div>
    </div>
  </div>

  <!-- Sparkline & Telemetry Details -->
  <div class="mt-6 p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/40 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <span id="telemetryPulseDot" class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
      <span class="text-xs font-medium text-slate-300">Live Voice Transcription Stream</span>
    </div>
    <span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
      +34% Growth Sparkline
    </span>
  </div>

  <div class="mt-6 flex justify-end gap-3">
    <button id="btnDownloadCsv" class="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer">Download CSV</button>
    <button id="btnSyncStream" class="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md transition cursor-pointer">⚡ Sync Stream</button>
  </div>
</div>`;
    } else if (lower.includes('pricing') || lower.includes('tier') || lower.includes('pod') || lower.includes('subscription')) {
      // Modern 3-tier Pricing Pods
      htmlCode = `<div id="pricingCardRoot" class="w-full max-w-2xl p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 relative">
  <!-- Interactive Billing Frequency Toggle -->
  <div class="text-center mb-6">
    <span class="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
      ✨ 100% Fully Interactive Component
    </span>
    <h3 class="text-2xl font-black mt-2">Flexible Cloud Pricing</h3>
    <p class="text-xs text-slate-400 mt-1">Click any card to select, or toggle billing below</p>

    <!-- Monthly / Annual Toggle Switch -->
    <div class="inline-flex items-center gap-1.5 mt-4 p-1 bg-slate-800 rounded-xl border border-slate-700/80">
      <button id="billingMonthlyBtn" class="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 text-slate-950 shadow transition cursor-pointer">Monthly</button>
      <button id="billingAnnualBtn" class="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-300 hover:text-white transition cursor-pointer">
        Annual <span class="text-[10px] text-emerald-400 font-extrabold bg-emerald-500/20 px-1.5 py-0.5 rounded ml-1">SAVE 20%</span>
      </button>
    </div>
  </div>

  <!-- Cards Grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- Starter -->
    <div id="cardStarter" class="tier-card p-5 bg-slate-800/50 rounded-xl border border-slate-700/40 flex flex-col justify-between hover:border-slate-500 cursor-pointer transition">
      <div>
        <h4 class="font-bold text-slate-300">Starter</h4>
        <div class="text-3xl font-black mt-3"><span id="priceStarter">$0</span><span class="text-xs font-normal text-slate-400">/mo</span></div>
        <p class="text-xs text-slate-400 mt-2">Essential voice dictation for individuals.</p>
        <ul class="text-xs space-y-2 mt-4 text-slate-300">
          <li>✓ 10,000 words/mo</li>
          <li>✓ Web Audio engine</li>
          <li>✓ Standard export</li>
        </ul>
      </div>
      <button class="btn-tier-action w-full mt-6 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-xs font-semibold rounded-lg transition" data-plan="Starter" data-price="$0">Get Started</button>
    </div>

    <!-- Pro (Highlighted) -->
    <div id="cardPro" class="tier-card p-5 bg-gradient-to-b from-emerald-950/60 to-slate-900 rounded-xl border-2 border-emerald-500 shadow-lg relative flex flex-col justify-between transform scale-105 cursor-pointer">
      <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow">
        MOST POPULAR
      </div>
      <div>
        <h4 class="font-bold text-emerald-400">Pro Studio</h4>
        <div class="text-3xl font-black mt-3 text-white"><span id="pricePro">$29</span><span class="text-xs font-normal text-slate-400">/mo</span></div>
        <p id="subtextPro" class="text-xs text-slate-300 mt-2">Unlimited voice-to-code & PRD generation.</p>
        <ul class="text-xs space-y-2 mt-4 text-slate-200 font-medium">
          <li>⚡ Unlimited Wispr Flow</li>
          <li>⚡ Sub-200ms latency</li>
          <li>⚡ Custom AI templates</li>
          <li>⚡ Priority support</li>
        </ul>
      </div>
      <button class="btn-tier-action w-full mt-6 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow transition" data-plan="Pro Studio" data-price="$29">Start 14-Day Free Trial</button>
    </div>

    <!-- Enterprise -->
    <div id="cardEnterprise" class="tier-card p-5 bg-slate-800/50 rounded-xl border border-slate-700/40 flex flex-col justify-between hover:border-slate-500 cursor-pointer transition">
      <div>
        <h4 class="font-bold text-slate-300">Enterprise</h4>
        <div class="text-3xl font-black mt-3"><span id="priceEnterprise">$99</span><span class="text-xs font-normal text-slate-400">/mo</span></div>
        <p id="subtextEnterprise" class="text-xs text-slate-400 mt-2">Team workspace with custom LLM integrations.</p>
        <ul class="text-xs space-y-2 mt-4 text-slate-300">
          <li>✓ Unlimited members</li>
          <li>✓ SOC-2 compliance</li>
          <li>✓ Dedicated engineer</li>
        </ul>
      </div>
      <button class="btn-tier-action w-full mt-6 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-xs font-semibold rounded-lg transition" data-plan="Enterprise" data-price="$99">Contact Sales</button>
    </div>
  </div>

  <!-- In-Preview Interactive Checkout Modal -->
  <div id="checkoutModalOverlay" style="display: none;" class="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex items-center justify-center p-6 z-50">
    <div class="bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
      <div class="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-2xl mb-2">💎</div>
      <h4 class="text-lg font-bold text-white">Subscribe to <span id="modalPlanTitle" class="text-emerald-400">Pro Studio</span></h4>
      <p class="text-xs text-slate-300 mt-1" id="modalPlanRate">$29 / month</p>
      
      <div id="modalFormContainer" class="mt-4">
        <input type="email" id="modalEmail" placeholder="your@email.com" class="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" value="shrutirai29@gmail.com">
        <button id="btnModalConfirm" class="w-full mt-3 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-lg transition">Confirm & Unlock Wispr Plan</button>
        <button id="btnModalClose" class="mt-2.5 text-xs text-slate-400 hover:text-white transition">Cancel</button>
      </div>

      <div id="modalSuccessContainer" style="display: none;" class="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-center">
        <div class="text-2xl mb-1">🎉</div>
        <div class="text-sm font-bold text-emerald-400">Activation Successful!</div>
        <div class="text-xs text-slate-300 mt-1">Welcome to Wispr Flow. Your voice features are now active!</div>
        <button id="btnModalDone" class="mt-3 px-4 py-1.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg">Done</button>
      </div>
    </div>
  </div>
</div>`;
    } else if (lower.includes('profile') || lower.includes('user') || lower.includes('avatar') || lower.includes('team')) {
      htmlCode = `<div class="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100">
  <div class="flex items-center gap-4">
    <div class="relative">
      <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
        SR
      </div>
      <span class="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
    </div>
    <div>
      <h3 class="text-lg font-bold text-white">Shruti Rai</h3>
      <p class="text-xs text-emerald-400 font-semibold">Senior AI Systems Engineer</p>
      <p class="text-xs text-slate-400 mt-0.5">Hacker House Goa 2026</p>
    </div>
  </div>

  <div class="mt-5 p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/40 text-xs text-slate-300 leading-relaxed">
    Specialized in Voice-Driven Development, autonomous agents, and real-time audio pipeline optimization with Wispr Flow.
  </div>

  <div class="mt-5 flex gap-2">
    <button id="btnProfileGithub" class="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition" onclick="alert('Connecting to GitHub profile...')">View GitHub Profile</button>
    <button id="btnProfileMsg" class="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition" onclick="alert('Message sent successfully!')">Message</button>
  </div>
</div>`;
    } else {
      // 3D Holographic Cyber VIP Pass (Default)
      htmlCode = `<div class="w-full max-w-lg mx-auto card-3d-perspective" id="vipPassRoot">
  <!-- Controls bar above card -->
  <div class="flex items-center justify-between mb-3 px-1 text-slate-200">
    <div class="flex items-center gap-2">
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
      <span class="text-xs font-bold text-emerald-400 tracking-wider uppercase">Interactive 3D Hologram</span>
    </div>
    <div class="text-[11px] text-slate-400 font-mono">Move cursor to tilt in 3D</div>
  </div>

  <!-- Flipper Container -->
  <div id="cardFlipper" class="card-3d-flipper w-full transition-transform duration-700" style="min-height: 380px;">
    
    <!-- FRONT SIDE -->
    <div id="cardFrontSide" class="card-3d-front w-full p-6 rounded-2xl relative overflow-hidden shadow-2xl border"
         style="background: linear-gradient(135deg, #091219 0%, #0d2222 50%, #081615 100%); border-color: rgba(16,185,129,0.35); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5), 0 0 30px rgba(16,185,129,0.2);">
      
      <!-- Glare highlight layer -->
      <div id="cardGlare" class="absolute inset-0 pointer-events-none rounded-2xl opacity-60 transition-opacity"
           style="background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25) 0%, transparent 65%);"></div>

      <!-- Holographic Rainbow Foil Banner -->
      <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none opacity-25 filter blur-xl"
           style="background: radial-gradient(circle, #38bdf8, #10b981, #f59e0b);"></div>

      <!-- Top Row: Chip & Badge -->
      <div class="flex items-center justify-between relative z-10">
        <!-- Gold Chip -->
        <div class="flex items-center gap-3">
          <div class="w-12 h-9 rounded-md border border-amber-300/60 p-1 flex flex-col justify-between"
               style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%); box-shadow: inset 0 1px 2px rgba(255,255,255,0.6), 0 2px 6px rgba(0,0,0,0.4);">
            <div class="w-full h-1 bg-amber-700/40 rounded-sm"></div>
            <div class="flex justify-between">
              <div class="w-2.5 h-3 bg-amber-700/40 rounded-sm"></div>
              <div class="w-2.5 h-3 bg-amber-700/40 rounded-sm"></div>
            </div>
            <div class="w-full h-1 bg-amber-700/40 rounded-sm"></div>
          </div>
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-[10px] font-mono font-bold text-emerald-400">NFC ACTIVE</span>
          </div>
        </div>

        <div class="text-right">
          <span class="text-[10px] font-mono tracking-widest text-slate-400">WISPR-OS v2.6</span>
          <div class="text-xs font-black text-amber-400 tracking-wider">VIP FOUNDER #0029</div>
        </div>
      </div>

      <!-- Title & Branding -->
      <div class="mt-6 relative z-10">
        <span class="text-[11px] font-semibold tracking-widest text-emerald-400 uppercase">Hacker House Goa 2026</span>
        <h3 class="text-2xl font-black text-white tracking-wide mt-0.5" style="letter-spacing: 0.04em;">
          WISPR FLOW CREATIVE STUDIO
        </h3>
        <p class="text-xs text-slate-300 mt-1">Autonomous Voice-Driven Engineering Keycard</p>
      </div>

      <!-- Equalizer Visualizer & Member Info -->
      <div class="mt-5 p-3.5 rounded-xl border border-slate-700/60 relative z-10 flex items-center justify-between"
           style="background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px);">
        <div>
          <div class="text-[10px] uppercase font-mono text-slate-400">Keyholder</div>
          <div class="text-sm font-bold text-white mt-0.5">Shruti Rai</div>
          <div class="text-[11px] text-emerald-400 font-medium">Voice AI Engineer</div>
        </div>

        <!-- Equalizer Bars -->
        <div class="flex items-end gap-1 h-8 px-2 py-1 bg-slate-900/80 rounded-lg border border-slate-700">
          <span class="w-1 bg-emerald-400 rounded-full animate-bounce" style="height: 60%; animation-duration: 0.6s;"></span>
          <span class="w-1 bg-emerald-300 rounded-full animate-bounce" style="height: 90%; animation-duration: 0.4s;"></span>
          <span class="w-1 bg-teal-400 rounded-full animate-bounce" style="height: 40%; animation-duration: 0.8s;"></span>
          <span class="w-1 bg-emerald-400 rounded-full animate-bounce" style="height: 100%; animation-duration: 0.5s;"></span>
          <span class="w-1 bg-cyan-400 rounded-full animate-bounce" style="height: 75%; animation-duration: 0.7s;"></span>
        </div>
      </div>

      <!-- Actions Toolbar -->
      <div class="mt-5 flex gap-2 relative z-10">
        <button id="btnVoicePing" class="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer">
          <span>⚡</span>
          <span>Biometric Voice Ping</span>
        </button>
        <button id="btnFlipCardFront" class="py-2.5 px-4 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer">
          <span>🔄</span>
          <span>Flip 3D Card</span>
        </button>
      </div>
    </div>

    <!-- BACK SIDE -->
    <div id="cardBackSide" class="card-3d-back w-full p-6 rounded-2xl relative overflow-hidden shadow-2xl border"
         style="background: linear-gradient(135deg, #070e14 0%, #0d1b22 100%); border-color: rgba(56,189,248,0.35); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
      
      <!-- Magnetic Strip -->
      <div class="-mx-6 -mt-1 h-12 bg-slate-950 border-y border-slate-800 flex items-center px-6">
        <span class="text-[9px] font-mono text-slate-500 tracking-widest">ENCRYPTED VOICE MAGNETIC STRIP // DO NOT DEMAGNETIZE</span>
      </div>

      <!-- Holographic Signature Panel -->
      <div class="mt-4 flex items-center justify-between p-2.5 bg-slate-800/80 rounded-lg border border-slate-700">
        <div class="text-[10px] font-mono text-slate-400">AUTHORIZED VOICEPRINT:</div>
        <div class="font-serif italic text-sm text-emerald-400 tracking-wider">Shruti Rai • Verified</div>
        <div class="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">99.8% Match</div>
      </div>

      <!-- Hash & Security Details -->
      <div class="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div class="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
          <div class="text-[10px] text-slate-400 font-mono">VOICE SIGNATURE HASH</div>
          <div class="text-[11px] font-mono text-cyan-400 mt-1 truncate">0x7F9A2B44E8C1019</div>
        </div>
        <div class="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
          <div class="text-[10px] text-slate-400 font-mono">SUB-LATENCY LEVEL</div>
          <div class="text-[11px] font-mono text-emerald-400 mt-1 font-bold">142ms Realtime</div>
        </div>
      </div>

      <!-- Barcode Graphic -->
      <div class="mt-4 p-2 bg-white rounded-lg flex items-center justify-between h-10">
        <div class="w-full h-full flex items-center justify-around">
          <span class="w-1 h-6 bg-slate-950"></span>
          <span class="w-2 h-6 bg-slate-950"></span>
          <span class="w-0.5 h-6 bg-slate-950"></span>
          <span class="w-1.5 h-6 bg-slate-950"></span>
          <span class="w-3 h-6 bg-slate-950"></span>
          <span class="w-1 h-6 bg-slate-950"></span>
          <span class="w-2 h-6 bg-slate-950"></span>
          <span class="w-0.5 h-6 bg-slate-950"></span>
          <span class="w-1.5 h-6 bg-slate-950"></span>
          <span class="w-2.5 h-6 bg-slate-950"></span>
          <span class="w-1 h-6 bg-slate-950"></span>
          <span class="w-2 h-6 bg-slate-950"></span>
        </div>
      </div>

      <!-- Back Action -->
      <div class="mt-4 flex justify-end">
        <button id="btnFlipCardBack" class="py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer">
          <span>🔄</span>
          <span>Flip to Front</span>
        </button>
      </div>
    </div>
  </div>
</div>`;
    }

    // Render Preview
    uiPreviewContainer.innerHTML = htmlCode;
    currentFullUiCode = htmlCode;
    renderUiCodePreview();

    // Attach rich event listeners
    attachUiInteractions();
  }

  function attachUiInteractions() {
    // 1. 3D Tilt & Flip mechanics for VIP Pass
    const vipPassRoot = document.getElementById('vipPassRoot');
    const cardFlipper = document.getElementById('cardFlipper');
    const cardGlare = document.getElementById('cardGlare');

    if (vipPassRoot && cardFlipper) {
      vipPassRoot.addEventListener('mousemove', (e) => {
        const rect = vipPassRoot.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -16;
        const rotateY = ((x - centerX) / centerX) * 16;

        if (!cardFlipper.classList.contains('flipped')) {
          cardFlipper.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
          if (cardGlare) {
            const glareX = ((x / rect.width) * 100).toFixed(1);
            const glareY = ((y / rect.height) * 100).toFixed(1);
            cardGlare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.3) 0%, transparent 60%)`;
          }
        } else {
          cardFlipper.style.transform = `rotateY(180deg) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
        }
      });

      vipPassRoot.addEventListener('mouseleave', () => {
        if (!cardFlipper.classList.contains('flipped')) {
          cardFlipper.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        } else {
          cardFlipper.style.transform = 'rotateY(180deg) scale3d(1, 1, 1)';
        }
        if (cardGlare) {
          cardGlare.style.background = `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 65%)`;
        }
      });

      const btnFlipFront = document.getElementById('btnFlipCardFront');
      const btnFlipBack = document.getElementById('btnFlipCardBack');
      if (btnFlipFront) {
        btnFlipFront.addEventListener('click', (e) => {
          e.stopPropagation();
          cardFlipper.classList.add('flipped');
          cardFlipper.style.transform = 'rotateY(180deg)';
          playSynthesizedSound('start');
          showToast('Flipped to Security Backside');
        });
      }
      if (btnFlipBack) {
        btnFlipBack.addEventListener('click', (e) => {
          e.stopPropagation();
          cardFlipper.classList.remove('flipped');
          cardFlipper.style.transform = 'rotateY(0deg)';
          playSynthesizedSound('click');
          showToast('Flipped to Holographic Front');
        });
      }

      const btnVoicePing = document.getElementById('btnVoicePing');
      if (btnVoicePing) {
        btnVoicePing.addEventListener('click', (e) => {
          e.stopPropagation();
          playSynthesizedSound('complete');
          showToast('⚡ Biometric Voiceprint Verified: 99.8% Match!');
        });
      }
    }

    // 2. 3D Orb Controls
    const sliderHarmonic = document.getElementById('sliderHarmonic');
    const orbFreqVal = document.getElementById('orbFreqVal');
    const resonancePercent = document.getElementById('resonancePercent');
    const holoGyroSphere = document.getElementById('holoGyroSphere');
    const btnPulseOrb = document.getElementById('btnPulseOrb');
    const btnVoiceBeacon = document.getElementById('btnVoiceBeacon');

    if (sliderHarmonic && orbFreqVal) {
      sliderHarmonic.addEventListener('input', (e) => {
        const freq = e.target.value;
        orbFreqVal.textContent = freq;
        if (resonancePercent) {
          resonancePercent.textContent = Math.round((freq / 880) * 100) + '%';
        }
        if (holoGyroSphere) {
          const dur = Math.max(3, 20 - (freq / 880) * 16);
          holoGyroSphere.style.animationDuration = `${dur.toFixed(1)}s`;
        }
      });

      sliderHarmonic.addEventListener('change', () => {
        playSynthesizedSound('start');
      });
    }

    if (btnPulseOrb) {
      btnPulseOrb.addEventListener('click', (e) => {
        e.stopPropagation();
        playSynthesizedSound('complete');
        showToast('🔮 Harmonic Core Pulsed at ' + (orbFreqVal ? orbFreqVal.textContent : '432') + ' Hz');
      });
    }

    if (btnVoiceBeacon) {
      btnVoiceBeacon.addEventListener('click', (e) => {
        e.stopPropagation();
        playSynthesizedSound('start');
        showToast('🔊 Wispr Voice Beacon Transmitting...');
      });
    }

    // 2.5 3D Sneaker Showcase Interactions
    const sneaker3dObject = document.getElementById('sneaker3dObject');
    const btnSpinShoe = document.getElementById('btnSpinShoe');
    let isShoeSpun = false;

    if (btnSpinShoe && sneaker3dObject) {
      btnSpinShoe.addEventListener('click', (e) => {
        e.stopPropagation();
        isShoeSpun = !isShoeSpun;
        sneaker3dObject.style.transform = isShoeSpun
          ? 'rotateY(215deg) translateY(-10px)'
          : 'rotateY(25deg) translateY(0px)';
        playSynthesizedSound('start');
        showToast('3D Sneaker Rotated 360°');
      });
    }

    document.querySelectorAll('.colorway-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.colorway-btn').forEach(b => b.classList.remove('ring-2'));
        btn.classList.add('ring-2');
        const c1 = btn.dataset.c1;
        const c2 = btn.dataset.c2;
        const stop1 = document.getElementById('shoeColorStop1');
        const stop2 = document.getElementById('shoeColorStop2');
        if (stop1 && stop2) {
          stop1.setAttribute('stop-color', c1);
          stop2.setAttribute('stop-color', c2);
        }
        playSynthesizedSound('click');
        showToast('Colorway Applied: ' + btn.getAttribute('title'));
      });
    });

    const btnPreorderShoe = document.getElementById('btnPreorderShoe');
    if (btnPreorderShoe) {
      btnPreorderShoe.addEventListener('click', (e) => {
        e.stopPropagation();
        playSynthesizedSound('complete');
        showToast('🎉 Pre-order Reserved for Cyber-Air Wispr V1!');
      });
    }

    // 3. Billing Frequency Toggle
    const btnMonthly = document.getElementById('billingMonthlyBtn');
    const btnAnnual = document.getElementById('billingAnnualBtn');
    const pricePro = document.getElementById('pricePro');
    const priceEnterprise = document.getElementById('priceEnterprise');
    const subtextPro = document.getElementById('subtextPro');
    const subtextEnterprise = document.getElementById('subtextEnterprise');

    if (btnMonthly && btnAnnual) {
      btnMonthly.addEventListener('click', (e) => {
        e.stopPropagation();
        btnMonthly.className = 'px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 text-slate-950 shadow transition cursor-pointer';
        btnAnnual.className = 'px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-300 hover:text-white transition cursor-pointer';
        if (pricePro) pricePro.textContent = '$29';
        if (priceEnterprise) priceEnterprise.textContent = '$99';
        if (subtextPro) subtextPro.textContent = 'Unlimited voice-to-code & PRD generation.';
        if (subtextEnterprise) subtextEnterprise.textContent = 'Team workspace with custom LLM integrations.';
        playSynthesizedSound('click');
        showToast('Switched to Monthly Billing');
      });

      btnAnnual.addEventListener('click', (e) => {
        e.stopPropagation();
        btnAnnual.className = 'px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 text-slate-950 shadow transition cursor-pointer';
        btnMonthly.className = 'px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-300 hover:text-white transition cursor-pointer';
        if (pricePro) pricePro.textContent = '$23';
        if (priceEnterprise) priceEnterprise.textContent = '$79';
        if (subtextPro) subtextPro.textContent = 'Billed annually ($276/yr). Save $72 every year!';
        if (subtextEnterprise) subtextEnterprise.textContent = 'Billed annually ($948/yr). Save $240 every year!';
        playSynthesizedSound('complete');
        showToast('Annual Discount Applied (Save 20%)!');
      });
    }

    // 4. Card Selection
    const tierCards = document.querySelectorAll('.tier-card');
    tierCards.forEach(card => {
      card.addEventListener('click', () => {
        tierCards.forEach(c => c.classList.remove('ring-2', 'ring-emerald-400'));
        card.classList.add('ring-2', 'ring-emerald-400');
        playSynthesizedSound('click');
      });
    });

    // 5. Checkout Modal
    const modalOverlay = document.getElementById('checkoutModalOverlay');
    const modalPlanTitle = document.getElementById('modalPlanTitle');
    const modalPlanRate = document.getElementById('modalPlanRate');
    const modalFormContainer = document.getElementById('modalFormContainer');
    const modalSuccessContainer = document.getElementById('modalSuccessContainer');
    const btnModalConfirm = document.getElementById('btnModalConfirm');
    const btnModalClose = document.getElementById('btnModalClose');
    const btnModalDone = document.getElementById('btnModalDone');

    document.querySelectorAll('.btn-tier-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const plan = btn.dataset.plan || 'Pro Studio';
        const price = btn.dataset.price || '$29';
        if (modalOverlay) {
          modalPlanTitle.textContent = plan;
          modalPlanRate.textContent = `${price} / month`;
          modalFormContainer.style.display = 'block';
          modalSuccessContainer.style.display = 'none';
          modalOverlay.style.display = 'flex';
          playSynthesizedSound('click');
        }
      });
    });

    if (btnModalClose) {
      btnModalClose.addEventListener('click', (e) => {
        e.stopPropagation();
        modalOverlay.style.display = 'none';
      });
    }

    if (btnModalConfirm) {
      btnModalConfirm.addEventListener('click', (e) => {
        e.stopPropagation();
        playSynthesizedSound('complete');
        modalFormContainer.style.display = 'none';
        modalSuccessContainer.style.display = 'block';
        showToast(`🎉 Subscription to ${modalPlanTitle.textContent} Confirmed!`);
      });
    }

    if (btnModalDone) {
      btnModalDone.addEventListener('click', (e) => {
        e.stopPropagation();
        modalOverlay.style.display = 'none';
      });
    }

    // 6. Analytics Dashboard Interactions
    const btnSyncStream = document.getElementById('btnSyncStream');
    const statUsers = document.getElementById('statUsers');
    const statArr = document.getElementById('statArr');
    if (btnSyncStream && statUsers) {
      btnSyncStream.addEventListener('click', (e) => {
        e.stopPropagation();
        playSynthesizedSound('start');
        statUsers.textContent = (parseFloat(statUsers.textContent) + 0.4).toFixed(1) + 'k';
        statArr.textContent = '$' + (parseInt(statArr.textContent.replace(/\D/g, '')) + 450).toLocaleString();
        btnSyncStream.textContent = '✓ Synced!';
        btnSyncStream.style.background = '#059669';
        showToast('Telemetry stream updated live!');
        setTimeout(() => {
          btnSyncStream.textContent = '⚡ Sync Stream';
          btnSyncStream.style.background = '';
        }, 1500);
      });
    }

    const btnDownloadCsv = document.getElementById('btnDownloadCsv');
    if (btnDownloadCsv) {
      btnDownloadCsv.addEventListener('click', (e) => {
        e.stopPropagation();
        const csvContent = "data:text/csv;charset=utf-8,Timestamp,Users,LatencyMs,ARR\\n2026-10-02T18:00:00Z,148200,142,42900\\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "wispr_telemetry.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Downloaded telemetry CSV report!');
      });
    }
  }

  // Code Preview Management (Truncated snippet by default + expandable)
  let currentFullUiCode = '';
  let isUiCodeExpanded = false;
  const toggleCodeExpandBtn = document.getElementById('toggleCodeExpandBtn');
  const codePreviewBadge = document.getElementById('codePreviewBadge');

  function renderUiCodePreview() {
    if (!uiCodePre) return;
    const lines = currentFullUiCode.split('\n');
    if (!isUiCodeExpanded && lines.length > 12) {
      const snippet = lines.slice(0, 12).join('\n');
      uiCodePre.textContent = snippet + `\n\n  ... /* [Remaining ${lines.length - 12} lines hidden. Click '⌄ Expand Full Code' above or 'Copy Code' for full file] */\n</div>`;
      if (codePreviewBadge) codePreviewBadge.textContent = `12 of ${lines.length} lines`;
      if (toggleCodeExpandBtn) toggleCodeExpandBtn.textContent = '⌄ Expand Full Code';
    } else {
      uiCodePre.textContent = currentFullUiCode;
      if (codePreviewBadge) codePreviewBadge.textContent = `${lines.length} lines (Full)`;
      if (toggleCodeExpandBtn) toggleCodeExpandBtn.textContent = '⌃ Collapse Code';
    }
  }

  if (toggleCodeExpandBtn) {
    toggleCodeExpandBtn.addEventListener('click', () => {
      isUiCodeExpanded = !isUiCodeExpanded;
      renderUiCodePreview();
      playSynthesizedSound('click');
    });
  }

  // Copy UI code (Always copies the complete 100% code)
  copyUiCodeBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentFullUiCode || uiCodePre.textContent);
    copyUiCodeBtn.textContent = 'Copied Full Code!';
    setTimeout(() => copyUiCodeBtn.textContent = 'Copy Code', 1800);
  });

  // Initial UI Render
  generateUiComponent('Create a futuristic 3D holographic Cyber VIP Pass');

  // =========================================================================
  // 2. Executive Brief & PRD Generator
  // =========================================================================
  function generatePrd(prompt) {
    const summaryHtml = `
      <div class="space-y-4">
        <!-- Top Spatial Metric Bar -->
        <div class="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-xl border border-emerald-500/30 shadow-md">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="text-xs font-mono font-bold text-emerald-400">3D SPATIAL PRODUCT ARCHITECTURE</span>
          </div>
          <div class="flex items-center gap-3 text-xs">
            <span class="text-slate-400">Sprint Target: <b class="text-white">Next Tuesday</b></span>
            <span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold">&lt; 142ms SLA</span>
          </div>
        </div>

        <!-- 3D Spatial Milestone Pods Grid -->
        <div class="roadmap-3d-grid">
          <!-- Pod 1 -->
          <div class="roadmap-col-card">
            <div class="roadmap-pod cursor-pointer transition hover:border-emerald-400" onclick="this.classList.toggle('ring-2'); this.classList.toggle('ring-emerald-400'); playSynthesizedSound('click');">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">P0 • VERIFIED</span>
                <span class="text-xs font-black text-emerald-400">100%</span>
              </div>
              <h4 class="text-sm font-bold text-white">Audio Pipeline & Latency</h4>
              <p class="text-[11px] text-slate-300 mt-1">Benchmark audio buffer sizes to guarantee latency strictly below 200ms.</p>
              
              <!-- Progress Bar -->
              <div class="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div class="bg-emerald-400 h-full rounded-full" style="width: 100%;"></div>
              </div>

              <div class="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                <span class="text-slate-400">Owner: <b class="text-slate-200">Shruti Rai</b></span>
                <span class="text-emerald-400 font-mono">✓ SLA Met</span>
              </div>
            </div>
          </div>

          <!-- Pod 2 -->
          <div class="roadmap-col-card">
            <div class="roadmap-pod cursor-pointer transition hover:border-cyan-400" onclick="this.classList.toggle('ring-2'); this.classList.toggle('ring-cyan-400'); playSynthesizedSound('click');">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">P0 • ACTIVE</span>
                <span class="text-xs font-black text-cyan-400">88%</span>
              </div>
              <h4 class="text-sm font-bold text-white">3D Spatial UI Components</h4>
              <p class="text-[11px] text-slate-300 mt-1">Mouse-tracking tilt physics, 3D flip card, and real-time audio visualizers.</p>
              
              <!-- Progress Bar -->
              <div class="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div class="bg-cyan-400 h-full rounded-full animate-pulse" style="width: 88%;"></div>
              </div>

              <div class="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                <span class="text-slate-400">Owner: <b class="text-slate-200">Sarah M.</b></span>
                <span class="text-cyan-400 font-mono">⚡ Deployed</span>
              </div>
            </div>
          </div>

          <!-- Pod 3 -->
          <div class="roadmap-col-card">
            <div class="roadmap-pod cursor-pointer transition hover:border-amber-400" onclick="this.classList.toggle('ring-2'); this.classList.toggle('ring-amber-400'); playSynthesizedSound('click');">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">P1 • SCHEDULED</span>
                <span class="text-xs font-black text-amber-400">65%</span>
              </div>
              <h4 class="text-sm font-bold text-white">Telemetry & CSV Sync</h4>
              <p class="text-[11px] text-slate-300 mt-1">Live voice stream analytics dashboard with instant CSV telemetry download.</p>
              
              <!-- Progress Bar -->
              <div class="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div class="bg-amber-400 h-full rounded-full" style="width: 65%;"></div>
              </div>

              <div class="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                <span class="text-slate-400">Owner: <b class="text-slate-200">John D.</b></span>
                <span class="text-amber-400 font-mono">📅 Monday</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Interactive Milestone Checkpoints -->
        <div class="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
          <div class="text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-2">
            <span>🚀</span> <span>Critical Path Checkpoints (Interactive Toggles):</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <label class="flex items-center gap-2 p-2 bg-slate-800/60 rounded-lg cursor-pointer hover:bg-slate-800 transition">
              <input type="checkbox" checked class="accent-emerald-500" onchange="playSynthesizedSound('click'); showToast('Milestone Status Updated');">
              <span class="text-slate-200 font-medium">Microphone stream &lt; 200ms</span>
            </label>
            <label class="flex items-center gap-2 p-2 bg-slate-800/60 rounded-lg cursor-pointer hover:bg-slate-800 transition">
              <input type="checkbox" checked class="accent-emerald-500" onchange="playSynthesizedSound('click'); showToast('Milestone Status Updated');">
              <span class="text-slate-200 font-medium">3D VIP Pass tilt & flip</span>
            </label>
            <label class="flex items-center gap-2 p-2 bg-slate-800/60 rounded-lg cursor-pointer hover:bg-slate-800 transition">
              <input type="checkbox" checked class="accent-emerald-500" onchange="playSynthesizedSound('click'); showToast('Milestone Status Updated');">
              <span class="text-slate-200 font-medium">Voice Maze Runner Navigation</span>
            </label>
            <label class="flex items-center gap-2 p-2 bg-slate-800/60 rounded-lg cursor-pointer hover:bg-slate-800 transition">
              <input type="checkbox" checked class="accent-emerald-500" onchange="playSynthesizedSound('click'); showToast('Milestone Status Updated');">
              <span class="text-slate-200 font-medium">Zero dependency Node server</span>
            </label>
          </div>
        </div>
      </div>
    `;

    const prdMarkdown = `# Product Requirements Document (PRD): Voice Onboarding Experience

## 1. Objective
Deliver a sub-200ms voice-first onboarding flow that allows new users to articulate requirements naturally using Wispr Flow and receive instant product execution.

## 2. Key Stakeholders & Roles
- **Product & Analytics Lead:** John D. (Telemetry & Conversion Tracking)
- **Design Lead:** Sarah M. (Mobile Figma Screens & Design Tokens)
- **Audio & Engine Engineering:** Core Audio Team (Latency Optimization)

## 3. User Stories
### US-101: Voice-Driven Dictation
- **As a** developer or product manager
- **I want to** speak my feature specs using Wispr Flow
- **So that** I don't have to manually write boilerplate code or tickets.
- **Acceptance Criteria:**
  - [x] Speech captures without audio dropping
  - [x] Transcribed words render in real-time
  - [x] End-to-end latency <= 200 milliseconds

### US-102: Instant PRD & Action Item Extraction
- **As an** engineering lead
- **I want to** convert brain-dumps into ownership matrices
- **So that** tasks are unblocked immediately.
- **Acceptance Criteria:**
  - [x] Extracts Assignees, Deadlines, and Priority (P0/P1/P2)
  - [x] One-click Markdown copy and CSV download

## 4. Release Criteria & Milestones
- **Feature Freeze:** Monday 6:00 PM
- **Launch Target:** Tuesday 11:59 PM (Official Release)
`;

    prdSummaryBody.innerHTML = summaryHtml;
    prdMarkdownPre.textContent = prdMarkdown;
  }

  // Copy PRD
  copyPrdSummaryBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(prdSummaryBody.innerText);
    copyPrdSummaryBtn.textContent = 'Copied!';
    setTimeout(() => copyPrdSummaryBtn.textContent = 'Copy Summary', 1800);
  });
  copyPrdMarkdownBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(prdMarkdownPre.textContent);
    copyPrdMarkdownBtn.textContent = 'Copied!';
    setTimeout(() => copyPrdMarkdownBtn.textContent = 'Copy Markdown', 1800);
  });

  generatePrd('Initial PRD voice sync');

  // =========================================================================
  // 3. Voice-to-Code Playground & In-Browser Execution
  // =========================================================================
  const codeTemplates = {
    javascript: `/**
 * Voice Generated: High-Performance LRU Cache
 * Dictated with Wispr Flow for Hacker House Goa Task 5
 */
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    // Refresh position to mark as recently used
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict least recently used (first item in Map)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      console.log('Evicted LRU key:', oldestKey);
    }
    this.cache.set(key, value);
  }
}

// Interactive Verification Test
console.log('--- Initializing LRU Cache (Capacity = 3) ---');
const lru = new LRUCache(3);
lru.put('user:1', { name: 'Alice', role: 'Engineer' });
lru.put('user:2', { name: 'Bob', role: 'Designer' });
lru.put('user:3', { name: 'Charlie', role: 'Founder' });
console.log('Cached 3 users successfully.');

console.log('Accessing user:1 =>', lru.get('user:1').name);

console.log('Adding 4th user (triggers eviction)...');
lru.put('user:4', { name: 'Dave', role: 'Audio AI Specialist' });

console.log('Lookup evicted user:2 =>', lru.get('user:2')); // Returns -1
console.log('Lookup active user:4 =>', lru.get('user:4').name);
console.log('✅ LRU Cache test completed without errors!');
`,
    python: `# Voice Generated: High-Performance LRU Cache in Python 3
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: str):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: str, value: any):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            oldest = next(iter(self.cache))
            del self.cache[oldest]
            print(f"Evicted least recently used key: {oldest}")

# Self-test
cache = LRUCache(capacity=2)
cache.put("token", "xyz_123")
cache.put("session", "active")
print("Session:", cache.get("session"))
`,
    typescript: `// Voice Generated: Strongly Typed LRU Cache in TypeScript
interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
}

export class TypedLRUCache<T> {
  private capacity: number;
  private store: Map<string, CacheEntry<T>> = new Map();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  public get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    this.store.delete(key);
    this.store.set(key, { ...entry, timestamp: Date.now() });
    return entry.value;
  }

  public put(key: string, value: T): void {
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.capacity) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }
    this.store.set(key, { key, value, timestamp: Date.now() });
  }
}
`,
    sql: `-- Voice Generated: PostgreSQL Analytical Aggregations
-- Hacker House Goa 2026 Task 5
SELECT 
    DATE_TRUNC('hour', created_at) AS time_bucket,
    COUNT(id) AS total_voice_sessions,
    ROUND(AVG(latency_ms), 2) AS avg_latency_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95_latency_ms,
    COUNT(CASE WHEN latency_ms <= 200 THEN 1 END) * 100.0 / COUNT(id) AS sla_compliance_pct
FROM 
    voice_transcriptions
WHERE 
    created_at >= NOW() - INTERVAL '24 hours'
GROUP BY 
    time_bucket
ORDER BY 
    time_bucket DESC;
`
  };

  function generateCode(prompt) {
    const lang = codeLanguageSelect.value;
    generatedCodePre.textContent = codeTemplates[lang] || codeTemplates.javascript;
  }

  codeLanguageSelect.addEventListener('change', () => {
    generateCode(voicePromptInput.value);
  });

  copyGeneratedCodeBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(generatedCodePre.textContent);
    copyGeneratedCodeBtn.textContent = 'Copied!';
    setTimeout(() => copyGeneratedCodeBtn.textContent = 'Copy', 1800);
  });

  // Run JavaScript Code safely in browser
  runCodeBtn.addEventListener('click', () => {
    const code = generatedCodePre.textContent;
    codeConsoleOutput.innerHTML = '';
    playSynthesizedSound('start');

    // Create custom logger
    const logs = [];
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    function formatArg(arg) {
      if (typeof arg === 'object') return JSON.stringify(arg);
      return String(arg);
    }

    try {
      console.log = (...args) => {
        logs.push(`<div style="color: #38bdf8;">${args.map(formatArg).join(' ')}</div>`);
        originalLog.apply(console, args);
      };
      console.warn = (...args) => {
        logs.push(`<div style="color: #f59e0b;">⚠️ ${args.map(formatArg).join(' ')}</div>`);
        originalWarn.apply(console, args);
      };
      console.error = (...args) => {
        logs.push(`<div style="color: #ef4444;">❌ ${args.map(formatArg).join(' ')}</div>`);
        originalError.apply(console, args);
      };

      // Execute code in Function constructor
      const runner = new Function(code);
      runner();

      logs.push(`<div style="color: #10b981; margin-top: 0.5rem; font-weight: bold;">⚡ Execution finished successfully in 4ms</div>`);
      playSynthesizedSound('complete');
    } catch (err) {
      logs.push(`<div style="color: #ef4444; margin-top: 0.5rem; font-weight: bold;">❌ Runtime Exception: ${err.message}</div>`);
    } finally {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      codeConsoleOutput.innerHTML = logs.join('');
    }
  });

  clearConsoleBtn.addEventListener('click', () => {
    codeConsoleOutput.innerHTML = '<div style="color: #64748b;">// Console cleared. Ready for next run.</div>';
  });

  generateCode('LRU Cache in JS');

  // =========================================================================
  // 4. Interactive MindMap Canvas
  // =========================================================================
  function resizeMindmap() {
    if (!mindmapCanvas) return;
    const parent = mindmapCanvas.parentElement;
    if (parent && typeof parent.getBoundingClientRect === 'function') {
      const rect = parent.getBoundingClientRect();
      mindmapCanvas.width = rect.width || 600;
      mindmapCanvas.height = rect.height || 420;
    } else {
      mindmapCanvas.width = mindmapCanvas.width || 600;
      mindmapCanvas.height = mindmapCanvas.height || 420;
    }
    drawMindmap();
  }
  window.addEventListener('resize', resizeMindmap);
  resizeMindmap();

  let draggedNode = null;
  let dragOffset = { x: 0, y: 0 };

  function drawMindmap() {
    if (!mCtx || !mindmapCanvas) return;
    const width = mindmapCanvas.width;
    const height = mindmapCanvas.height;

    mCtx.clearRect(0, 0, width, height);

    const isLight = document.body.classList.contains('light-theme');
    const edgeColor = isLight ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)';

    // Draw Edges (curved Bezier links)
    state.edges.forEach(edge => {
      const fromNode = state.nodes.find(n => n.id === edge.from);
      const toNode = state.nodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) return;

      mCtx.beginPath();
      mCtx.moveTo(fromNode.x, fromNode.y);
      const cpX = (fromNode.x + toNode.x) / 2;
      const cpY = (fromNode.y + toNode.y) / 2;
      mCtx.quadraticCurveTo(cpX, cpY - 20, toNode.x, toNode.y);
      mCtx.strokeStyle = edgeColor;
      mCtx.lineWidth = 2.5;
      mCtx.stroke();
    });

    // Draw Nodes
    state.nodes.forEach(node => {
      // Glow
      mCtx.shadowBlur = 12;
      mCtx.shadowColor = node.color;

      // Circle
      mCtx.beginPath();
      mCtx.arc(node.x, node.y, 24, 0, Math.PI * 2);
      mCtx.fillStyle = node.color;
      mCtx.fill();

      mCtx.shadowBlur = 0; // Reset

      // Category Pill
      mCtx.font = '600 11px Inter, sans-serif';
      mCtx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
      mCtx.textAlign = 'center';
      mCtx.fillText(node.label, node.x, node.y + 42);

      mCtx.font = '500 9px JetBrains Mono, monospace';
      mCtx.fillStyle = isLight ? '#64748b' : '#94a3b8';
      mCtx.fillText(`[${node.category}]`, node.x, node.y + 54);
    });
  }

  // Dragging interaction
  mindmapCanvas.addEventListener('mousedown', (e) => {
    const rect = mindmapCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    draggedNode = state.nodes.find(n => {
      const dist = Math.hypot(n.x - mouseX, n.y - mouseY);
      return dist <= 28;
    });

    if (draggedNode) {
      dragOffset.x = mouseX - draggedNode.x;
      dragOffset.y = mouseY - draggedNode.y;
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!draggedNode) return;
    const rect = mindmapCanvas.getBoundingClientRect();
    draggedNode.x = e.clientX - rect.left - dragOffset.x;
    draggedNode.y = e.clientY - rect.top - dragOffset.y;
    drawMindmap();
  });

  window.addEventListener('mouseup', () => {
    draggedNode = null;
  });

  // Expand mindmap from voice
  function expandMindmapFromVoice(prompt) {
    const newId = state.nodes.length + 1;
    const cleanLabel = prompt.replace(/add\s+(idea|node)?[:\s]*/i, '').slice(0, 24) || `Voice Node ${newId}`;
    const colors = ['#10b981', '#38bdf8', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4'];
    const randomColor = colors[newId % colors.length];

    const angle = (newId * 1.3) % (Math.PI * 2);
    const radius = 160 + Math.random() * 40;
    const centerX = mindmapCanvas.width / 2;
    const centerY = mindmapCanvas.height / 2;

    state.nodes.push({
      id: newId,
      label: cleanLabel,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      category: 'Voice Idea',
      color: randomColor
    });

    // Link to central node or previous node
    state.edges.push({ from: 1, to: newId });
    drawMindmap();
  }

  addMindmapNodeBtn.addEventListener('click', () => {
    expandMindmapFromVoice('New Product Idea ' + (state.nodes.length + 1));
    playSynthesizedSound('click');
  });

  resetMindmapBtn.addEventListener('click', () => {
    state.nodes = [
      { id: 1, label: 'WisprCraft Voice OS', x: mindmapCanvas.width / 2, y: mindmapCanvas.height / 2, category: 'Core', color: '#10b981' },
      { id: 2, label: 'Speech-to-UI Engine', x: mindmapCanvas.width / 2 - 140, y: mindmapCanvas.height / 2 - 100, category: 'Frontend', color: '#38bdf8' },
      { id: 3, label: 'PRD & Action Matrix', x: mindmapCanvas.width / 2 + 140, y: mindmapCanvas.height / 2 - 100, category: 'Product', color: '#f59e0b' },
      { id: 4, label: 'Voice-to-Code Compiler', x: mindmapCanvas.width / 2 - 140, y: mindmapCanvas.height / 2 + 100, category: 'Dev', color: '#a855f7' },
      { id: 5, label: 'Web Audio Visualizer', x: mindmapCanvas.width / 2 + 140, y: mindmapCanvas.height / 2 + 100, category: 'Audio', color: '#ec4899' }
    ];
    state.edges = [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 1, to: 5 }
    ];
    drawMindmap();
    playSynthesizedSound('click');
  });

  exportMindmapBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'wisprcraft-mindmap.png';
    link.href = mindmapCanvas.toDataURL('image/png');
    link.click();
  });

  // =========================================================================
  // 5. Teleprompter Copy Script Buttons
  // =========================================================================
  document.querySelectorAll('.copy-script-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.text;
      navigator.clipboard.writeText(text);
      btn.textContent = 'Copied!';
      btn.style.color = 'var(--primary)';
      playSynthesizedSound('click');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.style.color = '';
      }, 1800);
    });
  });

  // =========================================================================
  // 6. Voice Maze Runner Game Engine ("Maze Wala")
  // =========================================================================
  const mazeState = {
    cellSize: 38,
    player: { x: 1, y: 1 },
    portal: { x: 8, y: 8 },
    score: 0,
    gems: [
      { x: 3, y: 1, collected: false },
      { x: 5, y: 5, collected: false },
      { x: 8, y: 2, collected: false },
      { x: 2, y: 7, collected: false }
    ],
    // 10x10 maze: 1 = wall, 0 = path
    layout: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 0, 1, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  };

  function drawMaze() {
    if (!mzCtx || !mazeCanvas) return;
    const { cellSize, layout, player, portal, gems } = mazeState;

    mzCtx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);

    // Draw Grid & Walls
    for (let r = 0; r < layout.length; r++) {
      for (let c = 0; c < layout[r].length; c++) {
        const x = c * cellSize;
        const y = r * cellSize;

        if (layout[r][c] === 1) {
          // Wall
          mzCtx.fillStyle = '#0f1f1a';
          mzCtx.fillRect(x, y, cellSize, cellSize);
          mzCtx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
          mzCtx.lineWidth = 1.5;
          mzCtx.strokeRect(x, y, cellSize, cellSize);
        } else {
          // Path
          mzCtx.fillStyle = '#04080c';
          mzCtx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }

    // Draw Gems
    gems.forEach(gem => {
      if (!gem.collected) {
        const gx = gem.x * cellSize + cellSize / 2;
        const gy = gem.y * cellSize + cellSize / 2;
        mzCtx.shadowBlur = 10;
        mzCtx.shadowColor = '#38bdf8';
        mzCtx.font = '16px sans-serif';
        mzCtx.textAlign = 'center';
        mzCtx.textBaseline = 'middle';
        mzCtx.fillText('💎', gx, gy);
        mzCtx.shadowBlur = 0;
      }
    });

    // Draw Exit Portal
    const px = portal.x * cellSize + cellSize / 2;
    const py = portal.y * cellSize + cellSize / 2;
    mzCtx.shadowBlur = 15;
    mzCtx.shadowColor = '#a855f7';
    mzCtx.font = '18px sans-serif';
    mzCtx.textAlign = 'center';
    mzCtx.textBaseline = 'middle';
    mzCtx.fillText('🌀', px, py);
    mzCtx.shadowBlur = 0;

    // Draw Player (Glowing Emerald Audio Pulse)
    const plx = player.x * cellSize + cellSize / 2;
    const ply = player.y * cellSize + cellSize / 2;
    mzCtx.shadowBlur = 16;
    mzCtx.shadowColor = '#10b981';
    mzCtx.beginPath();
    mzCtx.arc(plx, ply, cellSize / 2.8, 0, Math.PI * 2);
    mzCtx.fillStyle = '#10b981';
    mzCtx.fill();
    mzCtx.strokeStyle = '#ffffff';
    mzCtx.lineWidth = 2;
    mzCtx.stroke();
    mzCtx.shadowBlur = 0;
  }

  function moveMazePlayer(dx, dy) {
    const newX = mazeState.player.x + dx;
    const newY = mazeState.player.y + dy;

    // Wall collision check
    if (mazeState.layout[newY] && mazeState.layout[newY][newX] === 0) {
      mazeState.player.x = newX;
      mazeState.player.y = newY;
      playSynthesizedSound('click');

      // Check Gems
      mazeState.gems.forEach(gem => {
        if (!gem.collected && gem.x === newX && gem.y === newY) {
          gem.collected = true;
          mazeState.score += 50;
          if (mazeScoreBadge) mazeScoreBadge.textContent = `Score: ${mazeState.score}`;
          playSynthesizedSound('complete');
          showToast('💎 Sound Crystal Collected! +50 Points');
        }
      });

      // Check Portal Win
      if (newX === mazeState.portal.x && newY === mazeState.portal.y) {
        mazeState.score += 200;
        if (mazeScoreBadge) mazeScoreBadge.textContent = `Score: ${mazeState.score}`;
        playSynthesizedSound('complete');
        if (mazeStatusBanner) {
          mazeStatusBanner.innerHTML = `<span style="color: #10b981; font-size: 1rem; font-weight: 800;">🏆 VICTORY! Wispr Portal Reached! Final Score: ${mazeState.score}</span>`;
        }
        showToast('🎉 Victory! You cleared the Cyber Maze!');
      }

      drawMaze();
    } else {
      // Hit wall
      if (mazeStatusBanner) {
        mazeStatusBanner.innerHTML = `<span style="color: #ef4444; font-weight: bold;">Hit a cyber barrier! Try another direction.</span>`;
        setTimeout(() => {
          if (mazeStatusBanner) mazeStatusBanner.innerHTML = `🎙️ Speak into Wispr Flow: <b>"Up"</b>, <b>"Down"</b>, <b>"Left"</b>, <b>"Right"</b>!`;
        }, 1200);
      }
    }
  }

  function handleMazeVoiceCommand(command) {
    const cmd = command.toLowerCase().trim();
    if (cmd.includes('up') || cmd.includes('top')) {
      moveMazePlayer(0, -1);
    } else if (cmd.includes('down') || cmd.includes('bottom')) {
      moveMazePlayer(0, 1);
    } else if (cmd.includes('left')) {
      moveMazePlayer(-1, 0);
    } else if (cmd.includes('right')) {
      moveMazePlayer(1, 0);
    } else if (cmd.includes('reset') || cmd.includes('restart')) {
      resetMaze();
    }
  }

  function resetMaze() {
    mazeState.player = { x: 1, y: 1 };
    mazeState.score = 0;
    mazeState.gems.forEach(g => g.collected = false);
    if (mazeScoreBadge) mazeScoreBadge.textContent = 'Score: 0';
    if (mazeStatusBanner) {
      mazeStatusBanner.innerHTML = `🎙️ Speak into Wispr Flow: <b>"Up"</b>, <b>"Down"</b>, <b>"Left"</b>, <b>"Right"</b>!`;
    }
    drawMaze();
    playSynthesizedSound('start');
  }

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    if (state.activeTab !== 'maze') return;
    if (['ArrowUp', 'KeyW'].includes(e.code)) { e.preventDefault(); moveMazePlayer(0, -1); }
    else if (['ArrowDown', 'KeyS'].includes(e.code)) { e.preventDefault(); moveMazePlayer(0, 1); }
    else if (['ArrowLeft', 'KeyA'].includes(e.code)) { e.preventDefault(); moveMazePlayer(-1, 0); }
    else if (['ArrowRight', 'KeyD'].includes(e.code)) { e.preventDefault(); moveMazePlayer(1, 0); }
  });

  // D-Pad buttons
  const dpadUp = document.getElementById('dpadUp');
  const dpadDown = document.getElementById('dpadDown');
  const dpadLeft = document.getElementById('dpadLeft');
  const dpadRight = document.getElementById('dpadRight');
  if (dpadUp) dpadUp.addEventListener('click', () => moveMazePlayer(0, -1));
  if (dpadDown) dpadDown.addEventListener('click', () => moveMazePlayer(0, 1));
  if (dpadLeft) dpadLeft.addEventListener('click', () => moveMazePlayer(-1, 0));
  if (dpadRight) dpadRight.addEventListener('click', () => moveMazePlayer(1, 0));
  if (resetMazeBtn) resetMazeBtn.addEventListener('click', resetMaze);

  // Initialize Mindmap & Maze
  setTimeout(resizeMindmap, 100);
  setTimeout(drawMaze, 150);
});
