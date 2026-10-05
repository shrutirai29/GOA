import React, { useState, useEffect } from 'react';
import { WorkspaceType, BuildItem, ProcessingStep, VoiceActivityItem, ToastItem } from './types';
import { useTheme } from './hooks/useTheme';
import { parseCommand } from './lib/commandRouter';
import { generatePRDData } from './lib/prdGenerator';
import { playStart, playSuccess, playClick } from './lib/audio';
import { readAloud } from './lib/tts';

// Layout & Voice
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { VoiceActivity } from './components/voice/VoiceActivity';
import { LoadingScan } from './components/common/LoadingScan';
import { ToastContainer } from './components/common/Toast';
import { WisprInfoModal } from './components/common/WisprInfoModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Workspaces
import { BuildWorkspace } from './components/build/BuildWorkspace';
import { PRDWorkspace } from './components/plan/PRDWorkspace';
import { CodeWorkspace } from './components/code/CodeWorkspace';
import { MindMapWorkspace } from './components/think/MindMapWorkspace';
import { MazeWorkspace } from './components/play/MazeWorkspace';

export const App: React.FC = () => {
  const { theme, toggleTheme, setTheme } = useTheme();

  // Core state
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('build');
  const [activeBuildItem, setActiveBuildItem] = useState<BuildItem>('none');
  const [commandText, setCommandText] = useState('');
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [currentIntentLabel, setCurrentIntentLabel] = useState('');
  const [isWisprModalOpen, setIsWisprModalOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  // Content state
  const [prdData, setPrdData] = useState(() =>
    generatePRDData('Cybersecurity Dashboard')
  );
  const [mindmapTopic, setMindmapTopic] = useState('');
  const [mazeVoiceDir, setMazeVoiceDir] = useState<'up' | 'down' | 'left' | 'right' | null>(null);

  // Voice activity history (starts clean)
  const [activity, setActivity] = useState<VoiceActivityItem[]>([]);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Safety watchdog timer: ensure processing state is never stuck
  useEffect(() => {
    if (processingStep !== 'idle') {
      const timer = setTimeout(() => {
        setProcessingStep('idle');
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [processingStep]);

  const addToast = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const handleExecuteCommand = (overrideCommand?: string) => {
    const textToRun = (overrideCommand ?? commandText).trim();
    if (!textToRun) {
      addToast('Please speak or type a command first.', 'warning');
      return;
    }

    const parsed = parseCommand(textToRun, activeWorkspace);

    setProcessingStep('received');
    setCurrentIntentLabel(parsed.intentLabel);
    playStart();
    addToast('Voice command received');

    setTimeout(() => {
      setProcessingStep('understanding');
    }, 250);

    setTimeout(() => {
      setProcessingStep('building');

      if (parsed.intent === 'THEME') {
        if (parsed.meta?.theme) {
          setTheme(parsed.meta.theme);
        } else {
          toggleTheme();
        }
      } else if (parsed.intent === 'READ_ALOUD') {
        handleReadAloud();
      } else {
        setActiveWorkspace(parsed.targetWorkspace);

        if (parsed.targetWorkspace === 'build') {
          setActiveBuildItem(parsed.targetBuildItem);
        } else if (parsed.targetWorkspace === 'plan') {
          setPrdData(generatePRDData(textToRun));
        } else if (parsed.targetWorkspace === 'think') {
          if (parsed.meta?.mindmapTopic) {
            setMindmapTopic(parsed.meta.mindmapTopic);
          }
        } else if (parsed.targetWorkspace === 'play') {
          if (parsed.meta?.mazeDirection) {
            setMazeVoiceDir(parsed.meta.mazeDirection);
            setTimeout(() => setMazeVoiceDir(null), 300);
          }
        }
      }
    }, 550);

    setTimeout(() => {
      setProcessingStep('ready');
      playSuccess();

      const timeStr = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const newActivity: VoiceActivityItem = {
        id: `${Date.now()}`,
        timestamp: timeStr,
        rawText: textToRun,
        intent: parsed.intent,
        intentLabel: parsed.intentLabel,
        resultTitle: parsed.resultTitle,
        status: 'done'
      };

      setActivity((prev) => [newActivity, ...prev]);
      addToast(`✓ ${parsed.resultTitle} ready`, 'success');
      setCommandText('');
    }, 950);

    setTimeout(() => {
      setProcessingStep('idle');
    }, 1400);
  };

  const handleReadAloud = () => {
    let textToRead = '';
    if (activeWorkspace === 'build') {
      textToRead =
        activeBuildItem === 'vip_pass'
          ? '3D Cyber VIP Pass with mouse perspective tilt, biometric voice verification, and holographic security backside.'
          : activeBuildItem === 'orb'
          ? 'Holographic AI Orb with harmonic gyro resonance and frequency scaling.'
          : 'Welcome to VoxForge. Speak a command with Wispr Flow to build interactive 3D software.';
    } else if (activeWorkspace === 'plan') {
      textToRead = `PRD for ${prdData.title}. Overview: ${prdData.overview}`;
    } else if (activeWorkspace === 'code') {
      textToRead = 'Voice to code compiler playground. High-performance LRU cache in JavaScript with capacity 5.';
    } else if (activeWorkspace === 'think') {
      textToRead = 'VoxForge MindMap canvas. Concept graph with draggable nodes.';
    } else if (activeWorkspace === 'play') {
      textToRead = 'Voice Quest maze runner. Navigate with voice commands UP, DOWN, LEFT, and RIGHT.';
    }

    readAloud(textToRead, () => {
      addToast('Voice readout finished.');
    });
    addToast('🔊 Reading workspace aloud...');
  };

  return (
    <div className="h-screen w-screen overflow-hidden retro-studio-backdrop flex flex-col font-sans text-studio-text dark:text-studio-darkText">
      {/* Top Header directly on background */}
      <TopBar
        commandText={commandText}
        setCommandText={setCommandText}
        onExecute={() => handleExecuteCommand()}
        processingStep={processingStep}
        currentIntentLabel={currentIntentLabel}
        theme={theme}
        toggleTheme={toggleTheme}
        onReadAloud={handleReadAloud}
        onToggleActivity={() => setIsActivityOpen(!isActivityOpen)}
        isActivityOpen={isActivityOpen}
      />

      {/* Studio Workspace (Sidebar + Main Stage) directly on background */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* Integrated Slim Sidebar */}
        <Sidebar
          activeWorkspace={activeWorkspace}
          onSelectWorkspace={(ws) => {
            setActiveWorkspace(ws);
            playClick();
          }}
          onOpenWisprInfo={() => setIsWisprModalOpen(true)}
        />

        {/* Integrated Main Stage */}
        <main className="flex-1 min-h-0 min-w-0 p-4 lg:p-5 relative flex flex-col overflow-hidden w-full">
          <LoadingScan step={processingStep} intentLabel={currentIntentLabel} />

          <ErrorBoundary fallbackTitle="Active Workspace">
            {activeWorkspace === 'build' && (
              <BuildWorkspace
                activeBuildItem={activeBuildItem}
                onExecutePreset={(cmd) => handleExecuteCommand(cmd)}
                onToast={addToast}
                onResetToEmpty={() => setActiveBuildItem('none')}
              />
            )}

            {activeWorkspace === 'plan' && (
              <PRDWorkspace prdData={prdData} onToast={addToast} />
            )}

            {activeWorkspace === 'code' && (
              <CodeWorkspace onToast={addToast} />
            )}

            {activeWorkspace === 'think' && (
              <MindMapWorkspace
                externalTopic={mindmapTopic}
                onToast={addToast}
              />
            )}

            {activeWorkspace === 'play' && (
              <MazeWorkspace
                externalVoiceCommand={mazeVoiceDir}
                onToast={addToast}
              />
            )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Collapsible Voice Activity Drawer */}
      <VoiceActivity
        activity={activity}
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Wispr Flow Architecture Modal */}
      <WisprInfoModal
        isOpen={isWisprModalOpen}
        onClose={() => setIsWisprModalOpen(false)}
      />
    </div>
  );
};
