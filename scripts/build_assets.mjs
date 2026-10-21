import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';

const ROOT = process.cwd();
const ASSETS_DIR = path.join(ROOT, 'assets');
const FONTS_DIR = path.join(ROOT, 'scripts', 'fonts');

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// 1. Load Fonts
const fontGloriaBuf = fs.readFileSync(path.join(FONTS_DIR, 'GloriaHallelujah.ttf'));
const fontGloria = opentype.parse(fontGloriaBuf.buffer.slice(fontGloriaBuf.byteOffset, fontGloriaBuf.byteOffset + fontGloriaBuf.byteLength));

const fontMonoBuf = fs.readFileSync(path.join(FONTS_DIR, 'SpaceMono-Regular.ttf'));
const fontMono = opentype.parse(fontMonoBuf.buffer.slice(fontMonoBuf.byteOffset, fontMonoBuf.byteOffset + fontMonoBuf.byteLength));

// Helpers: Text to Path
function textToPath(font, text, x, y, size) {
  const p = font.getPath(text, x, y, size);
  return p.toPathData(2);
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

function getTextMetrics(font, text, size) {
  const box = font.getPath(text, 0, 0, size).getBoundingBox();
  return {
    width: box.x2 - box.x1,
    height: box.y2 - box.y1,
    box,
  };
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── THEMES DEFINITION ───────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: '#090a0f',
    cardBorder: 'rgba(255, 255, 255, 0.12)',
    textPrimary: '#fafafa',
    textSecondary: '#cbd5e1',
    accentAmber: '#f59e0b',
    gridColor: 'rgba(255, 255, 255, 0.05)',
    highlightBg1: 'rgba(245, 158, 11, 0.15)',
    highlightText1: '#fbbf24',
    highlightBorder1: 'rgba(245, 158, 11, 0.35)',
    highlightBg2: 'rgba(56, 189, 248, 0.15)',
    highlightText2: '#38bdf8',
    highlightBorder2: 'rgba(56, 189, 248, 0.35)',
    highlightBg3: 'rgba(129, 140, 248, 0.15)',
    highlightText3: '#a5b4fc',
    highlightBorder3: 'rgba(129, 140, 248, 0.35)',
  },
  light: {
    bg: '#fdfbf7',
    cardBorder: '#e7e1d0',
    textPrimary: '#09090b',
    textSecondary: '#475569',
    accentAmber: '#b45309',
    gridColor: 'rgba(100, 70, 30, 0.05)',
    highlightBg1: 'rgba(245, 158, 11, 0.16)',
    highlightText1: '#92400e',
    highlightBorder1: 'rgba(180, 83, 9, 0.28)',
    highlightBg2: 'rgba(2, 132, 199, 0.12)',
    highlightText2: '#0369a1',
    highlightBorder2: 'rgba(2, 132, 199, 0.28)',
    highlightBg3: 'rgba(99, 102, 241, 0.12)',
    highlightText3: '#4338ca',
    highlightBorder3: 'rgba(99, 102, 241, 0.28)',
  },
};

// ── 1. HERO SVG ────────────────────────────────────────────────────────
function buildHero(themeName) {
  const t = THEMES[themeName];
  const isDark = themeName === 'dark';
  const startX = 80;
  const H = 260;

  // Title paths
  const heyPath = textToPath(fontGloria, 'hey i am', startX, 68, 22);
  const namePath = textToPath(fontGloria, 'garvit singla', startX, 126, 48);
  const engineerPath = textToPath(fontGloria, 'engineer', startX + 322, 126, 18);

  // Squiggle Underline under garvit singla
  const squigglePath = `M ${startX + 2} 138 C ${startX + 67} 131 ${startX + 162} 132 ${startX + 305} 136 C ${startX + 215} 140 ${startX + 75} 139 ${startX + 15} 140`;

  // Ambient gradient blobs
  const ambientDef = isDark
    ? `
      <radialGradient id="orb1" cx="80%" cy="30%" r="60%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.18" />
        <stop offset="60%" stop-color="#f59e0b" stop-opacity="0.04" />
        <stop offset="100%" stop-color="#090a0f" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="orb2" cx="85%" cy="80%" r="50%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.14" />
        <stop offset="70%" stop-color="#38bdf8" stop-opacity="0.02" />
        <stop offset="100%" stop-color="#090a0f" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="orb3" cx="15%" cy="30%" r="40%">
        <stop offset="0%" stop-color="#818cf8" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#090a0f" stop-opacity="0" />
      </radialGradient>
    `
    : `
      <radialGradient id="orb1" cx="85%" cy="20%" r="50%">
        <stop offset="0%" stop-color="#fef3c7" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#fdfbf7" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="orb2" cx="15%" cy="80%" r="50%">
        <stop offset="0%" stop-color="#e0f2fe" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#fdfbf7" stop-opacity="0" />
      </radialGradient>
    `;

  // Grid pattern
  const gridDef = `
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="12" cy="12" r="1" fill="${t.gridColor}" />
    </pattern>
  `;

  // Tagline Lines using SpaceMono
  const bioY1 = 180;
  const bioY2 = 214;
  const fontSize = 13.5;

  // Line 1: I like understanding how things work [under the hood].
  const l1_a = monoToPath('I like understanding how things work ', startX, bioY1, fontSize);
  const l1_b_x = startX + l1_a.width;
  const l1_b = monoToPath('under the hood', l1_b_x, bioY1, fontSize);
  const l1_c_x = l1_b_x + l1_b.width;
  const l1_c = monoToPath('.', l1_c_x, bioY1, fontSize);

  // Line 2: Building across the stack, from [systems programming] in [C++] and [Rust] to [web development], [graphics], and [DevOps].
  let curX = startX;
  const l2_a = monoToPath('Building across the stack, from ', curX, bioY2, fontSize);
  curX += l2_a.width;

  const l2_hl1_x = curX;
  const l2_b = monoToPath('systems programming', curX, bioY2, fontSize);
  curX += l2_b.width;

  const l2_c = monoToPath(' in ', curX, bioY2, fontSize);
  curX += l2_c.width;

  const l2_hl2_x = curX;
  const l2_d = monoToPath('C++', curX, bioY2, fontSize);
  curX += l2_d.width;

  const l2_e = monoToPath(' and ', curX, bioY2, fontSize);
  curX += l2_e.width;

  const l2_hl3_x = curX;
  const l2_f = monoToPath('Rust', curX, bioY2, fontSize);
  curX += l2_f.width;

  const l2_g = monoToPath(' to ', curX, bioY2, fontSize);
  curX += l2_g.width;

  const l2_hl4_x = curX;
  const l2_h = monoToPath('web development', curX, bioY2, fontSize);
  curX += l2_h.width;

  const l2_i = monoToPath(', ', curX, bioY2, fontSize);
  curX += l2_i.width;

  const l2_hl5_x = curX;
  const l2_j = monoToPath('graphics', curX, bioY2, fontSize);
  curX += l2_j.width;

  const l2_k = monoToPath(', and ', curX, bioY2, fontSize);
  curX += l2_k.width;

  const l2_hl6_x = curX;
  const l2_l = monoToPath('DevOps', curX, bioY2, fontSize);
  curX += l2_l.width;

  const l2_m = monoToPath('.', curX, bioY2, fontSize);

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 ${H}" width="1200" height="${H}" role="img" aria-label="Garvit Singla — Software Engineer">
  <title>Garvit Singla — Software Engineer</title>
  <defs>
    <clipPath id="cardClip">
      <rect x="0" y="0" width="1200" height="${H}" rx="18" />
    </clipPath>
    ${ambientDef}
    ${gridDef}
  </defs>

  <style>
    .ambient-drift-1 {
      animation: drift1 28s ease-in-out infinite alternate;
    }
    .ambient-drift-2 {
      animation: drift2 34s ease-in-out infinite alternate;
    }
    @keyframes drift1 {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(-40px, 30px) scale(1.08); }
    }
    @keyframes drift2 {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(50px, -25px) scale(1.12); }
    }

    .anim-name {
      stroke-dasharray: 2200;
      stroke-dashoffset: 2200;
      animation: drawName 2.4s cubic-bezier(0.3, 0, 0.2, 1) 0.3s forwards;
    }
    @keyframes drawName {
      0% { stroke-dashoffset: 2200; fill-opacity: 0; }
      75% { stroke-dashoffset: 0; fill-opacity: 0; }
      100% { stroke-dashoffset: 0; fill-opacity: 1; }
    }

    .anim-squiggle {
      stroke-dasharray: 450;
      stroke-dashoffset: 450;
      animation: drawSquiggle 1.4s cubic-bezier(0.4, 0, 0.2, 1) 1.5s forwards;
    }
    @keyframes drawSquiggle {
      to { stroke-dashoffset: 0; }
    }

    .fade-up {
      opacity: 0;
      animation: fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }
    .d-1 { animation-delay: 0.1s; }
    .d-2 { animation-delay: 0.3s; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (prefers-reduced-motion: reduce) {
      *, .anim-name, .anim-squiggle, .ambient-drift-1, .ambient-drift-2, .fade-up {
        animation: none !important;
        stroke-dashoffset: 0 !important;
        opacity: 1 !important;
      }
    }
  </style>

  <!-- Card Background -->
  <g clip-path="url(#cardClip)">
    <rect width="1200" height="${H}" fill="${t.bg}" />
    
    <!-- Ambient glowing orbs on right -->
    <circle class="ambient-drift-1" cx="1050" cy="70" r="280" fill="url(#orb1)" />
    <circle class="ambient-drift-2" cx="900" cy="210" r="240" fill="url(#orb2)" />
    ${isDark ? '<circle class="ambient-drift-1" cx="160" cy="50" r="180" fill="url(#orb3)" />' : ''}
    
    <!-- Grid Overlay -->
    <rect width="1200" height="${H}" fill="url(#grid)" opacity="0.8" />

    <!-- 1. "hey i am" in Gloria Hallelujah -->
    <g class="fade-up d-1">
      <path d="${heyPath}" fill="${t.accentAmber}" />
    </g>

    <!-- 2. "garvit singla" Animated Signature & Underline -->
    <g>
      <path class="anim-name" d="${namePath}" fill="${t.textPrimary}" stroke="${t.textPrimary}" stroke-width="1.4" />
      
      <!-- Role tag badge "engineer" -->
      <g transform="translate(0, 0)">
        <rect x="${startX + 312}" y="106" width="90" height="26" rx="6" fill="${t.highlightBg1}" stroke="${t.highlightBorder1}" stroke-width="1" />
        <path d="${engineerPath}" fill="${t.highlightText1}" />
      </g>

      <!-- Iconic Squiggle Underline -->
      <path class="anim-squiggle" d="${squigglePath}" fill="none" stroke="${t.accentAmber}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <!-- 3. Custom Tagline Lines with highlighters -->
    <g class="fade-up d-2">
      <!-- Line 1 Highlighter -->
      <rect x="${l1_b_x - 3}" y="${bioY1 - 14}" width="${l1_b.width + 6}" height="19" rx="4" fill="${t.highlightBg1}" stroke="${t.highlightBorder1}" stroke-width="0.8" />
      <!-- Line 1 Text -->
      <path d="${l1_a.pathData}" fill="${t.textSecondary}" />
      <path d="${l1_b.pathData}" fill="${t.highlightText1}" />
      <path d="${l1_c.pathData}" fill="${t.textSecondary}" />

      <!-- Line 2 Highlighters -->
      <rect x="${l2_hl1_x - 3}" y="${bioY2 - 14}" width="${l2_b.width + 6}" height="19" rx="4" fill="${t.highlightBg1}" stroke="${t.highlightBorder1}" stroke-width="0.8" />
      <rect x="${l2_hl2_x - 3}" y="${bioY2 - 14}" width="${l2_d.width + 6}" height="19" rx="4" fill="${t.highlightBg2}" stroke="${t.highlightBorder2}" stroke-width="0.8" />
      <rect x="${l2_hl3_x - 3}" y="${bioY2 - 14}" width="${l2_f.width + 6}" height="19" rx="4" fill="${t.highlightBg3}" stroke="${t.highlightBorder3}" stroke-width="0.8" />
      <rect x="${l2_hl4_x - 3}" y="${bioY2 - 14}" width="${l2_h.width + 6}" height="19" rx="4" fill="${t.highlightBg1}" stroke="${t.highlightBorder1}" stroke-width="0.8" />
      <rect x="${l2_hl5_x - 3}" y="${bioY2 - 14}" width="${l2_j.width + 6}" height="19" rx="4" fill="${t.highlightBg2}" stroke="${t.highlightBorder2}" stroke-width="0.8" />
      <rect x="${l2_hl6_x - 3}" y="${bioY2 - 14}" width="${l2_l.width + 6}" height="19" rx="4" fill="${t.highlightBg3}" stroke="${t.highlightBorder3}" stroke-width="0.8" />

      <!-- Line 2 Text -->
      <path d="${l2_a.pathData}" fill="${t.textSecondary}" />
      <path d="${l2_b.pathData}" fill="${t.highlightText1}" />
      <path d="${l2_c.pathData}" fill="${t.textSecondary}" />
      <path d="${l2_d.pathData}" fill="${t.highlightText2}" />
      <path d="${l2_e.pathData}" fill="${t.textSecondary}" />
      <path d="${l2_f.pathData}" fill="${t.highlightText3}" />
      <path d="${l2_g.pathData}" fill="${t.textSecondary}" />
      <path d="${l2_h.pathData}" fill="${t.highlightText1}" />
      <path d="${l2_i.pathData}" fill="${t.textSecondary}" />
      <path d="${l2_j.pathData}" fill="${t.highlightText2}" />
      <path d="${l2_k.pathData}" fill="${t.textSecondary}" />
      <path d="${l2_l.pathData}" fill="${t.highlightText3}" />
      <path d="${l2_m.pathData}" fill="${t.textSecondary}" />
    </g>
  </g>

  <!-- Card Border -->
  <rect x="0.75" y="0.75" width="1198.5" height="${H - 1.5}" rx="17.25" fill="none" stroke="${t.cardBorder}" stroke-width="1.5" />
</svg>
  `.trim();
}

// ── 2. WIRE DIVIDER SVG ────────────────────────────────────────────────
function buildWire(themeName) {
  const t = THEMES[themeName];
  const isDark = themeName === 'dark';
  const packetColor = t.accentAmber;
  const wireBase = isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(180, 83, 9, 0.25)';

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 24" width="1200" height="24" role="img" aria-label="Networking wire divider">
  <defs>
    <linearGradient id="packetGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${packetColor}" stop-opacity="0" />
      <stop offset="70%" stop-color="${packetColor}" stop-opacity="0.85" />
      <stop offset="100%" stop-color="${packetColor}" stop-opacity="1" />
    </linearGradient>
  </defs>
  <style>
    .packet {
      animation: packetRun 6.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      opacity: 0;
    }
    .p-1 { animation-delay: 0s; }
    .p-2 { animation-delay: 2.1s; }
    .p-3 { animation-delay: 4.3s; }

    @keyframes packetRun {
      0% { transform: translateX(0); opacity: 0; }
      8% { opacity: 1; }
      92% { opacity: 1; }
      100% { transform: translateX(1350px); opacity: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .packet { animation: none; opacity: 0; }
    }
  </style>

  <!-- Main Wire Rule -->
  <line x1="0" y1="12" x2="1200" y2="12" stroke="${wireBase}" stroke-width="1.2" />

  <!-- Animated Data Packets in Heading Amber Accent -->
  <rect class="packet p-1" x="-120" y="10" width="120" height="4" rx="2" fill="url(#packetGrad)" />
  <rect class="packet p-2" x="-120" y="10" width="80" height="4" rx="2" fill="url(#packetGrad)" />
  <rect class="packet p-3" x="-120" y="10" width="140" height="4" rx="2" fill="url(#packetGrad)" />
</svg>
  `.trim();
}

// ── 3. SECTION LABELS ──────────────────────────────────────────────────
function buildLabel(text, themeName) {
  const t = THEMES[themeName];
  const size = 20;
  const pathD = textToPath(fontGloria, text, 2, 21, size);
  const metrics = getTextMetrics(fontGloria, text, size);
  const w = Math.ceil(metrics.width) + 16;
  const h = 28;
  const safeText = escapeXml(text);

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${safeText}">
  <title>${safeText}</title>
  <path d="${pathD}" fill="${t.accentAmber}" />
</svg>
  `.trim();
}

// ── BUILD ALL ASSETS ───────────────────────────────────────────────────
function main() {
  console.log('Generating updated hero & assets for garvittsingla/garvittsingla...');

  for (const theme of ['dark', 'light']) {
    const heroContent = buildHero(theme);
    fs.writeFileSync(path.join(ASSETS_DIR, `hero-${theme}.svg`), heroContent);
    fs.writeFileSync(path.join(ASSETS_DIR, `hero-v3-${theme}.svg`), heroContent);

    const wireContent = buildWire(theme);
    fs.writeFileSync(path.join(ASSETS_DIR, `wire-${theme}.svg`), wireContent);
    fs.writeFileSync(path.join(ASSETS_DIR, `wire-amber-${theme}.svg`), wireContent);

    fs.writeFileSync(path.join(ASSETS_DIR, `label-built-${theme}.svg`), buildLabel('things i’ve built & shipped', theme));
    fs.writeFileSync(path.join(ASSETS_DIR, `label-writings-${theme}.svg`), buildLabel('recent writings', theme));
    fs.writeFileSync(path.join(ASSETS_DIR, `label-socials-${theme}.svg`), buildLabel('✎ socials ➔', theme));
  }

  const files = fs.readdirSync(ASSETS_DIR);
  console.log(`Successfully generated ${files.length} assets in ${ASSETS_DIR}`);
}

main();
