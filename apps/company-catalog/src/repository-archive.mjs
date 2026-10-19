import { strToU8, zipSync } from "fflate";

// Only the canonical company layout can enter the downloaded archive. An
// imported draft's old files are never used; export always calls the backend.
export function repositoryArchive(result) {
  if (!result?.ok || result.applied !== false || !result.selection ||
      !Array.isArray(result.repository_files) || result.repository_files.length > 110)
    throw new Error("A validated repository-file export is required.");
  const expected = new Set([
    "company/company.json", "company/ownership.json", "company/CONSTITUTION.md",
    "company/WORK.md", "company/ADOPTION.md", "company/catalog-selection.json",
    ...result.selection.roles.map((r) => {
      if (!/^[a-z][a-z0-9-]{0,95}$/.test(r.role_id))
        throw new Error("Unsafe role path in repository export.");
      return "company/roles/" + r.role_id + "/agent.md";
    }),
  ]);
  const files = Object.create(null);
  let size = 0;
  for (const { path, content } of result.repository_files) {
    if (!expected.delete(path) || typeof content !== "string")
      throw new Error("Unexpected or duplicate repository export path.");
    const bytes = strToU8(content);
    size += bytes.length;
    if (size > 8 * 1024 * 1024) throw new Error("Repository export exceeds 8 MiB.");
    files[path] = bytes;
  }
  if (expected.size) throw new Error("Repository export is missing company or role files.");
  return zipSync(files, { level: 6, mtime: new Date(1980, 0, 1) });
}
