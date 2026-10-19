export const clone = (value) => structuredClone(value);
const only = (value, keys) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.keys(value).every((k) => keys.includes(k));
export function readDraft(text) {
  if (text.length > 262144)
    throw new Error("Draft is too large (maximum 256 KiB).");
  let d = JSON.parse(text);
  if (d?.selection && d?.blueprint) {
    if (
      d.schema_version !== 1 ||
      !only(d, [
        "schema_version",
        "ok",
        "command",
        "read_only",
        "applied",
        "catalog",
        "selection_sha256",
        "diagnostics",
        "requirements",
        "evidence",
        "selection",
        "blueprint",
        "repository_files",
        "roster",
        "application",
      ])
    )
      throw new Error("Unsupported export envelope. Draft retained.");
    d = d.selection;
  }
  if (
    !only(d, [
      "schema_version",
      "catalog",
      "preset_id",
      "structure_id",
      "business_model_tags",
      "company",
      "roles",
    ]) ||
    d.schema_version !== 1 ||
    !only(d.catalog, ["version", "sha256"]) ||
    !only(d.company, ["id", "name", "repository", "version", "purpose"]) ||
    !Array.isArray(d.roles) ||
    d.roles.length > 100 ||
    !Array.isArray(d.business_model_tags) ||
    d.roles.some(
      (r) =>
        !only(r, [
          "role_id",
          "packs",
          "workflows",
          "reports_to",
          "reviewers",
          "title",
        ]) ||
        !Array.isArray(r.packs) ||
        !Array.isArray(r.workflows) ||
        !Array.isArray(r.reviewers),
    )
  ) {
    throw new Error(
      "Unsupported draft format. Open a version 1 company selection; your current draft has been retained.",
    );
  }
  if (
    typeof d.preset_id !== "string" ||
    typeof d.structure_id !== "string" ||
    typeof d.catalog.sha256 !== "string" ||
    typeof d.catalog.version !== "string"
  )
    throw new Error("Draft identity is missing.");
  for (const field of ["id", "name", "repository", "version", "purpose"])
    if (typeof d.company[field] !== "string" || d.company[field].length > 8000)
      throw new Error("Invalid company field: " + field);
  if (
    d.company.repository &&
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(d.company.repository)
  )
    throw new Error(
      "Use a portable owner/name repository, without credentials, URL or machine path.",
    );
  for (const r of d.roles) {
    if (
      typeof r.role_id !== "string" ||
      r.role_id.length > 96 ||
      (r.title !== undefined &&
        (typeof r.title !== "string" ||
          r.title.length > 160 ||
          /[\r\n]/.test(r.title))) ||
      (r.reports_to !== null && typeof r.reports_to !== "string") ||
      [...r.packs, ...r.workflows, ...r.reviewers].some(
        (v) => typeof v !== "string" || v.length > 96,
      )
    )
      throw new Error("Invalid role selection.");
  }
  if (d.business_model_tags.some((v) => typeof v !== "string" || v.length > 96))
    throw new Error("Invalid business-model tags.");
  return d;
}
export class CatalogModel {
  constructor(transport) {
    this.transport = transport;
    this.catalog = null;
    this.draft = null;
    this.preview = null;
    this.generation = 0;
    this.loadGeneration = 0;
    this.cache = new Map();
    this.host = null;
    this.mode = "initialize";
  }
  entries(kind) {
    return this.catalog?.entries.filter((e) => e.kind === kind) ?? [];
  }
  entry(kind, id) {
    return this.entries(kind).find((e) => e.id === id);
  }
  get stale() {
    return (
      this.draft &&
      this.catalog &&
      (this.draft.catalog.sha256 !== this.catalog.catalog.sha256 ||
        this.draft.catalog.version !== this.catalog.catalog.version)
    );
  }
  get canExport() {
    return !this.stale && !!this.preview && (this.preview.ok ||
      !!this.preview.selection && this.preview.diagnostics?.length > 0 &&
      this.preview.diagnostics.every((d) => d.code === "authoring_conflict"));
  }
  async load() {
    const seq = ++this.loadGeneration;
    const result = await this.transport.call("list");
    if (seq !== this.loadGeneration) return false;
    if (
      result.schema_version !== 1 ||
      !Array.isArray(result.entries) ||
      !result.catalog?.sha256
    )
      throw new Error("Unsupported catalog response. Draft retained.");
    this.catalog = result;
    this.preview = null;
    this.generation++;
    return true;
  }
  choose(id) {
    if (this.mode === "restructure") {
      if (!this.draft)
        throw new Error("Open the existing company's saved draft before restructuring.");
      const preset = this.entry("preset", id);
      if (!preset) throw new Error("Preset no longer exists.");
      if (preset.availability === "planned") return false;
      // Preserve identity and every existing role. Missing required roles are
      // added explicitly; incompatible relationships remain visible to review.
      const next = clone(this.draft);
      next.preset_id = id;
      for (const role of preset.data.defaults.roles)
        if (preset.data.required_roles.includes(role.role_id) &&
            !next.roles.some((r) => r.role_id === role.role_id))
          next.roles.push(clone(role));
      this.draft = next;
      this.changed();
      return true;
    }
    if (this.draft) this.cache.set(this.draft.preset_id, clone(this.draft));
    const preset = this.entry("preset", id);
    if (!preset) throw new Error("Preset no longer exists.");
    if (preset.availability === "planned") return false;
    this.draft = this.cache.has(id)
      ? clone(this.cache.get(id))
      : {
          schema_version: 1,
          catalog: clone(this.catalog.catalog),
          preset_id: id,
          ...clone(preset.data.defaults),
        };
    this.changed();
    return true;
  }
  changed() {
    this.generation++;
    this.preview = null;
  }
  import(text) {
    const draft = readDraft(text);
    this.draft = draft;
    this.changed();
  }
  refreshIdentity() {
    this.draft.catalog = clone(this.catalog.catalog);
    this.changed();
  }
  async review() {
    const seq = this.generation;
    const result = await this.transport.call("preview", {
      selection: clone(this.draft),
      ...(this.host
        ? { catalog_context: { schema_version: 1, host: this.host } }
        : {}),
    });
    if (seq !== this.generation) return null;
    this.preview = result;
    return result;
  }
  async export() {
    if (!this.canExport)
      throw new Error("Review the current configuration before exporting.");
    const seq = this.generation;
    const result = await this.transport.call("export", {
      selection: clone(this.draft),
      ...(this.host
        ? { catalog_context: { schema_version: 1, host: this.host } }
        : {}),
    });
    if (seq !== this.generation)
      throw new Error("The draft changed during export. Review it again.");
    if (!result.ok) {
      this.preview = result;
      throw new Error(
        result.diagnostics?.map((d) => d.message).join(" ") ||
          "Export requires a valid selection.",
      );
    }
    return result;
  }
}
