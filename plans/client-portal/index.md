# Client Portal Planning Index

## Purpose

This folder records the strategy, architecture, domain design, operating-cost
estimates, and implementation checkpoints for the AI consulting client portal.
The documents include both current direction and preserved decision history.

For strategic direction, begin with the
[revised plan](./revised-plan.md). For current capability sequencing, read the
[feature roadmap](./feature-roadmap.md), then consult the latest
[readiness checkpoint](./readiness-checkpoint-2026-07-22.md) for point-in-time
evidence.

## Current direction

### [Revised plan](./revised-plan.md)

The current strategic and architectural direction for the portal. It narrows
the initial scope to a thin collaboration surface, selects Vercel and Supabase
as separately managed platforms, keeps Stripe and an external signature
provider at their natural boundaries, and defines staged delivery and success
measures.

Use this as the primary planning document when evaluating scope or proposing
new work.

### [Feature roadmap](./feature-roadmap.md)

The current feature sequence. It distinguishes implemented local foundations
from recommended collaboration, document-review, commercial-handoff, and
human-gated AI phases, with supporting production-readiness tracks and evidence
gates.

Use this when choosing the next bounded feature. Individual roadmap items still
require their own planning and approval.

### [Inquiry intake and client onboarding workflow](./inquiry-onboarding-workflow.md)

The proposed lifecycle from unauthenticated website inquiry through consultant
review, organization and workspace provisioning, deliberate invitation, and
client activation. It makes manual qualification and invitation explicit and
defines AI as a private advisory briefing rather than an autonomous decision
maker.

Use this before implementing public inquiry handoff, consultant review,
prospect communication, provisioning, or invitation automation.

### [Multi-tenant consulting platform architecture](./multi-tenant-platform-architecture.md)

The proposed path from the single consulting practice to a configurable,
tenant-aware platform. It distinguishes operating tenants from their client
organizations, defines configuration and extension boundaries, and sequences
shared SaaS before evidence-driven dedicated or self-hosted options.

Use this when a change affects tenant identity, branding, provider
configuration, workflow customization, product packaging, or deployment
strategy.

## Visual exploration

### [Wireframe gallery](./wireframes/index.md)

The low-fidelity visual source of truth for implemented foundations and every
recommended roadmap phase. The interactive gallery filters by role, phase, and
state and simulates desktop or mobile framing without application behavior.

### [Storyboard presentation](./storyboard/index.md)

The guided client-and-staff journey through the feature sequence. The HTML
presentation reuses the shared wireframes, names each roadmap phase, and
explains its dependency or evidence gate.

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
2. [Feature roadmap](./feature-roadmap.md)
3. [Inquiry onboarding workflow](./inquiry-onboarding-workflow.md), when the
   change touches prospect intake or onboarding
4. [Multi-tenant platform architecture](./multi-tenant-platform-architecture.md),
   when the change affects tenant or product boundaries
5. [Storyboard presentation](./storyboard/index.md)
6. [Wireframe gallery](./wireframes/index.md)
7. [Latest readiness checkpoint](./readiness-checkpoint-2026-07-22.md)
8. [Domain model](./domain-model.md)
9. [Authentication design](./authentication-design.md), when the change
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
