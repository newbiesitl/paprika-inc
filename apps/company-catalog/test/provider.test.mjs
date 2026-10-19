import test from "node:test";
import assert from "node:assert/strict";
import { invoke } from "../provider.mjs";
import { CatalogModel, readDraft } from "../src/model.mjs";

test("production provider validates, previews and exports both catalog presets", async () => {
  const model = new CatalogModel({ call: invoke });
  await model.load();
  assert(model.catalog.integrations.length > 0);
  for (const id of ["software-studio", "scientific-research"]) {
    model.choose(id);
    const review = await model.review();
    assert.equal(review.ok, true, JSON.stringify(review.diagnostics));
    assert.equal(review.destination_state, "not_inspected");
    assert(review.proposed_files.some((f) => f.path === "company/company.json"));
    const exported = await model.export();
    assert.deepEqual(readDraft(JSON.stringify(exported)), model.draft);
    assert.equal(exported.applied, false);
    assert.equal(exported.evidence.native_host_verification, "unverified");
  }
});

test("production provider rejects invalid relationships and stale drafts", async () => {
  const { default_selection: selection } = await invoke("read", {
    kind: "preset", id: "software-studio",
  });
  selection.roles[1].reviewers = [selection.roles[1].role_id];
  const invalid = await invoke("preview", { selection });
  assert.equal(invalid.ok, false);
  assert(invalid.diagnostics.some((d) => d.code === "invalid_reviewer"));
  selection.catalog.sha256 = "0".repeat(64);
  const stale = await invoke("export", { selection });
  assert.equal(stale.ok, false);
  assert.equal(stale.blueprint, undefined);
  await assert.rejects(invoke("export", { selection, repository: "private-path" }));
});
