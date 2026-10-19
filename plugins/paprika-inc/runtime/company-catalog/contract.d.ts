/** CAT-BE-01 proposal. Versioned JSON wire contract; no live execution implied. */
export type CatalogKind = 'preset' | 'structure' | 'role' | 'pack' | 'workflow' | 'requirement';
export interface CatalogIdentity { version: string; sha256: string }
export interface RoleSelection {
  role_id: string;
  packs: string[];
  workflows: string[];
  reports_to: string | null;
  reviewers: string[];
}
export interface CompanySelection {
  schema_version: 1;
  catalog: CatalogIdentity;
  preset_id: string;
  structure_id: string;
  business_model_tags: string[];
  company: { id: string; name: string; repository: string; version: string; purpose: string };
  roles: RoleSelection[];
}
export interface CapabilityContext {
  schema_version: 1;
  host?: 'codex-local' | 'chatgpt' | 'standalone';
  capabilities?: string[];
}
export interface CatalogEntry {
  kind: CatalogKind;
  id: string;
  version: string;
  label: string;
  description: string;
  tags: string[];
  availability: 'template' | 'available' | 'planned';
  requirements: string[];
  provenance: { path: string; sha256: string };
  evidence: string[];
  data: Record<string, unknown>;
}
export interface CompanyCatalog {
  schema_version: 1;
  version: string;
  business_model_tags: string[];
  entries: CatalogEntry[];
}
export interface Diagnostic { code: string; path: string; message: string }
export interface RequirementAssessment {
  id: string;
  state: 'unknown' | 'missing' | 'declared-present' | 'unsupported';
}
export interface ConfigurationResult {
  schema_version: 1;
  ok: boolean;
  command: string;
  read_only: true;
  applied: false;
  catalog: CatalogIdentity;
  selection_sha256: string | null;
  diagnostics: Diagnostic[];
  requirements: RequirementAssessment[];
  evidence: {
    catalog_availability: 'template' | 'planned' | 'unknown';
    package_presence: { id: string; state: 'bundled' | 'not-bundled' | 'unverified' }[];
    local_configuration: 'unverified';
    connection_authentication: 'unverified';
    native_host_verification: 'unverified';
    task_quality_acceptance: 'unverified';
    release_state: 'draft';
  };
  selection?: CompanySelection;
  blueprint?: Record<string, unknown>;
  authoring?: Record<string, unknown>;
}
