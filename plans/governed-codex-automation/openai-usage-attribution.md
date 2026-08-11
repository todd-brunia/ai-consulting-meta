# OpenAI Usage Attribution and Project Strategy

## Status

**Approved architecture guidance for the governed delivery pilot.** Implement
this boundary with the live OpenAI provider and target-repository adapters. It
does not authorize credential creation, secret changes, or live API access.

## Decision

Keep all governed-delivery OpenAI projects in one OpenAI organization so the
organization Usage Dashboard remains the central billing view. Create a
separate OpenAI project for each target application or client cost center, and
attribute that application's planning, implementation, repair, and pull-request
analysis to its project.

Do not make `ai-delivery-orchestrator` the default cost bucket merely because
it coordinates the work. Treat it as the control plane. Reserve its OpenAI
project for development and testing of the orchestrator itself and for shared
operational analysis that cannot be attributed fairly to one target.

For the initial repositories, use this allocation:

| Activity | OpenAI project | Execution boundary |
| --- | --- | --- |
| Client-site planning, implementation, and repair | `ai-consulting-client-site` | Target-repository GitHub Actions/Codex workflow |
| Client-site pull-request analysis | `ai-consulting-client-site` | Orchestrator review worker |
| Client-portal planning, implementation, and repair | `ai-consulting-client-portal` | Target-repository GitHub Actions/Codex workflow |
| Client-portal pull-request analysis | `ai-consulting-client-portal` | Orchestrator review worker |
| Orchestrator development, tests, and its own pull-request analysis | `ai-delivery-orchestrator` | Orchestrator repository or development runtime |
| Cross-repository feasibility analysis | Target project when one target owns the work; otherwise `ai-delivery-orchestrator` | Orchestrator analysis worker |

Approval and merge should not normally consume OpenAI tokens. The model
produces structured review evidence. Deterministic policy evaluates current
checks, approvals, authorization, protection, and exact-head state; separated
GitHub Apps then submit the governed review or merge request. A reconciliation
model call is exceptional and must be recorded as such.

## Console reporting boundary

Use OpenAI's native dimensions for authoritative provider-side reporting:

- OpenAI project for application or client cost ownership.
- Project-scoped service account or API key for execution stage and trust
  boundary.
- Model, API capability, batch status, and service tier for provider-supported
  usage analysis.
- Usage Dashboard cost exports for invoice-aligned reporting and activity
  exports for token and request analysis.

The Usage Dashboard can show the entire organization by clearing the project
filter. It does not consolidate separate OpenAI organizations, so do not create
an organization per target solely for cost allocation.

Arbitrary Responses API metadata is useful correlation data, but it is not an
authoritative custom cost dimension in Usage Dashboard aggregation. Do not rely
on metadata alone for chargeback or reconciliation.

## Credential and routing model

Within each target project, provision separate credentials for independent
execution boundaries:

- A planner/builder credential for the target repository's isolated GitHub
  Actions/Codex generation job.
- A reviewer credential for the orchestrator's independent exact-diff analysis.
- Optionally separate planner and builder credentials when direct console
  separation between those stages is worth the added rotation burden.

The orchestrator must resolve the OpenAI project and reviewer secret from the
immutable target-repository adapter configuration. It must not accept a project
or secret selector from issue text, pull-request content, model output, or an
untrusted webhook payload. The selected credential must be project-scoped,
least privilege, independently rotatable, and stored only in the authorized
secret boundary.

Never expose the reviewer credential to the target repository's generation
job, and never expose planner/builder credentials to model output or publishing
steps. A routing mismatch, unknown target, unavailable secret, or observed
project mismatch fails closed before a model request.

## Per-request correlation

Attach bounded metadata to each Responses API request when supported. Use
opaque identifiers rather than issue titles, prompts, source content, client
names not already approved for telemetry, or other sensitive text. The minimum
correlation set is:

- application and environment
- workflow definition and version
- operation (`planning`, `feasibility`, `implementation`, `review`, `repair`,
  `sync`, or exceptional `reconciliation`)
- sprint run ID and work-item ID
- repository adapter ID
- attempt or review-cycle number

Persist a corresponding application-owned usage event containing:

- OpenAI response ID and provider request ID when available
- OpenAI project identifier and internal credential identifier, never the key
- model, snapshot when returned, reasoning effort, and service tier
- input, cached-input, cache-write, reasoning, and output token counts when
  returned
- start time, duration, outcome, retry count, and error category
- sprint run, work item, issue, pull request, exact head, workflow stage, and
  review-cycle correlation
- calculated cost estimate and the pricing-table version used

Do not retain raw model reasoning. Keep OpenAI's cost export authoritative for
billing and use orchestrator telemetry for allocation by sprint, issue, pull
request, stage, repair cycle, and outcome.

## Reconciliation and reporting

Produce two complementary views:

1. OpenAI Usage Dashboard and Costs API: organization, project, API key, model,
   and invoice-aligned spend.
2. Orchestrator telemetry: target repository, sprint, issue, pull request,
   workflow stage, attempt, latency, outcome, and estimated cost.

Reconcile them at least monthly and after the first two, five, and ten pilot
sprints. Compare the same UTC interval and record unexplained variance. Never
silently rewrite historical application usage when pricing changes; retain the
pricing version and calculate any restatement separately.

The core pilot reports are:

- total AI delivery cost per target application
- cost per completed issue and merged pull request
- planning versus implementation versus review/repair cost
- failed, blocked, and retried cost
- model and reasoning-effort mix
- cache effectiveness
- provider totals versus application-attributed totals and variance

## Implementation acceptance

Before enabling live model access, prove that:

1. Planning/build calls and independent review calls for one target appear in
   that target's OpenAI project under distinct credentials.
2. A second target cannot select or use the first target's project credential.
3. Orchestrator-owned development usage does not enter a target cost bucket.
4. Approval and merge proceed from deterministic evidence without an
   unrecorded model call.
5. Every successful and failed call creates a sanitized usage event or an
   explicit telemetry-gap event without blocking safety controls.
6. A UTC-bounded OpenAI activity/cost export can be reconciled to aggregated
   orchestrator telemetry with documented variance.

