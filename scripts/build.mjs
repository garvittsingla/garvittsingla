import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, 'profile.json');
const README_FILE = path.join(ROOT, 'README.md');

if (!fs.existsSync(DATA_FILE)) {
  console.error('profile.json not found!');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Format Projects
const projectLines = data.projects.map((p) => {
  const links = [];
  if (p.live) links.push(`[live](${p.live})`);
  if (p.github) links.push(`[github](${p.github})`);
  const linkStr = links.length ? ` · ${links.join(' · ')}` : '';
  const mainLink = p.github || p.live || '#';
  return `- **[${p.name}](${mainLink})**: ${p.description}${linkStr}`;
}).join('\n');

// Format Blogs
const blogLines = data.recentBlogs.map((b) => {
  return `- [${b.title}](${b.url})`;
}).join('\n');

// Format Socials
const socialLinks = data.socials.map((s) => {
  return `[${s.name}](${s.url})`;
}).join(' &nbsp;·&nbsp; ');

function renderHeroOption(optNum, label) {
  let darkFile, lightFile;
  if (optNum === 1) {
    darkFile = 'assets/opt1-browser-dark.svg';
    lightFile = 'assets/opt1-browser-light.svg';
  } else if (optNum === 2) {
    darkFile = 'assets/opt2-sketchbook-dark.svg';
    lightFile = 'assets/opt2-sketchbook-light.svg';
  } else {
    darkFile = 'assets/opt3-minimal-dark.svg';
    lightFile = 'assets/opt3-minimal-light.svg';
  }

  return `<a href="${data.portfolioUrl}" target="_blank" rel="noopener noreferrer">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="${darkFile}">
    <img alt="${label}" src="${lightFile}" width="100%">
  </picture>
</a>`;
}

let heroMarkdown = '';

if (data.heroStyle === 'tabs' || data.heroStyle === 'compare') {
  heroMarkdown = `> [!TIP]
> **Click any tab below to toggle between the 3 hero designs:**

<details open>
  <summary><b>Option 1: macOS / Arc Browser Frame (Active)</b></summary>
  <br>

${renderHeroOption(1, 'Option 1: macOS Browser Frame')}
</details>

<details>
  <summary><b>Option 2: Studio Desk / Sketchbook Canvas</b></summary>
  <br>

${renderHeroOption(2, 'Option 2: Sketchbook Canvas')}
</details>

<details>
  <summary><b>Option 3: Minimalist Developer Card</b></summary>
  <br>

${renderHeroOption(3, 'Option 3: Minimalist Developer Card')}
</details>
`;
} else {
  const chosen = Number(data.heroStyle) || 1;
  heroMarkdown = renderHeroOption(chosen, `Hero Option ${chosen}`);
}

const readmeContent = `${heroMarkdown}

### things i recently did

${projectLines}

### recent writings

${blogLines}

### elsewhere

${socialLinks}
`;

fs.writeFileSync(README_FILE, readmeContent);
console.log('Successfully generated README.md from profile.json');
