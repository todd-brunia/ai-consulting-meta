# Autonomous Goal-to-Deployment Delivery Pipeline

## Status

**Proposed long-term direction — not approved for implementation.**

This plan evolves the current GitHub- and Codex-based delivery workflow from
issue-level automation toward governed decomposition of a high-level business
goal. GitHub remains the system of record and human approval remains required
at milestone boundaries.

The word *autonomous* describes automation between checkpoints. It does not
mean unbounded authority, unattended production deployment, or removal of
human accountability.

## Current and target workflows

Current:

```text
Idea -> Codex discussion -> GitHub issue -> plan -> human approval
     -> AI build -> pull request -> human review -> merge
```

Target:

```text
Business goal
  -> goal clarification and constraints
  -> epic and dependency proposal
  -> human milestone approval
  -> issue and plan generation
  -> governed build and review loops
  -> pull requests
  -> human review and merge
  -> release/deployment approval
  -> outcome evidence and replanning
```

## Design principles

- GitHub issues, pull requests, reviews, checks, and immutable references form
  the public or repository audit trail.
- A durable orchestrator owns execution state, retries, leases, interrupts,
  and dependencies; labels are projections and human controls, not the entire
  state machine.
- Plans and generated artifacts are proposals until accepted at their required
  checkpoint.
- Agents receive narrow, time-bounded capabilities and cannot expand their own
  authority.
- Generation and validation are separated; no single agent's confidence is
  treated as evidence.
- Every external write is idempotent, attributable, policy-checked, and
  recoverable.
- Orchestration semantics live behind an internal interface so LangGraph or
  another engine can be replaced without rewriting domain policy.

## Architecture

```text
Goal and policy interface
  |
  v
Delivery orchestrator
  +-- decomposition service
  +-- planning service
  +-- issue/epic publisher
  +-- build executor
  +-- validation and review
  +-- checkpoint manager
  +-- evidence and evaluation
  |
  +-- GitHub adapter and system-of-record projection
  +-- repository/workspace adapters
  +-- model and tool adapters
  +-- optional LangGraph runtime
```

### Orchestrator interface

The internal orchestration contract should define:

- Workflow definition and version.
- Run, goal, work-item, attempt, and artifact identities.
- State transition commands and events.
- Dependency and concurrency semantics.
- Human interrupt and resume behavior.
- Capability requests and policy decisions.
- Retry, cancellation, timeout, and compensation behavior.
- Artifact references, evidence, cost, and provenance.

LangGraph is a plausible first runtime for graph execution and human
interrupts, but the stored business state and GitHub projection must not
depend on LangGraph-specific node or checkpoint formats.

## Work hierarchy and decomposition

```text
Goal
  Milestone
    Epic
      Issue
        Plan
          Build attempt
            Pull request
```

A goal records the desired business outcome, scope, repositories, constraints,
success measures, risk class, budget, deadline when real, and authorized human
owners. The decomposition service proposes milestones, epics, dependencies,
acceptance criteria, validation evidence, and explicit exclusions.

Decomposition must:

- Trace every work item to a goal and outcome.
- Identify cross-repository work and ordering.
- Keep issues independently reviewable and small enough for bounded builds.
- Surface ambiguity, architectural decisions, destructive migrations,
  security-sensitive work, and external dependencies.
- Replan through a reviewed change rather than silently rewriting approved
  scope.

## Workflow states

A dedicated state machine should distinguish at least:

```text
draft_goal
  -> awaiting_goal_approval
  -> decomposing
  -> awaiting_milestone_approval
  -> planning
  -> awaiting_plan_approval
  -> ready_to_build
  -> building
  -> validating
  -> awaiting_pr_review
  -> ready_to_merge
  -> merged
  -> awaiting_release_approval
  -> released
  -> measuring
  -> complete
```

Orthogonal terminal or recovery outcomes include `blocked`, `failed`,
`cancelled`, and `superseded`. Each transition has an allowed actor, required
evidence, idempotency key, time, policy version, and GitHub projection.

GitHub labels may expose these states for operators. Webhooks and reconciliation
must tolerate duplicate, delayed, missing, and manually changed labels without
creating contradictory execution.

## Agent responsibilities

Responsibilities are logical roles, not necessarily permanent agents:

- **Goal analyst:** clarifies outcome, constraints, risks, and missing input.
- **Decomposer:** proposes milestones, epics, issues, and dependencies.
- **Planner:** inspects repositories and produces an implementation plan with
  acceptance and validation.
- **Builder:** changes only the approved worktree scope.
- **Validator:** runs deterministic tests and records evidence.
- **Reviewer:** performs an independent diff, security, and requirement review.
- **Publisher:** performs narrowly authorized GitHub writes after policy checks.
- **Orchestrator:** advances durable state; it does not authoritatively approve
  its own generated work.

Begin with one agent taking multiple roles across isolated attempts if that is
simpler. Add specialized or concurrent agents only when evaluation shows a
quality, latency, or context benefit. No fixed agent topology is selected by
this plan.

## Human checkpoints

Required checkpoints initially are:

1. **Goal approval:** confirm business outcome, constraints, risk, and budget.
2. **Milestone/decomposition approval:** accept the epic and dependency shape
   before creating an actionable backlog.
3. **Plan approval:** authorize a bounded issue for code changes.
4. **Pull-request review:** inspect changes and evidence before merge.
5. **Release or deployment approval:** authorize production consequences.
6. **Outcome review:** compare delivered evidence with the original goal and
   decide whether to continue, replan, or stop.

Low-risk plan approvals may later be delegated through explicit policy.
Security boundaries, secrets, permissions, destructive data changes, external
communications, billing, production deployment, and policy changes retain
human approval unless separately reviewed.

## GitHub as system of record

GitHub should contain durable, human-readable projections:

- Goal and epic issues with stable parent and dependency references.
- Child issues with acceptance criteria, scope boundaries, and plan links.
- Approval records attributable to authenticated humans.
- Pull requests linked to the exact issue, plan, run, and commit.
- Required status checks and review decisions.
- A concise execution summary and references to retained evidence.

The orchestrator may use a separate durable store for leases, retries,
checkpoints, high-volume events, and private operational metadata. It must
reconcile that store with GitHub and make discrepancies visible. GitHub labels
alone are not sufficient for concurrency control or exactly-once execution.

## Policy and safety boundaries

- Repository allowlists, branch protections, CODEOWNERS, required checks, and
  environment protections remain authoritative.
- Untrusted issue, repository, dependency, and test output is data, not an
  instruction to expand tools or reveal secrets.
- Each attempt uses an isolated workspace and least-privilege credential.
- Generated workflow changes cannot approve or activate themselves.
- Secret access, network destinations, commands, file scope, token/cost budget,
  and maximum retries are policy-controlled.
- Publishing agents cannot bypass required human review or merge protection.
- Logs retain provenance while redacting secrets and private client content.
- Kill, pause, cancel, and manual recovery paths are tested.

## Delivery phases

### Phase 1 — Formalize the existing issue pipeline

Document explicit states, inputs, outputs, approval records, idempotency,
reconciliation, failure recovery, and evaluation for the current
issue-to-pull-request workflow.

### Phase 2 — Add epic decomposition

Accept a reviewed goal, generate a proposed epic and dependency graph, require
human approval, and publish traceable GitHub issues without starting builds.

### Phase 3 — Orchestrate approved work

Schedule dependency-ready issues through planning, build, validation, review,
and pull-request creation with concurrency limits and human plan/PR gates.

### Phase 4 — Add outcome feedback

Collect delivery and product evidence, compare it with goal measures, and
propose reviewed replanning or termination.

### Phase 5 — Evaluate broader autonomy

Use measured failure rates, review findings, rollback performance, cost, and
human correction data to decide whether any checkpoint can safely become
policy-based. Production deployment remains a separate decision.

## Evaluation and operating measures

- Goal-to-approved-backlog and issue-to-pull-request cycle time.
- Percentage of generated issues materially rewritten or rejected.
- Plan approval, build success, test failure, review finding, and rework rates.
- Traceability coverage from goal through commit and evidence.
- Duplicate or contradictory GitHub actions.
- Human intervention frequency and recovery time.
- Escaped defects, security findings, rollbacks, and policy violations.
- Model, compute, CI, and human-review cost per accepted work item.
- Delivered outcome measures defined by each goal.

## Open decisions

- Durable state store and deployment boundary for the orchestrator.
- Whether LangGraph is the first runtime after a minimal state-machine
  prototype.
- Exact GitHub representation for goals, epics, dependencies, and approvals.
- Initial agent topology and model routing.
- Policy language, identity model, and credential broker.
- Evidence retention and privacy rules across public and private repositories.
- The first synthetic or low-risk pilot goal.

## Explicitly deferred

- Unattended production deployment.
- Autonomous merge or release that bypasses repository protections.
- Self-modifying orchestration policy or self-granted tools.
- A permanent commitment to LangGraph.
- Agent swarms without a measured need.
- Multi-client hosted orchestration before a separate threat model and
  operating design.
