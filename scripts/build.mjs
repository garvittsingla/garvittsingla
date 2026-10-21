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

// Format Blogs (titles only, no descriptions)
const blogLines = data.recentBlogs.map((b) => {
  return `- [${b.title}](${b.url})`;
}).join('\n');

// Format Socials
const socialLinks = data.socials.map((s) => {
  return `[${s.name}](${s.url})`;
}).join(' &nbsp;·&nbsp; ');

const readmeContent = `<a href="${data.screenshot.portfolioUrl}" target="_blank" rel="noopener noreferrer">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="${data.screenshot.dark}">
    <img alt="${data.screenshot.alt}" src="${data.screenshot.light}" width="100%">
  </picture>
</a>

### things i recently did

${projectLines}

### recent writings

${blogLines}

### elsewhere

${socialLinks}
`;

fs.writeFileSync(README_FILE, readmeContent);
console.log('Successfully generated README.md from profile.json');
