# profile configuration & build

All contents of `README.md` are configured in **`profile.json`**.

### How to update:
1. Open **`profile.json`** and edit:
   - `projects`: add or edit projects under **"things i recently did"**
   - `recentBlogs`: add or edit your latest blog titles and URLs
   - `socials`: add or edit your links
2. Run:
   ```bash
   npm run build
   ```
   This will regenerate `README.md` instantly.

### How to update screenshot (optional):
If you update your portfolio intro on `garvitsingla.in` and want new screenshots:
```bash
npm run capture
```
This launches headless Chrome, grabs high-resolution 2x DPI dark and light mode screenshots of the intro section, and saves them to `assets/`.
