# AI Delivery Measurement and Estimation Framework

## Status

**Working direction — begin with a bounded client-portal automation pilot.**

The first proposed implementation is
[`ai-consulting-client-portal` issue #90](https://github.com/todd-brunia/ai-consulting-client-portal/issues/90).
It records token consumption for issue-attributed Codex automation without
introducing centralized infrastructure or dollar calculations. This document
defines the larger direction; it does not authorize implementation in any
repository.

## Goal

Build an evidence base that can answer four related questions:

1. How much AI consumption did a delivery activity use?
2. What did that activity cost in AI compute and human effort?
3. What will a proposed issue, feature, epic, or product likely require?
4. How accurate and well calibrated were previous estimates?

The framework should support planning and implementation across the client
portal, consulting site, AI delivery orchestrator, and later repositories
without coupling historical facts to one workflow engine or model provider.

## Measurement principles

- Record model activity as append-only, versioned events. Corrections are new
  events that reference the superseded observation.
- Keep measurements separate from aggregates. Issue, feature, epic, and
  product totals are derived views.
- Preserve provider-reported token classes rather than collapsing them into a
  number that cannot later be priced correctly.
- Treat cost as a derived value joined to a dated pricing snapshot. A pricing
  change never rewrites a historical usage event.
- Record failed and retried attempts because they consume resources and are
  part of delivery economics.
- Measure human review and correction separately from AI runtime. Low token
  use is not evidence of low total delivery cost or good quality.
- Store provenance and outcome evidence, not raw model reasoning.
- Minimize collection at the source. Sensitive content should not enter the
  measurement system merely to be filtered later.

## Event model

Every event has an immutable identity, schema version, occurrence time, source,
repository/work-item references, event type, outcome, and provenance. Optional
fields remain absent or explicitly unavailable; unknown values are not
reported as zero.

### Event types

| Event type | Purpose |
| --- | --- |
| `model_invocation` | Provider-reported model usage for one attributable attempt or turn. |
| `delivery_estimate` | A prediction range, confidence, assumptions, and estimator version. |
| `delivery_evaluation` | A comparison of a prior estimate with completed actuals. |
| `pricing_snapshot` | Dated provider/model rates and the source used for cost derivation. |
| `human_effort` | Deliberately recorded planning, review, correction, or operational effort. |
| `event_correction` | A replacement or qualification that preserves the original event. |

### Model invocation fields

The initial `ai-usage/v1` contract contains:

| Group | Fields |
| --- | --- |
| Identity | `schema_version`, `event_id`, `occurred_at` |
| Source | `source`, `provider`, `workflow`, `workflow_version` |
| Work | `repository`, `issue_number`, optional pull-request and hierarchy references |
| Scenario | `stage`, `prompt_category`, `attempt`, `outcome`, `measurement_status` |
| Model | `model`, optional `model_version`, `reasoning_effort`, optional service tier |
| Usage | `input_tokens`, `cached_input_tokens`, `output_tokens`, `reasoning_output_tokens` |
| Timing | `started_at`, `completed_at`, `duration_ms` |
| Provenance | Run URL or private artifact reference, collector version, and correlation IDs |

Cached input is a classified portion of input, and reasoning output may be a
classified portion of output. Consumers must follow the provider contract and
must not blindly add every field together. An unavailable measurement uses
nullable counts plus an explicit reason rather than synthetic zero usage.

The portal pilot uses one event per workflow attempt because that is the
smallest unit with deterministic issue, stage, model, and run attribution. A
future orchestrator may emit finer-grained invocation events and derive an
attempt view.

### Work hierarchy

Events reference stable work identities rather than embedding rollups:

```text
Product
  Epic
    Feature or story
      Issue
        Plan
          Delivery attempt
            Model invocation
```

Not every repository uses every level. Missing hierarchy levels remain absent;
they are not inferred from issue titles. Relationships may be added later as
versioned mapping records without changing the invocation event.

## Rollups and economics

Derived views should answer questions such as:

- Tokens and AI cost by issue, workflow stage, model, repository, or outcome.
- Planning-to-implementation ratio and retry or rework cost.
- AI runtime, calendar cycle time, and human review effort per delivered issue.
- Cost and variance by feature type, language, issue label, risk category, or
  acceptance-criteria shape.
- Model quality and cost for comparable work.
- Feature, epic, and product forecasts with uncertainty ranges.

Dollar calculations join invocation events to the pricing snapshot effective
for the provider, model, service tier, and usage class. Store both the derived
amount and the pricing-snapshot reference in analytical output. Distinguish:

- Provider-list-price estimates.
- Actual invoiced or credited cost when an authorized billing source supports
  appropriate attribution.
- ChatGPT subscription or credit consumption, which may not map to API list
  price.
- Cloud, GitHub, observability, and other non-model operating costs.
- Human labor, which requires an explicit rate or value assumption and must not
  be silently inferred from AI duration.

## Initial portal pilot

The client portal is the first measurement surface because its label-triggered
workflow already assigns each valid model run to an issue and one of three
stages: planning, revision, or implementation. It also selects an explicit
model and reasoning effort before execution.

The pilot should:

- Collect provider-reported token classes from Codex telemetry on the GitHub
  runner.
- Filter to a strict allowlist before writing any artifact.
- Keep the model-running job read-only with respect to GitHub publication.
- Pass only the sanitized event to trusted default-branch publisher code.
- Add an idempotent issue comment containing a readable summary and compact
  JSON event.
- Represent telemetry failure explicitly without blocking the underlying
  delivery result.
- Avoid dollar calculations until event completeness and token semantics are
  verified through representative work.

The pilot deliberately excludes local interactive sessions, the consulting
site, centralized storage, dashboards, estimation agents, and orchestrator
integration. A hard-cancelled GitHub Actions run may not execute its finalizer;
later reconciliation should discover this from workflow-run state.

## Target architecture

After the pilot proves that measurements are complete, safe, and useful, move
from issue comments as a pilot record to an access-controlled ingestion path:

```text
Repository automation, local agents, and delivery orchestrator
  -> authenticated event ingestion
  -> schema validation, deduplication, and policy checks
  -> append-only object storage
  -> derived analytical datasets
  -> queries, forecasts, and evaluation reports
```

The preferred AWS direction is:

- A narrowly authenticated ingestion endpoint with repository and actor
  allowlists, replay protection, size limits, and idempotent event IDs.
- S3 for append-only source events, with versioning and an evaluated Object
  Lock policy when operational requirements justify it.
- Separate generated Parquet datasets for efficient analysis; compaction never
  replaces the source event.
- Glue Data Catalog and Athena for serverless queries before introducing an
  operational analytics database.
- Lifecycle and retention policies by data class, with deletion or legal-hold
  behavior designed before real client evidence is accepted.

This infrastructure belongs in separately approved orchestrator or operations
issues. The public meta repository contains only the generalized design.

## Estimation and evaluation

### Estimator

When an issue becomes eligible for development, an estimator should produce a
`delivery_estimate` event with:

- Low, expected, and high token usage.
- Low, expected, and high derived AI cost using a referenced pricing snapshot.
- AI elapsed-runtime and human-review-effort ranges.
- Confidence, complexity classification, material assumptions, and estimator
  version.
- Observable inputs such as acceptance-criteria count, likely files or
  components, dependencies, labels, repository, language, risk class, and
  comparable historical cohorts.

The estimator proposes planning evidence; it does not approve scope, budgets,
or implementation.

### Evaluator

After completion, an evaluator emits a separate `delivery_evaluation` event
that references the estimate and actual rollup. It records:

- Absolute and percentage error for tokens, cost, elapsed time, and human
  effort where both values exist.
- Whether each actual value fell inside its prediction range.
- Retry, failed-attempt, rework, and human-correction observations.
- Confidence calibration and comparable-cohort identifiers.
- Data-quality limitations that prevent a valid comparison.

Begin with transparent heuristics and cohort summaries. Consider a learned
predictor only after the event definitions are stable, missingness is
understood, representative completed work exists, and backtesting demonstrates
an improvement over the heuristic baseline.

## Delivery sequence and gates

### Phase 1 — Portal automation pilot

Implement issue-attributed token events in the client portal. Review a small
set of naturally occurring planning and implementation runs for completeness,
privacy, duplicate handling, and operational noise.

**Gate:** proceed only if events can be captured without weakening the existing
credential and publishing boundary.

### Phase 2 — Portable repository measurement

Extract the proven event contract and publisher behavior into a versioned,
reusable component. Open a consulting-site adoption issue rather than copying
unreviewed workflow code.

**Gate:** the portal pilot must demonstrate stable fields and useful issue
history across successful, failed, and retried attempts.

### Phase 3 — Local interactive measurement

Add an opt-in local collector and an explicit command or workflow that binds a
Codex conversation to a repository, issue, scenario, and operator-selected
privacy policy. Account-wide token totals are supporting evidence, not exact
issue attribution.

**Gate:** correlation must be deliberate and inspectable; repository identity
must not be guessed solely from aggregate workspace analytics.

### Phase 4 — Orchestrator events and centralized storage

Extend the delivery orchestrator's existing model-provider provenance and
usage contract into canonical invocation events when its real model adapter is
separately authorized. Add secured ingestion, append-only storage, retention,
and reconciliation for missing or cancelled attempts.

**Gate:** complete the threat model, data classification, access model, cost
budget, and recovery design before accepting private repository or client
events.

### Phase 5 — Cost, estimation, and evaluation

Add pricing snapshots, derived cost views, heuristic estimates, post-delivery
evaluations, and confidence reporting. Aggregate issue predictions into
feature, epic, and product ranges without presenting the sums as more certain
than their inputs.

**Gate:** publish forecast quality and data limitations alongside every
decision-support view.

## Privacy, security, and governance

- Do not collect prompts, raw model responses, hidden reasoning, private source
  code, command output, tool-result content, webhook bodies, or credentials.
- Keep real usage and human-effort events in the source private repository or a
  separately access-controlled store. Never publish them in this repository or
  its Pages artifact.
- Avoid client, prospect, employee, and account identifiers. Use opaque tenant
  references only after an approved private data model exists.
- Separate model execution credentials from event-publication credentials.
- Validate all generated or locally supplied event data with trusted code
  before accepting or publishing it.
- Make external writes attributable, idempotent, least-privileged, and
  recoverable.
- Version schemas, collectors, workflow policies, pricing inputs, and
  estimators so analytical changes remain explainable.
- Treat estimates as decision support. Humans remain responsible for scope,
  budgets, approval, merge, release, and client commitments.

## Success measures

The framework is useful when it can show, with explicit data-quality caveats:

- The portion of AI delivery activity that is attributable to a repository,
  issue, stage, and model.
- Missing-event, duplicate-event, and failed-attempt rates.
- Token and derived cost distributions rather than only averages.
- Planning, implementation, review, retry, and human-correction contributions
  to completed work.
- Forecast error, prediction-range coverage, and confidence calibration.
- Whether a more expensive model or workflow produces enough quality or human
  effort reduction to justify its cost.

The objective is not to minimize tokens in isolation. It is to improve the
quality, predictability, and total economics of useful delivery outcomes.
