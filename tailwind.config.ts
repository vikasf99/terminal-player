import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      { base: '#000000', surface: '#0E1410' },
        green:   { bright: '#00FF88', mid: '#8AFF80', dim: '#00FF9F' },
        gray:    { muted: '#4A4A4A' },
        cyan:    '#00FFFF',
        magenta: '#FF00FF',
        yellow:  '#FFFF00',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        none:     '0px',
        terminal: '6px',
      },
      boxShadow: {
        none:         'none',
        glow:         '0 0 8px #00FF88',
        'glow-cyan':  '0 0 6px #00FFFF',
        'glow-head':  '0 0 12px #00FF88',
      },
      transitionTimingFunction: {
        DEFAULT: 'linear',
      },
      transitionDuration: {
        DEFAULT: '100ms',
      },
    },
  },
}

export default config
