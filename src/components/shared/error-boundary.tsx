"use client";
import React from 'react';

type Props = { children: React.ReactNode; fallback?: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }
  componentDidCatch(error: Error): void {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? <div role="alert">Algo salio mal.</div>;
    return this.props.children;
  }
}

export default ErrorBoundary;
