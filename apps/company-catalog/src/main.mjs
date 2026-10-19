import { CatalogModel, readDraft, clone } from "./model.mjs";
import { nativeTransport, standaloneTransport } from "./transports.mjs";
const $ = (id) => document.getElementById(id),
  escape = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const list = (values = []) =>
  values.map((v) => "<li>" + escape(v) + "</li>").join("");
const key = "paprika-inc:catalog-draft:v1";
let model,
  step = "configure",
  query = "",
  filter = "all",
  inspected = null,
  working = false;
const notice = (text, kind = "") => {
  $("notice").className = text ? "banner " + kind : "";
  $("notice").textContent = text;
};
function persist() {
  if (!model.draft) return;
  try {
    sessionStorage.setItem(key, JSON.stringify(model.draft));
    $("saved").textContent = "Draft retained in this tab";
  } catch {
    $("saved").textContent =
      "Tab storage unavailable. Save a draft to keep it.";
  }
  $("save").disabled = false;
}
const changed = () => {
  model.changed();
  persist();
};
function download(value, name) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2) + "\n"], {
      type: "application/json",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function badge(entry) {
  return (
    '<span class="badge ' +
    (entry.availability === "planned" ? "planned" : "") +
    '">' +
    escape(
      entry.availability === "available"
        ? "Available source"
        : entry.availability === "template"
          ? "Template"
          : "Planned",
    ) +
    "</span>"
  );
}
function option(id, label, selected) {
  return (
    '<option value="' +
    escape(id) +
    '"' +
    (selected ? " selected" : "") +
    ">" +
    escape(label) +
    "</option>"
  );
}
function checkbox(id, label, checked, attrs = "") {
  return (
    '<label class="check"><input type="checkbox" id="' +
    escape(id) +
    '" ' +
    (checked ? "checked " : "") +
    attrs +
    "><span>" +
    escape(label) +
    "</span></label>"
  );
}
function picker() {
  const presets = model.entries("preset"),
    matches = presets.filter(
      (e) =>
        (filter === "all" || e.availability === filter) &&
        [e.id, e.label, e.description, ...e.tags]
          .join(" ")
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()),
    );
  const selected = model.entry("preset", inspected ?? model.draft?.preset_id);
  return (
    '<aside class="panel picker" aria-label="Company picker"><p class="eyebrow">01 / FIND A STARTING POINT</p><h2>Company templates</h2><label for="search">Search company types</label><input type="search" id="search" value="' +
    escape(query) +
    '" placeholder="Name, ID or topic"><label for="availability">Catalog availability</label><select id="availability">' +
    option("all", "All entries", filter === "all") +
    option("template", "Templates", filter === "template") +
    option("planned", "Planned", filter === "planned") +
    option("available", "Available source", filter === "available") +
    '</select><label for="preset">Choose a company</label><select id="preset">' +
    option("", "Select a starting point", !selected) +
    matches
      .map((e) =>
        option(
          e.id,
          e.label + (e.availability === "planned" ? " · Planned" : ""),
          selected?.id === e.id,
        ),
      )
      .join("") +
    '</select><p id="result-count" class="count" role="status">' +
    matches.length +
    " matching " +
    (matches.length === 1 ? "entry" : "entries") +
    "</p>" +
    (!matches.length
      ? '<p class="empty">No company types match. Clear the search or change the filter.</p><button id="clear-search" class="secondary">Clear filters</button>'
      : "") +
    (selected
      ? "<hr><h3>" +
        escape(selected.label) +
        "</h3>" +
        badge(selected) +
        '<p class="help">' +
        escape(selected.description) +
        '</p><div class="tags">' +
        selected.tags
          .map((t) => '<span class="tag">' + escape(t) + "</span>")
          .join("") +
        "</div><small>" +
        escape(selected.id) +
        " · v" +
        escape(selected.version) +
        "</small>" +
        (selected.availability === "planned"
          ? '<p class="banner warning">This preset is planned. It has no usable team template yet. Your current draft is retained.</p>'
          : '<button id="use-preset" class="secondary" style="margin-top:14px">Configure this template</button>')
      : "") +
    '<details><summary>Catalog provenance</summary><p class="help">Version ' +
    escape(model.catalog.catalog.version) +
    '</p><code style="overflow-wrap:anywhere">' +
    escape(model.catalog.catalog.sha256) +
    "</code></details></aside>"
  );
}
function field(id, label, value, extra = "") {
  return (
    '<div class="field"><label for="' +
    id +
    '">' +
    label +
    '</label><input id="' +
    id +
    '" value="' +
    escape(value) +
    '" ' +
    extra +
    "></div>"
  );
}
function roleCard(entry) {
  const d = model.draft,
    r = d.roles.find((r) => r.role_id === entry.id),
    required = model
      .entry("preset", d.preset_id)
      ?.data.required_roles?.includes(entry.id),
    bp = entry.data.blueprint ?? {};
  const missing = r
    ? [
        ...r.packs.filter((id) => !model.entry("pack", id)),
        ...r.workflows.filter((id) => !model.entry("workflow", id)),
        ...r.reviewers.filter(
          (id) => !d.roles.some((peer) => peer.role_id === id),
        ),
      ]
    : [];
  return (
    '<section class="role" aria-label="' +
    escape(entry.label) +
    ' role"><div class="role-head">' +
    checkbox(
      "role-" + entry.id,
      entry.label,
      !!r,
      'data-role="' +
        escape(entry.id) +
        '" ' +
        (required
          ? 'disabled aria-describedby="required-' + escape(entry.id) + '"'
          : ""),
    ) +
    badge(entry) +
    "</div>" +
    (required
      ? '<small id="required-' +
        escape(entry.id) +
        '">Required by this preset</small>'
      : "") +
    "<p>" +
    escape(entry.description) +
    "</p>" +
    (r
      ? field(
          "title-" + entry.id,
          "Role display title",
          r.title ?? entry.label,
          'maxlength="160" data-title="' + escape(entry.id) + '"',
        ) +
        "<small>Stable ID: " +
        escape(entry.id) +
        " · Template v" +
        escape(entry.version) +
        " · contract v" +
        escape(bp.version ?? entry.version) +
        '</small><div class="fields"><div><label for="manager-' +
        escape(entry.id) +
        '">Reports to</label><select data-manager="' +
        escape(entry.id) +
        '" id="manager-' +
        escape(entry.id) +
        '">' +
        option("", "No reporting parent", r.reports_to === null) +
        [
          ...new Set([
            ...d.roles
              .filter((p) => p.role_id !== entry.id)
              .map((p) => p.role_id),
            ...(r.reports_to ? [r.reports_to] : []),
          ]),
        ]
          .map((id) =>
            option(
              id,
              model.entry("role", id)?.label ?? id + " (missing)",
              r.reports_to === id,
            ),
          )
          .join("") +
        "</select></div><div><fieldset><legend>Independent reviewers</legend>" +
        [
          ...new Set([
            ...d.roles
              .filter((p) => p.role_id !== entry.id)
              .map((p) => p.role_id),
            ...r.reviewers,
          ]),
        ]
          .map((id) =>
            checkbox(
              "reviewer-" + entry.id + "-" + id,
              model.entry("role", id)?.label ?? id + " (missing)",
              r.reviewers.includes(id),
              'data-reviewer="' +
                escape(entry.id) +
                '" data-value="' +
                escape(id) +
                '"',
            ),
          )
          .join("") +
        '</fieldset><p class="help">No peer selected means human review is required. Reporting lines do not assign reviewers.</p></div></div>' +
        "<fieldset><legend>Skill packs</legend>" +
        [...new Set([...(entry.data.allowed_packs ?? []), ...r.packs])]
          .map((id) => {
            const p = model.entry("pack", id);
            return checkbox(
              "pack-" + entry.id + "-" + id,
              (p?.label ?? id) + " · " + (p?.availability ?? "unknown"),
              r.packs.includes(id),
              'data-pack="' +
                escape(entry.id) +
                '" data-value="' +
                escape(id) +
                '"',
            );
          })
          .join("") +
        "</fieldset>" +
        "<fieldset><legend>Workflow templates</legend>" +
        [
          ...new Set([
            ...model.entries("workflow").map((w) => w.id),
            ...r.workflows,
          ]),
        ]
          .map((id) =>
            checkbox(
              "flow-" + entry.id + "-" + id,
              model.entry("workflow", id)?.label ?? id + " (unknown)",
              r.workflows.includes(id),
              'data-workflow="' +
                escape(entry.id) +
                '" data-value="' +
                escape(id) +
                '"',
            ),
          )
          .join("") +
        "</fieldset>" +
        (missing.length
          ? '<p class="banner warning">References need review: ' +
            escape(missing.join(", ")) +
            ". Choices are retained.</p>"
          : "")
      : "") +
    "<details><summary>Responsibilities, outputs and dependencies</summary><dl><dt>Responsibilities</dt><dd><ul>" +
    list(bp.responsibilities) +
    "</ul></dd><dt>Inputs</dt><dd><ul>" +
    list(bp.inputs) +
    "</ul></dd><dt>Outputs</dt><dd><ul>" +
    list(bp.outputs) +
    "</ul></dd><dt>Ownership paths</dt><dd>" +
    escape((entry.data.ownership_paths ?? []).join(", ") || "None declared") +
    "</dd><dt>Boundaries</dt><dd><ul>" +
    list(bp.boundaries) +
    "</ul></dd><dt>Required packs</dt><dd>" +
    escape((entry.data.required_packs ?? []).join(", ") || "None") +
    "</dd></dl></details></section>"
  );
}
function configuration() {
  const d = model.draft;
  return (
    '<p class="eyebrow">02 / SHAPE YOUR TEAM</p><h2 id="panel-heading" tabindex="-1">Configure ' +
    escape(model.entry("preset", d.preset_id)?.label ?? d.preset_id) +
    '</h2><div class="fields">' +
    field(
      "company-name",
      "Company name",
      d.company.name,
      'maxlength="160" data-company="name"',
    ) +
    field(
      "company-id",
      "Company ID",
      d.company.id,
      'maxlength="96" data-company="id" aria-describedby="id-help"',
    ) +
    field(
      "repository",
      "Repository (owner/name)",
      d.company.repository,
      'maxlength="200" data-company="repository" placeholder="organization/project"',
    ) +
    field(
      "company-version",
      "Definition version",
      d.company.version,
      'maxlength="32" data-company="version"',
    ) +
    '</div><p id="id-help" class="help">IDs stay stable when labels change. Use a portable repository name, without credentials or a local path.</p><div class="field"><label for="purpose">Company purpose</label><textarea id="purpose" rows="2" maxlength="8000" data-company="purpose">' +
    escape(d.company.purpose) +
    '</textarea></div><div class="field"><label for="structure">Organization structure</label><select id="structure">' +
    [
      ...new Set([
        ...model.entries("structure").map((s) => s.id),
        d.structure_id,
      ]),
    ]
      .map((id) =>
        option(
          id,
          model.entry("structure", id)?.label ?? id + " (unknown)",
          d.structure_id === id,
        ),
      )
      .join("") +
    '</select><p class="help">' +
    escape(
      model.entry("structure", d.structure_id)?.description ??
        "Unknown structure; choose a current catalog entry.",
    ) +
    ' Changing structure retains your role edits.</p></div><fieldset><legend>Business model</legend><div class="checks">' +
    [
      ...new Set([
        ...(model.catalog.business_model_tags ?? []),
        ...d.business_model_tags,
      ]),
    ]
      .map((tag) =>
        checkbox(
          "tag-" + tag,
          tag,
          d.business_model_tags.includes(tag),
          'data-tag="' + escape(tag) + '"',
        ),
      )
      .join("") +
    '</div></fieldset><p class="banner">Project selection is unavailable in this preview. Choose the destination through the supported host workflow when applying the draft.</p><div class="field"><label for="target-host">Target host for prerequisite review</label><select id="target-host">' +
    option("", "Not selected", !model.host) +
    option("codex-local", "Local Codex", model.host === "codex-local") +
    option("chatgpt", "ChatGPT", model.host === "chatgpt") +
    option("standalone", "Standalone", model.host === "standalone") +
    '</select><p class="help">Choosing a host does not verify a connection. Changing it invalidates the preview.</p></div><h3>Roles and personas</h3><p class="help">Add specialists, select guidance and make review relationships explicit.</p>' +
    model.entries("role").map(roleCard).join("") +
    d.roles
      .filter((r) => !model.entry("role", r.role_id))
      .map(
        (r) =>
          '<p class="banner warning">Unknown role retained: ' +
          escape(r.role_id) +
          ' <button data-remove-unknown="' +
          escape(r.role_id) +
          '" class="secondary">Remove unknown role</button></p>',
      )
      .join("") +
    integrationPanel() +
    '<div class="actions"><button id="review" ' +
    (working ? "disabled" : "") +
    ">Review configuration</button></div>"
  );
}
function review() {
  const d = model.draft,
    p = model.preview;
  if (!p)
    return '<h2 id="panel-heading" tabindex="-1">Review configuration</h2><p>Review the latest edits before exporting.</p><button id="review">Refresh preview</button>';
  const diagnostics = p.diagnostics ?? [];
  return (
    '<p class="eyebrow">03 / REVIEW YOUR DRAFT</p><h2 id="panel-heading" tabindex="-1">' +
    escape(d.company.name) +
    "</h2><p>" +
    escape(d.company.repository) +
    " · " +
    escape(model.entry("structure", d.structure_id)?.label ?? d.structure_id) +
    "</p>" +
    (diagnostics.length
      ? '<div class="banner error" role="alert"><strong>Configuration needs attention</strong><ul class="error-list">' +
        diagnostics
          .map(
            (x) =>
              '<li><button class="diagnostic" data-diagnostic="' +
              escape(x.path) +
              '">' +
              escape(x.path) +
              ": " +
              escape(x.message) +
              "</button></li>",
          )
          .join("") +
        '</ul><button id="fix" class="secondary">Return to configuration</button></div>'
      : '<p class="banner">Portable draft validated. Installation, connection and native readiness remain separate.</p>') +
    '<div class="metrics"><div><strong>' +
    d.roles.length +
    "</strong><span>Selected roles</span></div><div><strong>" +
    new Set(d.roles.flatMap((r) => r.packs)).size +
    '</strong><span>Skill packs</span></div></div><div class="table-wrap"><table><caption class="help">Resulting roster — reporting and review are independent</caption><thead><tr><th>Role</th><th>Reports to</th><th>Reviewers</th><th>Packs / workflows</th></tr></thead><tbody>' +
    d.roles
      .map(
        (r) =>
          "<tr><th>" +
          escape(
            r.title ?? model.entry("role", r.role_id)?.label ?? r.role_id,
          ) +
          "</th><td>" +
          escape(r.reports_to ?? "Root") +
          "</td><td>" +
          escape(r.reviewers.join(", ") || "Human review required") +
          "</td><td>" +
          escape([...r.packs, ...r.workflows].join(", ") || "None") +
          "</td></tr>",
      )
      .join("") +
    "</tbody></table></div>" +
    '<section class="review-block"><h3>Prerequisites and evidence</h3><ul>' +
    list(
      (p.requirements ?? []).map(
        (r) =>
          (model.entry("requirement", r.id)?.label ?? r.id) + ": " + r.state,
      ),
    ) +
    "</ul><dl>" +
    Object.entries(p.evidence ?? {})
      .map(
        ([k, v]) =>
          "<dt>" +
          escape(k.replaceAll("_", " ")) +
          "</dt><dd>" +
          escape(typeof v === "string" ? v : JSON.stringify(v)) +
          "</dd>",
      )
      .join("") +
    "</dl></section>" +
    '<section class="review-block"><h3>Proposed files and conflicts</h3>' +
    (p.authoring
      ? "<p>" +
        escape(
          (p.authoring.conflicts ?? []).length
            ? "Existing files conflict. No files have been changed."
            : "Read-only destination preview. No files have been changed.",
        ) +
        "</p>" +
        (p.authoring.changes ?? [])
          .map(
            (c) =>
              "<details><summary>" +
              escape(c.path) +
              " · " +
              escape(c.change) +
              "</summary><pre>" +
              escape(c.diff) +
              "</pre></details>",
          )
          .join("")
      : (p.proposed_files ?? [])
          .map(
            (f) =>
              "<details><summary>" +
              escape(f.path) +
              " · proposed, destination uninspected</summary><pre>" +
              escape(f.content) +
              "</pre></details>",
          )
          .join("") +
        '<p class="help">Destination files have not been inspected. Export does not apply files. Run the protected author plan against the selected repository before any separately requested write.</p>') +
    "</section>" +
    integrationPanel() +
    "<details><summary>Portable selection and catalog identity</summary><pre>" +
    escape(JSON.stringify(d, null, 2)) +
    '</pre></details><div class="actions"><button id="back" class="secondary">Edit configuration</button><button id="export" ' +
    (!p.ok || model.stale || working ? "disabled" : "") +
    ">Export reviewed blueprint</button></div>"
  );
}
function integrationPanel() {
  const items = model.catalog.integrations ?? [];
  return (
    '<section class="review-block"><h3>Tools and integration candidates</h3><p class="help">These are backend registry declarations. Connection, installation, host execution and task acceptance are separate. No integrations are selected or executed here; RDKit is optional/deferred.</p>' +
    (items.length
      ? items
          .map((item) => {
            const status = model.preview?.integration_assessments?.find(
              (s) => s.id === item.id,
            );
            return (
              '<details class="role"><summary>' +
              escape(item.title) +
              " · " +
              escape(item.maturity) +
              "</summary><dl><dt>Declared adapter</dt><dd>" +
              escape(item.adapter) +
              "</dd><dt>Capabilities</dt><dd>" +
              escape(item.capabilities.join(", ")) +
              "</dd><dt>Compatibility</dt><dd>" +
              escape(status?.state ?? "Not assessed for a target host") +
              "</dd><dt>Missing or unverified prerequisites</dt><dd>" +
              escape(
                status
                  ? [...status.reasons, ...status.missing_capabilities].join(
                      ", ",
                    )
                  : "Select a target host and review the draft.",
              ) +
              "</dd><dt>Installation / authentication / runtime</dt><dd>" +
              escape(
                status
                  ? JSON.stringify({
                      installed: status.installed,
                      authentication_verified: status.authentication_verified,
                      runtime_verified: status.runtime_verified,
                    })
                  : "Unverified",
              ) +
              "</dd><dt>Notes</dt><dd><ul>" +
              list(item.notes) +
              "</ul></dd></dl></details>"
            );
          })
          .join("")
      : '<p class="banner">The backend has not supplied integration metadata for this catalog response. No operational integration is implied.</p>') +
    "</section>"
  );
}

function render(focus) {
  if (!model.catalog) return;
  const active = focus ?? document.activeElement?.id;
  $("app").setAttribute("aria-busy", String(working));
  const d = model.draft;
  $("app").innerHTML =
    (model.catalog.evidence_scope === "browser_fixture"
      ? '<p class="banner warning">Browser fixture only. Validation and host behavior are simulated; no operational readiness is established.</p>'
      : "") +
    '<div class="grid">' +
    picker() +
    '<section class="panel"><nav class="steps" aria-label="Configuration steps"><button id="configure-step" aria-current="' +
    (step === "configure" ? "step" : "false") +
    '" ' +
    (!d ? "disabled" : "") +
    '>1 · Configure team</button><button id="review-step" aria-current="' +
    (step === "review" ? "step" : "false") +
    '" ' +
    (!d ? "disabled" : "") +
    ">2 · Review & export</button></nav>" +
    (model.stale
      ? '<div class="banner warning" role="alert"><strong>Catalog changed.</strong> Your draft still uses ' +
        escape(d.catalog.version) +
        " / " +
        escape(d.catalog.sha256.slice(0, 12)) +
        ". Current: " +
        escape(model.catalog.catalog.version) +
        " / " +
        escape(model.catalog.catalog.sha256.slice(0, 12)) +
        '. Choices have been retained. Review changes before revalidation.<button id="revalidate" class="secondary">Use current catalog and revalidate</button></div>'
      : "") +
    (d
      ? step === "configure"
        ? configuration()
        : review()
      : '<div class="empty"><h2>Pick your starting team</h2><p>Browse templates on the left, then select Configure this template.</p><p>Planned industries remain visible without implying working integrations.</p></div>') +
    "</section></div>";
  bind();
  if (active) $(active)?.focus();
  $("save").disabled = !d;
}
function bind() {
  for (const el of document.querySelectorAll("[data-diagnostic]"))
    el.onclick = () => {
      const path = el.dataset.diagnostic;
      const company = path.match(/company\.(\w+)/)?.[1];
      const index = path.match(/roles\[(\d+)\]/)?.[1];
      const role =
        index === undefined ? null : model.draft.roles[Number(index)];
      const target = company
        ? {
            id: "company-id",
            name: "company-name",
            version: "company-version",
            repository: "repository",
            purpose: "purpose",
          }[company]
        : role
          ? (path.includes("reports_to") ? "manager-" : "title-") + role.role_id
          : "panel-heading";
      step = "configure";
      render(target);
      $(target)?.setAttribute("aria-invalid", "true");
    };

  $("search").oninput = (e) => {
    query = e.target.value;
    const pos = e.target.selectionStart;
    render("search");
    $("search").setSelectionRange(pos, pos);
  };
  $("availability").onchange = (e) => {
    filter = e.target.value;
    render("availability");
  };
  $("preset").onchange = (e) => {
    inspected = e.target.value || null;
    render("preset");
  };
  $("clear-search")?.addEventListener("click", () => {
    query = "";
    filter = "all";
    render("search");
  });
  $("use-preset")?.addEventListener("click", () => {
    model.choose(inspected ?? model.draft?.preset_id);
    step = "configure";
    notice("Template selected. Review role and dependency choices.");
    persist();
    render("panel-heading");
  });
  for (const el of document.querySelectorAll("[data-title]"))
    el.oninput = () => {
      model.draft.roles.find((r) => r.role_id === el.dataset.title).title =
        el.value;
      changed();
    };
  for (const el of document.querySelectorAll("[data-company]"))
    el.oninput = () => {
      model.draft.company[el.dataset.company] = el.value;
      el.removeAttribute("aria-invalid");
      changed();
    };
  $("target-host")?.addEventListener("change", (e) => {
    model.host = e.target.value || null;
    changed();
  });
  $("structure")?.addEventListener("change", (e) => {
    model.draft.structure_id = e.target.value;
    changed();
    render("structure");
  });
  for (const el of document.querySelectorAll("[data-tag]"))
    el.onchange = () => {
      toggle(model.draft.business_model_tags, el.dataset.tag, el.checked);
      changed();
    };
  for (const el of document.querySelectorAll("[data-role]"))
    el.onchange = () => {
      if (el.checked) {
        const id = el.dataset.role,
          preset = model.entry("preset", model.draft.preset_id);
        const defaults = preset?.data.defaults.roles.find(
          (r) => r.role_id === id,
        );
        model.draft.roles.push(
          defaults
            ? clone(defaults)
            : {
                role_id: id,
                packs: [],
                workflows: [],
                reports_to: preset?.data.coordinator_role ?? null,
                reviewers: [],
              },
        );
      } else
        model.draft.roles = model.draft.roles.filter(
          (r) => r.role_id !== el.dataset.role,
        );
      changed();
      notice(
        "Role choices updated. Dependent references are retained for review.",
      );
      render(el.id);
    };
  for (const type of ["pack", "workflow", "reviewer"])
    for (const el of document.querySelectorAll("[data-" + type + "]"))
      el.onchange = () => {
        const r = model.draft.roles.find((r) => r.role_id === el.dataset[type]);
        toggle(
          r[
            { pack: "packs", workflow: "workflows", reviewer: "reviewers" }[
              type
            ]
          ],
          el.dataset.value,
          el.checked,
        );
        changed();
      };
  for (const el of document.querySelectorAll("[data-manager]"))
    el.onchange = () => {
      model.draft.roles.find(
        (r) => r.role_id === el.dataset.manager,
      ).reports_to = el.value || null;
      changed();
    };
  for (const el of document.querySelectorAll("[data-remove-unknown]"))
    el.onclick = () => {
      model.draft.roles = model.draft.roles.filter(
        (r) => r.role_id !== el.dataset.removeUnknown,
      );
      changed();
      render("panel-heading");
    };
  $("review")?.addEventListener("click", performReview);
  $("review-step")?.addEventListener("click", performReview);
  for (const id of ["back", "fix", "configure-step"])
    $(id)?.addEventListener("click", () => {
      step = "configure";
      render("panel-heading");
    });
  $("revalidate")?.addEventListener("click", () => {
    model.refreshIdentity();
    persist();
    performReview();
  });
  $("export")?.addEventListener("click", async () => {
    working = true;
    render();
    try {
      const result = await model.export();
      download(result, "paprika-company-export.json");
      notice("Reviewed draft exported. No files applied or chats created.");
    } catch (e) {
      notice(e.message, "error");
    } finally {
      working = false;
      render();
    }
  });
}
function toggle(values, value, on) {
  const index = values.indexOf(value);
  if (on && index < 0) values.push(value);
  else if (!on && index >= 0) values.splice(index, 1);
}
async function performReview() {
  working = true;
  notice("Checking the current configuration…");
  render();
  try {
    const result = await model.review();
    if (result) {
      step = "review";
      notice(
        result.ok
          ? "Review complete. This is a portable draft."
          : "Review found configuration issues.",
        result.ok ? "" : "error",
      );
    }
  } catch (e) {
    notice(e.message, "error");
  } finally {
    working = false;
    render("panel-heading");
  }
}
async function refresh() {
  $("refresh").disabled = true;
  notice("Loading catalog…");
  try {
    if (await model.load()) {
      notice(
        model.stale
          ? "Catalog changed; your draft and its previous identity have been retained."
          : "Catalog loaded. Source availability is separate from live readiness.",
        model.stale ? "warning" : "",
      );
      render();
    }
  } catch (e) {
    notice(e.message, "error");
    $("app").setAttribute("aria-busy", "false");
  } finally {
    $("refresh").disabled = false;
  }
}
async function start() {
  try {
    const transport =
      window.parent !== window
        ? await nativeTransport()
        : standaloneTransport();
    $("surface").textContent = transport.surface;
    model = new CatalogModel(transport);
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        model.import(saved);
        persist();
      }
    } catch (e) {
      notice("Saved tab draft could not be loaded: " + e.message, "error");
    }
    $("refresh").onclick = refresh;
    $("save").onclick = () => {
      try {
        readDraft(JSON.stringify(model.draft));
        download(model.draft, "paprika-company-draft.json");
        notice("Portable draft saved. Incomplete choices remain in the draft.");
      } catch (e) {
        notice(e.message, "error");
      }
    };
    $("import").onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        if (file.size > 262144)
          throw new Error("Draft is too large (maximum 256 KiB).");
        model.import(await file.text());
        persist();
        inspected = model.draft.preset_id;
        step = "configure";
        notice(
          "Saved draft opened. Review it against the current catalog before exporting.",
        );
        render("panel-heading");
      } catch (error) {
        notice(error.message, "error");
      } finally {
        e.target.value = "";
      }
    };
    await refresh();
  } catch (e) {
    notice("Native panel unavailable. " + e.message, "error");
    $("app").innerHTML =
      "<h2>Use the catalog without the panel</h2><p>Ask for the company catalog tools in chat, or use the standalone interface to review and export the same portable draft.</p><p>Opening this page outside a compatible host does not verify native rendering.</p>";
    $("app").setAttribute("aria-busy", "false");
    $("refresh").textContent = "Retry connection";
    $("refresh").onclick = start;
  }
}
start();
