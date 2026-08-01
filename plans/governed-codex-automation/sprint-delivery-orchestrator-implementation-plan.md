# Governed AI Sprint Delivery Orchestrator Implementation Plan

## Status

**Approved implementation direction — execute incrementally with reviewed
infrastructure and repository changes.**

## Implementation checkpoint — 2026-08-01

Implementation is active in the private
[`todd-brunia/ai-delivery-orchestrator`](https://github.com/todd-brunia/ai-delivery-orchestrator)
repository. The repository foundation and the following reviewed slices have
merged to `main`:

- [PR #5](https://github.com/todd-brunia/ai-delivery-orchestrator/pull/5)
  defines the provider-neutral, versioned `sprint-delivery/v1` domain,
  state-machine, risk, dependency, concurrency, and repository-adapter
  contracts.
- [PR #7](https://github.com/todd-brunia/ai-delivery-orchestrator/pull/7)
  adds PostgreSQL migrations, immutable sprint identity, optimistic run
  transitions, durable leases, and transactional outbox creation.
- [PR #9](https://github.com/todd-brunia/ai-delivery-orchestrator/pull/9)
  adds work-item transitions, validated dependency and conflict persistence,
  dependency-ready scheduling, and concurrent-safe recoverable outbox claims.
- [PR #11](https://github.com/todd-brunia/ai-delivery-orchestrator/pull/11)
  adds exact-byte GitHub HMAC verification, strict `github-webhook/v1`
  normalization, durable delivery deduplication, inbox claims, bounded retry,
  stale-claim recovery, and dead-letter handling.

The current validation baseline is 33 unit tests and 15 real-PostgreSQL
integration tests, plus lint, type checking, production build, Docker build and
runtime smoke test, dependency audit, secret scan, and Compose validation in
CI. The local PostgreSQL service can be stopped without deleting its named
volume.

This checkpoint does **not** mean Phase 1 or Phase 2 is complete. The current
code has no public HTTP/Lambda endpoint, GitHub App credentials or API calls,
LangGraph runtime or checkpoints, model integration, reconciliation loop,
operator API, Terraform/AWS resources, or target-repository installation. It
cannot mutate another repository.

The recommended next slice is the transport-neutral webhook application
service and ingress adapter: accept verified deliveries, persist them through
the inbox contract, return prompt duplicate-aware responses, and expose an
HTTP/Lambda boundary without adding GitHub mutation authority. LangGraph
workflow execution and canonical GitHub refetch should follow as separately
reviewed slices.

This plan defines the first implementation slice of the broader
[autonomous goal-to-deployment delivery pipeline](./goal-to-deployment-pipeline.md).
It creates a reusable AWS-hosted orchestrator that coordinates an explicit list
of GitHub issues. It does not yet generate epics from a business goal or select
issues from filter criteria.

The first installations are the private `ai-consulting-client-portal`
repository as the primary pilot and the public `ai-consulting-site` repository
as the second target.

## Initial outcome

Create a private implementation repository named `ai-delivery-orchestrator`
containing:

- A TypeScript and LangGraph orchestration service packaged as a Docker image.
- Terraform for an AWS deployment centered on ECS Fargate.
- Durable PostgreSQL checkpoints and workflow state.
- GitHub App webhook intake and narrowly authorized GitHub mutations.
- A secured operator API exercised through Bruno.
- GitHub Actions for validation, image publication, Terraform planning, and
  protected deployment.

The first workflow, `sprint-delivery/v1`, accepts one repository plus an
explicit list of issue numbers. It determines dependencies and conflict risk,
authorizes eligible plans, schedules safe work, reviews pull requests, attempts
bounded repairs, and waits for human merge before advancing dependent work.

## Architecture

```text
GitHub App webhooks             Bruno with AWS SigV4
          |                              |
          +---------- API Gateway -------+
                            |
                     Ingress/API Lambda
                       |           |
                 SQS FIFO      DynamoDB
                       |       status projection
                       v
              ECS Fargate worker service
                 desired count 0-2
                       |
                    LangGraph
                   /         \
          GitHub/OpenAI    Aurora PostgreSQL
                            checkpoints + audit
```

### Runtime responsibilities

- **API Gateway and Lambda:** accept GitHub webhooks and authenticated operator
  commands, verify and normalize inputs, record deduplication keys, enqueue
  work, return current projections, and wake workers.
- **SQS FIFO:** buffer commands and callbacks, group GitHub events by
  repository, and route exhausted messages to a dead-letter queue.
- **DynamoDB:** retain delivery and command deduplication records with TTL,
  coordinate worker wake generations, and expose an eventually consistent
  current-status projection without waking PostgreSQL.
- **Fargate workers:** claim durable leases, invoke versioned LangGraph
  workflows, call GitHub and OpenAI through bounded adapters, and write
  authoritative workflow history.
- **Aurora PostgreSQL:** store application workflow state, audit transitions,
  outbox actions, leases, attempts, evidence references, and LangGraph
  checkpoints in separate schemas.
- **GitHub:** remain the human-readable system of record for issues, labels,
  pull requests, checks, reviews, commits, and merges.

Use open-source LangGraph.js directly with
`@langchain/langgraph-checkpoint-postgres`; do not adopt the licensed LangGraph
Agent Server. Keep the domain state machine independent of LangGraph checkpoint
formats so another runtime can replace LangGraph later.

## AWS infrastructure

Deploy the pilot in `us-east-1` with Terraform.

### Always-available control plane

- API Gateway HTTP API with TLS.
- Public `POST /webhooks/github`, protected by GitHub HMAC-SHA256 validation.
- AWS IAM-authorized `/v1/*` operator routes.
- Node.js Lambda handlers for ingress, control commands, projections, and
  worker wake-up.
- SQS FIFO work queue plus dead-letter queue.
- DynamoDB on-demand projection/deduplication table.
- ECR with immutable tags, image scanning, and lifecycle retention.
- CloudWatch logs, alarms, queue and worker metrics, and a configurable AWS
  Budget notification.

### Scale-to-zero compute

- ECS Fargate service with desired count zero when idle and maximum count two.
- Public-subnet tasks with public IP for GitHub and OpenAI access, no inbound
  security-group rules, no load balancer, and no NAT Gateway.
- Non-root Docker runtime, read-only root filesystem, and a bounded writable
  ephemeral workspace.
- Immediate wake-up when ingress accepts work.
- Scheduled scale-down only after the queue is empty, no lease is active, and
  the wake generation is unchanged across two observations.
- Manual drain that stops new claims, checkpoints active work, and then scales
  the service to zero.

### PostgreSQL

- One encrypted Aurora PostgreSQL Serverless v2 writer with no readers.
- PostgreSQL 16 pinned to an AWS-supported version at or above 16.3.
- Standard Aurora storage, minimum 0 ACUs, maximum 2 ACUs, and five-minute
  auto-pause.
- Private isolated subnets; port 5432 accepted only from the worker security
  group.
- Connection timeouts of at least 60 seconds and bounded jittered retries for
  cold resume.
- Seven-day backups, deletion protection, final snapshots, and an AWS-managed
  master password.

Aurora is authoritative. DynamoDB is only the durable inbox, deduplication
store, wake coordinator, and read projection.

### Credentials and deployment

Store the GitHub App private key, GitHub webhook secret, and OpenAI API key in
Secrets Manager. Use short-lived GitHub App installation tokens for GitHub
calls. Do not expose GitHub publishing credentials to model execution.

Use versioned S3 Terraform state with native locking. GitHub Actions assumes
AWS roles through OIDC; do not create long-lived AWS deployment keys.

CI/CD behavior:

- Pull requests run lint, type checking, tests, Docker build and scan,
  Terraform formatting and validation, and a read-only Terraform plan.
- A merge to `main` publishes an immutable commit-SHA image to ECR.
- A protected GitHub `pilot` environment requires human approval before
  Terraform apply, database migrations, ECS rollout, and smoke tests.

## Implementation repository design

Use Node.js 22, TypeScript, npm workspaces, LangGraph.js, the official OpenAI
JavaScript SDK and Responses API, AWS SDK v3, Octokit, PostgreSQL, and Zod.

Organize the code around:

- A framework-independent domain state machine and policy engine.
- A registry of immutable, versioned workflow definitions.
- The `sprint-delivery/v1` LangGraph workflow.
- GitHub, OpenAI, persistence, queue, and projection adapters.
- Lambda ingress/control entry points and the Fargate worker entry point.
- Terraform modules and a pilot environment.
- A local Docker Compose environment and Bruno collection.

Persist workflow definition/version, sprint run, work item, dependency edge,
conflict domain, plan fingerprint, feasibility decision, attempt, GitHub
artifact, review, transition, lease, retry, cost, and provenance records.
Every external mutation uses a transactional outbox and idempotency key.

Do not retain raw model reasoning. Retain the structured decision, evidence
references, model and policy versions, usage, and hashes of reviewed artifacts.

## Public interfaces

### Operator API

All `/v1/*` routes require API Gateway AWS IAM authorization. Bruno signs
requests with temporary AWS credentials using SigV4.

Provide:

- `POST /v1/sprint-runs`
- `GET /v1/sprint-runs`
- `GET /v1/sprint-runs/{runId}`
- `GET /v1/sprint-runs/{runId}/events`
- `POST /v1/sprint-runs/{runId}/pause`
- `POST /v1/sprint-runs/{runId}/resume`
- `POST /v1/sprint-runs/{runId}/cancel`
- `POST /v1/sprint-runs/{runId}/reconcile`
- `GET /v1/runtime`
- `POST /v1/runtime/wake`
- `POST /v1/runtime/drain`

Run creation requires an `Idempotency-Key` header and this v1 body:

```json
{
  "repository": "todd-brunia/ai-consulting-client-portal",
  "issueNumbers": [81, 82, 83],
  "mergePolicy": "human"
}
```

Reject duplicates, closed issues, pull request numbers, inaccessible issues,
and cross-repository lists. The issue list is immutable after acceptance.
`mergePolicy: "automatic"` is represented in the versioned contract but must
be rejected until the automated-merge phase is enabled.

Queued commands return `202 Accepted`. Reads include `projectionAsOf` so Bruno
users can identify stale projections. Cancellation prevents future automation
but does not close issues, abandon pull requests, or reverse completed merges.

### Repository adapter

Add `.github/ai-delivery-orchestrator.yml` to each target. Version 1 declares:

- Default branch and repository identity.
- Implementation, repair, and synchronization workflow name.
- Workflow label mapping.
- Required CI and preview checks.
- Maximum parallel implementations, default two.
- Human-only risk labels, paths, and categories.
- Exact orchestrator GitHub App slug.
- Automation enable/kill switch and adapter version.

Reject unknown fields, unsupported versions, missing labels, and configurations
that weaken mandatory controls.

### GitHub App

Create a new orchestrator GitHub App, separate from both repositories' current
build-publisher Apps, and install it only on the portal and site repositories.

Initial repository permissions are:

- Metadata: read.
- Contents: read.
- Actions: read/write.
- Checks: read.
- Issues: read/write.
- Pull requests: read/write.

Subscribe to issue, pull request, pull request review, check run/suite, workflow
run, installation, and repository-selection events. Do not grant source-write
or merge permission in v1.

Webhook processing must validate the exact raw request body against
`X-Hub-Signature-256`, deduplicate `X-GitHub-Delivery`, respond promptly,
enqueue a normalized event, and refetch canonical GitHub state before acting.
A scheduled reconciliation loop repairs missed or delayed events.

## Sprint workflow

### States

Run states:

```text
accepted -> collecting_plans -> analyzing -> active
         -> waiting_for_human -> paused -> completed
```

Recovery outcomes are `blocked`, `failed`, `cancelled`, and `superseded`.

Work-item states:

```text
discovered
  -> awaiting_plan
  -> feasibility_review
  -> human_plan_approval_required | ready_to_build
  -> build_dispatched
  -> building
  -> pr_open
  -> checks_pending
  -> reviewing
  -> fixing
  -> ready_for_human_review
  -> merged
```

Every transition records actor, policy version, evidence, idempotency key, and
time, and uses optimistic concurrency plus a durable lease.

### Plan collection and authorization

1. Validate and record every issue's immutable GitHub identity.
2. Apply `needs-planning` when an issue has no marked plan and no conflicting
   state, allowing the existing repository workflow to plan it.
3. On `plan-ready`, fingerprint the issue, marked plan, trusted amendments,
   adapter configuration, and default-branch SHA.
4. Use GPT-5.6 Terra at medium reasoning effort to return a schema-validated
   dependency graph, conflict domains, likely paths, feasibility result, risk
   classification, required evidence, and unresolved decisions.
5. Detect cycles, open external dependencies, conflicting paths, and invalid or
   low-confidence output deterministically. Uncertainty forces serialization
   or human review rather than optimistic parallelism.
6. Store feasibility findings privately; do not post them as issue comments.
7. For ordinary feasible work, apply `approved-for-build`, refetch and verify
   the plan fingerprint, then apply `approved-for-ai-build`.
8. Require human `approved-for-build` for security, authentication, secrets,
   infrastructure, destructive data, billing, workflow-policy, and external
   communication changes. After human approval, the orchestrator applies only
   `approved-for-ai-build`.
9. For infeasible or ambiguous plans, remove `plan-ready`, apply
   `needs-decision`, expose the reason through the operator API, and stop that
   dependency branch.

The deterministic policy may make a work item more restrictive than the model
suggests; model output may never weaken repository risk policy.

### Scheduling and builds

- Allow at most two same-repository builds when dependencies and predicted
  conflict domains are disjoint.
- Allow the portal and site to build concurrently.
- Serialize merge eligibility within each repository.
- Delegate implementation to the existing GitHub Actions/Codex workflow; the
  Fargate worker must not push implementation branches.
- Update each repository's trigger validation to trust only the exact
  orchestrator App bot for these transitions. Never enable arbitrary bot
  triggers.

Add narrowly scoped `repair` and `sync` dispatch stages to both repositories:

- `repair` fetches a correlated automated review, runs Codex against the exact
  automation branch in the existing isolated generation/publisher boundary,
  validates the patch, and pushes with the existing publisher App.
- `sync` updates a still-open automation branch after an earlier sprint pull
  request merges, then reruns required checks.

### Pull request review and completion

1. Correlate the draft pull request to its issue, plan fingerprint, automation
   marker, branch, base SHA, and head SHA.
2. Wait for the repository-configured required checks.
3. Review the exact diff with GPT-5.6 Sol at high reasoning effort and validate
   findings against a strict path, line, severity, evidence, and recommendation
   schema.
4. If actionable findings exist, submit a GitHub `REQUEST_CHANGES` review and
   dispatch `repair`.
5. Permit at most two review/fix cycles for a head lineage. After two failed
   cycles, apply `blocked` and require human attention.
6. When the review passes, submit a non-approving automated review summary,
   convert the draft to ready for review, apply `preview-ready` to the issue,
   and wait for human review and merge.
7. On merge, verify the merged SHA, mark the item merged, synchronize stale
   parallel branches, and release newly unblocked work.
8. On close without merge, force-push, plan mutation, check regression, or
   branch mismatch, stop and reconcile rather than continuing silently.

## Delivery sequence

### Phase 1 — Repository and platform foundation

- [x] Create the private implementation repository.
- **Partially complete:** Add architecture decisions, threat model, security
  and contribution policy, operating runbook, and private/proprietary
  distribution notice. The initial architecture, decision, threat, security,
  contribution, and distribution documents exist; the operating runbook
  remains pending.
- **Partially complete:** Build local Docker Compose with PostgreSQL and stubbed GitHub/OpenAI
  adapters. PostgreSQL and the worker container exist; explicit stub adapters
  remain pending.
- Implement Terraform bootstrap, AWS resources, OIDC CI/CD, migrations,
  secrets contract, observability, and Bruno smoke tests. Application
  migrations are implemented; the infrastructure portions remain pending.

### Phase 2 — Dry-run orchestration

- **Partially complete:** Implement webhook validation, durable inbox/outbox, reconciliation,
  LangGraph persistence, dependency analysis, feasibility review, and
  scheduling. Webhook verification and normalization, durable inbox/outbox,
  domain dependency validation, and persistence-level scheduling are merged;
  ingress transport, reconciliation, LangGraph, model feasibility analysis,
  and end-to-end scheduling remain pending.
- Run read-only against both targets and report proposed labels, dispatches,
  reviews, and concurrency decisions without GitHub writes.

### Phase 3 — Client portal pilot

- Add the repository adapter and exact-bot authorization changes through the
  client portal's normal issue and pull request workflow.
- Start with one low-risk sprint containing two or three issues.
- Enable AI plan authorization, implementation dispatch, automated review,
  two-cycle repair, and human merge.
- Demonstrate crash recovery, duplicate delivery handling, pause/drain, kill
  switch, Fargate scale-to-zero, Aurora auto-pause/resume, and reconciliation.

### Phase 4 — Consulting site rollout

- Install the same adapter contract in `ai-consulting-site`.
- Prove cross-repository concurrency and per-repository merge serialization.
- Record evidence and implementation links in this planning repository.

### Phase 5 — Automated merge follow-up

Scaffold a versioned `MergePolicy`, disabled `automatic` mode, separate merge
executor interface, repository allowlist, exact-head policy decision, and kill
switch in the initial implementation.

Enable automated approval and merge only in a separately reviewed release
after:

- Ten successful human-merged orchestrated pull requests, with at least three
  from each target repository.
- No escaped high-severity finding, policy violation, duplicate mutation, or
  unrecovered state corruption.
- Current required checks and non-bypassable branch protection are enforced.
- The private client portal has GitHub features capable of enforcing the
  required protection.
- A separate merge identity has only minimum permissions.
- Squash merge, stale-head rejection, rollback, and emergency disablement have
  been tested.

Automatic mode remains restricted to low-risk work. Sensitive plan categories
retain human approval.

## Test and acceptance plan

- Unit-test state transitions, policies, DAG cycles, external dependencies,
  conflict domains, concurrency limits, retries, leases, and merge ordering.
- Verify HMAC validation, malformed webhook rejection, delivery deduplication,
  FIFO ordering, DLQ behavior, and missed-event reconciliation.
- Verify every GitHub mutation is outbox-backed, idempotent, refetched before
  execution, and rejected for stale fingerprints or SHAs.
- Test prompt injection through issue text, plans, comments, repository files,
  diffs, and CI output.
- Verify model output cannot select credentials, expand repository access,
  weaken policy, or grant merge authority.
- Integration-test LangGraph crash/resume after every graph node with
  PostgreSQL persistence.
- Test Aurora cold-resume retries and ECS zero-to-active-to-zero behavior.
- Test SigV4 authorization, cross-run isolation, invalid credentials,
  idempotency, pause/resume/cancel, and stale projections through Bruno.
- Use synthetic GitHub fixtures in CI; automated tests must not mutate either
  live target repository.

Pilot acceptance requires:

- Correct dependency order and one demonstrated safe parallel pair.
- No duplicate build, pull request, review, or label transition.
- Successful bounded repair and deterministic blocking after two failures.
- Human merge remaining mandatory.
- Traceability from sprint run through issue, plan fingerprint, Actions run,
  pull request, checks, review, and merge.
- Demonstrated worker drain, kill switch, scale-to-zero, database auto-pause,
  restore, and reconciliation.

## Assumptions and explicit boundaries

- The implementation repository is private and contains no credentials or
  account-specific secret values.
- AWS region is `us-east-1`; AWS credentials must be reauthenticated before
  provisioning.
- The target repositories' current build workflows and publisher Apps remain
  in place.
- The client portal is the primary pilot; the consulting site is also an
  initial supported target.
- Human merge is the only enabled v1 merge policy.
- Same-repository parallelism defaults to two and uncertainty serializes work.
- Automated repair is limited to two cycles.
- GPT-5.6 Terra at medium effort is the default for sequencing and feasibility;
  GPT-5.6 Sol at high effort is the default for pull request review.
- Goal decomposition, epic generation, issue filter criteria, a user interface,
  unattended deployment, and multi-client hosting are later workflow versions.
