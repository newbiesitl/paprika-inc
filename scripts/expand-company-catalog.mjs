// Deterministic import of the issue #30 research snapshot into selectable starters.
// No third-party skills, tool bindings, live role contracts or grants are imported.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const sourcePath = 'docs/research/company-persona-landscape-2026-10-19.json';
const catalogPath = 'plugins/paprika-inc/runtime/company-catalog/catalog.json';
const slug = label => label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const familyIds = [
  'frontier-ai-research', 'applied-ml', 'cross-domain-r-and-d', 'venture-capital-private-equity',
  'asset-management-quantitative-research', 'banking-fintech', 'accounting-audit', 'insurance-actuarial',
  'law-firm', 'pharmaceutical-discovery', 'pharmaceutical-manufacturing', 'biotech-genomics',
  'healthcare-operations', 'medical-devices-diagnostics', 'marketing-agency', 'brand-design-agency',
  'general-manufacturing', 'semiconductors-electronics', 'robotics-automotive-aerospace',
  'procurement-supply-chain', 'logistics-warehousing', 'human-resources', 'recruiting-talent-acquisition',
  'b2b-software', 'b2c-software-mobile', 'saas-cloud-platform', 'open-source-organization', 'cybersecurity',
  'consulting-professional-services', 'sales-customer-success-support', 'retail-e-commerce',
  'real-estate-property-management', 'construction-infrastructure', 'energy-utilities',
  'climate-environmental-services', 'agriculture-food-production', 'telecommunications-network-operations',
  'education-edtech', 'media-publishing-journalism', 'gaming-entertainment', 'travel-hospitality-events',
  'nonprofit-social-enterprise', 'public-sector-civic-technology',
];
const familyIdMap = new Map(familyIds.map((id, i) => ['F' + String(i + 1).padStart(2, '0'), id]));

// First-pass focus, not a validated professional competency or task benchmark.
const focuses = Object.fromEntries(`
Research Scientist|Formulate research hypotheses and design experiments with explicit falsification criteria
Research Engineer|Implement reproducible experimental code and document execution conditions
Evaluation/Safety Researcher|Design bounded evaluations and analyze failure modes and benchmark limitations
Data Scientist|Analyze validated datasets and compare statistical models with uncertainty estimates
ML Engineer|Build and evaluate model pipelines with reproducible data and model versions
MLOps Engineer|Design experiment tracking and model lifecycle procedures with rollback evidence
Domain Scientist|Frame domain hypotheses and appraise their scientific evidence
Computational Researcher|Plan computational experiments and test sensitivity to modeling assumptions
Research Software Engineer|Build reproducible research tools with documented methods and tests
Investment Analyst|Compare opportunities using sourced financial assumptions and scenario analysis
Due-Diligence Analyst|Organize diligence evidence, missing documents and material exceptions
Portfolio Analyst|Analyze portfolio exposures and performance against explicit benchmarks
Equity Researcher|Develop sourced company research and track thesis assumptions
Quant Researcher|Evaluate quantitative hypotheses with leakage checks and backtest limitations
Risk Analyst|Analyze exposures and stress scenarios with documented model limitations
Credit Analyst|Assess documented cash flows and credit assumptions for human review
Treasury Analyst|Reconcile liquidity inputs and compare cash-management scenarios
Compliance Analyst|Map evidence and exceptions to the applicable supplied policies
Accountant|Reconcile transactions and prepare traceable accounting workpapers
Financial Planning Analyst|Build budget and forecast scenarios and explain variances
Audit Analyst|Trace assertions to evidence and document exceptions for independent review
Actuarial Analyst|Analyze exposure and loss assumptions with sensitivity estimates
Claims Operations Analyst|Check claim documentation and organize exceptions for authorized review
Underwriting Analyst|Compare application evidence against supplied underwriting criteria
Legal Researcher|Research supplied legal questions with jurisdiction, dates and source traceability
Contract Analyst|Compare clauses and document obligations, deviations and proposed redlines
Litigation Support Analyst|Build evidence chronologies and document indexes for qualified review
Medicinal Chemistry Researcher|Appraise compound and target evidence for proposed discovery experiments
Computational Chemist|Plan reproducible molecular calculations and explain model limitations
Bioinformatics Analyst|Analyze biological datasets with explicit quality and provenance checks
Process Analyst|Analyze process trends and deviations against documented operating assumptions
Quality Assurance Analyst|Trace quality requirements to records and identify evidence gaps
Regulatory Documentation Specialist|Assemble traceable documentation against supplied regulatory requirements
Bioinformatician|Plan reproducible sequence-analysis pipelines with quality controls
Computational Biologist|Interpret computational biological results within study-design limits
Lab Data Steward|Maintain sample and dataset provenance and resolve metadata inconsistencies
Clinical Operations Analyst|Map clinical operational processes using approved de-identified inputs
Quality Improvement Analyst|Compare operational improvement options using measurable outcomes
Medical Literature Researcher|Appraise medical literature and retain applicability and evidence limitations
Systems Engineer|Define system requirements, interfaces and traceable acceptance criteria
Verification Engineer|Design verification plans and trace results to requirements
Marketing Strategist|Develop positioning and campaign hypotheses from supplied market evidence
SEO Analyst|Assess search visibility and prioritize measurable content and technical improvements
Copywriter|Draft audience-specific copy with substantiated claims and reviewable alternatives
Growth Analyst|Analyze acquisition and retention experiments with explicit measurement assumptions
Brand Strategist|Translate audience research into brand positioning and creative briefs
UX Researcher|Plan user studies and synthesize findings with sampling limitations
Product Designer|Develop product concepts and interaction specifications for usability review
Production Planner|Compare production schedules under explicit demand and capacity constraints
Industrial Engineer|Analyze process capacity and propose measurable operational improvements
Quality Analyst|Analyze defects and trace proposed quality actions to supporting evidence
Hardware Engineer|Analyze hardware specifications and document interface and design tradeoffs
Test Data Analyst|Analyze test outcomes and identify yield trends and anomalous results
Simulation Engineer|Design simulation studies and validate assumptions against available evidence
Reliability Analyst|Analyze failure modes and reliability estimates with uncertainty
Procurement Analyst|Compare supplier proposals and spending against documented requirements
Supplier Risk Analyst|Evaluate supplier evidence and identify continuity and compliance gaps
Demand Planner|Compare demand forecasts and inventory scenarios with error estimates
Route Planner|Propose routes subject to supplied capacity and service constraints
Warehouse Analyst|Analyze warehouse capacity, inventory flows and operational exceptions
Operations Coordinator|Organize operational handoffs and track dependencies and exceptions
HR Operations Specialist|Prepare reviewed employee-process documentation and completion checklists
People Analyst|Analyze approved aggregate workforce data with privacy and bias checks
Learning Designer|Map competencies to learning activities and evaluation criteria
Recruiter|Translate hiring requirements into job-related sourcing and evaluation plans
Talent Researcher|Organize candidate evidence against authorized job-related criteria
Interview Coordinator|Prepare structured interview materials and coordinate authorized scheduling
Product Manager|Translate customer evidence into scoped requirements and acceptance criteria
Backend Engineer|Implement service behavior with documented interfaces and regression evidence
Solutions Engineer|Map customer integration needs to verifiable technical solution proposals
QA Engineer|Independently validate behavior against acceptance criteria and report uncovered scope
Frontend/Mobile Engineer|Build accessible client interactions and verify platform behavior
Platform Engineer|Design platform capabilities with isolation and operational acceptance criteria
SRE|Analyze reliability objectives, incidents and recovery procedures
Billing Operations Analyst|Reconcile usage and billing records and document discrepancies
Customer Success Analyst|Analyze customer outcomes and propose evidence-based adoption improvements
Maintainer|Triage contributions and preserve project compatibility and review requirements
Community Manager|Prepare community guidance and organize feedback within moderation policy
Documentation Engineer|Produce tested technical instructions and resolve documentation gaps
Release Engineer|Sequence independently reviewed changes and prepare reproducible release evidence
Security Analyst|Analyze security evidence within an explicitly authorized scope
Application Security Engineer|Review application threats and validate proposed mitigations within scope
Incident Analyst|Correlate incident evidence and build a sourced event timeline
Engagement Manager|Frame client deliverables and manage explicit scope and review dependencies
Business Analyst|Map business processes and compare requirements and improvement options
Domain Consultant|Develop domain recommendations with documented assumptions and expert review points
Account Researcher|Compile sourced account context and identify relevant evidence gaps
Sales Engineer|Draft technical proposals and verify claims against available capabilities
Support Analyst|Triage support evidence and draft responses and escalation recommendations
Merchandising Analyst|Analyze assortment performance and compare merchandising scenarios
E-commerce Manager|Prepare reviewed catalog and conversion improvements with measurable criteria
Demand Analyst|Analyze demand patterns and compare forecast assumptions
Market Researcher|Compare sourced market evidence and explain sampling and comparability limits
Property Analyst|Analyze property comparables and portfolio documents for qualified review
Leasing Operations Coordinator|Organize leasing documentation and maintenance handoffs
Project Controls Analyst|Analyze project schedule, cost and change evidence against baselines
Cost Estimator|Prepare traceable quantity and cost estimates with explicit assumptions
BIM Coordinator|Coordinate model information and document design-package inconsistencies
Energy Analyst|Compare energy demand and supply scenarios using validated inputs
Asset Reliability Analyst|Analyze asset-condition trends and maintenance priorities
Operations Planner|Prepare operational plans under explicit resource and service constraints
Climate Analyst|Compare climate scenarios and document model and source uncertainty
Sustainability Analyst|Reconcile sustainability metrics and substantiate reporting assumptions
Geospatial Analyst|Analyze spatial datasets with coordinate, resolution and provenance checks
Agronomy Researcher|Appraise field trials and agronomic hypotheses with study limitations
Food Quality Analyst|Trace food-quality observations to batch records and review criteria
Supply Planner|Compare supply plans against demand, lead-time and capacity constraints
Network Engineer|Analyze network configurations and propose scoped changes for review
Capacity Analyst|Model capacity demand and identify resource bottlenecks
Service Assurance Analyst|Correlate service faults and report performance against supplied objectives
Curriculum Designer|Map learning objectives to sequenced content and assessment evidence
Learning Researcher|Evaluate learning studies and explain applicability and uncertainty
Assessment Designer|Design assessments aligned to learning objectives and validity criteria
Research Editor|Organize source research and identify unsupported editorial claims
Writer|Draft sourced content tailored to the agreed audience and editorial brief
Fact Checker|Verify material claims and record source conflicts and unresolved evidence
Rights Coordinator|Organize permissions and attribution records for authorized rights review
Game Designer|Specify gameplay hypotheses and measurable playtest criteria
Gameplay Engineer|Implement gameplay behavior with reproducible test evidence
Technical Artist|Prepare technical art workflows and verify asset integration constraints
Playtest Analyst|Analyze playtest observations and explain sample and measurement limitations
Revenue Analyst|Compare revenue and capacity scenarios with explicit pricing assumptions
Guest Operations Coordinator|Organize guest-service handoffs and document operational exceptions
Event Planner|Prepare event schedules and resource plans with explicit dependencies
Program Manager|Track program outcomes, delivery dependencies and review evidence
Grant Writer|Draft evidence-backed grant materials against supplied funder criteria
Impact Analyst|Evaluate impact claims against measurable outcomes and attribution limits
Volunteer Coordinator|Prepare volunteer plans and track authorized onboarding requirements
Policy Researcher|Compare policy evidence and explain assumptions and stakeholder impacts
Service Designer|Map service journeys and develop testable improvement proposals
Program Evaluator|Evaluate program outcomes against explicit criteria and study limitations
`.trim().split('\n').map(line => line.split('|')));

export function expandCatalog(current, source, sourceBytes) {
  if (source.families.length !== familyIds.length || new Set(source.families.map(f => f.id)).size !== familyIds.length ||
      source.families.some(f => !familyIdMap.has(f.id))) throw new Error('Research family inventory changed; review its stable ID mapping.');
  const provenance = { path: sourcePath, sha256: createHash('sha256').update(sourceBytes).digest('hex') };
  const catalog = structuredClone(current);
  catalog.version = '0.2.0';
  // Preserve essential content and stable IDs, including shared Release Engineer.
  catalog.entries = catalog.entries.filter(e => e.tier !== 'extension' && !(e.kind === 'preset' && e.id === 'marketing-agency'));
  for (const e of catalog.entries) if (['preset', 'role'].includes(e.kind)) e.tier = 'essential';
  const make = (kind, id, label, description, data, family) => ({ kind, id, version: '0.1.0', label,
    description, tags: ['research-starter', ...(family ? [family.id.toLowerCase()] : [])], tier: 'extension',
    availability: 'template', requirements: [], provenance, evidence: [source.source_url], data });
  const roles = new Map(catalog.entries.filter(e => e.kind === 'role').map(e => [e.label, e]));
  for (const family of source.families) {
    for (const label of family.roles) {
      if (roles.has(label)) continue;
      const id = slug(label), focus = focuses[label];
      if (!focus) throw new Error('Missing role focus: ' + label);
      const contexts = source.families.filter(f => f.roles.includes(label));
      const entry = make('role', id, label, `Research starter: ${focus.toLowerCase()}. Requires role-specific refinement and domain review.`, {
        blueprint: { id, version: '0.1.0', title: label, purpose: focus + '.',
          responsibilities: [focus + '.', 'Define the assigned question, acceptance criteria, sources and stopping condition before producing a draft.',
            'Record methods, assumptions, evidence gaps and unresolved disagreements; distinguish observations from proposals.'],
          boundaries: ['This extension is a research-derived starter, without independent domain or task-quality acceptance.',
            'Use only authorized inputs and supported tools. Tool access, credentials and professional authority require separate verification.',
            'Obtain qualified human or domain review before consequential decisions, external actions or publication; the persona grants no authority.'],
          inputs: ['An authorized assignment, permitted sources or datasets, constraints and the designated qualified reviewer.',
            'Applicable jurisdiction, standards, operating policies and domain assumptions supplied for the assignment.'],
          outputs: [`A reviewable ${label.toLowerCase()} work product addressing the assigned question, with methods, sources, limitations and reviewer handoff.`,
            'Candidate workflow context: ' + contexts.map(c => c.workflow).join('; ') + '.'],
          escalation: ['Raise missing data, tools, jurisdiction, qualifications or evidence before dependent work; continue independent authorized analysis.',
            'Refine this starter for the selected company and obtain review before adopting the role contract.'] },
        ownership_paths: [`deliverables/${id}/`], allowed_packs: ['engineering-core', 'research-core'], required_packs: [],
      }, family);
      catalog.entries.push(entry); roles.set(label, entry);
    }
  }
  for (const family of source.families) {
    const id = familyIdMap.get(family.id), workflow = 'industry-' + id;
    catalog.entries.push(make('workflow', workflow, family.family + ' workflow',
      'Research-starter workflow. Procedures and domain tools require separate implementation and validation.',
      { required_packs: [], steps: family.workflow.split('→').map(s => s.trim()) }, family));
    const members = ['coordinator', ...family.roles.map(label => roles.get(label).id)];
    catalog.entries.push(make('preset', id, family.family,
      `Research starter for ${family.family}. Skill candidates: ${family.skill_candidates}. Refine contracts and verify tools and domain review before adoption.`, {
        coordinator_role: 'coordinator', required_roles: ['coordinator', members[1]],
        defaults: { structure_id: 'lean-team', business_model_tags: [],
          company: { id: 'example-' + id, name: family.family, repository: 'example/' + id, version: '0.1.0', purpose: family.workflow + '.' },
          roles: members.map(role_id => ({ role_id, packs: [], workflows: [workflow], reports_to: role_id === 'coordinator' ? null : 'coordinator', reviewers: [] })) },
        ownership: members.map(role => ({ path: role === 'coordinator' ? 'docs/work/' : `deliverables/${role}/`, owner_role: role, reviewer_roles: [] })),
      }, family));
  }
  return catalog;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const sourceBytes = await readFile(new URL(sourcePath, root));
  const current = JSON.parse(await readFile(new URL(catalogPath, root), 'utf8'));
  const expanded = expandCatalog(current, JSON.parse(sourceBytes), sourceBytes);
  const output = JSON.stringify(expanded, null, 2) + '\n';
  if (process.argv.includes('--check')) {
    if (await readFile(new URL(catalogPath, root), 'utf8') !== output) throw new Error('Catalog drift; run node scripts/expand-company-catalog.mjs.');
    console.log('Research starters match the source snapshot.');
  } else {
    await writeFile(new URL(catalogPath, root), output);
    console.log('Updated company and role starters.');
  }
}
