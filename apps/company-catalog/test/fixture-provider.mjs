// UI-only service fixture. Not backend validation or native-host evidence.
import { readFile } from "node:fs/promises";
const read = async (path) =>
  JSON.parse(await readFile(new URL(path, import.meta.url)));
const raw = await read(
  "../../../plugins/paprika-inc/runtime/company-catalog/catalog.json",
);
const baseline = await read(
  "../../../tests/fixtures/company-catalog/software-studio.json",
);
export const catalog = {
  ...raw,
  catalog: baseline.catalog,
  evidence_scope: "browser_fixture",
};
export async function fixtureCall(op, { selection } = {}) {
  if (op === "list") return structuredClone(catalog);
  const diagnostics = [];
  if (selection.catalog.sha256 !== catalog.catalog.sha256)
    diagnostics.push({
      path: "catalog.sha256",
      code: "stale_catalog",
      message: "Catalog identity is stale.",
    });
  if (selection.roles.some((r) => r.reviewers.includes(r.role_id)))
    diagnostics.push({
      path: "roles.reviewers",
      code: "self_review",
      message: "A role cannot review itself.",
    });
  return {
    schema_version: 1,
    ok: !diagnostics.length,
    command: "UI fixture " + op,
    read_only: true,
    applied: false,
    catalog: catalog.catalog,
    selection_sha256: "fixture-only",
    diagnostics,
    selection,
    requirements: [
      { id: "node-runtime", state: "unknown" },
      { id: "git-client", state: "unknown" },
    ],
    evidence: {
      catalog_availability: "template",
      package_presence: [],
      local_configuration: "unverified",
      connection_authentication: "unverified",
      native_host_verification: "unverified",
      task_quality_acceptance: "unverified",
      release_state: "draft",
    },
    ...(op === "export"
      ? { blueprint: { schema_version: 1, company_id: selection.company.id } }
      : {}),
  };
}
