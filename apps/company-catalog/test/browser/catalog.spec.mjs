import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
const fixture = JSON.parse(
  await readFile(
    new URL(
      "../../../../tests/fixtures/company-catalog/software-studio.json",
      import.meta.url,
    ),
  ),
);
async function configure(page, id = "software-studio") {
  await page.goto("/");
  await page.getByLabel("Choose a company").selectOption(id);
  await page.getByRole("button", { name: "Configure this template" }).click();
  await expect(page.getByLabel("Company name", { exact: true })).toBeVisible();
}
test("search, empty results, keyboard picker, planned entry and retained selection", async ({
  page,
}) => {
  await configure(page);
  await page
    .getByLabel("Company name", { exact: true })
    .fill("Retain this team");
  await page.getByLabel("Search company types").fill("不存在");
  await expect(
    page.getByText("No company types match.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByLabel("Choose a company").focus();
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.getByLabel("Choose a company").selectOption("marketing-agency");
  await expect(
    page.getByText("This preset is planned.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByLabel("Company name", { exact: true })).toHaveValue(
    "Retain this team",
  );
});
test("roles, structure and packs survive review and tab reload", async ({
  page,
}) => {
  await configure(page, "scientific-research");
  await page
    .getByLabel("Organization structure")
    .selectOption("functional-departments");
  await page.locator("#title-researcher").fill("Evidence Researcher");
  await page.locator("#pack-researcher-engineering-core").check();
  await page.getByLabel("Company name", { exact: true }).fill("Evidence Lab");
  await page
    .getByRole("button", { name: "Review configuration", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Evidence Lab", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("connection authentication", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Company name", { exact: true })).toHaveValue(
    "Evidence Lab",
  );
  await expect(page.locator("#title-researcher")).toHaveValue(
    "Evidence Researcher",
  );
  await expect(page.locator("#pack-researcher-engineering-core")).toBeChecked();
  await expect(page.getByLabel("Organization structure")).toHaveValue(
    "functional-departments",
  );
});
test("service error and retry retain draft", async ({ page }) => {
  await configure(page);
  await page.getByLabel("Company name", { exact: true }).fill("Keep my work");
  await page.route("**/api/list", (route) =>
    route.fulfill({ status: 503, body: "offline" }),
  );
  await page.getByRole("button", { name: "Refresh catalog" }).click();
  await expect(page.locator("#notice")).toContainText("unavailable");
  await expect(page.getByLabel("Company name", { exact: true })).toHaveValue(
    "Keep my work",
  );
  await page.unroute("**/api/list");
  await page.getByRole("button", { name: "Refresh catalog" }).click();
  await expect(page.locator("#notice")).toContainText("Catalog loaded");
});
test("stale import is retained, revalidated explicitly, and exported losslessly", async ({
  page,
}) => {
  await configure(page);
  const draft = structuredClone(fixture);
  draft.catalog.sha256 = "0".repeat(64);
  draft.company.name = "Imported team";
  await page.getByLabel("Open saved draft").setInputFiles({
    name: "draft.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(draft)),
  });
  await expect(
    page.getByText("Catalog changed.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Use current catalog and revalidate" })
    .click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export reviewed blueprint" }).click();
  const output = JSON.parse(
    await readFile(await (await pending).path(), "utf8"),
  );
  expect(output.selection.company.name).toBe("Imported team");
  expect(output.selection.roles).toEqual(draft.roles);
  expect(output.selection.catalog.sha256).not.toBe(draft.catalog.sha256);
  await page.getByLabel("Open saved draft").setInputFiles({
    name: "export.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(output)),
  });
  await expect(page.getByLabel("Company name", { exact: true })).toHaveValue(
    "Imported team",
  );
  await expect(
    page.getByRole("button", { name: "Review configuration", exact: true }),
  ).toBeVisible();
});
test("invalid import preserves current draft and markup renders as text", async ({
  page,
}) => {
  await configure(page);
  await page
    .getByLabel("Company name", { exact: true })
    .fill("<img src=x onerror=alert(1)>");
  await page
    .getByRole("button", { name: "Review configuration", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "<img src=x onerror=alert(1)>",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("img[src=x]")).toHaveCount(0);
  await page.getByLabel("Open saved draft").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"schema_version":2}'),
  });
  await expect(page.locator("#notice")).toContainText("Unsupported draft");
});
test("native bridge fixture matches standalone export and unsupported host has fallback", async ({
  page,
}) => {
  await configure(page);
  await page
    .getByRole("button", { name: "Review configuration", exact: true })
    .click();
  let pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export reviewed blueprint" }).click();
  const standalone = JSON.parse(
    await readFile(await (await pending).path(), "utf8"),
  );
  await page.evaluate(() => sessionStorage.clear());
  await page.goto("/harness");
  const frame = page.frameLocator("#catalog-frame");
  await expect(
    frame.getByText("Native MCP App panel", { exact: true }),
  ).toBeVisible();
  await frame.getByLabel("Choose a company").selectOption("software-studio");
  await frame.getByRole("button", { name: "Configure this template" }).click();
  await frame
    .getByRole("button", { name: "Review configuration", exact: true })
    .click();
  pending = page.waitForEvent("download");
  await frame
    .getByRole("button", { name: "Export reviewed blueprint" })
    .click();
  const nativeFixture = JSON.parse(
    await readFile(await (await pending).path(), "utf8"),
  );
  expect(nativeFixture.selection).toEqual(standalone.selection);
  await page.goto("/harness?unsupported");
  await expect(
    page
      .frameLocator("#catalog-frame")
      .getByRole("heading", { name: "Use the catalog without the panel" }),
  ).toBeVisible();
});
test("accessible names, keyboard focus, and narrow layout", async ({
  page,
}) => {
  await configure(page);
  await page.getByLabel("Company name", { exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Company ID", { exact: true })).toBeFocused();
  await page
    .getByRole("button", { name: "Review configuration", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#panel-heading")).toBeFocused();
  let scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(scan.violations).toEqual([]);
  await page.getByRole("button", { name: "Edit configuration" }).click();
  await page.setViewportSize({ width: 375, height: 812 });
  scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(scan.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/catalog-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/catalog-desktop.png",
    fullPage: false,
  });
});
