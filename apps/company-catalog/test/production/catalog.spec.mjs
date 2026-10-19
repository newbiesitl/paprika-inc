import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

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
