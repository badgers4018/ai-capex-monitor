import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
const password = process.env.TEST_LOCAL_PASSWORD!;
const cachedCookies = new Map<string, any[]>();
const pageErrors = new WeakMap<any, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on('pageerror', (e) => errors.push(e.message));
});
test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page)).toEqual([]);
});
async function login(page: any, role = 'reviewer') {
  if (cachedCookies.has(role)) {
    await page.context().addCookies(cachedCookies.get(role)!);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
    return;
  }
  await page.goto('/');
  await page.getByLabel('Username', { exact: true }).fill('TEST_' + role);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Open research desk' }).click();
  await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
  cachedCookies.set(role, await page.context().cookies());
}
test('private sign-in and wrong-credential failure', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Sign in to the registry' })).toBeVisible();
  await page.getByLabel('Username', { exact: true }).fill('TEST_viewer');
  await page.getByLabel('Password', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Open research desk' }).click();
  await expect(page.getByRole('alert')).toContainText('Invalid local credentials');
});
test('viewer navigates records/evidence but has no review controls', async ({ page }) => {
  await login(page, 'viewer');
  await expect(page.getByRole('button', { name: 'Review Queue', exact: false })).toHaveCount(0);
  await page.getByRole('button', { name: 'TEST Evidence Campus', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'TEST Evidence Campus', exact: true }),
  ).toBeVisible();
  await page.getByText('View supporting source evidence').first().click();
  await expect(page.getByRole('link', { name: 'Original source' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Accept supported claim' })).toHaveCount(0);
  await page.getByText('TEST Building 1', { exact: true }).click();
  await expect(page.getByText('Year built: 2020', { exact: false })).toBeVisible();
});
test('search filters empty state and source coverage routes', async ({ page }) => {
  await login(page);
  await page.getByLabel('Search records').fill('NO-SUCH-TEST-PROJECT');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'No projects match these filters' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sources & Coverage', exact: false }).click();
  await expect(
    page.getByRole('heading', { name: 'Sources & Coverage', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('direct_listing_and_sample_document_http_403')).toHaveCount(0);
  await expect(page.getByText('blocked', { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText('Local runtime only. No scheduled production collector.').first(),
  ).toBeVisible();
});
test('reviewer submits a source-backed review and sees selected evidence', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'TEST Evidence Campus', exact: true }).click();
  const claim = page
    .locator('.claim')
    .filter({ has: page.locator('code').filter({ hasText: 'status.construction' }) })
    .first();
  await claim
    .locator('textarea')
    .fill('TEST reviewer verifies the exact county-reported planned state only');
  await claim.getByRole('button', { name: 'Accept supported claim' }).click();
  await expect(claim.getByText('Selected fact', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Changes', exact: false }).click();
  await expect(page.getByText('review.accepted', { exact: true })).toBeVisible();
});
test('paired export downloads and unchanged weekly tape are usable', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Export XLSX + Markdown' }).click();
  await expect(page.getByRole('link', { name: 'Download XLSX' })).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: 'Download MARKDOWN' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('projects.md');
  await page.getByRole('button', { name: 'Weekly Tape', exact: false }).click();
  await page.getByRole('button', { name: '2026-10-11', exact: false }).click();
  await expect(
    page.getByRole('heading', { name: 'Permit Intelligence Appendix', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Original weekly report', exact: true }),
  ).toBeVisible();
});
test('companies expose uncertainty and a citation proposal form', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Companies', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'Ownership is not guessed' })).toBeVisible();
  await page
    .getByText('Propose an evidenced company relationship or site role', { exact: true })
    .click();
  await page.getByLabel('Legal entity name', { exact: true }).fill('TEST Site Company');
  await page
    .getByLabel('Parent / related entity name', { exact: true })
    .fill('TEST Parent Company');
  await page
    .getByLabel('Original HTTPS source URL', { exact: true })
    .fill('https://example.invalid/TEST-parent');
  await page
    .getByLabel('Exact supporting quotation', { exact: true })
    .fill(
      'TEST-only disclosure explicitly states control of TEST Site Company by TEST Parent Company',
    );
  await page.getByRole('button', { name: 'Save unreviewed proposal' }).click();
  await expect(page.getByRole('status')).toContainText('Proposal saved for review');
});
test('API error state is recoverable', async ({ page }) => {
  await login(page);
  await page.route('**/api/v1/projects?*', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'TEST simulated unavailable registry' }),
    }),
  );
  await page.getByRole('button', { name: 'Permits & Plans', exact: false }).click();
  await page.getByRole('button', { name: 'Projects', exact: false }).first().click();
  await expect(page.getByRole('alert')).toContainText('TEST simulated unavailable registry');
  await page.unroute('**/api/v1/projects?*');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'TEST Evidence Campus', exact: true }),
  ).toBeVisible();
});
test('mobile navigation/table usability and keyboard sign-out', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, 'viewer');
  await expect(
    page.getByRole('button', { name: 'TEST Evidence Campus', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sources & Coverage', exact: false }).click();
  await expect(
    page.getByRole('heading', { name: 'Sources & Coverage', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).focus();
  await page.keyboard.press('Enter');
  cachedCookies.delete('viewer');
  await expect(page.getByRole('heading', { name: 'Sign in to the registry' })).toBeVisible();
});
test('desktop and mobile screenshots capture a synthetic-only research desk', async ({ page }) => {
  await login(page, 'viewer');
  mkdirSync(resolve('.local/screenshots'), { recursive: true });
  await page.screenshot({ path: '.local/screenshots/desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '.local/screenshots/mobile.png', fullPage: true });
});
test('candidate identity confirmation is audited and does not approve ownership', async ({
  page,
}) => {
  await login(page);
  await page.getByRole('button', { name: 'TEST Evidence Campus', exact: true }).click();
  await page.getByText('Review candidate record identity', { exact: true }).click();
  await page
    .getByLabel('Identity review rationale')
    .fill(
      'TEST reviewer verifies the explicit source GlobalID and planning identity, not ownership',
    );
  await page.getByRole('button', { name: 'Confirm source identity', exact: true }).click();
  await expect(page.getByText('Source record identity confirmed.', { exact: false })).toBeVisible();
});
test('principal research screens pass automated WCAG A/AA checks', async ({ page }) => {
  await login(page);
  for (const name of [
    'Projects',
    'Permits & Plans',
    'Companies',
    'Sources & Coverage',
    'Review Queue',
  ]) {
    await page.getByRole('button', { name, exact: false }).first().click();
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    await expect(page.getByText('Loading source-linked records…', { exact: true })).toHaveCount(0);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  }
});
