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
  if (p.live) links.push(`[launch live](${p.live})`);
  if (p.github) links.push(`[github](${p.github})`);
  const linkStr = links.length ? ` · ${links.join(' · ')}` : '';
  const mainLink = p.live || p.github || '#';
  return `* **[${p.name}](${mainLink})**: ${p.description}${linkStr}`;
}).join('\n');

// Format Writings (titles only)
const writingLines = data.writings.map((w) => {
  return `* [${w.title}](${w.url})`;
}).join('\n');

// Format Socials
const socialLinks = data.socials.map((s) => {
  return `[${s.name}](${s.url})`;
}).join(' &nbsp;·&nbsp; ');

const readmeContent = `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/hero-v2-dark.svg">
  <img alt="Garvit Singla — Software Engineer" src="assets/hero-v2-light.svg" width="100%">
</picture>

<br>
<br>

<h2>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/label-built-dark.svg">
    <img alt="things i’ve built & shipped" src="assets/label-built-light.svg">
  </picture>
</h2>

${projectLines}

<h2>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/label-writings-dark.svg">
    <img alt="recent writings" src="assets/label-writings-light.svg">
  </picture>
</h2>

${writingLines}

<h2>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/label-socials-dark.svg">
    <img alt="✎ socials ➔" src="assets/label-socials-light.svg">
  </picture>
</h2>

${socialLinks}

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/wire-amber-dark.svg">
  <img alt="" src="assets/wire-amber-light.svg" width="100%">
</picture>
`;

fs.writeFileSync(README_FILE, readmeContent);
console.log('Successfully generated README.md from profile.json');
