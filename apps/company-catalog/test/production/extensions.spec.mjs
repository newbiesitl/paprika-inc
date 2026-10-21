import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';
import AxeBuilder from '@axe-core/playwright';

test('Essential and Extension companies are separated and a refined extension team exports and reopens', async ({ page }) => {
  await page.goto('/?mode=initialize');
  await page.getByLabel('Template collection', { exact: true }).selectOption('essential');
  await expect(page.locator('#preset option[value]:not([value=""])')).toHaveCount(2);
  await page.getByLabel('Template collection', { exact: true }).selectOption('extension');
  await expect(page.locator('#preset option[value]:not([value=""])')).toHaveCount(43);
  await page.getByLabel('Search company types').fill('law firm');
  await expect(page.locator('#preset option[value]:not([value=""])')).toHaveCount(1);
  await page.getByLabel('Choose a company').selectOption('law-firm');
  await expect(page.locator('.picker')).toContainText('Extension · In development');
  await page.getByRole('button', { name: 'Configure this template' }).click();
  await expect(page.locator('#role-picker optgroup[label="Essential"] option')).toHaveCount(7);
  await expect(page.locator('#role-picker optgroup[label="Extensions · In development"] option')).toHaveCount(130);
  await expect(page.locator('#role-legal-researcher')).toBeChecked();
  await page.getByLabel('Configure role', { exact: true }).selectOption('marketing-strategist');
  await page.locator('#role-marketing-strategist').check();
  await page.locator('#title-marketing-strategist').fill('Client Outreach Strategist');
  await page.getByLabel('Role collection', { exact: true }).selectOption('selected');
  await expect(page.locator('#title-marketing-strategist')).toHaveValue('Client Outreach Strategist');
  await page.getByRole('button', { name: 'Review configuration', exact: true }).click();
  await expect(page.getByText('Extension starter: still in development.', { exact: false }).last()).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export reviewed blueprint' }).click();
  const exported = JSON.parse(await readFile(await (await download).path(), 'utf8'));
  expect(exported.ok).toBe(true);
  expect(exported.selection.preset_id).toBe('law-firm');
  expect(exported.evidence.task_quality_acceptance).toBe('unverified');
  expect(exported.blueprint.roles.find(r => r.id === 'marketing-strategist').title).toBe('Client Outreach Strategist');
  const zipDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download repository files' }).click();
  const zip = unzipSync(await readFile(await (await zipDownload).path()));
  expect(strFromU8(zip['company/roles/legal-researcher/agent.md'])).toContain('research-derived starter');
  await page.getByLabel('Open saved draft').setInputFiles({
    name: 'law-firm.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(exported)),
  });
  await page.getByLabel('Configure role', { exact: true }).selectOption('marketing-strategist');
  await expect(page.locator('#title-marketing-strategist')).toHaveValue('Client Outreach Strategist');
  await page.reload();
  await expect(page.locator('#role-legal-researcher')).toBeChecked();
  await page.getByLabel('Configure role', { exact: true }).selectOption('marketing-strategist');
  await expect(page.locator('#title-marketing-strategist')).toHaveValue('Client Outreach Strategist');
});

test('Extension filtering retains Essential edits and stays accessible on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/?mode=initialize');
  await page.getByLabel('Choose a company').selectOption('software-studio');
  await page.getByRole('button', { name: 'Configure this template' }).click();
  await page.getByLabel('Company name', { exact: true }).fill('Retained Essential company');
  await page.getByLabel('Template collection', { exact: true }).selectOption('extension');
  await page.getByLabel('Choose a company').selectOption('marketing-agency');
  await page.getByRole('button', { name: 'Configure this template' }).click();
  await expect(page.locator('#role-marketing-strategist')).toBeChecked();
  await expect(page.locator('#role-seo-analyst')).toBeChecked();
  // Font metrics vary between Windows and Linux; headers must wrap with wider text too.
  await page.addStyleTag({ content: '.role-head { font-family: monospace; font-size: 17px; }' });
  const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(audit.violations).toEqual([]);
  const overflow = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth,
    elements: [...document.querySelectorAll('.role-head, .role-head > *')]
      .filter(el => el.getBoundingClientRect().right > innerWidth).map(el => el.className) }));
  expect(overflow.scroll, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.width + 1);
  await page.getByLabel('Template collection', { exact: true }).selectOption('essential');
  await page.getByLabel('Choose a company').selectOption('software-studio');
  await page.getByRole('button', { name: 'Configure this template' }).click();
  await expect(page.getByLabel('Company name', { exact: true })).toHaveValue('Retained Essential company');
});
