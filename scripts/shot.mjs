// Dev helper: open the running app, optionally run store actions, and save screenshots.
// usage: node scripts/shot.mjs <outDir> [url] [--mobile | --tablet]
// env:   STEPS='[{"name":…,"scrollTo":…,"state":{…},"click":"test-id","wait":ms}]'  LOCALE=en|vi|ja
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const outDir = process.argv[2] ?? 'shots';
const url = process.argv[3] ?? 'http://localhost:5173/';
const mobile = process.argv.includes('--mobile');
const tablet = process.argv.includes('--tablet');
const locale = process.env.LOCALE;
const steps = process.env.STEPS ? JSON.parse(process.env.STEPS) : [{ name: 'home' }];
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const context = await browser.newContext(
  mobile ? devices['Pixel 7'] : { viewport: tablet ? { width: 820, height: 1180 } : { width: 1440, height: 900 } },
);
// Same storage key as src/i18n/index.ts.
if (locale) await context.addInitScript((value) => window.localStorage.setItem('mimic-lab.locale', value), locale);
const page = await context.newPage();
page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && console.log(`[${m.type()}]`, m.text().slice(0, 600)));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(url);
await page.waitForFunction(() => window.__MIMIC__ !== undefined, null, { timeout: 60000 }).catch(() => console.log('engine not ready'));
for (const step of steps) {
  if (step.state) await page.evaluate((s) => window.__MIMIC__.store.setState(s), step.state);
  if (step.eval) await page.evaluate(step.eval);
  if (step.click) await page.getByTestId(step.click).first().click();
  if (step.scrollTo) await page.evaluate((id) => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }), step.scrollTo);
  await page.waitForTimeout(step.wait ?? 1500);
  await page.screenshot({ path: `${outDir}/${step.name}.png` });
  if (step.debug) console.log(step.name, JSON.stringify(await page.evaluate(() => window.__MIMIC__.debug())));
}
await browser.close();
