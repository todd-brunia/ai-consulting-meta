# Governed Codex Automation Client-Sharing Plan

## Status

**Working direction — not approved for implementation.** This plan evolves the
internal proposal to centralize GitHub label-driven Codex automation into a
solution that can be adopted safely by consultancy clients. It contains no
client-specific identities, infrastructure details, credentials, or commercial
terms.

## Product direction

Offer a versioned, self-managed release of `ai-delivery-orchestrator` that a
client can fork into its own GitHub organization and provision in an AWS
account it controls. The release should preserve the demonstrated human-gated
workflow while allowing each client to retain control of infrastructure,
Terraform state, credentials, policies, repositories, generated code, logs,
backups, costs, and final publication decisions.

Do not distribute the implementation directly from `ai-consulting-meta`. This
repository should remain the public planning record. Prepare the dedicated
`ai-delivery-orchestrator` implementation repository for client distribution
only after selecting a license and publishing appropriate security, release,
installation, upgrade, and support documentation. Its current private and
proprietary terms do not grant clients permission to fork or reuse it.

The initial offering is a self-managed accelerator supported through consulting
engagements. A hosted control plane or consultancy-operated GitHub App is a
separate future product that requires its own threat model, tenant isolation,
privacy terms, operations, and incident-response capability.

## Client-ready architecture

### Forkable, versioned orchestrator

- Publish reviewed releases of the TypeScript service, container image build,
  database migrations, Terraform modules, protected deployment workflows, and
  operating documentation from the dedicated implementation repository.
- Make a client fork the deployment source of truth. It must be possible to
  build images and provision the complete supported stack without access to a
  consultancy-owned repository, AWS account, Terraform backend, GitHub App, or
  secret store.
- Tag immutable releases and deliver upstream upgrades to client forks as
  reviewable pull requests. Document how clients preserve local configuration
  while accepting security fixes and schema or infrastructure migrations.
- Keep the stable interface small and versioned. Breaking configuration,
  infrastructure, state, security, workflow, or API changes require a new
  major version and a migration guide.

### Client-owned infrastructure, adapter, and policy

Each client deployment retains:

- Its own fork, protected deployment environment, AWS account or approved
  account boundary, remote Terraform state, OIDC roles, GitHub App, secrets,
  logs, backups, budgets, and notification endpoints.
- A declarative configuration file selecting supported stages, prompt and
  schema paths, validation commands or supported validation profiles, label
  names, and optional accessibility or change-journal requirements.
- Repository-specific prompts, schemas, guidance, branch protection, and pull
  request checks.
- Its own OpenAI credential and GitHub publishing credential. Pass only named
  secrets; never use blanket secret inheritance.
- An explicit actor allowlist and automation enable switch.

Provide versioned Terraform variables and outputs, a configuration schema,
validator, example environment, upgrade checker, and onboarding checklist.
Reject unknown fields and unsafe combinations so a configuration mistake fails
closed rather than silently weakening policy.

Use the [client repository provisioning plan](./client-repository-provisioning.md)
as the standard onboarding path for new target repositories. Each client
maintains a credential-free `node-v1` template and uses an idempotent
provisioner from its orchestrator fork to reconcile labels, GitHub governance,
App selection, adapter registration, and compatibility. Do not fork the client
portal or duplicate its monolithic workflow for each application.

### Self-provisioning contract

The supported client path must document and test:

1. Prerequisite GitHub, AWS, DNS, Terraform, and operator permissions.
2. Human bootstrap of protected remote state and repository-bound GitHub OIDC
   trust, including safe adoption of an existing account-level OIDC provider.
3. Creation and installation of a client-owned GitHub App with the minimum
   target-repository permissions and allowlist.
4. Protected Terraform plan/apply, database migration, image rollout, and
   smoke-test workflows using short-lived credentials.
5. Budget configuration, monitoring, backup/restore, upgrades, rollback,
   break-glass disablement, and separately approved teardown.

Acceptance requires a clean synthetic fork and fresh test account. A second
authorized operator must be able to provision and recover the deployment using
only published documentation. Examples must use placeholders and fictional
fixtures, with no account-specific consultancy dependency.

### Security and tenant boundary

- Run model generation and repository validation with read-only GitHub
  permissions and without publishing credentials.
- Transfer only bounded, validated artifacts between generation, validation,
  and publishing jobs.
- Mint a short-lived publisher token only in a separate trusted job. After the
  token exists, do not execute caller-controlled scripts or import publisher
  code from the client repository.
- Revalidate the live issue, approval cutoff, plan fingerprint, artifact,
  target repository, branch, labels, and public text immediately before every
  mutation.
- Default to a client-owned GitHub App or equivalent client-owned credential.
  A consultancy-owned multi-client App is out of scope until a separately
  reviewed managed-service design exists.
- Collect no telemetry by default. Diagnostic bundles must be explicitly
  generated, sanitized, and reviewed by the client before sharing.
- Treat issue bodies, comments, generated patches, repository files, and build
  output as untrusted. Never include prompts, model traces, secrets, or client
  source in public failure reports.

## Service and adoption model

### Initial consulting offer

Deliver the solution as a configurable accelerator rather than promising a
turnkey autonomous developer. A standard engagement should include:

1. Repository and governance assessment.
2. Threat-model and data-boundary review.
3. Label/state-machine configuration and client-owned credential setup.
4. Prompt and validation-profile adaptation.
5. A dry-run using synthetic issues and mocked publishers.
6. A limited pilot in one non-critical repository.
7. Maintainer training, operating runbook, rollback procedure, and acceptance
   review.

State clearly that the client remains responsible for approving scope,
reviewing generated code, protecting credentials, merging pull requests, and
authorizing deployment. Define supported GitHub plans, repository visibility,
runner types, languages, and validation profiles before quoting an engagement.

### Distribution and legal readiness

- Choose an explicit software license before publishing implementation. The
  current all-rights-reserved terms in `ai-consulting-meta` do not permit client
  reuse and should not be copied accidentally into the product repository.
- Publish a security policy, vulnerability-reporting channel, support policy,
  compatibility matrix, release notes, and end-of-support policy.
- Use fictional fixtures and sanitized documentation. Store client-specific
  configuration, evidence, commercial terms, and security findings only in the
  client's repository or another explicitly authorized private system.
- Separate product warranty and support expectations from consulting
  deliverables in the applicable agreement; obtain legal review before making
  claims about security, compliance, or autonomous operation.
- Produce a software bill of materials, pin third-party actions, enable
  dependency review, and document the process for urgent security upgrades.

## Implementation sequence

### Phase 1 — Extract and stabilize

- Stabilize the dedicated implementation repository and complete the internal
  orchestrator pilot.
- Define the v1 application, Terraform, OIDC, state, secrets, API, and target-
  repository configuration contracts.
- Preserve the separation between untrusted generation and trusted publishing.
- Port the complete state-machine, schema, publisher, workflow-state, and
  failure-path test suite.

### Phase 2 — Prove portability

- Complete licensing and client-distribution readiness, then create a clean
  synthetic fork in a fresh AWS test account.
- Have a second operator follow the published bootstrap and deployment guide,
  with no access to consultancy-owned infrastructure or undocumented steps.
- Add two synthetic target repositories with different policies and validation
  commands to prove that behavior is configured rather than hard-coded.
- Create one target from the client-owned `node-v1` template and prove both
  provisioning and non-mutating drift checks from the orchestrator fork.
- Have a second operator reach a passing repository-readiness result using only
  the published template, provisioner, and operating guidance.
- Exercise planning, revision, implementation, split, replay, stale approval,
  duplicate PR, failed validation, and publisher failure paths without creating
  real client issues during automated tests.
- Document installation, upgrade, rollback, break-glass disablement, and full
  removal.

### Phase 3 — Conduct a client pilot

- Select one low-risk client repository with a named technical owner and
  documented acceptance criteria.
- Use client-owned secrets and a client-approved immutable release SHA.
- Begin with planning-only behavior, then enable implementation publication
  only after the client accepts the logs, permissions, failure behavior, and
  review process.
- Record only anonymized outcome measures with permission: setup time, plan
  revisions, validation failures, human review time, rejected changes, and
  recovery events.
- Complete a pilot retrospective before supporting more clients or languages.

### Phase 4 — Productize only with evidence

- Add validation profiles and platform support in response to demonstrated
  client demand rather than accepting arbitrary executable extensions into the
  trusted publisher.
- Automate pinned-version update pull requests and compatibility checks.
- Consider a marketplace listing, consultancy-managed App, private distribution,
  or hosted dashboard only after demand justifies the added identity, tenancy,
  billing, privacy, availability, and incident-response obligations.

## Interfaces and compatibility

The v1 public contracts include Terraform inputs and outputs, backend state
layout, GitHub OIDC trust conditions, Secrets Manager names and formats,
database migrations, operator API schemas, target-repository configuration,
and the label-state contract. The implementation must document defaults,
required labels, supported events, permissions, retry semantics, migration
behavior, and which values may differ between environments.

Provisioning outputs must contain only the identifiers operators need for
subsequent configuration and verification. Secrets, source code, prompts,
model traces, raw failure output, and temporary credentials must never become
Terraform outputs, workflow artifacts, or issue comments. Patch releases may
fix bugs without weakening gates; changes that alter authority, infrastructure
state, schemas, or workflow transitions require explicit release notes and
client reacceptance.

## Test and acceptance plan

- Unit-test actor authorization, approval cutoffs, plan fingerprints, label
  transitions, public-text validation, patch constraints, split idempotency,
  and failure recovery.
- Use mocked GitHub publishers and synthetic repositories for all destructive
  behavior. No test may create client issues, branches, comments, or pull
  requests.
- Verify that generation and validation cannot mutate GitHub and cannot read
  publisher credentials.
- Verify that the publisher rejects stale approval, modified artifacts,
  unexpected labels, unsafe paths, credential-like output, duplicate branches,
  and cross-repository targeting.
- Test installation and upgrades from the oldest supported release, including
  rollback to the previously pinned SHA.
- Require passing workflow lint, schema validation, unit/integration tests,
  secret scanning, dependency review, and end-to-end fixture scenarios before
  publishing a release.
- Client acceptance requires a successful synthetic dry-run, documented
  permissions, passing repository validation, demonstrated disable/rollback,
  maintainer training, and explicit human approval before enabling write stages.
- Repository-onboarding acceptance also requires a clean template creation,
  idempotent provisioning, a no-op repeat, a passing non-mutating drift check,
  and a synthetic draft pull request that stops for human review.

## Assumptions and explicit boundaries

- All workflow stages are candidates for the shared core, but clients may
  enable a subset and should begin with the least-privileged useful subset.
- The implementation will be distributed from its dedicated repository under
  an explicit license that permits client forks; this meta repository stores
  planning history only.
- Every client deployment owns and can revoke access to its infrastructure,
  Terraform state, deployment identity, GitHub App, secrets, logs, and backups.
- Clients retain per-repository or organization-owned secrets and credentials.
- Immutable upstream release commits with reviewable update pull requests are
  the default versioning model; movable major tags are not trusted production
  references.
- Node repositories are the initial supported profile. Other ecosystems require
  separately tested profiles and compatibility commitments.
- The first offering is self-managed software plus consulting services, not a
  multi-tenant SaaS, compliance product, or autonomous merge/deployment system.
- Human approval of scope, pull-request review, merge, release, and production
  deployment remain outside the automation.
