# how this profile is made

This profile README mirrors the design, typography, and interactive aesthetic of **[garvitsingla.in](https://garvitsingla.in)**.

### 1. Vector Path Baking (`scripts/build_assets.mjs`)
GitHub README images rendered via `<img>` cannot load external web fonts. To guarantee 100% pixel-perfect rendering across macOS, Windows, Linux, iOS, and Android without missing fonts or system font mismatches, all text is mathematically parsed and outlined directly into raw SVG vector path coordinates (`<path d="...">`) using `opentype.js`.

* **Gloria Hallelujah** (the handwriting font used on `garvitsingla.in`) is baked into vector curves for `hey i am`, `garvit singla`, `engineer`, `✎ sketch`, and section labels.
* **Space Mono** (monospaced systems font) is outlined character-by-character into path coordinates for the bio paragraph and telemetry bar.
* **Garvit's Portrait**: Encoded directly as an inlined base64 JPEG inside an authentic Polaroid frame with washi tape, drop shadows, and handwriting annotations.

### 2. Dual-Theme Support
Every graphic comes in a pair (`*-dark.svg` and `*-light.svg`) toggled via GitHub's native HTML `<picture>` mechanism:
* **Dark Mode**: Deep midnight background (`#090a0f`), drifting ambient radial glow orbs (`#f59e0b` amber, `#38bdf8` cyan, `#818cf8` indigo), subtle dot grid, and high-contrast glowing highlighter pills.
* **Light Mode**: Warm sketchbook paper (`#fdfbf7`), craft washi tape, warm card stock (`#faf7ee`), and rich dark ink lines (`#09090b`).

### 3. Stroke-by-Stroke Handwriting Animation
The name `garvit singla` and the signature squiggle underline from `garvitsingla.in` use `stroke-dasharray` and `stroke-dashoffset` CSS keyframe animations to smoothly draw themselves onto the screen when the page loads.

### 4. Regeneration
To modify colors, text, or rebuild the assets:
```bash
npm install
npm run build
```
All outputs are compiled into `assets/`.
