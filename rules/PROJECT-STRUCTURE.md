# PROJECT STRUCTURE — terminal-playlist
> spotify-connected beat-reactive matrix player
> stack: next.js 14 · spotify web api · web audio api · canvas · tailwind · typescript

---

## stack decisions

```
next.js 14 (app router)     — spotify oauth needs server-side routes; app router handles
                              auth callbacks, api proxying, and env secrets cleanly

spotify web api             — track metadata, audio features, playlist data
spotify web playback sdk    — in-browser playback (premium required), real-time position

web audio api               — analysernode for real-time frequency + beat detection
                              from audio stream; no external lib needed

canvas api (vanilla)        — matrix rain animation; raw canvas over any react lib
                              for frame-rate performance. requestAnimationFrame loop.

tailwind css (customised)   — all defaults overridden with taste tokens;
                              rounded-none, no shadows, linear transitions global

framer motion               — ui state transitions only (linear, 0.1s max)
                              NOT used for matrix rain or beat animation

typescript                  — throughout. strict mode.
```

---

## directory map

```
terminal-playlist/
│
├── .env.local                         ← SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, NEXTAUTH_SECRET
├── TASTE-RULES.md                     ← visual language source of truth
├── TASTE-SKILL.md                     ← original reference image analysis
│
├── public/
│   └── fonts/
│       └── JetBrainsMono/             ← .woff2 font files
│
├── src/
│   │
│   ├── app/                           ← next.js app router
│   │   ├── layout.tsx                 ← root layout, font loading, global providers
│   │   ├── page.tsx                   ← entry — redirects to /player if authed, else /login
│   │   ├── globals.css                ← CSS tokens + tailwind base
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx               ← spotify auth prompt, ASCII logo, single CTA
│   │   │
│   │   ├── player/
│   │   │   └── page.tsx               ← main player view (matrix bg + player UI)
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── callback/
│   │       │   │   └── route.ts       ← spotify oauth callback handler
│   │       │   └── refresh/
│   │       │       └── route.ts       ← token refresh endpoint
│   │       └── spotify/
│   │           ├── current-track/
│   │           │   └── route.ts       ← GET currently playing track
│   │           ├── audio-features/
│   │           │   └── route.ts       ← GET tempo, energy, danceability for track
│   │           └── playlist/
│   │               └── route.ts       ← GET user playlists
│   │
│   ├── components/
│   │   │
│   │   ├── ui/                        ← base primitives — terminal-native
│   │   │   ├── Button.tsx             ← hard-edge rect, 1px cyan border, no radius
│   │   │   ├── Input.tsx              ← underline-only focus state, monospace
│   │   │   ├── Panel.tsx              ← flat panel, 1px cyan border, bg-surface
│   │   │   ├── Divider.tsx            ← ASCII rule variants: ─ · │ ············
│   │   │   ├── Tag.tsx                ← [LABEL] bracket syntax, yellow border
│   │   │   ├── StatusBadge.tsx        ← [PLAYING] [PAUSED] [BUFFERING] states
│   │   │   └── Cursor.tsx             ← blinking block cursor — 500ms hard toggle
│   │   │
│   │   ├── matrix/
│   │   │   ├── MatrixCanvas.tsx       ← canvas component, full viewport, z-index 0
│   │   │   ├── useMatrixRain.ts       ← canvas animation loop, column state, char set
│   │   │   └── useBeatDetection.ts    ← web audio analysernode → beat data → matrix params
│   │   │
│   │   ├── player/
│   │   │   ├── PlayerShell.tsx        ← root player layout — matrix bg + UI overlay
│   │   │   ├── NowPlaying.tsx         ← track title, artist, album — terminal formatted
│   │   │   ├── Controls.tsx           ← ▶ ■ ↑ ↓ — ASCII/unicode controls, no icons lib
│   │   │   ├── ProgressBar.tsx        ← flat rect progress, no radius, green fill
│   │   │   ├── VolumeControl.tsx      ← CLI-style: [████░░░░] volume display
│   │   │   ├── TrackList.tsx          ← dense log-style track list, left-aligned
│   │   │   └── TrackRow.tsx           ← single track row, bottom border only
│   │   │
│   │   └── layout/
│   │       ├── TerminalWindow.tsx     ← macOS chrome wrapper (only rounded element)
│   │       └── Shell.tsx              ← global shell — handles auth state, layout zones
│   │
│   ├── lib/
│   │   ├── spotify.ts                 ← spotify api client (fetch wrappers, token handling)
│   │   ├── auth.ts                    ← oauth flow helpers, token storage (httpOnly cookies)
│   │   ├── audio.ts                   ← web audio api setup, analysernode helpers
│   │   ├── beat.ts                    ← beat detection algorithm (frequency threshold + BPM)
│   │   └── ascii.ts                   ← divider generators, ASCII art strings
│   │
│   ├── hooks/
│   │   ├── useSpotifyPlayer.ts        ← spotify web playback sdk init + state
│   │   ├── useCurrentTrack.ts         ← polls /api/spotify/current-track
│   │   ├── useAudioFeatures.ts        ← fetches track tempo/energy on track change
│   │   ├── useTypewriter.ts           ← char-by-char text reveal, fixed interval
│   │   └── useCursorBlink.ts          ← 500ms binary blink state
│   │
│   ├── stores/
│   │   └── playerStore.ts             ← zustand — playback state, beat data, matrix params
│   │
│   ├── types/
│   │   ├── spotify.ts                 ← spotify api response types
│   │   ├── beat.ts                    ← beat detection output types
│   │   └── matrix.ts                  ← matrix rain config types
│   │
│   └── styles/
│       ├── tokens.css                 ← CSS custom properties — single source of truth
│       └── crt.css                    ← optional scan-line + CRT grain utilities
│
├── tailwind.config.ts                 ← taste overrides (see below)
├── tsconfig.json
├── next.config.ts
└── package.json
```

---

## tokens.css

```css
:root {
  /* backgrounds */
  --bg-base:          #000000;
  --bg-surface:       #0E1410;

  /* greens — primary voice */
  --green-bright:     #00FF88;
  --green-mid:        #8AFF80;
  --green-dim:        #00FF9F;

  /* neutrals */
  --gray-muted:       #4A4A4A;
  --white:            #FFFFFF;

  /* accents — supporting only */
  --cyan:             #00FFFF;
  --magenta:          #FF00FF;
  --yellow:           #FFFF00;

  /* typography */
  --font-mono:        'JetBrains Mono', 'Fira Code', monospace;

  /* spacing — CLI rhythm */
  --space-xs:   4px;
  --space-sm:   8px;
  --space-md:  16px;
  --space-lg:  32px;
  --space-xl:  64px;

  /* borders */
  --border:           1px solid var(--cyan);
  --border-dim:       1px solid var(--gray-muted);
  --border-active:    1px solid var(--green-bright);
  --radius:           0px;

  /* glow — 1-2 focal points per view only */
  --glow-green:       0 0 8px var(--green-bright);
  --glow-cyan:        0 0 6px var(--cyan);
  --glow-matrix-head: 0 0 12px var(--green-bright);

  /* motion — linear only */
  --t-instant:        all 0.05s linear;
  --t-fast:           all 0.1s linear;
}
```

---

## tailwind.config.ts

```ts
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
```

---

## beat → matrix data flow

```
spotify web playback sdk
        ↓
  audio output stream
        ↓
  web audio api — AnalyserNode
        ↓
  beat.ts — frequency threshold analysis
  (bass bin energy spike = beat event)
        ↓
  playerStore.ts — beatIntensity: 0–1, bpm: number
        ↓
  useMatrixRain.ts — reads store each animation frame
        ↓
  MatrixCanvas.tsx — requestAnimationFrame loop

  column speed   = base + (beatIntensity × speedMultiplier)
  brightness     = base + (beatIntensity × brightnessMultiplier)
  density        = base + (beatIntensity × densityMultiplier)
  spawn rate     = new columns triggered on kick events
```

---

## spotify auth flow

```
/login
  → [AUTHENTICATE WITH SPOTIFY]
  → spotify oauth (scopes: streaming, user-read-playback-state,
    user-modify-playback-state, user-read-currently-playing)
  → callback → /api/auth/callback/route.ts
  → tokens stored in httpOnly cookies
  → redirect to /player
  → silent refresh via /api/auth/refresh/route.ts
```

---

## naming conventions

```
components/    PascalCase        MatrixCanvas.tsx, NowPlaying.tsx
hooks/         camelCase         useSpotifyPlayer.ts, useBeatDetection.ts
lib/           camelCase         spotify.ts, beat.ts
stores/        camelCase         playerStore.ts
types/         camelCase         spotify.ts, beat.ts
css classes    kebab-case        .btn-primary, .panel-surface
CSS tokens     --kebab-case      --green-bright, --glow-head
```

---

## key dependencies

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "typescript": "^5",
    "tailwindcss": "^3",
    "zustand": "^4",
    "framer-motion": "^11",
    "@spotify/web-playback-sdk": "latest"
  }
}
```

no icon libraries — unicode/ASCII symbols only.
no animation libraries for matrix rain — raw canvas only.
no component libraries — build from primitives.

---

> project: terminal-playlist
> taste ref: TASTE-RULES.md
> last updated: 2026-05
