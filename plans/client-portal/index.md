# Client Portal Planning Index

## Purpose

This folder records the strategy, architecture, domain design, operating-cost
estimates, and implementation checkpoints for the AI consulting client portal.
The documents include both current direction and preserved decision history.

For the current implementation position, begin with the
[revised plan](./revised-plan.md), then read the latest
[readiness checkpoint](./readiness-checkpoint-2026-07-22.md).

## Current direction

### [Revised plan](./revised-plan.md)

The current strategic and architectural direction for the portal. It narrows
the initial scope to a thin collaboration surface, selects Vercel and Supabase
as separately managed platforms, keeps Stripe and an external signature
provider at their natural boundaries, and defines staged delivery and success
measures.

Use this as the primary planning document when evaluating scope or proposing
new work.

### [Domain model](./domain-model.md)

The conceptual model and invariants for identities, organizations,
memberships, invitations, inquiries, engagements, proposals, agreements,
conversations, notifications, external handoffs, and future AI-agent access.

Use this when designing data structures, authorization rules, workflow states,
or API behavior.

### [Authentication design](./authentication-design.md)

The security design for human identity, invitation-only activation, browser
sessions, recent authentication, notification links, email and SMS behavior,
and machine credentials for future AI agents.

Use this before changing authentication, account activation, session policy,
notifications, or agent authorization.

### [Estimated operating costs](./estimated-operating-costs.md)

The phased cost model for the original AWS-oriented plan, including assumptions,
cost controls, progression gates, and excluded items.

This remains useful as cost decision history, but its platform assumptions
predate the managed Vercel and Supabase direction in the revised plan. Update or
replace it before using it as a current hosted-environment forecast.

## Progress checkpoints

Checkpoints are point-in-time records. Read the newest checkpoint for the
current handoff and consult earlier checkpoints for context.

### [Readiness checkpoint — 2026-07-22](./readiness-checkpoint-2026-07-22.md)

The latest checkpoint. It records completion of deterministic Supabase
fixtures, cross-tenant RLS tests, authenticated engagements API tests, the
isolated CI integration suite, and conditional execution of expensive
Supabase checks.

Its recommended next step is to introduce a shared engagement application
service used by both the server-rendered workspace and JSON:API route.

### [Readiness checkpoint — 2026-07-21](./readiness-checkpoint-2026-07-21.md)

The preceding readiness assessment. It established that local feature
exploration was viable, identified automated database and application
integration coverage as the primary gap, and listed the gates for hosted
staging and public release.

The testing foundation it recommended was completed in the 2026-07-22
checkpoint.

## Decision history

These documents explain how the project reached its current direction. They
should not override the revised plan where the documents differ.

### [Initial plan](./initial-plan.md)

The original broad proposal for an incremental AWS-native client portal,
including infrastructure, product scope, repository automation, testing, and
delivery assumptions.

### [Counterproposal](./counterproposal.md)

The critique of the initial plan. It argues for validating the real workflow
before building a broad platform, reducing bespoke infrastructure, retaining
managed provider boundaries, and introducing useful AI capabilities only after
the collaboration surface is proven.

### [Revised plan](./revised-plan.md)

The resulting synthesis and current strategic decision. It is listed under
current direction because it supersedes the initial plan where they conflict.

## Suggested reading paths

### Continue implementation

1. [Revised plan](./revised-plan.md)
2. [Latest readiness checkpoint](./readiness-checkpoint-2026-07-22.md)
3. [Domain model](./domain-model.md)
4. [Authentication design](./authentication-design.md), when the change
   touches identity or access

### Understand the strategic evolution

1. [Initial plan](./initial-plan.md)
2. [Counterproposal](./counterproposal.md)
3. [Revised plan](./revised-plan.md)

### Evaluate readiness or plan a release

1. [Latest readiness checkpoint](./readiness-checkpoint-2026-07-22.md)
2. [Revised plan](./revised-plan.md)
3. [Authentication design](./authentication-design.md)
4. [Estimated operating costs](./estimated-operating-costs.md), with the
   platform caveat noted above

## Maintenance

Keep this index synchronized whenever a document in this folder is added,
removed, renamed, superseded, or materially changes purpose or status. Add new
dated checkpoints to the progress section and update the recommended starting
point when a newer checkpoint becomes authoritative.
