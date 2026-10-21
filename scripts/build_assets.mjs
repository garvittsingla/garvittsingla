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

// 2. Load Avatar as base64
const avatarBuf = fs.readFileSync(path.join(ROOT, 'scripts', 'avatar.jpg'));
const avatarBase64 = `data:image/jpeg;base64,${avatarBuf.toString('base64')}`;

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

// ── THEMES DEFINITION ───────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: '#090a0f',
    cardBg: '#12131a',
    cardBorder: 'rgba(255, 255, 255, 0.12)',
    textPrimary: '#fafafa',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    accentAmber: '#f59e0b',
    accentCyan: '#38bdf8',
    accentGreen: '#22c55e',
    accentIndigo: '#818cf8',
    polaroidBg: '#161722',
    polaroidBorder: 'rgba(255, 255, 255, 0.14)',
    polaroidShadow: 'rgba(0, 0, 0, 0.6)',
    tapeBg: 'rgba(245, 158, 11, 0.28)',
    tapeBorder: 'rgba(245, 158, 11, 0.45)',
    gridColor: 'rgba(255, 255, 255, 0.05)',
    pillBg: '#161824',
    pillBorder: 'rgba(255, 255, 255, 0.10)',
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
    cardBg: '#faf7ee',
    cardBorder: '#e7e1d0',
    textPrimary: '#09090b',
    textSecondary: '#475569',
    textMuted: '#71717a',
    accentAmber: '#b45309',
    accentCyan: '#0284c7',
    accentGreen: '#16a34a',
    accentIndigo: '#4338ca',
    polaroidBg: '#ffffff',
    polaroidBorder: '#e2d9cc',
    polaroidShadow: 'rgba(80, 50, 15, 0.12)',
    tapeBg: 'rgba(217, 160, 102, 0.45)',
    tapeBorder: 'rgba(133, 86, 39, 0.35)',
    gridColor: 'rgba(100, 70, 30, 0.05)',
    pillBg: '#f4ede0',
    pillBorder: '#e2d9cc',
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

  // Text Paths
  const heyPath = textToPath(fontGloria, 'hey i am', 330, 130, 24);
  const namePath = textToPath(fontGloria, 'garvit singla', 330, 195, 52);
  const engineerPath = textToPath(fontGloria, 'engineer', 692, 195, 20);
  const polaroidCaption = textToPath(fontGloria, 'garvit', 145, 345, 18);
  const sketchTag = textToPath(fontGloria, '✎ sketch', 62, 385, 13);

  // Squiggle Underline (derived from portfolio: M2 7C50 2 120 3 238 6C170 9 60 8 12 9 scaled ~1.36x)
  const squigglePath = 'M 332 208 C 397 201 492 202 652 206 C 560 210 411 209 346 210';

  // Ambient gradient blobs
  const ambientDef = isDark
    ? `
      <radialGradient id="orb1" cx="80%" cy="20%" r="60%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.18" />
        <stop offset="60%" stop-color="#f59e0b" stop-opacity="0.04" />
        <stop offset="100%" stop-color="#090a0f" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="orb2" cx="20%" cy="80%" r="50%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.14" />
        <stop offset="70%" stop-color="#38bdf8" stop-opacity="0.02" />
        <stop offset="100%" stop-color="#090a0f" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="orb3" cx="85%" cy="85%" r="45%">
        <stop offset="0%" stop-color="#818cf8" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#090a0f" stop-opacity="0" />
      </radialGradient>
    `
    : `
      <radialGradient id="orb1" cx="85%" cy="15%" r="50%">
        <stop offset="0%" stop-color="#fef3c7" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#fdfbf7" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="orb2" cx="15%" cy="85%" r="50%">
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

  // Bio line text paths using SpaceMono
  // Line 1: Software engineer obsessed with low-level systems, C/C++, Rust, and graphics.
  const bioLine1_a = monoToPath('Software engineer obsessed with ', 330, 255, 14.5);
  const bioLine1_b = monoToPath('low-level systems', 330 + bioLine1_a.width, 255, 14.5);
  const bioLine1_c = monoToPath(', ', 330 + bioLine1_a.width + bioLine1_b.width, 255, 14.5);
  const bioLine1_d = monoToPath('C/C++', 330 + bioLine1_a.width + bioLine1_b.width + bioLine1_c.width, 255, 14.5);
  const bioLine1_e = monoToPath(', ', 330 + bioLine1_a.width + bioLine1_b.width + bioLine1_c.width + bioLine1_d.width, 255, 14.5);
  const bioLine1_f = monoToPath('Rust', 330 + bioLine1_a.width + bioLine1_b.width + bioLine1_c.width + bioLine1_d.width + bioLine1_e.width, 255, 14.5);
  const bioLine1_g = monoToPath(', and ', 330 + bioLine1_a.width + bioLine1_b.width + bioLine1_c.width + bioLine1_d.width + bioLine1_e.width + bioLine1_f.width, 255, 14.5);
  const bioLine1_h = monoToPath('graphics', 330 + bioLine1_a.width + bioLine1_b.width + bioLine1_c.width + bioLine1_d.width + bioLine1_e.width + bioLine1_f.width + bioLine1_g.width, 255, 14.5);
  const bioLine1_i = monoToPath('.', 330 + bioLine1_a.width + bioLine1_b.width + bioLine1_c.width + bioLine1_d.width + bioLine1_e.width + bioLine1_f.width + bioLine1_g.width + bioLine1_h.width, 255, 14.5);

  const l1_b_x = 330 + bioLine1_a.width;
  const l1_d_x = l1_b_x + bioLine1_b.width + bioLine1_c.width;
  const l1_f_x = l1_d_x + bioLine1_d.width + bioLine1_e.width;
  const l1_h_x = l1_f_x + bioLine1_f.width + bioLine1_g.width;

  // Line 2: Exploring foundational computing from network protocols to memory management.
  const bioLine2_a = monoToPath('Exploring foundational computing from ', 330, 290, 14.5);
  const bioLine2_b = monoToPath('network protocols', 330 + bioLine2_a.width, 290, 14.5);
  const bioLine2_c = monoToPath(' to ', 330 + bioLine2_a.width + bioLine2_b.width, 290, 14.5);
  const bioLine2_d = monoToPath('memory management', 330 + bioLine2_a.width + bioLine2_b.width + bioLine2_c.width, 290, 14.5);
  const bioLine2_e = monoToPath('.', 330 + bioLine2_a.width + bioLine2_b.width + bioLine2_c.width + bioLine2_d.width, 290, 14.5);

  const l2_b_x = 330 + bioLine2_a.width;
  const l2_d_x = l2_b_x + bioLine2_b.width + bioLine2_c.width;

  // Line 3: Building performant tools and understanding computers from the metal up.
  const bioLine3_a = monoToPath('Building performant tools and understanding computers ', 330, 325, 14.5);
  const bioLine3_b = monoToPath('from the metal up', 330 + bioLine3_a.width, 325, 14.5);
  const bioLine3_c = monoToPath('.', 330 + bioLine3_a.width + bioLine3_b.width, 325, 14.5);

  const l3_b_x = 330 + bioLine3_a.width;

  // Telemetry status text
  const statusPillText = monoToPath('IST (UTC+5:30) · CHITKARA · OPEN SOURCE EXECUTIVE', 362, 75, 11);

  // Skill Pills at the bottom
  const pills = [
    { label: 'C / C++', x: 330, w: 90 },
    { label: 'Rust', x: 432, w: 75 },
    { label: 'POSIX Sockets', x: 519, w: 140 },
    { label: 'RFC 1035 / DNS Wire', x: 671, w: 180 },
    { label: 'WebSockets', x: 863, w: 120 },
    { label: 'Custom Parsers', x: 995, w: 145 },
  ];

  const pillSvg = pills.map(p => {
    const textP = monoToPath(p.label, p.x + 16, 396, 11.5);
    return `
      <g>
        <rect x="${p.x}" y="380" width="${p.w}" height="24" rx="12" fill="${t.pillBg}" stroke="${t.pillBorder}" stroke-width="1" />
        <circle cx="${p.x + 8}" cy="392" r="2.5" fill="${t.accentAmber}" />
        <path d="${textP.pathData}" fill="${t.textSecondary}" />
      </g>
    `;
  }).join('');

  return `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 450" width="1200" height="450" role="img" aria-label="Garvit Singla — Software Engineer &amp; Builder">
  <title>Garvit Singla — Software Engineer &amp; Builder</title>
  <defs>
    <clipPath id="cardClip">
      <rect x="0" y="0" width="1200" height="450" rx="24" />
    </clipPath>
    <clipPath id="avatarClip">
      <rect x="50" y="55" width="200" height="235" rx="6" />
    </clipPath>
    <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="${t.polaroidShadow}" />
    </filter>
    ${ambientDef}
    ${gridDef}
  </defs>

  <style>
    /* CSS Animations */
    .pulse-dot {
      animation: pulse 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.15); }
    }

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

    /* Handwriting Stroke Draw Animation */
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

    /* Squiggle Draw Animation */
    .anim-squiggle {
      stroke-dasharray: 550;
      stroke-dashoffset: 550;
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
    .d-3 { animation-delay: 0.5s; }
    .d-4 { animation-delay: 0.8s; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (prefers-reduced-motion: reduce) {
      *, .anim-name, .anim-squiggle, .pulse-dot, .ambient-drift-1, .ambient-drift-2, .fade-up {
        animation: none !important;
        stroke-dashoffset: 0 !important;
        opacity: 1 !important;
      }
    }
  </style>

  <!-- Card Background -->
  <g clip-path="url(#cardClip)">
    <rect width="1200" height="450" fill="${t.bg}" />
    
    <!-- Ambient glowing orbs -->
    <circle class="ambient-drift-1" cx="1050" cy="70" r="320" fill="url(#orb1)" />
    <circle class="ambient-drift-2" cx="200" cy="400" r="280" fill="url(#orb2)" />
    ${isDark ? '<circle class="ambient-drift-1" cx="950" cy="420" r="260" fill="url(#orb3)" />' : ''}
    
    <!-- Grid Overlay -->
    <rect width="1200" height="450" fill="url(#grid)" opacity="0.8" />

    <!-- ── LEFT: POLAROID CARD ── -->
    <g transform="translate(48, 35) rotate(-1.5 150 180)" filter="url(#softShadow)">
      <!-- Polaroid Card Frame -->
      <rect x="35" y="40" width="230" height="325" rx="10" fill="${t.polaroidBg}" stroke="${t.polaroidBorder}" stroke-width="1.2" />

      <!-- Photo Image Area -->
      <rect x="50" y="55" width="200" height="235" rx="6" fill="#000000" />
      <image x="50" y="55" width="200" height="235" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarClip)" xlink:href="${avatarBase64}" />

      <!-- Photo Inner Border & Shadow -->
      <rect x="50" y="55" width="200" height="235" rx="6" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" />

      <!-- Polaroid Bottom Caption: "garvit" -->
      <path d="${polaroidCaption}" fill="${t.textSecondary}" />

      <!-- Washi Tape / Tape Strip at Top -->
      <g transform="translate(115, 30) rotate(-3)">
        <rect x="0" y="0" width="70" height="20" rx="3" fill="${t.tapeBg}" stroke="${t.tapeBorder}" stroke-width="1" />
        <line x1="10" y1="0" x2="10" y2="20" stroke="${t.tapeBorder}" stroke-dasharray="2 2" stroke-width="1" />
        <line x1="60" y1="0" x2="60" y2="20" stroke="${t.tapeBorder}" stroke-dasharray="2 2" stroke-width="1" />
      </g>
    </g>

    <!-- Sketch Annotation Tag -->
    <g transform="rotate(-5 80 415)">
      <path d="${sketchTag}" fill="${t.textMuted}" opacity="0.9" />
    </g>

    <!-- ── RIGHT: MAIN CONTENT ── -->

    <!-- 1. Telemetry / Live Status Pill -->
    <g class="fade-up d-1">
      <rect x="330" y="54" width="370" height="30" rx="15" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1.2" />
      <circle cx="346" cy="69" r="4.5" fill="${t.accentGreen}" class="pulse-dot" />
      <circle cx="346" cy="69" r="8" fill="${t.accentGreen}" opacity="0.25" class="pulse-dot" />
      <path d="${statusPillText.pathData}" fill="${t.textMuted}" />
    </g>

    <!-- 2. "hey i am" in Gloria Hallelujah -->
    <g class="fade-up d-2">
      <path d="${heyPath}" fill="${t.accentAmber}" />
    </g>

    <!-- 3. "garvit singla" Animated Signature & Underline -->
    <g>
      <path class="anim-name" d="${namePath}" fill="${t.textPrimary}" stroke="${t.textPrimary}" stroke-width="1.4" />
      
      <!-- Role tag badge "engineer" -->
      <g transform="translate(0, 0)">
        <rect x="682" y="174" width="95" height="28" rx="6" fill="${t.highlightBg1}" stroke="${t.highlightBorder1}" stroke-width="1" />
        <path d="${engineerPath}" fill="${t.highlightText1}" />
      </g>

      <!-- Iconic Squiggle Underline -->
      <path class="anim-squiggle" d="${squigglePath}" fill="none" stroke="${t.accentAmber}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <!-- 4. Bio Paragraph with highlighter pill boxes -->
    <g class="fade-up d-3">
      <!-- Line 1 Highlighters -->
      <rect x="${l1_b_x - 3}" y="240" width="${bioLine1_b.width + 6}" height="21" rx="4" fill="${t.highlightBg1}" stroke="${t.highlightBorder1}" stroke-width="0.8" />
      <rect x="${l1_d_x - 3}" y="240" width="${bioLine1_d.width + 6}" height="21" rx="4" fill="${t.highlightBg2}" stroke="${t.highlightBorder2}" stroke-width="0.8" />
      <rect x="${l1_f_x - 3}" y="240" width="${bioLine1_f.width + 6}" height="21" rx="4" fill="${t.highlightBg3}" stroke="${t.highlightBorder3}" stroke-width="0.8" />
      <rect x="${l1_h_x - 3}" y="240" width="${bioLine1_h.width + 6}" height="21" rx="4" fill="${t.highlightBg1}" stroke="${t.highlightBorder1}" stroke-width="0.8" />

      <!-- Line 1 Text -->
      <path d="${bioLine1_a.pathData}" fill="${t.textSecondary}" />
      <path d="${bioLine1_b.pathData}" fill="${t.highlightText1}" />
      <path d="${bioLine1_c.pathData}" fill="${t.textSecondary}" />
      <path d="${bioLine1_d.pathData}" fill="${t.highlightText2}" />
      <path d="${bioLine1_e.pathData}" fill="${t.textSecondary}" />
      <path d="${bioLine1_f.pathData}" fill="${t.highlightText3}" />
      <path d="${bioLine1_g.pathData}" fill="${t.textSecondary}" />
      <path d="${bioLine1_h.pathData}" fill="${t.highlightText1}" />
      <path d="${bioLine1_i.pathData}" fill="${t.textSecondary}" />

      <!-- Line 2 Highlighters -->
      <rect x="${l2_b_x - 3}" y="275" width="${bioLine2_b.width + 6}" height="21" rx="4" fill="${t.highlightBg2}" stroke="${t.highlightBorder2}" stroke-width="0.8" />
      <rect x="${l2_d_x - 3}" y="275" width="${bioLine2_d.width + 6}" height="21" rx="4" fill="${t.highlightBg3}" stroke="${t.highlightBorder3}" stroke-width="0.8" />

      <!-- Line 2 Text -->
      <path d="${bioLine2_a.pathData}" fill="${t.textSecondary}" />
      <path d="${bioLine2_b.pathData}" fill="${t.highlightText2}" />
      <path d="${bioLine2_c.pathData}" fill="${t.textSecondary}" />
      <path d="${bioLine2_d.pathData}" fill="${t.highlightText3}" />
      <path d="${bioLine2_e.pathData}" fill="${t.textSecondary}" />

      <!-- Line 3 Highlighter -->
      <rect x="${l3_b_x - 3}" y="310" width="${bioLine3_b.width + 6}" height="21" rx="4" fill="${t.highlightBg1}" stroke="${t.highlightBorder1}" stroke-width="0.8" />

      <!-- Line 3 Text -->
      <path d="${bioLine3_a.pathData}" fill="${t.textSecondary}" />
      <path d="${bioLine3_b.pathData}" fill="${t.highlightText1}" />
      <path d="${bioLine3_c.pathData}" fill="${t.textSecondary}" />
    </g>

    <!-- 5. Skill Micro-Pills -->
    <g class="fade-up d-4">
      ${pillSvg}
    </g>

  </g>

  <!-- Card Border -->
  <rect x="0.75" y="0.75" width="1198.5" height="448.5" rx="23.25" fill="none" stroke="${t.cardBorder}" stroke-width="1.5" />
</svg>
  `.trim();
}

// ── 2. WIRE DIVIDER SVG ────────────────────────────────────────────────
function buildWire(themeName) {
  const t = THEMES[themeName];
  const isDark = themeName === 'dark';
  const packetColor = isDark ? '#38bdf8' : '#b45309';

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 24" width="1200" height="24" role="img" aria-label="Networking wire divider">
  <defs>
    <linearGradient id="packetGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${packetColor}" stop-opacity="0" />
      <stop offset="70%" stop-color="${packetColor}" stop-opacity="0.85" />
      <stop offset="100%" stop-color="${isDark ? '#ffffff' : packetColor}" stop-opacity="1" />
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
  <line x1="0" y1="12" x2="1200" y2="12" stroke="${t.cardBorder}" stroke-width="1.2" />

  <!-- Animated Data Packets (RFC 1035 UDP / Sockets motif) -->
  <rect class="packet p-1" x="-120" y="10" width="120" height="4" rx="2" fill="url(#packetGrad)" />
  <rect class="packet p-2" x="-120" y="10" width="80" height="4" rx="2" fill="url(#packetGrad)" />
  <rect class="packet p-3" x="-120" y="10" width="140" height="4" rx="2" fill="url(#packetGrad)" />
</svg>
  `.trim();
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

// ── 4. SIGNOFF SVG ─────────────────────────────────────────────────────
function buildSignoff(themeName) {
  const t = THEMES[themeName];
  const text = 'built from the metal up · garvitsingla.in';
  const size = 18;
  const pathD = textToPath(fontGloria, text, 4, 22, size);
  const metrics = getTextMetrics(fontGloria, text, size);
  const w = Math.ceil(metrics.width) + 20;
  const h = 30;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${text}">
  <title>${text}</title>
  <path d="${pathD}" fill="${t.textSecondary}" />
</svg>
  `.trim();
}

// ── BUILD ALL ASSETS ───────────────────────────────────────────────────
function main() {
  console.log('Generating assets for garvittsingla/garvittsingla...');

  for (const theme of ['dark', 'light']) {
    fs.writeFileSync(path.join(ASSETS_DIR, `hero-${theme}.svg`), buildHero(theme));
    fs.writeFileSync(path.join(ASSETS_DIR, `wire-${theme}.svg`), buildWire(theme));
    fs.writeFileSync(path.join(ASSETS_DIR, `signoff-${theme}.svg`), buildSignoff(theme));
    fs.writeFileSync(path.join(ASSETS_DIR, `label-built-${theme}.svg`), buildLabel('things i’ve built & shipped', theme));
    fs.writeFileSync(path.join(ASSETS_DIR, `label-exp-${theme}.svg`), buildLabel('places i’ve grown · experience', theme));
    fs.writeFileSync(path.join(ASSETS_DIR, `label-socials-${theme}.svg`), buildLabel('✎ socials ➔', theme));
  }

  const files = fs.readdirSync(ASSETS_DIR);
  console.log(`Successfully generated ${files.length} assets in ${ASSETS_DIR}:`);
  for (const file of files) {
    const stats = fs.statSync(path.join(ASSETS_DIR, file));
    console.log(`  - ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
  }
}

main();
