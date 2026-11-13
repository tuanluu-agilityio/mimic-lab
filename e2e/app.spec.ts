import { expect, test, type Page } from '@playwright/test';

/** Acceptance criteria from docs/specs/functional-spec.md §9. */

interface Debug {
  armCount: number;
  armsFinite: boolean;
  poseKey: string;
  progress: number;
  playing: boolean;
  mode: string;
  xray: number;
  section: number;
  explode: number;
  isolatePart: number;
  highlightPart: number;
  nerveOpacity: number;
  visibleOrgans: string[];
  skinPatchVisible: boolean;
  camera: { azimuth: number; polar: number; distance: number };
  referenceModel: string | null;
  referenceViewport: boolean;
  renderer: { geometries: number; textures: number };
  armHighlights: number[];
}

const STAGES = ['intro', 'anatomy', 'mechanisms', 'mimicry', 'sources'] as const;
const TARGETS = ['flatfish', 'lionfish', 'sea-snake', 'stingray', 'snake-eel', 'jellyfish', 'sponge', 'tunicate', 'tube-worm', 'anemone'];

const debug = (page: Page) => page.evaluate(() => (window as any).__MIMIC__.debug() as Debug);
const stageOf = (page: Page) => page.evaluate(() => (window as any).__MIMIC__.store.getState().stage as string);

async function open(page: Page, path = '/') {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(path);
  await page.waitForFunction(() => (window as any).__MIMIC__ !== undefined, null, { timeout: 60_000 });
  return errors;
}

/** Snap the window back to the top of a stage (clicking deep in a panel can nudge the page). */
async function align(page: Page, stage: (typeof STAGES)[number]) {
  await page.evaluate((id) => document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' }), `stage-${stage}`);
}

async function goTo(page: Page, stage: (typeof STAGES)[number]) {
  await page.getByTestId(`nav-${stage}`).click();
  await expect.poll(() => stageOf(page), { timeout: 10_000 }).toBe(stage);
}

test('1 · five stages are reachable by nav and by scrolling', async ({ page }) => {
  const errors = await open(page);
  for (const stage of STAGES) {
    await goTo(page, stage);
    await expect(page.locator(`#stage-${stage}`)).toBeInViewport();
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(() => stageOf(page)).toBe('intro');
  await page.mouse.move(400, 500);
  await page.mouse.wheel(0, 900);
  await expect.poll(() => stageOf(page), { timeout: 10_000 }).toBe('anatomy');
  await page.getByTestId('nav-intro').click();
  await page.getByTestId('cta-mimicry').click();
  await expect.poll(() => stageOf(page), { timeout: 10_000 }).toBe('mimicry');
  expect(errors).toEqual([]);
});

test('4 · camera presets, zoom buttons, drag and ctrl+wheel move the camera', async ({ page }) => {
  await open(page);
  await goTo(page, 'anatomy');
  const cam = page.locator('#stage-anatomy');
  const seen = new Set<string>();
  for (const preset of ['front', 'side', 'top', 'rear', 'bottom', 'reset']) {
    await cam.getByTestId(`cam-${preset}`).click();
    await page.waitForTimeout(900);
    const { camera } = await debug(page);
    seen.add(`${camera.azimuth.toFixed(1)}|${camera.polar.toFixed(1)}`);
  }
  expect(seen.size).toBe(6);

  const before = (await debug(page)).camera;
  await cam.getByTestId('cam-zoom-in').click();
  await expect.poll(async () => (await debug(page)).camera.distance).toBeLessThan(before.distance - 0.05);

  const mid = (await debug(page)).camera;
  await page.mouse.move(500, 520);
  await page.mouse.down();
  await page.mouse.move(640, 540, { steps: 6 });
  await page.mouse.up();
  await expect.poll(async () => Math.abs((await debug(page)).camera.azimuth - mid.azimuth)).toBeGreaterThan(0.05);

  const beforeWheel = (await debug(page)).camera.distance;
  await page.mouse.move(500, 520);
  await page.keyboard.down('Control');
  await page.mouse.wheel(0, 400);
  await page.keyboard.up('Control');
  await expect.poll(async () => Math.abs((await debug(page)).camera.distance - beforeWheel)).toBeGreaterThan(0.05);
  expect(await stageOf(page)).toBe('anatomy');
});

test('5 · every anatomy structure updates the card and the engine', async ({ page }) => {
  await open(page);
  await goTo(page, 'anatomy');
  const ids = await page.locator('[data-testid^="structure-"]:not([data-testid="structure-card"]):not([data-testid="structure-empty"])').evaluateAll((els) =>
    els.map((el) => (el as HTMLElement).dataset.testid!.replace('structure-', '')),
  );
  expect(ids.length).toBe(17);
  const external = new Set(['mantle', 'head', 'eyes', 'arms', 'web', 'suckers', 'funnel']);
  for (const id of ids) {
    await page.getByTestId('mode-normal').click();
    const button = page.getByTestId(`structure-${id}`);
    const name = (await button.textContent())!;
    await button.click();
    if (id === 'skin') {
      await expect.poll(async () => (await debug(page)).skinPatchVisible).toBe(true);
      continue;
    }
    await expect(page.getByTestId('structure-card').locator('h3')).toHaveText(name);
    if (external.has(id)) {
      await expect.poll(async () => (await debug(page)).highlightPart, { message: id }).toBeGreaterThanOrEqual(0);
    } else {
      await expect.poll(async () => (await debug(page)).mode, { message: id }).toBe('xray');
      await expect.poll(async () => (await debug(page)).visibleOrgans.length, { message: id }).toBeGreaterThan(0);
    }
    await button.click();
  }
});

test('6 · each view mode changes what the engine renders', async ({ page }) => {
  await open(page);
  await goTo(page, 'anatomy');
  const settle = (fn: (d: Debug) => boolean, message: string) =>
    expect.poll(async () => fn(await debug(page)), { message, timeout: 10_000 }).toBe(true);

  await page.getByTestId('mode-xray').click();
  await settle((d) => d.xray > 0.5 && d.visibleOrgans.length > 0, 'xray');
  await page.getByTestId('mode-normal').click();
  await settle((d) => d.xray < 0.1 && !d.skinPatchVisible, 'normal');
  await page.getByTestId('mode-exploded').click();
  await settle((d) => d.explode > 0.2, 'exploded');
  await page.getByTestId('mode-section').click();
  await settle((d) => d.section > 0.5 && d.explode < 0.1, 'section');
  await page.getByTestId('mode-neural').click();
  await settle((d) => d.nerveOpacity > 0.5 && d.section < 0.1, 'neural');
  await page.getByTestId('mode-isolated').click();
  await page.getByTestId('structure-mantle').click();
  await settle((d) => d.isolatePart >= 0, 'isolated');
  await page.getByTestId('mode-skin').click();
  await settle((d) => d.skinPatchVisible, 'skin');
  await page.getByTestId('skin-chromatophores').click();
  await expect(page.getByTestId('skin-card').locator('h3')).toHaveText('Chromatophores');
});

test('mechanism lab: tabs, steps and controls drive the engine', async ({ page }) => {
  await open(page);
  await goTo(page, 'mechanisms');
  await expect.poll(async () => (await debug(page)).nerveOpacity).toBeGreaterThan(0.5);
  for (let i = 0; i < 5; i++) await page.getByTestId('step-next').click();
  await expect(page.getByTestId('step-text')).toContainText('Step 6 of 6');
  await expect.poll(async () => (await debug(page)).poseKey).toBe('alert');

  await align(page, 'mechanisms');
  await page.getByTestId('mech-skin').click();
  await expect.poll(async () => (await debug(page)).skinPatchVisible).toBe(true);
  await page.getByTestId('mech-arms').click();
  await page.getByTestId('arm-3').click();
  await expect.poll(async () => (await debug(page)).armHighlights[3]).toBeGreaterThan(0.3);
  await page.getByTestId('mech-locomotion').click();
  await page.getByTestId('loco-jet').click();
  await expect.poll(async () => (await debug(page)).poseKey).toBe('loco-jet');
  await page.getByTestId('mech-mimicry').click();
  await expect.poll(async () => (await debug(page)).poseKey).toBe('channels-1111');
  await page.getByTestId('channel-skin').click();
  await expect.poll(async () => (await debug(page)).poseKey).toBe('channels-1101');
  const d = await debug(page);
  expect(d.armCount).toBe(8);
  expect(d.armsFinite).toBe(true);
});

test('7–8 · all ten targets play to completion with eight finite arms', async ({ page }) => {
  test.setTimeout(240_000);
  await open(page);
  await goTo(page, 'mimicry');
  await expect(page.locator('[data-testid^="target-"]:not([data-testid="target-detail"])')).toHaveCount(10);
  for (const id of TARGETS) {
    await page.getByTestId(`target-${id}`).click();
    await page.getByTestId('speed-2').click();
    await expect(page.getByTestId('target-detail')).toBeVisible();
    let samples = 0;
    await expect
      .poll(
        async () => {
          const d = await debug(page);
          expect(d.armCount, id).toBe(8);
          expect(d.armsFinite, id).toBe(true);
          samples++;
          return d.poseKey === `target-${id}` && d.progress >= 0.999;
        },
        { message: `${id} completes`, timeout: 40_000, intervals: [250] },
      )
      .toBe(true);
    expect(samples).toBeGreaterThan(3);
    expect((await debug(page)).referenceModel).toBe(id);
  }
});

test('8 · pause freezes, scrub seeks, replay restarts, reset returns to rest', async ({ page }) => {
  await open(page);
  await goTo(page, 'mimicry');
  await page.getByTestId('target-sea-snake').click();
  await expect.poll(async () => (await debug(page)).progress).toBeGreaterThan(0.1);
  await page.getByTestId('play-toggle').click();
  await page.waitForTimeout(400);
  const frozen = (await debug(page)).progress;
  await page.waitForTimeout(900);
  expect((await debug(page)).progress).toBeCloseTo(frozen, 3);
  expect(frozen).toBeLessThan(0.99);

  await page.getByTestId('scrub').fill('0.8');
  await expect.poll(async () => (await debug(page)).progress).toBeCloseTo(0.8, 1);
  await expect(page.getByTestId('phase-label')).not.toHaveText('Resting octopus');

  await page.getByTestId('replay').click();
  await expect.poll(async () => (await debug(page)).progress).toBeLessThan(0.5);
  await expect.poll(async () => (await debug(page)).playing).toBe(true);

  await page.getByTestId('rest').click();
  await expect.poll(async () => (await debug(page)).poseKey).toBe('rest');
  await expect(page.getByTestId('caveats')).toBeVisible();
});

test('9 · comparison mode renders two viewports', async ({ page }) => {
  await open(page);
  await goTo(page, 'mimicry');
  await page.getByTestId('target-lionfish').click();
  await expect.poll(async () => (await debug(page)).referenceViewport, { timeout: 15_000 }).toBe(true);
  const small = (await page.getByTestId('reference').boundingBox())!;
  await page.getByTestId('compare').click();
  await expect.poll(async () => (await page.getByTestId('reference').boundingBox())!.width).toBeGreaterThan(small.width * 1.5);
  const d = await debug(page);
  expect(d.referenceViewport).toBe(true);
  expect(d.referenceModel).toBe('lionfish');
  const ref = (await page.getByTestId('reference').boundingBox())!;
  const main = (await page.locator('#stage-mimicry [data-viewport="main"]').boundingBox())!;
  expect(main.x).toBeGreaterThanOrEqual(ref.x + ref.width - 2);
  await expect(page.getByTestId('comparison-table').locator('tbody tr')).toHaveCount(5);
});

test('10 · mobile: no horizontal overflow, tap selection and playback @mobile', async ({ page }) => {
  await open(page);
  for (const stage of STAGES) {
    await goTo(page, stage);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, stage).toBeLessThanOrEqual(1);
  }
  await goTo(page, 'mimicry');
  await page.getByTestId('target-flatfish').tap();
  await expect(page.getByTestId('target-detail')).toBeVisible();
  await expect.poll(async () => (await debug(page)).progress, { timeout: 20_000 }).toBeGreaterThan(0.15);
  await page.getByTestId('play-toggle').tap();
  await page.waitForTimeout(400);
  const frozen = (await debug(page)).progress;
  await page.waitForTimeout(800);
  expect((await debug(page)).progress).toBeCloseTo(frozen, 3);
  const d = await debug(page);
  expect(d.armCount).toBe(8);
  expect(d.armsFinite).toBe(true);
});

test('11 · without WebGL the written content is still there', async ({ page }) => {
  await page.goto('/?nowebgl=1');
  await expect(page.getByTestId('fallback')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mimic Lab');
  await page.getByTestId('structure-brain').click();
  await expect(page.getByTestId('structure-card')).toContainText('Brain');
  await page.getByTestId('target-stingray').click();
  await expect(page.getByTestId('target-detail')).toContainText('Tentative');
  await expect(page.getByTestId('evidence-table').locator('tbody tr')).toHaveCount(10);
  await expect(page.getByTestId('limitations')).toBeVisible();
});

test('12 · disposing the engine releases GPU resources', async ({ page }) => {
  await open(page);
  await goTo(page, 'mimicry');
  await page.getByTestId('target-jellyfish').click();
  await expect.poll(async () => (await debug(page)).referenceViewport, { timeout: 15_000 }).toBe(true);
  expect((await debug(page)).renderer.geometries).toBeGreaterThan(5);
  const memory = await page.evaluate(() => (window as any).__MIMIC__.dispose() as { geometries: number; textures: number });
  expect(memory.geometries).toBe(0);
  expect(memory.textures).toBe(0);
});
