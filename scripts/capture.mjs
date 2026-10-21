import puppeteer from 'puppeteer-core';
import path from 'node:path';

async function capture() {
  console.log('Capturing intro section from garvitsingla.in...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const theme of ['dark', 'light']) {
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 700, deviceScaleFactor: 2 });
    await page.goto(`https://garvitsingla.in?theme=${theme}`, { waitUntil: 'networkidle0' });

    // Allow animations and fonts to settle
    await new Promise((r) => setTimeout(r, 1200));

    const introEl = await page.evaluateHandle(() => {
      const sec = document.querySelector('section');
      return sec.parentElement;
    });

    const outPath = path.join(process.cwd(), 'assets', `intro-${theme}.png`);
    await introEl.screenshot({ path: outPath });
    console.log(`Saved: assets/intro-${theme}.png`);
    await page.close();
  }

  await browser.close();
  console.log('Done!');
}

capture().catch(console.error);
