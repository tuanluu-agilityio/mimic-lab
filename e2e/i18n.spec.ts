import { expect, test, type Page } from '@playwright/test';

/** Localisation checks: see docs/i18n/localization-testing.md. */

type Locale = 'en' | 'vi' | 'ja';

/** Same key as STORAGE_KEY in src/i18n/index.ts. */
const STORAGE_KEY = 'mimic-lab.locale';

const EXPECT: Record<Locale, { anatomyTitle: string; brain: string; navAnatomy: string; title: RegExp; flatfish: string }> = {
  en: { anatomyTitle: 'The body of a mimic', brain: 'Brain', navAnatomy: 'Anatomy', title: /^MIMIC LAB — Thaumoctopus mimicus$/, flatfish: 'Flatfish' },
  vi: { anatomyTitle: 'Cơ thể của kẻ bắt chước', brain: 'Não', navAnatomy: 'Giải phẫu', title: /Bạch tuộc bắt chước/, flatfish: 'Cá bơn' },
  ja: { anatomyTitle: '擬態するタコの体', brain: '脳', navAnatomy: '体のつくり', title: /ミミックオクトパス/, flatfish: 'カレイ・ヒラメ類' },
};

const TARGETS = ['flatfish', 'lionfish', 'sea-snake', 'stingray', 'snake-eel', 'jellyfish', 'sponge', 'tunicate', 'tube-worm', 'anemone'];

const state = (page: Page) =>
  page.evaluate(() => {
    const s = (window as any).__MIMIC__.store.getState();
    return {
      stage: s.stage as string,
      viewMode: s.viewMode as string,
      selectedStructure: s.selectedStructure as string | null,
      mimicryTarget: s.mimicryTarget as string | null,
      comparison: s.comparison as boolean,
      progress: s.playback.progress as number,
      playing: s.playback.playing as boolean,
    };
  });
const debug = (page: Page) => page.evaluate(() => (window as any).__MIMIC__.debug());

async function open(page: Page, stored?: Locale) {
  const problems: string[] = [];
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && m.text().includes('[i18n]')) problems.push(m.text());
  });
  if (stored) await page.addInitScript(([key, value]) => window.localStorage.setItem(key, value), [STORAGE_KEY, stored]);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => (window as any).__MIMIC__ !== undefined, null, { timeout: 60_000 });
  return problems;
}

async function switchTo(page: Page, locale: Locale) {
  await page.getByTestId(`lang-${locale}`).click();
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await expect(page.getByTestId(`lang-${locale}`)).toHaveAttribute('aria-pressed', 'true');
}

async function goTo(page: Page, stage: string) {
  await page.getByTestId(`nav-${stage}`).click();
  await expect.poll(async () => (await state(page)).stage, { timeout: 10_000 }).toBe(stage);
}

/** Text that would show if a key were missing (i18next prints the key) or a variable unfilled. */
async function expectNoRawKeys(page: Page) {
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(/\{\{|\}\}/);
  expect(text).not.toMatch(/\b(common|navigation|home|anatomy|mechanisms|mimicry|scientific):[a-z]/i);
  expect(text).not.toMatch(/\b[a-z]+(\.[a-zA-Z-]+){2,}\b(?<!\.org|\.com|\.app)/);
}

test('L1 · English is the default and the switcher sits in the navigation bar', async ({ page }) => {
  const problems = await open(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mimic Lab');
  const group = page.getByTestId('language');
  await expect(group).toBeInViewport();
  await expect(group.getByRole('button')).toHaveText(['EN', 'VI', '日本語']);
  await expect(page.getByTestId('lang-en')).toHaveAttribute('aria-pressed', 'true');
  const box = await group.boundingBox();
  expect(box!.y).toBeLessThan(56);
  expect(box!.x).toBeGreaterThan(1440 / 2);
  // Keyboard: focus the option and activate it.
  await page.getByTestId('lang-vi').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  expect(problems).toEqual([]);
});

test('L2 · every switch direction works in place: no reload, same engine, metadata follows', async ({ page }) => {
  const problems = await open(page);
  await page.evaluate(() => {
    (window as any).__marker = (window as any).__MIMIC__;
  });
  const geometries = (await debug(page)).renderer.geometries;
  await goTo(page, 'anatomy');
  // EN → VI → JA → EN → JA → VI → EN covers all six ordered pairs.
  for (const locale of ['vi', 'ja', 'en', 'ja', 'vi', 'en'] as Locale[]) {
    await switchTo(page, locale);
    await expect(page.locator('#stage-anatomy h2')).toHaveText(EXPECT[locale].anatomyTitle);
    await expect(page.getByTestId('nav-anatomy')).toContainText(EXPECT[locale].navAnatomy);
    await expect(page).toHaveTitle(EXPECT[locale].title);
    expect(await page.evaluate(() => (window as any).__marker === (window as any).__MIMIC__)).toBe(true);
    expect((await state(page)).stage).toBe('anatomy');
    expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBe(locale);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('Thaumoctopus mimicus');
  }
  // Nothing was rebuilt on the GPU by switching language.
  expect((await debug(page)).renderer.geometries).toBe(geometries);
  expect(problems).toEqual([]);
});

test('L3 · switching while viewing internal anatomy keeps the structure, the mode and the camera', async ({ page }) => {
  await open(page);
  await goTo(page, 'anatomy');
  await page.getByTestId('structure-brain').click();
  await expect.poll(async () => (await debug(page)).mode).toBe('xray');
  await page.locator('#stage-anatomy').getByTestId('cam-top').click();
  await page.waitForTimeout(600);
  const before = (await debug(page)).camera;
  for (const locale of ['vi', 'ja'] as Locale[]) {
    await switchTo(page, locale);
    const s = await state(page);
    expect(s.selectedStructure).toBe('brain');
    expect(s.viewMode).toBe('xray');
    await expect(page.getByTestId('structure-card').locator('h3')).toHaveText(EXPECT[locale].brain);
    // The 3D marker is relabelled, not removed.
    await expect(page.getByTestId('hotspot-brain')).toHaveText(EXPECT[locale].brain);
    const d = await debug(page);
    expect(d.mode).toBe('xray');
    expect(d.camera.polar).toBeCloseTo(before.polar, 2);
    expect(d.camera.distance).toBeCloseTo(before.distance, 1);
    expect(d.camera.azimuth).toBeCloseTo(before.azimuth, 1);
  }
});

test('L4 · switching during a transformation in comparison mode does not restart it', async ({ page }) => {
  await open(page);
  await goTo(page, 'mimicry');
  await page.getByTestId('target-sea-snake').click();
  await page.getByTestId('compare').click();
  await expect.poll(async () => (await debug(page)).progress, { timeout: 30_000 }).toBeGreaterThan(0.1);
  let last = (await debug(page)).progress;
  for (const locale of ['ja', 'vi', 'en'] as Locale[]) {
    await switchTo(page, locale);
    const s = await state(page);
    expect(s.mimicryTarget).toBe('sea-snake');
    expect(s.comparison).toBe(true);
    expect(s.playing).toBe(true);
    const d = await debug(page);
    expect(d.poseKey).toBe('target-sea-snake');
    expect(d.referenceViewport).toBe(true);
    expect(d.progress).toBeGreaterThanOrEqual(last - 0.001);
    last = d.progress;
    await expect(page.getByTestId('phase-label')).not.toBeEmpty();
  }
});

for (const locale of ['vi', 'ja'] as Locale[]) {
  test(`L5 · ${locale}: the choice survives a reload and never paints English first`, async ({ page }) => {
    // Record every label the Anatomy nav link ever shows, from the first render on.
    await page.addInitScript(() => {
      (window as any).__seen = [];
      new MutationObserver(() => {
        const text = document.querySelector('[data-testid="nav-anatomy"]')?.textContent;
        if (text && !(window as any).__seen.includes(text)) (window as any).__seen.push(text);
      }).observe(document, { childList: true, subtree: true, characterData: true });
    });
    await open(page);
    await switchTo(page, locale);
    await page.reload();
    await page.waitForFunction(() => (window as any).__MIMIC__ !== undefined, null, { timeout: 60_000 });
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.getByTestId(`lang-${locale}`)).toHaveAttribute('aria-pressed', 'true');
    const seen: string[] = await page.evaluate(() => (window as any).__seen);
    expect(seen.length).toBeGreaterThan(0);
    for (const text of seen) expect(text).not.toContain('Anatomy');
  });

  test(`L6 · ${locale}: all ten identities, every stage, no missing text and no overflow`, async ({ page }) => {
    test.setTimeout(300_000); // walks the whole site on a software renderer
    const problems = await open(page, locale);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expectNoRawKeys(page);

    await goTo(page, 'anatomy');
    for (const mode of ['xray', 'exploded', 'section', 'isolated', 'neural', 'skin', 'normal']) await page.getByTestId(`mode-${mode}`).click();
    await expectNoRawKeys(page);

    await goTo(page, 'mechanisms');
    for (const id of ['nervous', 'skin', 'arms', 'locomotion', 'mimicry']) {
      await page.getByTestId(`mech-${id}`).click();
      await expect(page.getByTestId('mech-panel').locator('h3').first()).not.toBeEmpty();
    }
    // All five tabs fit without scrolling.
    const tabs = page.getByRole('tablist');
    expect(await tabs.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    await expectNoRawKeys(page);

    await goTo(page, 'mimicry');
    await expect(page.getByTestId('target-flatfish')).toContainText(EXPECT[locale].flatfish);
    for (const id of TARGETS) {
      await page.getByTestId(`target-${id}`).click();
      const detail = page.getByTestId('target-detail');
      await expect(detail.locator('h3')).not.toBeEmpty();
      await expect(page.getByTestId('comparison-table').locator('tbody tr')).toHaveCount(5);
      expect((await debug(page)).poseKey).toBe(`target-${id}`);
      // Scientific names are never translated.
      if (id === 'lionfish') await expect(detail).toContainText('Pterois sp.');
      if (id === 'sea-snake') await expect(detail).toContainText('Laticauda sp.');
      if (id === 'flatfish') await expect(detail).toContainText('Zebrias sp.');
    }
    await expectNoRawKeys(page);

    await goTo(page, 'sources');
    await expect(page.getByTestId('evidence-table').locator('tbody tr')).toHaveCount(10);
    // DOIs and bibliographic entries are untouched.
    await expect(page.locator('#ref-norman2001')).toContainText('Dynamic mimicry in an Indo-Malayan octopus');
    await expect(page.locator('#ref-norman2001 a')).toHaveAttribute('href', 'https://doi.org/10.1098/rspb.2001.1708');
    await expectNoRawKeys(page);

    // Nav and buttons are not clipped.
    const clipped = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('header a, header button, main button')]
        .filter((el) => el.offsetParent !== null && el.scrollWidth > el.clientWidth + 2)
        .map((el) => el.textContent),
    );
    expect(clipped).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
    expect(problems).toEqual([]);
  });

  test(`L7 · ${locale}: phone layout has no horizontal overflow and the switcher is reachable @mobile`, async ({ page }) => {
    await open(page, locale);
    await expect(page.getByTestId('language')).toBeInViewport();
    for (const stage of ['anatomy', 'mechanisms', 'mimicry', 'sources']) {
      await goTo(page, stage);
      await expect(page.getByTestId(`nav-${stage}`)).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
    }
    await page.getByTestId('lang-en').tap();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect((await state(page)).stage).toBe('sources');
  });
}

test('L8 · first visit follows the browser language for Vietnamese and Japanese only', async ({ browser }) => {
  for (const [browserLocale, expected] of [['vi-VN', 'vi'], ['ja-JP', 'ja'], ['fr-FR', 'en']] as const) {
    const context = await browser.newContext({ locale: browserLocale });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', expected);
    await expect(page.getByTestId(`lang-${expected}`)).toHaveAttribute('aria-pressed', 'true');
    await context.close();
  }
});

test('L9 · Japanese and Vietnamese text render in the intended typefaces', async ({ page }) => {
  await open(page, 'ja');
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.evaluate(() => document.fonts.check('16px "Noto Sans JP Variable"', '擬態'))).toBe(true);
  expect(await page.evaluate(() => [...document.fonts].some((f) => f.family.includes('Noto Sans JP') && f.status === 'loaded'))).toBe(true);
  await switchTo(page, 'vi');
  await page.evaluate(() => document.fonts.ready);
  // The Vietnamese subset of the text face is what draws "ặ", not a fallback font.
  expect(await page.evaluate(() => document.fonts.check('16px "Manrope Variable"', 'Giải phẫu bạch tuộc bắt chước'))).toBe(true);
});
