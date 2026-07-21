# Governed Codex Automation Client-Sharing Plan

## Status

**Working direction — not approved for implementation.** This plan evolves the
internal proposal to centralize GitHub label-driven Codex automation into a
solution that can be adopted safely by consultancy clients. It contains no
client-specific identities, infrastructure details, credentials, or commercial
terms.

## Product direction

Offer a versioned automation kit that clients install in repositories they own.
The kit should preserve the demonstrated human-gated workflow while allowing
each client to retain control of credentials, policies, repositories, generated
code, and final publication decisions.

Do not distribute the implementation directly from `ai-consulting-meta`. This
repository should remain the public planning record. Create a dedicated public
implementation repository when the design is approved, with its own license,
security policy, releases, documentation, and support boundaries.

The initial offering is a self-managed accelerator supported through consulting
engagements. A hosted control plane or consultancy-operated GitHub App is a
separate future product that requires its own threat model, tenant isolation,
privacy terms, operations, and incident-response capability.

## Client-ready architecture

### Shared, versioned core

- Publish a reusable GitHub Actions workflow covering planning, revision,
  implementation, split publishing, and sanitized failure reporting.
- Package the generic state machine, approval fingerprinting, schema and patch
  validation, label transitions, idempotency, and publisher logic as centrally
  tested actions or modules.
- Pin reusable workflows and actions to immutable commit SHAs. Publish named
  releases for discovery, then deliver upgrades as reviewable pull requests
  that change the pinned SHA.
- Keep the stable interface small and versioned. Breaking configuration,
  security, label-state, or output changes require a new major version and a
  migration guide.

GitHub supports reusable workflows across repositories and identifies commit
SHAs as the safest reference for stability and security. Public workflows can
be called by public or private repositories when the client's Actions policy
allows them. See [Reuse workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)
and [Reusing workflow configurations](https://docs.github.com/en/actions/reference/workflows-and-actions/reusing-workflow-configurations).

### Client-owned adapter and policy

Each client repository retains:

- A thin workflow containing issue-label and manual-dispatch triggers plus the
  call to the pinned reusable workflow.
- A declarative configuration file selecting supported stages, prompt and
  schema paths, validation commands or supported validation profiles, label
  names, and optional accessibility or change-journal requirements.
- Repository-specific prompts, schemas, guidance, branch protection, and pull
  request checks.
- Its own OpenAI credential and GitHub publishing credential. Pass only named
  secrets; never use blanket secret inheritance.
- An explicit actor allowlist and automation enable switch.

Provide a configuration schema, validator, starter template, upgrade checker,
and onboarding checklist. Reject unknown fields and unsafe combinations so a
configuration mistake fails closed rather than silently weakening policy.

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

- Create the dedicated implementation repository and extract the generic
  workflow from the internal site repository.
- Define the v1 workflow inputs, named secrets, outputs, configuration schema,
  and supported Node validation profile.
- Preserve the separation between untrusted generation and trusted publishing.
- Port the complete state-machine, schema, publisher, workflow-state, and
  failure-path test suite.

### Phase 2 — Prove portability

- Adopt the pinned workflow in the original site as the reference consumer.
- Add a second synthetic sample repository with different prompts and
  validation commands to prove that behavior is configured rather than
  hard-coded.
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

The v1 reusable workflow should accept explicit inputs for issue number,
requested stage, configuration path, enable state, allowed actors, and GitHub
App ID. It should accept only the named OpenAI API key and GitHub App private
key as secrets.

Its outputs should be limited to the selected action, stage, issue number,
approval fingerprint, sanitized status, and pull-request URL when one is
created. Secrets, source code, prompts, model traces, and raw failure output
must never be workflow outputs or issue comments.

The configuration schema and label-state contract are public interfaces. The
v1 implementation must document defaults, required labels, supported events,
permissions, output markers, retry semantics, and migration behavior. Patch
releases may fix bugs without weakening gates; changes that alter authority or
state transitions require explicit release notes and client reacceptance.

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

## Assumptions and explicit boundaries

- All workflow stages are candidates for the shared core, but clients may
  enable a subset and should begin with the least-privileged useful subset.
- The implementation will be distributed from a dedicated public repository;
  this meta repository stores planning history only.
- Clients retain per-repository or organization-owned secrets and credentials.
- Immutable SHA pins with reviewable update PRs are the default versioning
  model; movable major tags are not trusted production references.
- Node repositories are the initial supported profile. Other ecosystems require
  separately tested profiles and compatibility commitments.
- The first offering is self-managed software plus consulting services, not a
  multi-tenant SaaS, compliance product, or autonomous merge/deployment system.
- Human approval of scope, pull-request review, merge, release, and production
  deployment remain outside the automation.

