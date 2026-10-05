import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('VoxForge Component Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-2xl bg-studio-card dark:bg-studio-darkCard border border-studio-maroon/30 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-studio-maroon/10 text-studio-maroon mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-studio-maroon dark:text-studio-gold">
            {this.props.fallbackTitle || '3D Canvas Notice'}
          </h3>
          <p className="text-xs text-studio-textSec max-w-sm mx-auto">
            {this.state.error?.message || '3D acceleration was reset. Click below to reload the scene.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 rounded-xl bg-studio-maroon text-white text-xs font-semibold flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload 3D Scene</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
