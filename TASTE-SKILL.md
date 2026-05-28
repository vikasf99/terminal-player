# Taste Profile — terminal-playlist

## Emotional Core
Developer-native nostalgia meets contemporary refinement — a confident technical aesthetic that honors hacker culture without drowning in skeuomorphism, balancing CLI authenticity with just enough polish to feel intentional rather than accidental.

## Color Language
**Foundational black** (#000000, occasionally near-black #0E1410) as the non-negotiable canvas. **Electric matrix-green** as the dominant voice — ranging from bright lime (#00FF00, #8AFF80) to cyan-infused green (#00FF88, #00FF9F) depending on emphasis level, with cooler cyan-greens signaling brand moments and warmer lime-greens for active states. **Muted grays** (#4A4A4A range) hold secondary information without competing. **Pure white** (#FFFFFF) anchors primary content. Accent palette borrows from classic terminal environments: cyan (#00FFFF) for borders/structure, magenta (#FF00FF) for warnings, yellow-gold (#FFFF00) for labels — but these remain supporting players, never overwhelming the green dominance. One outlier (Reference 5's royal blue background) suggests flexibility for contained contexts, but black + matrix-green is the canonical pairing.

## Typography Direction
Strictly **monospace with mechanical rhythm** — fixed-width characters creating satisfying vertical alignment and tabular precision. Medium weight with no bold styling (hierarchy comes from color and spacing, not weight variation). Line-height trends toward **generous breathing room** in sparse layouts (Reference 1) but **tightens to dense stacking** when displaying data or code blocks (References 3, 4). Zero typographic ornament — this is utilitarian type that embraces its terminal lineage with pride. Aliased or minimally anti-aliased rendering preserves the pixelated bitmap aesthetic without becoming illegible.

## Layout & Space
**No consistent grid** — spatial logic follows terminal/CLI conventions: strict left-alignment, hierarchical indentation using dashes and spaces, content zones separated by ASCII dividers (dotted lines, pipes, brackets). Reference 1 introduces **asymmetric two-column thinking** with generous negative space isolating blocks, while References 3-4 default to **centered single-column terminal output**. Reference 2 breaks the pattern entirely with **cascading vertical streams** and infinite bleed, suggesting that structured layouts can occasionally dissolve into kinetic data fields. Margins range from **zero bleed** (text-to-edge) to **extreme isolation** — never timid mid-range padding. Density varies by context: sparse when presenting product/brand information, **high-density when displaying data/logs**.

## Texture & Depth
**Radically flat** — no gradients, no drop shadows on UI elements, no layering effects. The only depth cues are **luminosity variation** (bright elements advance, dim elements recede) and **subtle phosphor glow** on the brightest text (Reference 2's gaussian bloom). Physical materiality is **matte digital** — think anti-aliased pixels on a modern display, not glossy glass or paper texture. Optional: faint **scan-line texture or CRT grain** as atmospheric treatment, but never heavy enough to obscure readability. When terminal window chrome appears (Reference 1's rounded corners, macOS traffic lights), it's the **only permitted dimensional element** — a container acknowledging the interface as software, not reality.

## Motion Principles
**Instant or near-instant** — transitions honor CLI snappiness where commands execute and redraw immediately. No easing curves, no elastic bounce, no gentle fades. Text reveals happen **character-by-character with mechanical typewriter precision** or all-at-once state swaps. Cursor blink operates on **hard binary toggle** at fixed intervals. The one exception: Reference 2's **slow, continuous vertical drift** suggests that kinetic background states can be meditative and hypnotic, but foreground interactions remain **instantaneous**. Animation budget is near-zero — spend it on functional feedback (active state changes, data loading) not decorative flourishes.

## The Details That Matter

- **ASCII art as brand texture**: Use mixed characters (#+*%=:.*) to build logos, dividers, and decorative elements — creates organic contrast against clean monospace text while staying true to terminal constraints (Reference 1).

- **Authentic shell formatting**: Incorporate real CLI syntax — tildes, @-signs, bracket notation, pipe separators, strikethrough for deprecated/crossed-out items — to ground the interface in developer muscle memory (References 1, 4, 5).

- **Luminosity-based hierarchy**: Brightest green = foreground/active, mid-tone green = secondary content, dimmest green/gray = background/disabled. Never use stroke weight or size to create emphasis — brightness is the variable (Reference 2).

- **Selective glow/bloom on hotspots**: Apply subtle gaussian blur to the brightest interactive elements or brand text, mimicking CRT phosphor decay — but only on **1-2 focal points per view** to preserve flatness elsewhere (Reference 2).

- **Cultural/linguistic friction points**: Embed unexpected characters (Japanese text in filenames, emoji in error messages, Unicode symbols breaking ASCII purity) to inject humanity and surprise into the sterile technical environment (Reference 3).

## Anti-Patterns — Never Do This

- **No rounded corners on UI elements** (except terminal window chrome itself) — buttons, cards, panels remain hard-edged rectangles with single-pixel borders.

- **No soft shadows or layering effects** — depth comes from color brightness only, never from z-axis simulation via drop shadows or blurs.

- **No smooth easing curves** — avoid ease-in-out, cubic-bezier, spring physics — motion is linear or instantaneous, never organic.

- **No mixed-case in headers or labels** — prefer UPPERCASE for emphasis or lowercase for body, but avoid Title Case which reads as overly polished/corporate.

- **No photorealistic textures or skeuomorphism** — no paper grain, no leather, no wood — this is pure digital abstraction.

- **No pastel or desaturated greens** — the palette lives at **full saturation** (matrix-green) or near-zero (grays), nothing in between reads as wishy-washy.

## Cursor Instruction Summary

When generating UI for this project: use pure black backgrounds with electric matrix-green (#00FF88 to #8AFF80 range) as the primary text/accent color, strict monospace typography with mechanical spacing, and radically flat layouts that follow CLI conventions (left-alignment, ASCII dividers, tabular indentation). Motion should be instant or linear — no easing — and hierarchy comes from brightness variation, not font weight or shadows. Embrace authentic terminal syntax (brackets, pipes, tildes) and pixel-perfect borders while allowing occasional phosphor glow on focal points.