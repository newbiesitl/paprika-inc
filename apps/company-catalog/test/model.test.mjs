import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { CatalogModel, readDraft, clone } from "../src/model.mjs";
const raw = JSON.parse(
  await readFile(
    new URL(
      "../../../plugins/paprika-inc/runtime/company-catalog/catalog.json",
      import.meta.url,
    ),
  ),
);
const software = JSON.parse(
  await readFile(
    new URL(
      "../../../tests/fixtures/company-catalog/software-studio.json",
      import.meta.url,
    ),
  ),
);
const catalog = { ...raw, catalog: software.catalog };
catalog.entries.push({ kind: "preset", id: "planned-company-fixture", label: "Planned fixture company", availability: "planned", data: {} });
const setup = async (call) => {
  const model = new CatalogModel({
    call: call ?? (async () => clone(catalog)),
  });
  await model.load();
  model.choose("software-studio");
  return model;
};

test("restructuring preserves identity, existing roles, edits and stale evidence", async () => {
  const m = await setup();
  m.draft.company.name = "Existing company";
  m.draft.roles[1].title = "Existing specialist";
  m.draft.catalog.sha256 = "old";
  const before = clone(m.draft);
  m.mode = "restructure";
  m.preview = { ok: true };
  m.choose("scientific-research");
  assert.equal(m.draft.preset_id, "scientific-research");
  assert.deepEqual(m.draft.company, before.company);
  for (const role of before.roles)
    assert.deepEqual(m.draft.roles.find((r) => r.role_id === role.role_id), role);
  assert(m.draft.roles.some((r) => r.role_id === "researcher"));
  assert.equal(m.stale, true);
  assert.equal(m.preview, null);
  const next = clone(m.draft);
  assert.equal(m.choose("planned-company-fixture"), false);
  assert.deepEqual(m.draft, next);
  m.draft = null;
  assert.throws(() => m.choose("software-studio"), /Open the existing company's saved draft/);
});
test("both presets initialize from the single backend inventory and retain per-preset edits", async () => {
  const m = await setup();
  assert.deepEqual(m.draft, software);
  m.draft.company.name = "Customized";
  m.choose("scientific-research");
  assert.equal(m.draft.roles.length, 4);
  assert(
    m.draft.roles
      .find((r) => r.role_id === "researcher")
      .packs.includes("research-core"),
  );
  m.choose("software-studio");
  assert.equal(m.draft.company.name, "Customized");
  assert.equal(m.choose("planned-company-fixture"), false);
  assert.equal(m.draft.company.name, "Customized");
});
test("refresh preserves old identity and all choices until explicit revalidation", async () => {
  let value = clone(catalog);
  const m = await setup(async () => clone(value));
  m.draft.roles[1].packs = [];
  value.catalog.sha256 = "changed";
  await m.load();
  assert.equal(m.stale, true);
  assert.deepEqual(m.draft.roles[1].packs, []);
  m.refreshIdentity();
  assert.equal(m.stale, false);
  assert.deepEqual(m.draft.roles[1].packs, []);
});
test("late preview cannot validate newer edits", async () => {
  let finish;
  const m = await setup(async (op) =>
    op === "list"
      ? clone(catalog)
      : new Promise((resolve) => {
          finish = resolve;
        }),
  );
  const pending = m.review();
  m.draft.company.name = "New";
  m.changed();
  finish({ ok: true });
  assert.equal(await pending, null);
  assert.equal(m.preview, null);
});
test("late catalog response cannot replace a newer refresh", async () => {
  const queue = [];
  const m = new CatalogModel({
    call: () => new Promise((resolve) => queue.push(resolve)),
  });
  const first = m.load(),
    second = m.load();
  const latest = clone(catalog);
  latest.catalog.version = "9.0.0";
  queue[1](latest);
  await second;
  queue[0](catalog);
  await first;
  assert.equal(m.catalog.catalog.version, "9.0.0");
});
test("failed refresh leaves the draft and read-only evidence available", async () => {
  let fail = false;
  const m = await setup(async () => {
    if (fail) throw new Error("offline");
    return clone(catalog);
  });
  const before = clone(m.draft);
  fail = true;
  await assert.rejects(m.load(), /offline/);
  assert.deepEqual(m.draft, before);
});
test("export requires reviewed current content and ignores changed-during-export results", async () => {
  let finish;
  const m = await setup(async (op) =>
    op === "list"
      ? clone(catalog)
      : new Promise((resolve) => {
          finish = resolve;
        }),
  );
  await assert.rejects(m.export(), /Review/);
  m.preview = { ok: true };
  const pending = m.export();
  m.changed();
  finish({ ok: true, selection: software });
  await assert.rejects(pending, /changed/);
});
test("portable draft reader preserves invalid graph choices but rejects unsupported or sensitive fields", () => {
  const d = clone(software);
  d.roles[1].reviewers = ["architect"];
  assert.deepEqual(readDraft(JSON.stringify(d)), d);
  for (const extra of [
    { credentials: "secret" },
    { native_chat_id: "private" },
    { schema_version: 2 },
  ])
    assert.throws(
      () => readDraft(JSON.stringify({ ...d, ...extra })),
      /Unsupported/,
    );
  d.company.repository = "https://user:secret@example.invalid/repo";
  assert.throws(() => readDraft(JSON.stringify(d)), /portable/);
});
test("invalid import never overwrites current work", async () => {
  const m = await setup();
  m.draft.company.name = "Keep me";
  assert.throws(() => m.import('{"schema_version":99}'));
  assert.equal(m.draft.company.name, "Keep me");
});

test("export envelopes reopen only their portable selection and discard prior review evidence", async () => {
  const m = await setup();
  const selection = clone(software);
  selection.roles[1].title = "Custom architect";
  selection.roles[1].reviewers = ["unknown-reviewer"];
  const envelope = {
    schema_version: 1,
    ok: true,
    command: "config export",
    read_only: true,
    applied: false,
    catalog: selection.catalog,
    selection_sha256: "previous-review",
    diagnostics: [],
    requirements: [],
    evidence: { release_state: "draft" },
    selection,
    blueprint: { schema_version: 1 },
    roster: [],
    application: "portable_draft",
  };
  m.preview = { ok: true };
  m.import(JSON.stringify(envelope));
  assert.deepEqual(m.draft, selection);
  assert.equal(m.preview, null);
  assert.throws(
    () => m.import(JSON.stringify({ ...envelope, credentials: "private" })),
    /Unsupported export/,
  );
  assert.deepEqual(m.draft, selection);
});
