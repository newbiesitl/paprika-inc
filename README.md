# Paprika Inc

<p align="center">
  <img src="assets/paprika-inc-logo-navy-v1.png" alt="Paprika Inc — Paprika in a navy office suit" width="360" />
</p>

**Give every agent the knowledge and skills its task needs.**

Paprika Inc is an open-source framework for organizing specialized AI agents around project roles, skills and shared work. It helps you define responsibilities, onboard agents into persistent Codex chats, coordinate handoffs and run focused discussions.

Our long-term vision is an **optimized agent harness framework**: a system that routes work to the right specialist, brings in relevant knowledge and skills, and preserves validated findings for future tasks. The goals are **lower total token spending** and **better task performance and quality**.

**Current stage: local MVP.** Role setup, onboarding helpers, selected skill packs and collaboration workflows form the current foundation. Automated knowledge routing and measured token optimization are future work. Live availability depends on the installed host and connected service; see [scope and acceptance](docs/MVP.md).

[Features](#see-it-in-action) · [Get started](#get-started) · [Architecture](#how-paprika-inc-works) · [Vision](#where-we-are-going) · [Reference](#reference-and-development)

## What is it for?

Use Paprika Inc when a project benefits from specialists with clear responsibilities and a shared way to work:

- **Build software:** define architecture, implementation, review and release responsibilities, then hand work between the relevant agents.
- **Conduct research:** equip a researcher with selected literature, citation and critical-appraisal workflows, with separate review where needed.
- **Make decisions together:** bring existing agent chats into a meeting with a shared agenda, bounded rounds and recorded outcomes.

A virtual company is one way to configure these roles. The broader aim is a reusable foundation for focused, knowledgeable agents across different kinds of work.

## See it in action

These screenshots illustrate the setup and meeting workflows. The catalog, native host and connected service each have their own availability requirements.

### 1. Shape the team around your project

Discuss your repository and goals with an initial agent. Choose a starting template, refine the suggested roles, and review responsibilities, ownership and reviewers before creating the company definitions.

<p align="center">
  <img src="https://github.com/user-attachments/assets/429f3d42-35fe-4241-8e7d-24ae98aabd3e" width="700" alt="Discussing a repository and its initial company configuration" />
</p>

<details>
<summary>See the company configuration example</summary>

<p align="center">
  <img src="https://github.com/user-attachments/assets/836a4cc3-e24b-44cc-ae79-e79adec042e3" width="700" alt="Reviewing the proposed company configuration" />
</p>

</details>

The [company catalog](apps/company-catalog/README.md) provides Essential software and research presets, plus an **Extensions · In development** collection of additional company and role starters. The standalone picker can export a starter repository and a brief for further refinement. Native panel rendering remains a separate acceptance step.

### 2. Give each agent a role and a starting context

Review the role contracts, select any optional skill packs, and ask Inc to onboard the agreed roster into a saved local Codex project. The sequential bootstrap records progress so you can inspect its status and deliberately resume interrupted work.

<p align="center">
  <img src="https://github.com/user-attachments/assets/0d283edf-96b2-4013-b107-4ad7e8e02ee2" width="700" alt="Creating agent roles for the selected company" />
</p>

<details>
<summary>See the onboarding sequence</summary>

The new chat reads its assigned role and reports what it understood before taking on later work.

<p align="center">
  <img src="https://github.com/user-attachments/assets/5b5e4c9d-70da-4572-9036-13fe236599b3" width="700" alt="A coordinator chat reading its onboarding instructions" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/92dd9316-075a-4d05-a73d-27d48dd3c14f" width="700" alt="The coordinator reporting completion of onboarding" />
</p>

</details>

Role definitions describe responsibilities. Creating files alone does not create chats or give agents additional permissions. See the [onboarding workflow](plugins/paprika-inc/skills/setup-paprika-inc/references/mvp-workflow.md).

### 3. Bring specialists together for a focused discussion

Create a meeting with a topic, participants and a round budget. Existing agent chats receive invitations through Inc messaging. Each participant contributes or explicitly passes; a completed round is published together before the next begins.

<p align="center">
  <img src="https://github.com/user-attachments/assets/8f6372d7-974a-4472-a449-bd104f16bbce" width="700" alt="Creating an agent meeting with a topic, participants and discussion rounds" />
</p>

<details>
<summary>Follow a meeting from invitations to notes</summary>

**Choose participants and invite their existing chats.**

<p align="center">
  <img src="https://github.com/user-attachments/assets/9986cbfc-fe41-4f8e-bc55-40d9b319e66a" width="700" alt="An agent receiving and accepting a meeting invitation" />
</p>

**Contribute within the agreed round budget.**

<p align="center">
  <img src="https://github.com/user-attachments/assets/83f232b3-cfba-4e65-9777-537394aed73f" width="700" alt="An agent contributing to a meeting round" />
</p>

**Keep published contributions and curated notes together.**

<p align="center">
  <img src="https://github.com/user-attachments/assets/b9c68480-d2fb-4e49-bc93-6c0cf01da7a7" width="700" alt="The private meeting board collecting published contributions" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/dbfced77-a8ad-49d9-a714-b31a053018ca" width="700" alt="Meeting notes recording the discussion and its outcomes" />
</p>

</details>

The room closes when the configured rounds are complete. The coordinator prepares conclusions, action items and unresolved questions; curated notes and summaries can be exported to the repository's `meetings/` folder.

<p align="center">
  <img src="https://github.com/user-attachments/assets/2a001b1f-c238-4e05-a7c5-6bf52347602d" width="700" alt="A final meeting summary with conclusions, action items and open questions" />
</p>

Meetings require a compatible private Paprika service. See the [meeting pilot and acceptance boundaries](docs/MEETING-PILOT.md) and [meeting procedure](plugins/paprika-inc/skills/paprika-inc/references/meetings.md).

## Get started

The first target is a saved **local Codex project on one selected machine**.

1. **Install the Paprika Inc kit** through your host's supported plugin installation flow. Follow the [installation workflow](plugins/paprika-inc/skills/setup-paprika-inc/references/mvp-workflow.md#installation-and-existing-service-binding); developers can [prepare the kit from source](#work-from-source).
2. **Open your repository as a local Codex project** and choose an existing chat for setup. Start with:

   > $setup-paprika-inc — Help me define a team for this project. Suggest roles, responsibilities, reviewers and relevant skill packs, then show me the proposed configuration.

3. **Review and save the definitions.** Ask Inc to write the agreed configuration. Select and request installation of any project-local skill packs. Once the definitions are committed and available at the selected Git revision, ask Inc to bootstrap that roster into the chosen local project.
4. **Assign work and collaborate.** Use `$paprika-inc help` to explore the workflow. Ask for a scoped handoff or a meeting when useful. Service-backed messages and meetings need a verified compatible Paprika service connection.

Native onboarding can use the host's own tools without a separate Messenger plugin installation. If you already have a Paprika service, setup should inspect and reuse it. For status, recovery and host-specific requirements, follow the [concrete MVP workflow](plugins/paprika-inc/skills/setup-paprika-inc/references/mvp-workflow.md).

## How Paprika Inc works

Paprika Inc builds on **Paprika Messenger**, adds reusable role and collaboration workflows, and brings in selected external skills. The host provides the agents and their execution tools.

```mermaid
flowchart LR
    accTitle: Paprika Inc architecture
    accDescr: Human goals guide Paprika Inc roles and collaboration. Inc uses the Codex host for agent chats and tools, and Paprika Messenger for communication. Agents draw on selected skills and project knowledge.
    Human["You<br/>Goals and decisions"] --> Inc["Paprika Inc<br/>Roles and collaboration"]
    Inc --> Host["Codex host<br/>Chats and tools"]
    Inc --> Messenger["Paprika Messenger<br/>Communication"]
    Host --> Skills["Selected skills<br/>Research and engineering"]
    Host --> Knowledge["Project knowledge<br/>Code, docs and evidence"]
```

| Component | What it contributes |
| --- | --- |
| **Paprika Inc** | Portable role contracts, ownership and review relationships, setup helpers, handoffs and meeting procedures. |
| **Paprika Messenger** | The underlying communication layer for durable messages and private meeting state. It remains an [independent project](https://github.com/newbiesitl/paprika-messenger). |
| **Codex host** | Persistent chats, model execution and access to tools allowed in the current environment. Inc prepares and records supported native actions; the agent invokes them. |
| **Skills and integrations** | Selected instructions and resources for specialist work. Tool availability, credentials and host permissions determine which actions can actually run. |
| **Project knowledge** | The repository's source, documents, decisions, evidence and work checkpoints that agents can read and maintain within their assignments. |

A specialist can use external tools available in its own host environment and return results through a managed handoff. Inc currently supplies collaboration procedures and [integration compatibility metadata](docs/architecture/INTEGRATION-REGISTRY.md); a general-purpose external-tool execution service is future work.

### Optional specialist skills

| Pack | Included workflows | Setup |
| --- | --- | --- |
| `research-core` | Paper lookup, literature review, citation management and scientific critical thinking, from a pinned subset of Scientific Agent Skills. | [Research setup and capability boundaries](plugins/paprika-inc/skills/setup-paprika-inc/references/research-core.md) |
| `engineering-core` | The `paprika-code-review` skill, with selected engineering and review guidance. | [Engineering setup and provenance](plugins/paprika-inc/skills/setup-paprika-inc/references/engineering-core.md) |

Packs are explicitly selected and installed into the project. Installing Inc alone does not activate them or install entire upstream plugins. Role assignments guide skill use; project-local discovery can expose the same skills to other chats in that project. Setup reports installation integrity and local dependencies separately from external-service readiness.

Explore the [scientific research example](examples/scientific-research/README.md) and [third-party notices](THIRD_PARTY_NOTICES.md).

## Where we are going

We want Paprika Inc to become an **optimized agent harness framework**, with each specialist responsible for its own knowledge and skills. A coordinator should be able to identify the right specialist and narrow the search space before that agent gathers detailed context.

### The target task-routing cycle

The following illustration describes the **planned operating cycle**, building on today's roles, skill packs, handoffs and checkpoints.

```mermaid
flowchart LR
    accTitle: Planned task-routing cycle
    accDescr: Understand the task, select a specialist, load focused context, execute, validate and preserve reusable knowledge. Validation can send work back for more context. Preserved knowledge improves future routing and retrieval.
    Task["1. Understand<br/>the task"]
    Route["2. Select a<br/>specialist"]
    Context["3. Load focused<br/>context"]
    Execute["4. Execute"]
    Validate["5. Validate"]
    Preserve["6. Preserve reusable<br/>knowledge"]
    Knowledge[("Role knowledge<br/>and skill index")]

    Task --> Route --> Context --> Execute --> Validate
    Validate -->|"Pass"| Preserve
    Validate -->|"Rework"| Context
    Preserve --> Knowledge
    Knowledge -.->|"Route future tasks"| Route
    Knowledge -.->|"Retrieve"| Context
```

For example, a repository task could be routed to a specialist whose knowledge index points to the relevant subsystem, decisions and tests. That agent would read the needed sources and use an appropriate skill, then preserve any validated finding for the next task.

### Knowledge distillation and navigation

Here, **knowledge distillation means organizing knowledge, not training a smaller model**. We envision concise, source-linked entries arranged in a tree or graph so an agent can navigate from a concept to the relevant code, documents, evidence and skills.

A lightweight ontology could give concepts and relationships consistent names. Entries should retain their owners, source revisions and freshness, along with uncertainty, contradictions and unresolved questions. Summaries help locate evidence; the underlying sources remain available for verification.

Role ownership would make specialists accountable for maintaining their knowledge and skill indexes, while shared references would connect related domains. The goal is to retrieve a useful slice of knowledge for each task.

### Token optimization and task quality

Focused routing could reduce repeated repository exploration, irrelevant context and duplicated specialist work. It should complement the host's existing skill-discovery and context-loading behavior.

We will need to evaluate **total tokens and cost per accepted task**, including routing, retrieval, knowledge maintenance and retries, alongside task success, quality, latency and rework. Lower context size by itself does not prove a better result. **No measured token savings or quality gains are claimed yet.**

| Foundation in the current implementation | Direction to develop and evaluate |
| --- | --- |
| Role contracts, ownership and selected skill packs | Task-aware selection of specialists, knowledge and skills |
| Repository documents, evidence and resumable work checkpoints | Structured knowledge distillation, navigation and freshness checks |
| Native handoffs and private meeting workflows | Managed collaboration across more tools and agent environments |
| Validation procedures and recorded task evidence | Reproducible comparisons of total token use, task performance and quality |

These are product directions, not a release schedule. Follow [development tracking](docs/DEVELOPMENT.md) and the [industry and integration roadmap](https://github.com/newbiesitl/paprika-inc/issues/30) for scoped work and acceptance evidence.

## Reference and development

### Browse the full catalog

The generated reference below lists the current templates and skill-pack sources. Extension entries are starting points for refinement and domain review; their presence does not certify task performance or connected tools.

<details>
<summary>Expand company types, organization structures, role templates and packs</summary>

<!-- company-catalog:start -->
## Company catalog preview

Browse and configure a portable company draft in the [shared catalog UI](apps/company-catalog/README.md). One component supports a standalone local interface and an MCP App resource for supported native hosts. This candidate is not installed or deployed; actual Codex/ChatGPT rendering remains unverified.

### Company types

**Essential:** 2 existing company presets and 7 role templates. **Extensions · In development:** 43 researched company families and 130 additional personas. The research maps 131 distinct role names; Release Engineer is shared with Essential. Extensions are selectable starters requiring refinement, qualified review and separate tool/task validation. See the [maturity assessment](docs/research/COMPANY-CATALOG-MATURITY.md).

| Starting template | Version | Catalog state | Default roles | Default structure |
| --- | --- | --- | --- | --- |
| Software studio | 0.1.0 | template | Coordinator, Architect, Developer, QA, Release Engineer | Lean team |
| Scientific research | 0.1.0 | template | Coordinator, Researcher, Scientific Reviewer, Release Engineer | Research lab |

<details>
<summary>Extensions · In development — company types</summary>

| Starting template | Version | Catalog state | Default roles | Default structure |
| --- | --- | --- | --- | --- |
| Frontier AI research | 0.1.0 | template | Coordinator, Research Scientist, Research Engineer, Evaluation/Safety Researcher | Lean team |
| Applied ML / deep learning | 0.1.0 | template | Coordinator, Data Scientist, ML Engineer, MLOps Engineer | Lean team |
| AI-powered cross-domain R&D | 0.1.0 | template | Coordinator, Domain Scientist, Computational Researcher, Research Software Engineer | Lean team |
| Venture capital / private equity | 0.1.0 | template | Coordinator, Investment Analyst, Due-Diligence Analyst, Portfolio Analyst | Lean team |
| Asset management / quantitative research | 0.1.0 | template | Coordinator, Equity Researcher, Quant Researcher, Risk Analyst | Lean team |
| Banking / fintech | 0.1.0 | template | Coordinator, Credit Analyst, Treasury Analyst, Compliance Analyst | Lean team |
| Accounting / audit | 0.1.0 | template | Coordinator, Accountant, Financial Planning Analyst, Audit Analyst | Lean team |
| Insurance / actuarial | 0.1.0 | template | Coordinator, Actuarial Analyst, Claims Operations Analyst, Underwriting Analyst | Lean team |
| Law firm / legal department | 0.1.0 | template | Coordinator, Legal Researcher, Contract Analyst, Litigation Support Analyst | Lean team |
| Pharmaceutical discovery | 0.1.0 | template | Coordinator, Medicinal Chemistry Researcher, Computational Chemist, Bioinformatics Analyst | Lean team |
| Pharmaceutical manufacturing | 0.1.0 | template | Coordinator, Process Analyst, Quality Assurance Analyst, Regulatory Documentation Specialist | Lean team |
| Biotech / genomics | 0.1.0 | template | Coordinator, Bioinformatician, Computational Biologist, Lab Data Steward | Lean team |
| Healthcare operations | 0.1.0 | template | Coordinator, Clinical Operations Analyst, Quality Improvement Analyst, Medical Literature Researcher | Lean team |
| Medical devices / diagnostics | 0.1.0 | template | Coordinator, Systems Engineer, Verification Engineer, Regulatory Documentation Specialist | Lean team |
| Advertising / marketing | 0.1.0 | template | Coordinator, Marketing Strategist, SEO Analyst, Copywriter, Growth Analyst | Lean team |
| Brand / design agency | 0.1.0 | template | Coordinator, Brand Strategist, UX Researcher, Product Designer | Lean team |
| General manufacturing | 0.1.0 | template | Coordinator, Production Planner, Industrial Engineer, Quality Analyst | Lean team |
| Semiconductors / electronics | 0.1.0 | template | Coordinator, Hardware Engineer, Verification Engineer, Test Data Analyst | Lean team |
| Robotics / automotive / aerospace | 0.1.0 | template | Coordinator, Systems Engineer, Simulation Engineer, Reliability Analyst | Lean team |
| Procurement / supply chain | 0.1.0 | template | Coordinator, Procurement Analyst, Supplier Risk Analyst, Demand Planner | Lean team |
| Logistics / warehousing | 0.1.0 | template | Coordinator, Route Planner, Warehouse Analyst, Operations Coordinator | Lean team |
| Human resources | 0.1.0 | template | Coordinator, HR Operations Specialist, People Analyst, Learning Designer | Lean team |
| Recruiting firm / talent acquisition | 0.1.0 | template | Coordinator, Recruiter, Talent Researcher, Interview Coordinator | Lean team |
| B2B software | 0.1.0 | template | Coordinator, Product Manager, Backend Engineer, Solutions Engineer, QA Engineer | Lean team |
| B2C software / mobile | 0.1.0 | template | Coordinator, Product Manager, Frontend/Mobile Engineer, UX Researcher, Growth Analyst | Lean team |
| SaaS / cloud platform | 0.1.0 | template | Coordinator, Platform Engineer, SRE, Billing Operations Analyst, Customer Success Analyst | Lean team |
| Open-source organization | 0.1.0 | template | Coordinator, Maintainer, Community Manager, Documentation Engineer, Release Engineer | Lean team |
| Cybersecurity | 0.1.0 | template | Coordinator, Security Analyst, Application Security Engineer, Incident Analyst | Lean team |
| Consulting / professional services | 0.1.0 | template | Coordinator, Engagement Manager, Business Analyst, Domain Consultant | Lean team |
| Sales / customer success / support | 0.1.0 | template | Coordinator, Account Researcher, Sales Engineer, Customer Success Analyst, Support Analyst | Lean team |
| Retail / e-commerce | 0.1.0 | template | Coordinator, Merchandising Analyst, E-commerce Manager, Demand Analyst | Lean team |
| Real estate / property management | 0.1.0 | template | Coordinator, Market Researcher, Property Analyst, Leasing Operations Coordinator | Lean team |
| Construction / infrastructure | 0.1.0 | template | Coordinator, Project Controls Analyst, Cost Estimator, BIM Coordinator | Lean team |
| Energy / utilities | 0.1.0 | template | Coordinator, Energy Analyst, Asset Reliability Analyst, Operations Planner | Lean team |
| Climate / environmental services | 0.1.0 | template | Coordinator, Climate Analyst, Sustainability Analyst, Geospatial Analyst | Lean team |
| Agriculture / food production | 0.1.0 | template | Coordinator, Agronomy Researcher, Food Quality Analyst, Supply Planner | Lean team |
| Telecommunications / network operations | 0.1.0 | template | Coordinator, Network Engineer, Capacity Analyst, Service Assurance Analyst | Lean team |
| Education / edtech | 0.1.0 | template | Coordinator, Curriculum Designer, Learning Researcher, Assessment Designer | Lean team |
| Media / publishing / journalism | 0.1.0 | template | Coordinator, Research Editor, Writer, Fact Checker, Rights Coordinator | Lean team |
| Gaming / entertainment | 0.1.0 | template | Coordinator, Game Designer, Gameplay Engineer, Technical Artist, Playtest Analyst | Lean team |
| Travel / hospitality / events | 0.1.0 | template | Coordinator, Revenue Analyst, Guest Operations Coordinator, Event Planner | Lean team |
| Nonprofit / social enterprise | 0.1.0 | template | Coordinator, Program Manager, Grant Writer, Impact Analyst, Volunteer Coordinator | Lean team |
| Public sector / civic technology | 0.1.0 | template | Coordinator, Policy Researcher, Procurement Analyst, Service Designer, Program Evaluator | Lean team |

</details>

### Organization structures

| Structure | Stable ID | Reporting shape | Catalog state |
| --- | --- | --- | --- |
| Lean team | lean-team | Direct to coordinator | template |
| Functional departments | functional-departments | Reporting tree | template |
| Research lab | research-lab | Reporting tree | template |

Structures are independent of company type and business-model tags. Review relationships are configured separately from reporting lines.

### Role templates

| Role | Stable ID | Purpose | Catalog state |
| --- | --- | --- | --- |
| Coordinator | coordinator | Route human requests and preserve task handoffs. | template |
| Architect | architect | Own design and technical acceptance. | template |
| Developer | developer | Implement the selected software outcome. | template |
| QA | qa | Provide company quality evidence for meaningful feature, pilot, MVP, PR and design-implementation validation. | template |
| Release Engineer | release-engineer | Sequence reviewed changes and prepare reproducible releases. | template |
| Researcher | researcher | Investigate scoped questions and synthesize evidence. | template |
| Scientific Reviewer | scientific-reviewer | Independently appraise claims, methods and evidence. | template |

<details>
<summary>Extensions · In development — role personas</summary>

| Role | Stable ID | Purpose | Catalog state |
| --- | --- | --- | --- |
| Research Scientist | research-scientist | Research starter: formulate research hypotheses and design experiments with explicit falsification criteria. Requires role-specific refinement and domain review. | template |
| Research Engineer | research-engineer | Research starter: implement reproducible experimental code and document execution conditions. Requires role-specific refinement and domain review. | template |
| Evaluation/Safety Researcher | evaluation-safety-researcher | Research starter: design bounded evaluations and analyze failure modes and benchmark limitations. Requires role-specific refinement and domain review. | template |
| Data Scientist | data-scientist | Research starter: analyze validated datasets and compare statistical models with uncertainty estimates. Requires role-specific refinement and domain review. | template |
| ML Engineer | ml-engineer | Research starter: build and evaluate model pipelines with reproducible data and model versions. Requires role-specific refinement and domain review. | template |
| MLOps Engineer | mlops-engineer | Research starter: design experiment tracking and model lifecycle procedures with rollback evidence. Requires role-specific refinement and domain review. | template |
| Domain Scientist | domain-scientist | Research starter: frame domain hypotheses and appraise their scientific evidence. Requires role-specific refinement and domain review. | template |
| Computational Researcher | computational-researcher | Research starter: plan computational experiments and test sensitivity to modeling assumptions. Requires role-specific refinement and domain review. | template |
| Research Software Engineer | research-software-engineer | Research starter: build reproducible research tools with documented methods and tests. Requires role-specific refinement and domain review. | template |
| Investment Analyst | investment-analyst | Research starter: compare opportunities using sourced financial assumptions and scenario analysis. Requires role-specific refinement and domain review. | template |
| Due-Diligence Analyst | due-diligence-analyst | Research starter: organize diligence evidence, missing documents and material exceptions. Requires role-specific refinement and domain review. | template |
| Portfolio Analyst | portfolio-analyst | Research starter: analyze portfolio exposures and performance against explicit benchmarks. Requires role-specific refinement and domain review. | template |
| Equity Researcher | equity-researcher | Research starter: develop sourced company research and track thesis assumptions. Requires role-specific refinement and domain review. | template |
| Quant Researcher | quant-researcher | Research starter: evaluate quantitative hypotheses with leakage checks and backtest limitations. Requires role-specific refinement and domain review. | template |
| Risk Analyst | risk-analyst | Research starter: analyze exposures and stress scenarios with documented model limitations. Requires role-specific refinement and domain review. | template |
| Credit Analyst | credit-analyst | Research starter: assess documented cash flows and credit assumptions for human review. Requires role-specific refinement and domain review. | template |
| Treasury Analyst | treasury-analyst | Research starter: reconcile liquidity inputs and compare cash-management scenarios. Requires role-specific refinement and domain review. | template |
| Compliance Analyst | compliance-analyst | Research starter: map evidence and exceptions to the applicable supplied policies. Requires role-specific refinement and domain review. | template |
| Accountant | accountant | Research starter: reconcile transactions and prepare traceable accounting workpapers. Requires role-specific refinement and domain review. | template |
| Financial Planning Analyst | financial-planning-analyst | Research starter: build budget and forecast scenarios and explain variances. Requires role-specific refinement and domain review. | template |
| Audit Analyst | audit-analyst | Research starter: trace assertions to evidence and document exceptions for independent review. Requires role-specific refinement and domain review. | template |
| Actuarial Analyst | actuarial-analyst | Research starter: analyze exposure and loss assumptions with sensitivity estimates. Requires role-specific refinement and domain review. | template |
| Claims Operations Analyst | claims-operations-analyst | Research starter: check claim documentation and organize exceptions for authorized review. Requires role-specific refinement and domain review. | template |
| Underwriting Analyst | underwriting-analyst | Research starter: compare application evidence against supplied underwriting criteria. Requires role-specific refinement and domain review. | template |
| Legal Researcher | legal-researcher | Research starter: research supplied legal questions with jurisdiction, dates and source traceability. Requires role-specific refinement and domain review. | template |
| Contract Analyst | contract-analyst | Research starter: compare clauses and document obligations, deviations and proposed redlines. Requires role-specific refinement and domain review. | template |
| Litigation Support Analyst | litigation-support-analyst | Research starter: build evidence chronologies and document indexes for qualified review. Requires role-specific refinement and domain review. | template |
| Medicinal Chemistry Researcher | medicinal-chemistry-researcher | Research starter: appraise compound and target evidence for proposed discovery experiments. Requires role-specific refinement and domain review. | template |
| Computational Chemist | computational-chemist | Research starter: plan reproducible molecular calculations and explain model limitations. Requires role-specific refinement and domain review. | template |
| Bioinformatics Analyst | bioinformatics-analyst | Research starter: analyze biological datasets with explicit quality and provenance checks. Requires role-specific refinement and domain review. | template |
| Process Analyst | process-analyst | Research starter: analyze process trends and deviations against documented operating assumptions. Requires role-specific refinement and domain review. | template |
| Quality Assurance Analyst | quality-assurance-analyst | Research starter: trace quality requirements to records and identify evidence gaps. Requires role-specific refinement and domain review. | template |
| Regulatory Documentation Specialist | regulatory-documentation-specialist | Research starter: assemble traceable documentation against supplied regulatory requirements. Requires role-specific refinement and domain review. | template |
| Bioinformatician | bioinformatician | Research starter: plan reproducible sequence-analysis pipelines with quality controls. Requires role-specific refinement and domain review. | template |
| Computational Biologist | computational-biologist | Research starter: interpret computational biological results within study-design limits. Requires role-specific refinement and domain review. | template |
| Lab Data Steward | lab-data-steward | Research starter: maintain sample and dataset provenance and resolve metadata inconsistencies. Requires role-specific refinement and domain review. | template |
| Clinical Operations Analyst | clinical-operations-analyst | Research starter: map clinical operational processes using approved de-identified inputs. Requires role-specific refinement and domain review. | template |
| Quality Improvement Analyst | quality-improvement-analyst | Research starter: compare operational improvement options using measurable outcomes. Requires role-specific refinement and domain review. | template |
| Medical Literature Researcher | medical-literature-researcher | Research starter: appraise medical literature and retain applicability and evidence limitations. Requires role-specific refinement and domain review. | template |
| Systems Engineer | systems-engineer | Research starter: define system requirements, interfaces and traceable acceptance criteria. Requires role-specific refinement and domain review. | template |
| Verification Engineer | verification-engineer | Research starter: design verification plans and trace results to requirements. Requires role-specific refinement and domain review. | template |
| Marketing Strategist | marketing-strategist | Research starter: develop positioning and campaign hypotheses from supplied market evidence. Requires role-specific refinement and domain review. | template |
| SEO Analyst | seo-analyst | Research starter: assess search visibility and prioritize measurable content and technical improvements. Requires role-specific refinement and domain review. | template |
| Copywriter | copywriter | Research starter: draft audience-specific copy with substantiated claims and reviewable alternatives. Requires role-specific refinement and domain review. | template |
| Growth Analyst | growth-analyst | Research starter: analyze acquisition and retention experiments with explicit measurement assumptions. Requires role-specific refinement and domain review. | template |
| Brand Strategist | brand-strategist | Research starter: translate audience research into brand positioning and creative briefs. Requires role-specific refinement and domain review. | template |
| UX Researcher | ux-researcher | Research starter: plan user studies and synthesize findings with sampling limitations. Requires role-specific refinement and domain review. | template |
| Product Designer | product-designer | Research starter: develop product concepts and interaction specifications for usability review. Requires role-specific refinement and domain review. | template |
| Production Planner | production-planner | Research starter: compare production schedules under explicit demand and capacity constraints. Requires role-specific refinement and domain review. | template |
| Industrial Engineer | industrial-engineer | Research starter: analyze process capacity and propose measurable operational improvements. Requires role-specific refinement and domain review. | template |
| Quality Analyst | quality-analyst | Research starter: analyze defects and trace proposed quality actions to supporting evidence. Requires role-specific refinement and domain review. | template |
| Hardware Engineer | hardware-engineer | Research starter: analyze hardware specifications and document interface and design tradeoffs. Requires role-specific refinement and domain review. | template |
| Test Data Analyst | test-data-analyst | Research starter: analyze test outcomes and identify yield trends and anomalous results. Requires role-specific refinement and domain review. | template |
| Simulation Engineer | simulation-engineer | Research starter: design simulation studies and validate assumptions against available evidence. Requires role-specific refinement and domain review. | template |
| Reliability Analyst | reliability-analyst | Research starter: analyze failure modes and reliability estimates with uncertainty. Requires role-specific refinement and domain review. | template |
| Procurement Analyst | procurement-analyst | Research starter: compare supplier proposals and spending against documented requirements. Requires role-specific refinement and domain review. | template |
| Supplier Risk Analyst | supplier-risk-analyst | Research starter: evaluate supplier evidence and identify continuity and compliance gaps. Requires role-specific refinement and domain review. | template |
| Demand Planner | demand-planner | Research starter: compare demand forecasts and inventory scenarios with error estimates. Requires role-specific refinement and domain review. | template |
| Route Planner | route-planner | Research starter: propose routes subject to supplied capacity and service constraints. Requires role-specific refinement and domain review. | template |
| Warehouse Analyst | warehouse-analyst | Research starter: analyze warehouse capacity, inventory flows and operational exceptions. Requires role-specific refinement and domain review. | template |
| Operations Coordinator | operations-coordinator | Research starter: organize operational handoffs and track dependencies and exceptions. Requires role-specific refinement and domain review. | template |
| HR Operations Specialist | hr-operations-specialist | Research starter: prepare reviewed employee-process documentation and completion checklists. Requires role-specific refinement and domain review. | template |
| People Analyst | people-analyst | Research starter: analyze approved aggregate workforce data with privacy and bias checks. Requires role-specific refinement and domain review. | template |
| Learning Designer | learning-designer | Research starter: map competencies to learning activities and evaluation criteria. Requires role-specific refinement and domain review. | template |
| Recruiter | recruiter | Research starter: translate hiring requirements into job-related sourcing and evaluation plans. Requires role-specific refinement and domain review. | template |
| Talent Researcher | talent-researcher | Research starter: organize candidate evidence against authorized job-related criteria. Requires role-specific refinement and domain review. | template |
| Interview Coordinator | interview-coordinator | Research starter: prepare structured interview materials and coordinate authorized scheduling. Requires role-specific refinement and domain review. | template |
| Product Manager | product-manager | Research starter: translate customer evidence into scoped requirements and acceptance criteria. Requires role-specific refinement and domain review. | template |
| Backend Engineer | backend-engineer | Research starter: implement service behavior with documented interfaces and regression evidence. Requires role-specific refinement and domain review. | template |
| Solutions Engineer | solutions-engineer | Research starter: map customer integration needs to verifiable technical solution proposals. Requires role-specific refinement and domain review. | template |
| QA Engineer | qa-engineer | Research starter: independently validate behavior against acceptance criteria and report uncovered scope. Requires role-specific refinement and domain review. | template |
| Frontend/Mobile Engineer | frontend-mobile-engineer | Research starter: build accessible client interactions and verify platform behavior. Requires role-specific refinement and domain review. | template |
| Platform Engineer | platform-engineer | Research starter: design platform capabilities with isolation and operational acceptance criteria. Requires role-specific refinement and domain review. | template |
| SRE | sre | Research starter: analyze reliability objectives, incidents and recovery procedures. Requires role-specific refinement and domain review. | template |
| Billing Operations Analyst | billing-operations-analyst | Research starter: reconcile usage and billing records and document discrepancies. Requires role-specific refinement and domain review. | template |
| Customer Success Analyst | customer-success-analyst | Research starter: analyze customer outcomes and propose evidence-based adoption improvements. Requires role-specific refinement and domain review. | template |
| Maintainer | maintainer | Research starter: triage contributions and preserve project compatibility and review requirements. Requires role-specific refinement and domain review. | template |
| Community Manager | community-manager | Research starter: prepare community guidance and organize feedback within moderation policy. Requires role-specific refinement and domain review. | template |
| Documentation Engineer | documentation-engineer | Research starter: produce tested technical instructions and resolve documentation gaps. Requires role-specific refinement and domain review. | template |
| Security Analyst | security-analyst | Research starter: analyze security evidence within an explicitly authorized scope. Requires role-specific refinement and domain review. | template |
| Application Security Engineer | application-security-engineer | Research starter: review application threats and validate proposed mitigations within scope. Requires role-specific refinement and domain review. | template |
| Incident Analyst | incident-analyst | Research starter: correlate incident evidence and build a sourced event timeline. Requires role-specific refinement and domain review. | template |
| Engagement Manager | engagement-manager | Research starter: frame client deliverables and manage explicit scope and review dependencies. Requires role-specific refinement and domain review. | template |
| Business Analyst | business-analyst | Research starter: map business processes and compare requirements and improvement options. Requires role-specific refinement and domain review. | template |
| Domain Consultant | domain-consultant | Research starter: develop domain recommendations with documented assumptions and expert review points. Requires role-specific refinement and domain review. | template |
| Account Researcher | account-researcher | Research starter: compile sourced account context and identify relevant evidence gaps. Requires role-specific refinement and domain review. | template |
| Sales Engineer | sales-engineer | Research starter: draft technical proposals and verify claims against available capabilities. Requires role-specific refinement and domain review. | template |
| Support Analyst | support-analyst | Research starter: triage support evidence and draft responses and escalation recommendations. Requires role-specific refinement and domain review. | template |
| Merchandising Analyst | merchandising-analyst | Research starter: analyze assortment performance and compare merchandising scenarios. Requires role-specific refinement and domain review. | template |
| E-commerce Manager | e-commerce-manager | Research starter: prepare reviewed catalog and conversion improvements with measurable criteria. Requires role-specific refinement and domain review. | template |
| Demand Analyst | demand-analyst | Research starter: analyze demand patterns and compare forecast assumptions. Requires role-specific refinement and domain review. | template |
| Market Researcher | market-researcher | Research starter: compare sourced market evidence and explain sampling and comparability limits. Requires role-specific refinement and domain review. | template |
| Property Analyst | property-analyst | Research starter: analyze property comparables and portfolio documents for qualified review. Requires role-specific refinement and domain review. | template |
| Leasing Operations Coordinator | leasing-operations-coordinator | Research starter: organize leasing documentation and maintenance handoffs. Requires role-specific refinement and domain review. | template |
| Project Controls Analyst | project-controls-analyst | Research starter: analyze project schedule, cost and change evidence against baselines. Requires role-specific refinement and domain review. | template |
| Cost Estimator | cost-estimator | Research starter: prepare traceable quantity and cost estimates with explicit assumptions. Requires role-specific refinement and domain review. | template |
| BIM Coordinator | bim-coordinator | Research starter: coordinate model information and document design-package inconsistencies. Requires role-specific refinement and domain review. | template |
| Energy Analyst | energy-analyst | Research starter: compare energy demand and supply scenarios using validated inputs. Requires role-specific refinement and domain review. | template |
| Asset Reliability Analyst | asset-reliability-analyst | Research starter: analyze asset-condition trends and maintenance priorities. Requires role-specific refinement and domain review. | template |
| Operations Planner | operations-planner | Research starter: prepare operational plans under explicit resource and service constraints. Requires role-specific refinement and domain review. | template |
| Climate Analyst | climate-analyst | Research starter: compare climate scenarios and document model and source uncertainty. Requires role-specific refinement and domain review. | template |
| Sustainability Analyst | sustainability-analyst | Research starter: reconcile sustainability metrics and substantiate reporting assumptions. Requires role-specific refinement and domain review. | template |
| Geospatial Analyst | geospatial-analyst | Research starter: analyze spatial datasets with coordinate, resolution and provenance checks. Requires role-specific refinement and domain review. | template |
| Agronomy Researcher | agronomy-researcher | Research starter: appraise field trials and agronomic hypotheses with study limitations. Requires role-specific refinement and domain review. | template |
| Food Quality Analyst | food-quality-analyst | Research starter: trace food-quality observations to batch records and review criteria. Requires role-specific refinement and domain review. | template |
| Supply Planner | supply-planner | Research starter: compare supply plans against demand, lead-time and capacity constraints. Requires role-specific refinement and domain review. | template |
| Network Engineer | network-engineer | Research starter: analyze network configurations and propose scoped changes for review. Requires role-specific refinement and domain review. | template |
| Capacity Analyst | capacity-analyst | Research starter: model capacity demand and identify resource bottlenecks. Requires role-specific refinement and domain review. | template |
| Service Assurance Analyst | service-assurance-analyst | Research starter: correlate service faults and report performance against supplied objectives. Requires role-specific refinement and domain review. | template |
| Curriculum Designer | curriculum-designer | Research starter: map learning objectives to sequenced content and assessment evidence. Requires role-specific refinement and domain review. | template |
| Learning Researcher | learning-researcher | Research starter: evaluate learning studies and explain applicability and uncertainty. Requires role-specific refinement and domain review. | template |
| Assessment Designer | assessment-designer | Research starter: design assessments aligned to learning objectives and validity criteria. Requires role-specific refinement and domain review. | template |
| Research Editor | research-editor | Research starter: organize source research and identify unsupported editorial claims. Requires role-specific refinement and domain review. | template |
| Writer | writer | Research starter: draft sourced content tailored to the agreed audience and editorial brief. Requires role-specific refinement and domain review. | template |
| Fact Checker | fact-checker | Research starter: verify material claims and record source conflicts and unresolved evidence. Requires role-specific refinement and domain review. | template |
| Rights Coordinator | rights-coordinator | Research starter: organize permissions and attribution records for authorized rights review. Requires role-specific refinement and domain review. | template |
| Game Designer | game-designer | Research starter: specify gameplay hypotheses and measurable playtest criteria. Requires role-specific refinement and domain review. | template |
| Gameplay Engineer | gameplay-engineer | Research starter: implement gameplay behavior with reproducible test evidence. Requires role-specific refinement and domain review. | template |
| Technical Artist | technical-artist | Research starter: prepare technical art workflows and verify asset integration constraints. Requires role-specific refinement and domain review. | template |
| Playtest Analyst | playtest-analyst | Research starter: analyze playtest observations and explain sample and measurement limitations. Requires role-specific refinement and domain review. | template |
| Revenue Analyst | revenue-analyst | Research starter: compare revenue and capacity scenarios with explicit pricing assumptions. Requires role-specific refinement and domain review. | template |
| Guest Operations Coordinator | guest-operations-coordinator | Research starter: organize guest-service handoffs and document operational exceptions. Requires role-specific refinement and domain review. | template |
| Event Planner | event-planner | Research starter: prepare event schedules and resource plans with explicit dependencies. Requires role-specific refinement and domain review. | template |
| Program Manager | program-manager | Research starter: track program outcomes, delivery dependencies and review evidence. Requires role-specific refinement and domain review. | template |
| Grant Writer | grant-writer | Research starter: draft evidence-backed grant materials against supplied funder criteria. Requires role-specific refinement and domain review. | template |
| Impact Analyst | impact-analyst | Research starter: evaluate impact claims against measurable outcomes and attribution limits. Requires role-specific refinement and domain review. | template |
| Volunteer Coordinator | volunteer-coordinator | Research starter: prepare volunteer plans and track authorized onboarding requirements. Requires role-specific refinement and domain review. | template |
| Policy Researcher | policy-researcher | Research starter: compare policy evidence and explain assumptions and stakeholder impacts. Requires role-specific refinement and domain review. | template |
| Service Designer | service-designer | Research starter: map service journeys and develop testable improvement proposals. Requires role-specific refinement and domain review. | template |
| Program Evaluator | program-evaluator | Research starter: evaluate program outcomes against explicit criteria and study limitations. Requires role-specific refinement and domain review. | template |

</details>

Role selection defines a draft roster; it does not create live chats or grant permissions.

| Available pack source | Version | Included guidance |
| --- | --- | --- |
| Engineering core | 0.1.0 | paprika-code-review |
| Research core | 0.1.0 | paper-lookup, literature-review, citation-management, scientific-critical-thinking |

Pack source availability does not establish local installation, authentication, native-host verification, task-quality acceptance or release.

**Other planned catalog entries:** Marketing core. The broader [industry and integration roadmap](https://github.com/newbiesitl/paprika-inc/issues/30) is tracked separately.

Generated from the version 0.2.0 [backend catalog](plugins/paprika-inc/runtime/company-catalog/catalog.json); check with npm --prefix apps/company-catalog run readme:check.
<!-- company-catalog:end -->

</details>

### Work from source

Use Git, Python 3.10 or newer, and Node.js 24 or newer.

```sh
git clone --recurse-submodules https://github.com/newbiesitl/paprika-inc.git
cd paprika-inc
```

For an existing checkout, initialize its pinned dependencies:

```sh
git submodule sync --recursive
git submodule update --init --recursive
```

Submodules are pinned to reviewed commits. A GitHub source ZIP alone does not populate them; see [dependency adoption](docs/DEPENDENCIES.md).

Inspect the company and prepare a self-contained plugin kit:

```sh
node plugins/paprika-inc/skills/paprika-inc/scripts/inc.mjs help
node plugins/paprika-inc/skills/paprika-inc/scripts/inc.mjs validate --repo .
node plugins/paprika-inc/skills/paprika-inc/scripts/inc.mjs plan --repo .
node plugins/paprika-inc/skills/paprika-inc/scripts/inc.mjs status --repo .
node plugins/paprika-inc/skills/paprika-inc/scripts/inc.mjs roles --repo .
python3 scripts/prepare-plugin.py
```

The preparation command reports the generated archive path. Validate that archive with `python3 scripts/validate-plugin.py <archive-path>`. Building the kit does not install or publish it. See the [package boundary](docs/PLUGIN-SKELETON.md) and [catalog UI development guide](apps/company-catalog/README.md).

### Explore the project

| Guide | What you will find |
| --- | --- |
| [Development company](company/README.md) | The roles and contracts of the team developing Paprika Inc |
| [Local MVP](docs/MVP.md) | Implemented setup and onboarding scope, with separate live acceptance gates |
| [Meeting pilot](docs/MEETING-PILOT.md) | Round-based meetings, delivery helpers and notes export |
| [Work checkpoints](docs/work/README.md) | Task evidence and resumable handoff records |
| [Integration registry](docs/architecture/INTEGRATION-REGISTRY.md) | Compatibility declarations and future integration boundaries |
| [Governance](company/CONSTITUTION.md) and [self-development](docs/architecture/SELF-DEVELOPMENT.md) | Review, authority and adoption procedures |
| [Original proposal](docs/proposals/PAPRIKA-VIRTUAL-COMPANY.md) and [provenance](docs/proposals/MIGRATION.md) | Earlier design material and its migration history |
| [Development tracking](docs/DEVELOPMENT.md) | Features, tasks, milestones and evidence |
| [Brand assets](assets/README.md) | The approved logo and its generation prompt |

### Contribute

Read [Contributing](CONTRIBUTING.md), [Support](SUPPORT.md), [Security](SECURITY.md), the [Code of Conduct](CODE_OF_CONDUCT.md) and [Maintaining](docs/MAINTAINING.md).

Paprika Inc is distributed under the [MIT license](LICENSE). See [third-party notices](THIRD_PARTY_NOTICES.md) for dependency licenses and imported material.
