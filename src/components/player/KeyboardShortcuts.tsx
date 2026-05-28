'use client';

import { useEffect, useId } from 'react';
import type { CSSProperties } from 'react';

import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';

type ShortcutRow = {
  keys: string;
  action: string;
};

const PLAYBACK_SHORTCUTS: ShortcutRow[] = [
  { keys: 'space', action: 'play / pause' },
  { keys: '←  →', action: 'seek backward / forward 10 seconds' },
  { keys: '↑  ↓', action: 'volume up / down' },
  { keys: 's', action: 'toggle shuffle' },
  { keys: 'r', action: 'toggle repeat' },
];

const QUEUE_SHORTCUTS: ShortcutRow[] = [
  { keys: 'j', action: 'select next track in queue' },
  { keys: 'k', action: 'select previous track in queue' },
  { keys: 'enter', action: 'play selected track' },
];

type KeyboardShortcutsPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function KeyboardShortcutsPanel({ open, onClose }: KeyboardShortcutsPanelProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        background: 'rgba(0, 0, 0, 0.72)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--bg-surface)',
          border: '1px solid var(--green-bright)',
          padding: '14px 16px',
          fontFamily: 'var(--font-mono)',
          borderRadius: 0,
        }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <h2
              id={titleId}
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 400,
                color: 'var(--white)',
                textTransform: 'uppercase',
              }}
            >
              [KEYBOARD SHORTCUTS]
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--gray-muted)' }}>
              keyboard controls for this player
            </p>
          </div>
          <Button variant="ghost" fullWidth={false} onClick={onClose} aria-label="close shortcuts">
            [CLOSE]
          </Button>
        </header>

        <Divider variant="solid" width={28} />

        <ShortcutGroup title="playback" rows={PLAYBACK_SHORTCUTS} />
        <ShortcutGroup title="queue" rows={QUEUE_SHORTCUTS} />

        <p style={{ margin: '12px 0 0', fontSize: 10, color: 'var(--gray-muted)' }}>
          press <kbd style={kbdStyle}>esc</kbd> or <ModKeyLabel />/ again to close
        </p>
      </section>
    </div>
  );
}

function ShortcutGroup({ title, rows }: { title: string; rows: ShortcutRow[] }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 11, color: 'var(--green-mid)', textTransform: 'uppercase', marginBottom: 6 }}>[{title}]</div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {rows.map((row) => (
          <li
            key={`${title}-${row.keys}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              padding: '5px 0',
              borderBottom: '1px solid var(--gray-muted)',
              fontSize: 11,
            }}
          >
            <span style={{ color: 'var(--green-bright)', flexShrink: 0 }}>
              {row.keys.split(/\s+/).map((key) => (
                <kbd key={key} style={{ ...kbdStyle, marginRight: 4 }}>
                  {key}
                </kbd>
              ))}
            </span>
            <span style={{ color: 'var(--white)', textAlign: 'right' }}>{row.action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const kbdStyle: CSSProperties = {
  display: 'inline-block',
  padding: '1px 5px',
  border: '1px solid var(--gray-muted)',
  background: 'var(--bg-base)',
  color: 'var(--green-bright)',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  borderRadius: 0,
};

export function ModKeyLabel() {
  const isMac =
    typeof navigator !== 'undefined' && /mac/i.test(navigator.platform || navigator.userAgent);
  return <kbd style={kbdStyle}>{isMac ? '⌘' : 'ctrl'}</kbd>;
}

type KeyboardShortcutsHintProps = {
  onOpen: () => void;
};

export function KeyboardShortcutsHint({ onOpen }: KeyboardShortcutsHintProps) {
  const isMac =
    typeof navigator !== 'undefined' && /mac/i.test(navigator.platform || navigator.userAgent);
  const modLabel = isMac ? '⌘/' : 'ctrl+/';

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="view keyboard shortcuts"
      style={{
        marginTop: 10,
        padding: 0,
        border: 'none',
        background: 'transparent',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        lineHeight: 1.5,
        color: 'var(--gray-muted)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--green-mid)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--gray-muted)';
      }}
    >
      {modLabel} keyboard shortcuts
    </button>
  );
}
