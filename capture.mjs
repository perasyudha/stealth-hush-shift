import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const POSES = ['cover', 'hide', 'close', 'win'];
mkdirSync('screenshots', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 936 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (err) => errors.push(String(err)));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});

for (const pose of POSES) {
  await page.goto(`http://127.0.0.1:8099/?shot=${pose}`, { waitUntil: 'load' });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `screenshots/${pose}.png` });
  console.log('shot', pose);
}

await browser.close();
if (errors.length) {
  console.error('page errors:', errors.join('\n'));
  process.exit(1);
}
