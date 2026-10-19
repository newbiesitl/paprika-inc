import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { unzipSync, strFromU8 } from "fflate";
import AxeBuilder from "@axe-core/playwright";

test("initialize through the real backend, edit a role and export a portable company", async ({ page }) => {
  await page.goto("/?mode=initialize");
  await page.getByLabel("Choose a company").selectOption("software-studio");
  await page.getByRole("button", { name: "Configure this template" }).click();
  await page.getByLabel("Company name", { exact: true }).fill("Production test studio");
  await page.getByLabel("Configure role", { exact: true }).selectOption("developer");
  await page.locator("#title-developer").fill("Application Engineer");
  await page.getByRole("button", { name: "Review configuration", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Production test studio", exact: true })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export reviewed blueprint" }).click();
  const result = JSON.parse(await readFile(await (await download).path(), "utf8"));
  expect(result.ok).toBe(true);
  expect(result.applied).toBe(false);
  expect(result.blueprint.roles.find((r) => r.id === "developer").title).toBe("Application Engineer");
  const zipDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download repository files" }).click();
  const files = unzipSync(await readFile(await (await zipDownload).path()));
  const manifest = JSON.parse(strFromU8(files["company/company.json"]));
  expect(manifest.roles.map((r) => r.id)).toEqual(result.selection.roles.map((r) => r.role_id));
  expect(strFromU8(files["company/roles/developer/agent.md"])).toContain("# Application Engineer");
  expect(JSON.parse(strFromU8(files["company/catalog-selection.json"]))).toEqual(result.selection);
  const briefDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download AI refinement brief" }).click();
  const brief = await readFile(await (await briefDownload).path(), "utf8");
  expect(brief).toContain("NOT been LLM-refined");
  expect(brief).toContain("Application Engineer");
  expect(brief).toContain('"blueprint"');
});

test("restructure imports the existing selection and retains company identity and roles across types", async ({ page }) => {
  await page.goto("/?mode=restructure");
  await page.getByLabel("Choose a company").selectOption("scientific-research");
  await page.getByRole("button", { name: "Configure this template" }).click();
  await expect(page.locator("#notice")).toContainText("Open the existing company's saved draft");
  const response = await page.request.post("/api/read", { data: { kind: "preset", id: "software-studio" } });
  const { default_selection: draft } = await response.json();
  draft.company.name = "Existing company";
  draft.roles.find((r) => r.role_id === "developer").title = "Existing Engineer";
  await page.getByLabel("Open saved draft").setInputFiles({
    name: "existing.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(draft)),
  });
  await page.getByLabel("Choose a company").selectOption("scientific-research");
  await page.getByRole("button", { name: "Configure this template" }).click();
  await expect(page.getByLabel("Company name", { exact: true })).toHaveValue("Existing company");
  await page.getByLabel("Configure role", { exact: true }).selectOption("developer");
  await expect(page.locator("#title-developer")).toHaveValue("Existing Engineer");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  const saved = JSON.parse(await readFile(await (await download).path(), "utf8"));
  expect(saved.company).toEqual(draft.company);
  expect(saved.preset_id).toBe("scientific-research");
  for (const role of draft.roles) expect(saved.roles).toContainEqual(role);
  expect(saved.roles.some((r) => r.role_id === "researcher")).toBe(true);
  await page.reload();
  await expect(page.getByLabel("Company action", { exact: true })).toHaveValue("restructure");
  await expect(page.getByLabel("Company name", { exact: true })).toHaveValue("Existing company");
});

test("action changes survive reload and diagnostics reveal a filtered role", async ({ page }) => {
  await page.goto("/?mode=initialize");
  await page.getByLabel("Company action", { exact: true }).selectOption("restructure");
  await page.reload();
  await expect(page.getByLabel("Company action", { exact: true })).toHaveValue("restructure");
  await page.getByLabel("Company action", { exact: true }).selectOption("initialize");
  await page.getByLabel("Choose a company").selectOption("software-studio");
  await page.getByRole("button", { name: "Configure this template" }).click();
  await page.getByLabel("Configure role", { exact: true }).selectOption("developer");
  await page.locator("#title-developer").fill("");
  await page.getByLabel("Configure role", { exact: true }).selectOption("architect");
  await page.getByRole("button", { name: "Review configuration", exact: true }).click();
  await page.locator('[data-diagnostic="$.roles[2].title"]').click();
  await expect(page.getByLabel("Configure role", { exact: true })).toHaveValue("developer");
  await expect(page.locator("#title-developer")).toBeFocused();
});

test("narrow review roster is keyboard scrollable and accessible", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/?mode=initialize");
  await page.getByLabel("Choose a company").selectOption("software-studio");
  await page.getByRole("button", { name: "Configure this template" }).click();
  await page.getByRole("button", { name: "Review configuration", exact: true }).click();
  const roster = page.getByRole("region", { name: "Resulting roster", exact: true });
  await roster.focus();
  await expect(roster).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => roster.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(audit.violations).toEqual([]);
});
