'use client';
import React from 'react';
import { logger } from '@/lib/logger';
type Props = { children: React.ReactNode; fallback?: React.ReactNode };
type State = { hasError: boolean };
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error('ErrorBoundary', {
      error: String(error),
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? <div role="alert">Algo salio mal.</div>;
    return this.props.children;
  }
}

export default ErrorBoundary;
