import test from "node:test";
import assert from "node:assert/strict";
import { unzipSync, strFromU8 } from "fflate";
import { invoke } from "../provider.mjs";
import { repositoryArchive } from "../src/repository-archive.mjs";
import { CatalogModel } from "../src/model.mjs";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { inspectDefinition } from "../../../plugins/paprika-inc/runtime/paprika-inc/definition.mjs";
import { refinementBrief } from "../src/refinement.mjs";

test("repository ZIP contains canonical files for every configured role and reopens its selection", async () => {
  for (const id of ["software-studio", "scientific-research", "law-firm", "marketing-agency"]) {
    const { default_selection: selection } = await invoke("read", { kind: "preset", id });
    selection.roles[1].title = "Configured Specialist";
    const result = await invoke("export", { selection });
    const archive = unzipSync(repositoryArchive(result));
    const manifest = JSON.parse(strFromU8(archive["company/company.json"]));
    assert.equal(manifest.company_id, selection.company.id);
    assert.deepEqual(manifest.roles.map((r) => r.id), selection.roles.map((r) => r.role_id));
    for (const role of manifest.roles) {
      assert(archive[role.definition], role.definition);
      assert.match(strFromU8(archive[role.definition]), /## Responsibilities/);
    }
    assert.match(strFromU8(archive[manifest.roles[1].definition]), /^# Configured Specialist/);
    const model = new CatalogModel({ call: invoke });
    await model.load();
    model.import(strFromU8(archive["company/catalog-selection.json"]));
    assert.deepEqual(model.draft, selection);
    for (const file of result.repository_files)
      assert.equal(strFromU8(archive[file.path]), file.content);
    assert.deepEqual(repositoryArchive(result), repositoryArchive(result));
    const destination = await mkdtemp(join(tmpdir(), "paprika-export-check-"));
    for (const [path, bytes] of Object.entries(archive)) {
      const target = join(destination, path);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, bytes);
    }
    const inspected = await inspectDefinition(destination);
    assert.equal(inspected.manifest.company_id, selection.company.id);
    assert.equal(inspected.roles.length, selection.roles.length);
    const brief = refinementBrief(result, "restructure");
    assert.match(brief, /existing-company definition proposal/);
    assert.match(brief, /NOT been LLM-refined/);
    assert(brief.includes(JSON.stringify({ selection, blueprint: result.blueprint }, null, 2)));
  }
});

test("repository archive rejects missing, duplicate and escaping paths", async () => {
  const { default_selection: selection } = await invoke("read", { kind: "preset", id: "software-studio" });
  const result = await invoke("export", { selection });
  const missing = structuredClone(result);
  missing.repository_files.pop();
  assert.throws(() => repositoryArchive(missing), /missing/);
  for (const path of ["../outside", "/absolute", "company/../secret", "company/company.json"]) {
    const changed = structuredClone(result);
    changed.repository_files.push({ path, content: "unexpected" });
    assert.throws(() => repositoryArchive(changed), /Unexpected or duplicate/);
  }
});

test("destination conflicts allow proposal export but invalid configurations do not", async () => {
  const model = new CatalogModel({ call: invoke });
  await model.load();
  model.choose("software-studio");
  model.preview = { ok: false, selection: structuredClone(model.draft),
    diagnostics: [{ code: "authoring_conflict", path: "company/company.json" }] };
  assert.equal(model.canExport, true);
  assert((await model.export()).repository_files.length > 0);
  model.preview.diagnostics.push({ code: "invalid_reviewer" });
  assert.equal(model.canExport, false);
  await assert.rejects(model.export(), /Review/);
});
