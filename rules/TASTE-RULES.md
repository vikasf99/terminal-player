# TASTE RULES — terminal-playlist
> source of truth for all visual, motion, and code decisions
> derived from: TASTE-SKILL.md (reference image analysis)

---

## emotional core

developer-native nostalgia meets contemporary refinement.
every decision should feel like it was **typed, not designed**.
CLI authenticity with just enough polish to feel intentional — never accidental.

---

## color

```
--bg-base:       #000000   canvas — always pure black, non-negotiable
--bg-surface:    #0E1410   near-black for panels, sidebars, overlays
--green-bright:  #00FF88   primary text, active states, brand moments
--green-mid:     #8AFF80   secondary text, hover, inactive labels
--green-dim:     #00FF9F   tertiary, decorative, matrix rain characters
--gray-muted:    #4A4A4A   disabled, timestamps, metadata
--white:         #FFFFFF   primary content anchors

--cyan:          #00FFFF   borders, structural dividers — supporting only
--magenta:       #FF00FF   warnings, errors — supporting only
--yellow:        #FFFF00   labels, tags — supporting only
```

**rules:**
- background is always `#000000` or `#0E1410`. never off-white. never dark gray. never #111 warming to blue.
- primary accent is always matrix-green (`#00FF88`–`#8AFF80`). never teal. never sage. never desaturated or pastel.
- hierarchy via **brightness only** — not font weight, not size variation.
- cyan / magenta / yellow are supporting players. never dominant.
- one exception allowed: isolated contained contexts (e.g. modal headers) can use a single contrasting bg — but black + matrix-green is always canonical.

---

## typography

- font: **monospace only** — `JetBrains Mono`, `Fira Code`, `Courier New`, system monospace fallback. zero exceptions.
- weight: **medium (400)** only. no bold. no thin. hierarchy = brightness, not weight.
- case: **UPPERCASE** for headings, labels, status indicators. **lowercase** for body, data, metadata. **NO Title Case** — reads as corporate and polished, wrong register entirely.
- line-height: generous (`1.6–1.8`) for sparse product views, tight (`1.2–1.3`) for dense data/log views.
- letter-spacing: default or tighter. never `tracking-wider` on body copy.
- zero typographic ornament. no ligatures as design gestures. purely utilitarian.
- aliased or minimally anti-aliased rendering preferred — preserves pixelated bitmap aesthetic.

---

## layout & space

- **left-aligned by default.** centered only for single-column terminal output contexts (now playing, full-screen mode).
- ASCII dividers separate content zones — not margins alone:
  ```
  ──────────────────────────────────
  ············
  │ content  │
  [  label  ]
  > input line
  ```
- indentation via dashes and spaces, not padding alone — mirrors real CLI hierarchy.
- two-column asymmetric layouts allowed for product/info views.
- margins: either **zero bleed** (text to edge) or **extreme isolation**. never timid mid-range padding.
- density scales with context: sparse for product/brand surfaces, high-density for data/logs/track lists.
- no equal-gutter card grids. no consistent column widths. use CLI-style stacking instead.

---

## borders & shape

- all UI elements: **hard-edged rectangles**. 1px solid borders. always.
- active/focused borders: `--green-bright`
- structural/idle borders: `--cyan`
- disabled/secondary borders: `--gray-muted`
- **NO rounded corners** on buttons, inputs, cards, modals, panels, tags.
- **one exception**: terminal window chrome (macOS-style container) may use `border-radius: 6px`. this is the only 3D/dimensional element permitted.
- **NO box-shadow.** NO drop-shadow. NO inset-shadow. depth = luminosity only.

---

## texture & depth

- **radically flat.** no gradients. no layering effects. no glassmorphism. no backdrop-filter blur.
- depth cues: luminosity variation only — bright elements advance, dim elements recede.
- optional atmospheric treatments (use sparingly):
  - faint scan-line overlay at ≤10% opacity
  - subtle CRT grain texture — never obscuring readability
- **phosphor glow**: `text-shadow: 0 0 8px currentColor` — apply to **1–2 focal points per view only.** never global. mimics CRT phosphor decay.
- matrix rain canvas sits behind all UI — it IS the depth. UI layers are flat above it.

---

## motion

- **default: instant.** state swaps happen immediately. no transitions unless functionally necessary.
- **permitted**: `transition: all 0.05s–0.1s linear` for hover states only.
- **text reveal**: character-by-character typewriter (mechanical, fixed interval) OR all-at-once state swap. no fade-in. no slide-in.
- **cursor blink**: hard binary toggle at 500ms fixed interval. no fade blink.
- **matrix rain**: slow continuous vertical drift — meditative, hypnotic. this is the one kinetic background state. foreground interactions remain instantaneous.
- **beat pulses**: brightness spike on beat detection — instantaneous flash, no easing, natural decay via luminosity falloff.
- **NO** `ease-in-out`. **NO** `cubic-bezier`. **NO** spring physics. **NO** elastic bounce. **NO** organic motion of any kind.
- animation budget: near-zero for UI. spend it on beat-reactive feedback and matrix rain only.

---

## matrix rain — specific rules

the matrix rain is the visual centrepiece. it is **functional art**, not decoration.

- characters: mix of katakana, latin, numerals, and symbols — `ｦｱｲｳｴｵ0123456789!@#$%`
- color: `--green-dim` (#00FF9F) for falling characters, `--green-bright` (#00FF88) for head/leading character
- head character gets phosphor glow: `text-shadow: 0 0 12px #00FF88`
- speed, density, and brightness react to **beat intensity** from audio analysis:
  - on kick/bass hit: speed spike + brightness flash
  - sustained energy: increased column density
  - silence/quiet: slow drift, dim, sparse columns
- render on `<canvas>` — no DOM-based alternatives. raw canvas only for performance.
- canvas sits at `z-index: 0`, full viewport. UI layers sit above at `z-index: 10+`.
- rain never pauses. even at silence it drifts — it breathes with the music.

---

## authentic terminal syntax — use these

```
~/music/playlist          file paths
user@host:~$              shell prompts  
[NOW PLAYING]             bracket labels — UPPERCASE
[PAUSED]  [BUFFERING]     status states
> search tracks           input prefix
──────────────────        solid dividers
············              dotted dividers
│ track title │           pipe containers
--shuffle --repeat        flag-style options
~~removed track~~         strikethrough for unavailable
▶ ■ ↑ ↓ ←  →            unicode functional icons (no emoji icons in UI chrome)
```

inject humanity via: unexpected Japanese characters in filenames, emoji in error/empty states, unicode symbols breaking ASCII purity — surprises in the sterile technical environment.

---

## ASCII art

use mixed characters `# + * % = : . * ░ ▒ ▓` for logos, dividers, and decorative elements.
creates organic contrast against clean monospace while staying terminal-true.

```
 ████████╗███╗   ██╗██████╗
 ╚══██╔══╝████╗  ██║██╔══██╗
    ██║   ██╔██╗ ██║██████╔╝
    ██║   ██║╚██╗██║██╔═══╝
    ██║   ██║ ╚████║██║
    ╚═╝   ╚═╝  ╚═══╝╚═╝
```

---

## anti-patterns — never do this

| ❌ what                            | why                                          |
|------------------------------------|----------------------------------------------|
| rounded corners on UI elements     | reads soft/consumer — wrong register         |
| box-shadow or drop-shadow          | depth via luminosity only                    |
| gradients anywhere                 | flat is the rule, always                     |
| ease-in-out / cubic-bezier motion  | organic motion breaks CLI snappiness         |
| Title Case in labels               | too polished, too corporate                  |
| sans-serif or display fonts        | monospace is non-negotiable                  |
| bold weight for emphasis           | use brightness, not weight                   |
| pastel or desaturated greens       | full saturation or near-zero, nothing between|
| glassmorphism / backdrop blur      | belongs to a different aesthetic entirely    |
| consistent card grids              | CLI stacking, not design-system grids        |
| tailwind `rounded-lg`              | always override to `rounded-none`            |
| tailwind `shadow-md`               | no shadows, ever                             |
| tailwind `ease-in-out`             | always `linear`                              |
| tailwind `font-bold`               | brightness for hierarchy, not weight         |
| `bg-gray-900`                      | too blue/warm — use `#000` or `#0E1410`      |

---

## component reference

| component      | bg            | border               | radius | shadow |
|----------------|---------------|----------------------|--------|--------|
| button         | `--bg-base`   | 1px `--cyan`         | 0      | none   |
| input          | `--bg-base`   | 1px `--gray-muted` + active bottom `--green-bright` | 0 | none |
| panel/card     | `--bg-surface`| 1px `--cyan`         | 0      | none   |
| modal          | `--bg-surface`| 1px `--green-bright` | 0      | none   |
| tag/badge      | `--bg-base`   | 1px `--yellow`       | 0      | none   |
| terminal chrome| `--bg-surface`| 1px `--gray-muted`   | 6px ✓  | none   |
| track row      | transparent   | bottom 1px `--gray-muted` | 0 | none  |
| progress bar   | `--gray-muted`| none                 | 0      | none   |

---

## motion reference

| action              | timing              | curve    |
|---------------------|---------------------|----------|
| hover state         | 0.05–0.1s           | linear   |
| active/press        | instant             | —        |
| text typewriter     | fixed char interval | none     |
| cursor blink        | 500ms toggle        | none     |
| matrix rain drift   | slow continuous     | linear   |
| beat pulse flash    | instant on, decay   | linear   |
| modal open/close    | instant             | —        |
| track change        | instant             | —        |
| volume/seek         | instant feedback    | —        |
