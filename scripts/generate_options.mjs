import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';

const ROOT = process.cwd();
const ASSETS_DIR = path.join(ROOT, 'assets');
const FONTS_DIR = path.join(ROOT, 'scripts', 'fonts');

// Load Fonts
const fontGloriaBuf = fs.readFileSync(path.join(FONTS_DIR, 'GloriaHallelujah.ttf'));
const fontGloria = opentype.parse(fontGloriaBuf.buffer.slice(fontGloriaBuf.byteOffset, fontGloriaBuf.byteOffset + fontGloriaBuf.byteLength));

const fontMonoBuf = fs.readFileSync(path.join(FONTS_DIR, 'SpaceMono-Regular.ttf'));
const fontMono = opentype.parse(fontMonoBuf.buffer.slice(fontMonoBuf.byteOffset, fontMonoBuf.byteOffset + fontMonoBuf.byteLength));

// Load Avatar
const avatarBuf = fs.readFileSync(path.join(ASSETS_DIR, 'avatar.jpg'));
const avatarBase64 = `data:image/jpeg;base64,${avatarBuf.toString('base64')}`;

// Load Screenshots
const introDarkBuf = fs.readFileSync(path.join(ASSETS_DIR, 'intro-dark.png'));
const introDarkBase64 = `data:image/png;base64,${introDarkBuf.toString('base64')}`;

const introLightBuf = fs.readFileSync(path.join(ASSETS_DIR, 'intro-light.png'));
const introLightBase64 = `data:image/png;base64,${introLightBuf.toString('base64')}`;

// Helpers
function textToPath(font, text, x, y, size) {
  return font.getPath(text, x, y, size).toPathData(2);
}

function monoToPath(text, x, y, size, letterSpacing = 0) {
  const scale = size / fontMono.unitsPerEm;
  let curX = x;
  let paths = [];
  for (const ch of text) {
    const glyph = fontMono.charToGlyph(ch);
    const p = glyph.getPath(curX, y, size);
    paths.push(p.toPathData(2));
    curX += ((glyph.advanceWidth || fontMono.unitsPerEm * 0.6) * scale) + letterSpacing;
  }
  return { pathData: paths.join(' '), width: curX - x };
}

// ═══════════════════════════════════════════════════════════════════════
// OPTION 1: macOS / ARC BROWSER WINDOW FRAME
// ═══════════════════════════════════════════════════════════════════════
function buildOption1(theme) {
  const isDark = theme === 'dark';
  const bg = isDark ? '#090a0f' : '#fdfbf7';
  const windowBg = isDark ? '#14151f' : '#ffffff';
  const titlebarBg = isDark ? '#1c1d29' : '#f4f4f5';
  const border = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.10)';
  const urlBg = isDark ? '#0d0e14' : '#ffffff';
  const urlBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const shadowColor = isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.12)';
  const imgData = isDark ? introDarkBase64 : introLightBase64;

  const urlText = monoToPath('garvitsingla.in', 545, 26, 11);

  return `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 460" width="1200" height="460" role="img" aria-label="Garvit Singla — macOS Browser Mockup">
  <defs>
    <filter id="winShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="${shadowColor}" />
    </filter>
    <clipPath id="innerClip">
      <rect x="20" y="20" width="1160" height="415" rx="14" />
    </clipPath>
    <clipPath id="contentClip">
      <rect x="20" y="58" width="1160" height="377" />
    </clipPath>
  </defs>

  <!-- Window Container with Drop Shadow -->
  <g filter="url(#winShadow)">
    <rect x="20" y="20" width="1160" height="415" rx="14" fill="${windowBg}" stroke="${border}" stroke-width="1.2" />

    <g clip-path="url(#innerClip)">
      <!-- Title Bar -->
      <rect x="20" y="20" width="1160" height="38" fill="${titlebarBg}" />
      <line x1="20" y1="58" x2="1180" y2="58" stroke="${border}" stroke-width="1" />

      <!-- Traffic Light Controls -->
      <circle cx="44" cy="39" r="6" fill="#ff5f56" stroke="#e0443e" stroke-width="0.5" />
      <circle cx="64" cy="39" r="6" fill="#ffbd2e" stroke="#dea123" stroke-width="0.5" />
      <circle cx="84" cy="39" r="6" fill="#27c93f" stroke="#1aab29" stroke-width="0.5" />

      <!-- Centered URL Badge -->
      <g>
        <rect x="420" y="27" width="360" height="24" rx="6" fill="${urlBg}" stroke="${urlBorder}" stroke-width="1" />
        <!-- Lock Icon -->
        <path d="M 528 35 L 536 35 L 536 33 C 536 31 534 29 532 29 C 530 29 528 31 528 33 Z M 526 35 L 538 35 L 538 42 L 526 42 Z" fill="${textColor}" />
        <path d="${urlText.pathData}" fill="${textColor}" />
      </g>

      <!-- Screenshot Body -->
      <g clip-path="url(#contentClip)">
        <image x="20" y="58" width="1160" height="377" preserveAspectRatio="xMidYMid slice" xlink:href="${imgData}" />
      </g>
    </g>
  </g>
</svg>
  `.trim();
}

// ═══════════════════════════════════════════════════════════════════════
// OPTION 2: STUDIO DESK / SKETCHBOOK CANVAS
// ═══════════════════════════════════════════════════════════════════════
function buildOption2(theme) {
  const isDark = theme === 'dark';
  const bg = isDark ? '#090a0f' : '#fdfbf7';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : '#e7e1d0';
  const textPrimary = isDark ? '#fafafa' : '#09090b';
  const textSecondary = isDark ? '#cbd5e1' : '#475569';
  const textMuted = isDark ? '#94a3b8' : '#71717a';
  const accentAmber = isDark ? '#f59e0b' : '#b45309';
  const polaroidBg = isDark ? '#161722' : '#ffffff';
  const polaroidBorder = isDark ? 'rgba(255, 255, 255, 0.14)' : '#e2d9cc';
  const tapeBg = isDark ? 'rgba(245, 158, 11, 0.28)' : 'rgba(217, 160, 102, 0.45)';
  const tapeBorder = isDark ? 'rgba(245, 158, 11, 0.45)' : 'rgba(133, 86, 39, 0.35)';

  const heyPath = textToPath(fontGloria, 'hey i am', 330, 130, 24);
  const namePath = textToPath(fontGloria, 'garvit singla', 330, 195, 52);
  const engineerPath = textToPath(fontGloria, 'engineer', 692, 195, 20);
  const polaroidCaption = textToPath(fontGloria, 'garvit', 145, 345, 18);
  const sketchTag = textToPath(fontGloria, '✎ sketch', 62, 385, 13);
  const squigglePath = 'M 332 208 C 397 201 492 202 652 206 C 560 210 411 209 346 210';

  const bio1 = monoToPath('Software engineer obsessed with low-level systems, C/C++, Rust, and graphics.', 330, 255, 14);
  const bio2 = monoToPath('Exploring foundational computing from network protocols to memory management.', 330, 288, 14);
  const bio3 = monoToPath('Building performant tools and understanding computers from the metal up.', 330, 321, 14);
  const status = monoToPath('IST (UTC+5:30) · CHITKARA · OPEN SOURCE EXECUTIVE', 362, 75, 11);

  return `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 450" width="1200" height="450" role="img" aria-label="Garvit Singla — Sketchbook Canvas">
  <defs>
    <clipPath id="cardClip2"><rect width="1200" height="450" rx="24" /></clipPath>
    <clipPath id="avatarClip2"><rect x="50" y="55" width="200" height="235" rx="6" /></clipPath>
    <filter id="pShadow"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(80,50,15,0.12)'}" /></filter>
  </defs>

  <g clip-path="url(#cardClip2)">
    <rect width="1200" height="450" fill="${bg}" />

    <!-- Ambient Glow / Grid -->
    ${isDark ? '<circle cx="1000" cy="80" r="280" fill="#f59e0b" opacity="0.12" /><circle cx="200" cy="400" r="260" fill="#38bdf8" opacity="0.10" />' : ''}

    <!-- Polaroid on Left -->
    <g transform="translate(48, 35) rotate(-1.5 150 180)" filter="url(#pShadow)">
      <rect x="35" y="40" width="230" height="325" rx="10" fill="${polaroidBg}" stroke="${polaroidBorder}" stroke-width="1.2" />
      <image x="50" y="55" width="200" height="235" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarClip2)" xlink:href="${avatarBase64}" />
      <path d="${polaroidCaption}" fill="${textSecondary}" />

      <!-- Washi tape -->
      <g transform="translate(115, 30) rotate(-3)">
        <rect x="0" y="0" width="70" height="20" rx="3" fill="${tapeBg}" stroke="${tapeBorder}" stroke-width="1" />
      </g>
    </g>

    <g transform="rotate(-5 80 415)">
      <path d="${sketchTag}" fill="${textMuted}" opacity="0.9" />
    </g>

    <!-- Main Right Content -->
    <!-- Status Pill -->
    <rect x="330" y="54" width="370" height="30" rx="15" fill="${isDark ? '#14151f' : '#f4ede0'}" stroke="${cardBorder}" stroke-width="1" />
    <circle cx="346" cy="69" r="4.5" fill="#22c55e" />
    <path d="${status.pathData}" fill="${textMuted}" />

    <!-- Intro & Name -->
    <path d="${heyPath}" fill="${accentAmber}" />
    <path d="${namePath}" fill="${textPrimary}" />
    <g transform="translate(0, 0)">
      <rect x="682" y="174" width="95" height="28" rx="6" fill="${isDark ? 'rgba(245,158,11,0.18)' : '#fef3c7'}" stroke="${accentAmber}" stroke-width="0.8" />
      <path d="${engineerPath}" fill="${accentAmber}" />
    </g>
    <path d="${squigglePath}" fill="none" stroke="${accentAmber}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Bio lines -->
    <path d="${bio1.pathData}" fill="${textSecondary}" />
    <path d="${bio2.pathData}" fill="${textSecondary}" />
    <path d="${bio3.pathData}" fill="${textSecondary}" />

    <!-- Skill Pills -->
    <g transform="translate(330, 375)">
      <rect x="0" y="0" width="85" height="26" rx="13" fill="${isDark ? '#161824' : '#f4ede0'}" stroke="${cardBorder}" stroke-width="1" />
      <path d="${monoToPath('C / C++', 16, 17, 11).pathData}" fill="${textSecondary}" />

      <rect x="95" y="0" width="70" height="26" rx="13" fill="${isDark ? '#161824' : '#f4ede0'}" stroke="${cardBorder}" stroke-width="1" />
      <path d="${monoToPath('Rust', 16, 17, 11).pathData}" fill="${textSecondary}" />

      <rect x="175" y="0" width="135" height="26" rx="13" fill="${isDark ? '#161824' : '#f4ede0'}" stroke="${cardBorder}" stroke-width="1" />
      <path d="${monoToPath('POSIX Sockets', 16, 17, 11).pathData}" fill="${textSecondary}" />

      <rect x="320" y="0" width="165" height="26" rx="13" fill="${isDark ? '#161824' : '#f4ede0'}" stroke="${cardBorder}" stroke-width="1" />
      <path d="${monoToPath('RFC 1035 / DNS Wire', 16, 17, 11).pathData}" fill="${textSecondary}" />

      <rect x="495" y="0" width="115" height="26" rx="13" fill="${isDark ? '#161824' : '#f4ede0'}" stroke="${cardBorder}" stroke-width="1" />
      <path d="${monoToPath('WebSockets', 16, 17, 11).pathData}" fill="${textSecondary}" />
    </g>
  </g>
  <rect x="0.75" y="0.75" width="1198.5" height="448.5" rx="23.25" fill="none" stroke="${cardBorder}" stroke-width="1.5" />
</svg>
  `.trim();
}

// ═══════════════════════════════════════════════════════════════════════
// OPTION 3: MINIMALIST DEVELOPER CARD (LINEAR / APPLE STYLE)
// ═══════════════════════════════════════════════════════════════════════
function buildOption3(theme) {
  const isDark = theme === 'dark';
  const bg = isDark ? '#0c0d14' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0';
  const textPrimary = isDark ? '#ffffff' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const accentAmber = isDark ? '#f59e0b' : '#d97706';

  const name = monoToPath('GARVIT SINGLA', 240, 105, 34);
  const subtitle = monoToPath('Software Engineer · Low-Level Systems, Networking & Graphics', 240, 142, 14);
  const bio = monoToPath('Exploring foundational computing from network protocols to memory management.', 240, 175, 13);
  const bio2 = monoToPath('Building performant tools and understanding computers from the metal up.', 240, 198, 13);

  return `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 310" width="1200" height="310" role="img" aria-label="Garvit Singla — Minimalist Developer Card">
  <defs>
    <clipPath id="cardClip3"><rect width="1200" height="310" rx="20" /></clipPath>
    <clipPath id="avatarCircle"><circle cx="120" cy="145" r="65" /></clipPath>
    <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
  </defs>

  <g clip-path="url(#cardClip3)">
    <rect width="1200" height="310" fill="${bg}" />

    <!-- Left: Circular Avatar with Gradient Ring -->
    <circle cx="120" cy="145" r="70" fill="none" stroke="url(#ringGrad)" stroke-width="2.5" />
    <image x="55" y="80" width="130" height="130" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarCircle)" xlink:href="${avatarBase64}" />

    <!-- Online Status Dot -->
    <circle cx="170" cy="195" r="12" fill="${bg}" />
    <circle cx="170" cy="195" r="8" fill="#22c55e" />

    <!-- Right: Typography & Content -->
    <path d="${name.pathData}" fill="${textPrimary}" />
    <path d="${subtitle.pathData}" fill="${accentAmber}" />
    <path d="${bio.pathData}" fill="${textSecondary}" />
    <path d="${bio2.pathData}" fill="${textSecondary}" />

    <!-- Pills -->
    <g transform="translate(240, 235)">
      <rect x="0" y="0" width="85" height="26" rx="6" fill="${isDark ? '#171926' : '#f1f5f9'}" stroke="${cardBorder}" stroke-width="1" />
      <path d="${monoToPath('C / C++', 14, 17, 11).pathData}" fill="${textSecondary}" />

      <rect x="95" y="0" width="65" height="26" rx="6" fill="${isDark ? '#171926' : '#f1f5f9'}" stroke="${cardBorder}" stroke-width="1" />
      <path d="${monoToPath('Rust', 14, 17, 11).pathData}" fill="${textSecondary}" />

      <rect x="170" y="0" width="130" height="26" rx="6" fill="${isDark ? '#171926' : '#f1f5f9'}" stroke="${cardBorder}" stroke-width="1" />
      <path d="${monoToPath('POSIX Sockets', 14, 17, 11).pathData}" fill="${textSecondary}" />

      <rect x="310" y="0" width="160" height="26" rx="6" fill="${isDark ? '#171926' : '#f1f5f9'}" stroke="${cardBorder}" stroke-width="1" />
      <path d="${monoToPath('RFC 1035 UDP / Wire', 14, 17, 11).pathData}" fill="${textSecondary}" />

      <rect x="480" y="0" width="110" height="26" rx="6" fill="${isDark ? '#171926' : '#f1f5f9'}" stroke="${cardBorder}" stroke-width="1" />
      <path d="${monoToPath('WebSockets', 14, 17, 11).pathData}" fill="${textSecondary}" />
    </g>

    <!-- Right-aligned action button -->
    <g transform="translate(1000, 45)">
      <rect x="0" y="0" width="145" height="34" rx="8" fill="${isDark ? '#181926' : '#f8fafc'}" stroke="${cardBorder}" stroke-width="1.2" />
      <path d="${monoToPath('garvitsingla.in ↗', 12, 21, 11).pathData}" fill="${accentAmber}" />
    </g>
  </g>
  <rect x="0.75" y="0.75" width="1198.5" height="308.5" rx="19.25" fill="none" stroke="${cardBorder}" stroke-width="1.5" />
</svg>
  `.trim();
}

// Build all options
console.log('Generating 3 Hero Design Options...');
for (const theme of ['dark', 'light']) {
  fs.writeFileSync(path.join(ASSETS_DIR, `opt1-browser-${theme}.svg`), buildOption1(theme));
  fs.writeFileSync(path.join(ASSETS_DIR, `opt2-sketchbook-${theme}.svg`), buildOption2(theme));
  fs.writeFileSync(path.join(ASSETS_DIR, `opt3-minimal-${theme}.svg`), buildOption3(theme));
}

console.log('Done! Generated all 3 design options in dark & light themes.');
