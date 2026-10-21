import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';

const ROOT = process.cwd();
const ASSETS_DIR = path.join(ROOT, 'assets');
const FONTS_DIR = path.join(ROOT, 'scripts', 'fonts');

// Load Font
const fontMonoBuf = fs.readFileSync(path.join(FONTS_DIR, 'SpaceMono-Regular.ttf'));
const fontMono = opentype.parse(fontMonoBuf.buffer.slice(fontMonoBuf.byteOffset, fontMonoBuf.byteOffset + fontMonoBuf.byteLength));

// Load User's Screenshot
const imgBuf = fs.readFileSync(path.join(ASSETS_DIR, 'intro-custom.png'));
const imgBase64 = `data:image/png;base64,${imgBuf.toString('base64')}`;

function monoToPath(text, x, y, size) {
  const scale = size / fontMono.unitsPerEm;
  let curX = x;
  let paths = [];
  for (const ch of text) {
    const glyph = fontMono.charToGlyph(ch);
    const p = glyph.getPath(curX, y, size);
    paths.push(p.toPathData(2));
    curX += (glyph.advanceWidth || fontMono.unitsPerEm * 0.6) * scale;
  }
  return { pathData: paths.join(' '), width: curX - x };
}

function buildHero(theme) {
  const isDark = theme === 'dark';
  const windowBg = isDark ? '#14151f' : '#ffffff';
  const titlebarBg = isDark ? '#1c1d29' : '#f1f5f9';
  const border = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
  const innerDivider = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const urlBg = isDark ? '#0d0e15' : '#ffffff';
  const urlBorder = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.10)';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const shadowColor = isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.14)';

  // Text start at 555, baseline at 45.5 (centered inside pill [440, 28, 320, 26])
  const urlText = monoToPath('garvitsingla.in', 555, 45.5, 12);

  return `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 520" width="1200" height="520" role="img" aria-label="Garvit Singla — macOS Browser Mockup">
  <title>Garvit Singla — garvitsingla.in</title>
  <defs>
    <filter id="winShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="${shadowColor}" />
    </filter>
    <clipPath id="innerWindow">
      <rect x="20" y="20" width="1160" height="478" rx="14" />
    </clipPath>
    <clipPath id="bodyContent">
      <rect x="20" y="62" width="1160" height="436" />
    </clipPath>
  </defs>

  <!-- Floating Window with Drop Shadow -->
  <g filter="url(#winShadow)">
    <rect x="20" y="20" width="1160" height="478" rx="14" fill="${windowBg}" stroke="${border}" stroke-width="1.2" />

    <g clip-path="url(#innerWindow)">
      <!-- Title Bar -->
      <rect x="20" y="20" width="1160" height="42" fill="${titlebarBg}" />
      <line x1="20" y1="62" x2="1180" y2="62" stroke="${innerDivider}" stroke-width="1" />

      <!-- Traffic Light Controls -->
      <circle cx="46" cy="41" r="6" fill="#ff5f56" stroke="#e0443e" stroke-width="0.5" />
      <circle cx="66" cy="41" r="6" fill="#ffbd2e" stroke="#dea123" stroke-width="0.5" />
      <circle cx="86" cy="41" r="6" fill="#27c93f" stroke="#1aab29" stroke-width="0.5" />

      <!-- Centered URL Badge -->
      <g>
        <rect x="440" y="28" width="320" height="26" rx="7" fill="${urlBg}" stroke="${urlBorder}" stroke-width="1" />
        
        <!-- Lock Icon -->
        <g transform="translate(534, 34)" fill="${textColor}" stroke="${textColor}">
          <rect x="0" y="5" width="12" height="9" rx="2" fill="${textColor}" stroke="none" />
          <path d="M 2 5 L 2 3.5 C 2 1.6 3.8 0 6 0 C 8.2 0 10 1.6 10 3.5 L 10 5" fill="none" stroke="${textColor}" stroke-width="1.4" stroke-linecap="round" />
        </g>

        <!-- URL Text -->
        <path d="${urlText.pathData}" fill="${textColor}" />
      </g>

      <!-- Screenshot Body Content -->
      <g clip-path="url(#bodyContent)">
        <image x="20" y="62" width="1160" height="436" preserveAspectRatio="xMidYMid slice" xlink:href="${imgBase64}" />
      </g>
    </g>
  </g>
</svg>
  `.trim();
}

console.log('Generating hero SVGs with custom screenshot...');
fs.writeFileSync(path.join(ASSETS_DIR, 'hero-dark.svg'), buildHero('dark'));
fs.writeFileSync(path.join(ASSETS_DIR, 'hero-light.svg'), buildHero('light'));
console.log('Successfully generated assets/hero-dark.svg and assets/hero-light.svg');
