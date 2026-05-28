'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button } from '@/components/ui/Button';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class PlayerBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'unknown error' };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('player render error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          style={{
            minHeight: '100vh',
            background: 'var(--bg-base)',
            color: 'var(--green-mid)',
            fontFamily: 'var(--font-mono)',
            display: 'grid',
            placeItems: 'center',
            padding: 16,
          }}
        >
          <section
            style={{
              maxWidth: 480,
              border: '1px solid var(--magenta)',
              background: 'var(--bg-surface)',
              padding: 16,
            }}
          >
            <p style={{ color: 'var(--magenta)', margin: '0 0 8px' }}>[ERROR] player crashed</p>
            <p style={{ color: 'var(--gray-muted)', fontSize: 12, margin: '0 0 12px' }}>{this.state.message}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button variant="ghost" fullWidth={false} onClick={() => this.setState({ hasError: false, message: '' })}>
                [RETRY]
              </Button>
              <Button
                variant="ghost"
                fullWidth={false}
                onClick={() => {
                  window.location.href = '/api/auth/start?reauth=1';
                }}
              >
                [RE-AUTHENTICATE]
              </Button>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
