import { readFile, writeFile } from "node:fs/promises";
const catalog = JSON.parse(
  await readFile(
    new URL(
      "../../plugins/paprika-inc/runtime/company-catalog/catalog.json",
      import.meta.url,
    ),
  ),
);
const entries = (kind) => catalog.entries.filter((e) => e.kind === kind);
const safe = (value) =>
  String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
export function catalogSection() {
  const label = (kind, id) =>
    entries(kind).find((e) => e.id === id)?.label ?? id;
  const presets = entries("preset").map((p) => {
    const defaults = p.data.defaults;
    return (
      "| " +
      [
        p.label,
        p.version,
        p.availability,
        defaults
          ? defaults.roles.map((r) => label("role", r.role_id)).join(", ")
          : "—",
        defaults ? label("structure", defaults.structure_id) : "—",
      ]
        .map(safe)
        .join(" | ") +
      " |"
    );
  });
  const structures = entries("structure").map(
    (e) =>
      "| " +
      [
        e.label,
        e.id,
        e.data.reporting === "flat" ? "Direct to coordinator" : "Reporting tree",
        e.availability,
      ]
        .map(safe)
        .join(" | ") +
      " |",
  );
  const roles = entries("role").map(
    (e) =>
      "| " +
      [e.label, e.id, e.description, e.availability]
        .map(safe)
        .join(" | ") +
      " |",
  );
  const packs = entries("pack")
    .filter((p) => p.availability !== "planned")
    .map(
      (p) =>
        "| " +
        [p.label, p.version, (p.data.skills ?? []).join(", ")]
          .map(safe)
          .join(" | ") +
        " |",
    );
  return [
    "<!-- company-catalog:start -->",
    "## Company catalog preview",
    "",
    "Browse and configure a portable company draft in the [shared catalog UI](apps/company-catalog/README.md). One component supports a standalone local interface and an MCP App resource for supported native hosts. This candidate is not installed or deployed; actual Codex/ChatGPT rendering remains unverified.",
    "",
    "### Company types",
    "",
    "| Starting template | Version | Catalog state | Default roles | Default structure |",
    "| --- | --- | --- | --- | --- |",
    ...presets,
    "",
    "### Organization structures",
    "",
    "| Structure | Stable ID | Reporting shape | Catalog state |",
    "| --- | --- | --- | --- |",
    ...structures,
    "",
    "Structures are independent of company type and business-model tags. Review relationships are configured separately from reporting lines.",
    "",
    "### Role templates",
    "",
    "| Role | Stable ID | Purpose | Catalog state |",
    "| --- | --- | --- | --- |",
    ...roles,
    "",
    "Role selection defines a draft roster; it does not create live chats or grant permissions.",
    "",
    "| Available pack source | Version | Included guidance |",
    "| --- | --- | --- |",
    ...packs,
    "",
    "Pack source availability does not establish local installation, authentication, native-host verification, task-quality acceptance or release.",
    "",
    "**Other planned catalog entries:** " +
      catalog.entries
        .filter((e) => e.availability === "planned" && e.kind !== "preset")
        .map((e) => safe(e.label))
        .join(", ") +
      ". The broader [industry and integration roadmap](https://github.com/newbiesitl/paprika-inc/issues/30) is tracked separately.",
    "",
    "Generated from the version " +
      catalog.version +
      " [backend catalog](plugins/paprika-inc/runtime/company-catalog/catalog.json); check with npm --prefix apps/company-catalog run readme:check.",
    "<!-- company-catalog:end -->",
  ].join("\n");
}
const path = new URL("../../README.md", import.meta.url),
  before = await readFile(path, "utf8"),
  block = catalogSection();
const pattern =
  /<!-- company-catalog:start -->[\s\S]*?<!-- company-catalog:end -->/;
const after = pattern.test(before)
  ? before.replace(pattern, () => block)
  : before.trimEnd() + "\n\n" + block + "\n";
if (process.argv.includes("--check")) {
  if (after !== before)
    throw new Error(
      "README catalog drift: run node apps/company-catalog/readme.mjs",
    );
  console.log("README matches canonical catalog.");
} else {
  await writeFile(path, after);
  console.log("Updated README from canonical catalog.");
}
