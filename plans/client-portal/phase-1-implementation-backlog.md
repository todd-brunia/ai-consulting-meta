# Client Portal Phase 1 Implementation Backlog

## Status and purpose

This document preserves the issue plan derived from the
[feature roadmap](./feature-roadmap.md) for implementing the Phase 1 inquiry
intake and consultant-approved onboarding workflow. The corresponding issues
were created in the
[client portal repository](https://github.com/todd-brunia/ai-consulting-client-portal)
in their intended delivery order.

The issues remain subject to the client portal repository's normal planning,
approval, implementation, and review workflow. GitHub is authoritative for
their current state; this document records the scope and sequencing decision
that produced them.

## Decisions applied

- Complete the consultant-controlled human workflow before adding AI
  assistance.
- Do not create a portal account, organization, workspace, membership, or
  invitation when an inquiry is submitted.
- Provision a qualified inquiry idempotently only after an explicit consultant
  decision.
- Keep invitation and account activation deliberate and invitation-only.
- Keep the first implementation within the portal repository's local,
  fictional-data boundary. Public-site integration and production release
  readiness are separate work.
- Make inquiry analysis staff-triggered and synchronous for the first local
  implementation.
- Put OpenAI behind a provider-neutral adapter and use a deterministic fake in
  automated tests. Do not make live provider calls in CI.
- Keep AI output advisory. It may prepare a briefing and suggest discovery
  questions, but it must not qualify, reject, provision, or invite a prospect.
- Size each issue around one bounded outcome so it can normally pass the
  repository's issue classifier without further splitting.

## Planned issue sequence

### 1. [#74 — Establish inquiry persistence, lifecycle, and audit foundation](https://github.com/todd-brunia/ai-consulting-client-portal/issues/74)

**Outcome:** Add the domain and persistence foundation for inquiries,
consultant decisions, and append-only lifecycle history.

**Acceptance focus:**

- Define normalized inquiry fields and explicit lifecycle states.
- Record state transitions with actor, timestamp, and reason where applicable.
- Preserve original inquiry content and decision history.
- Enforce legal transitions and tenant-safe access in the data layer.
- Add migration, RLS, fixtures, and automated lifecycle tests.

**Dependencies:** None.

**Scope boundary:** No public endpoint, consultant interface, provisioning,
email, or AI analysis.

### 2. [#75 — Support pre-auth invitee identities and pending memberships](https://github.com/todd-brunia/ai-consulting-client-portal/issues/75)

**Outcome:** Represent an invited person and their pending access before they
authenticate, without weakening invitation-only activation.

**Acceptance focus:**

- Separate a pending invitee from an activated authentication identity.
- Model pending membership and invitation relationships explicitly.
- Define safe invitation redemption and identity-linking invariants.
- Cover duplicate, expired, revoked, and already-redeemed cases.
- Add migration, RLS, fixtures, and automated tests.

**Dependencies:** None.

**Scope boundary:** No inquiry workflow, outbound email, authentication UI, or
production identity-provider integration.

### 3. [#76 — Add authenticated idempotent inquiry intake API](https://github.com/todd-brunia/ai-consulting-client-portal/issues/76)

**Outcome:** Provide the portal-owned intake contract that a public website can
eventually call through a trusted integration boundary.

**Acceptance focus:**

- Accept and validate normalized inquiry data.
- Require authenticated machine access rather than exposing an unrestricted
  public write endpoint.
- Support an idempotency key and return the existing result on safe retries.
- Persist an initial lifecycle event without provisioning portal access.
- Return stable validation and conflict errors with automated API coverage.

**Dependencies:** #74.

**Scope boundary:** No public website change, confirmation email, CAPTCHA,
production rate limiting, or organization creation.

### 4. [#77 — Implement staff inquiry review and decision APIs](https://github.com/todd-brunia/ai-consulting-client-portal/issues/77)

**Outcome:** Give authorized staff a complete application-service and API
boundary for reviewing and deciding inquiries.

**Acceptance focus:**

- List and filter inquiries by lifecycle state.
- Retrieve inquiry details and chronological history.
- Record consultant notes and explicit qualify or decline decisions.
- Reject illegal or stale transitions safely.
- Enforce staff authorization and tenant isolation.
- Test application services, routes, and RLS behavior.

**Dependencies:** #74.

**Scope boundary:** No review UI, provisioning, invitations, email, or AI.

### 5. [#78 — Build the staff inquiry review queue and detail experience](https://github.com/todd-brunia/ai-consulting-client-portal/issues/78)

**Outcome:** Let staff review normalized inquiries, see their history, record
notes, and make explicit decisions from the portal.

**Acceptance focus:**

- Add queue states for loading, empty, populated, filtered, and failed results.
- Add an accessible inquiry detail and lifecycle-history view.
- Provide explicit qualify and decline actions with confirmation and feedback.
- Preserve notes and display validation or stale-state failures clearly.
- Follow the portal's semantic HTML and Tailwind CSS component strategy.
- Add component and end-to-end coverage for the primary staff journey.

**Dependencies:** #77.

**Scope boundary:** No provisioning, invitation controls, public intake form,
email, or AI briefing.

### 6. [#79 — Implement idempotent qualified-inquiry provisioning](https://github.com/todd-brunia/ai-consulting-client-portal/issues/79)

**Outcome:** Convert a qualified inquiry into a prepared organization,
workspace, pending invitee, and pending membership exactly once.

**Acceptance focus:**

- Require an explicit qualified state before provisioning.
- Create the related records atomically and preserve their traceability to the
  source inquiry.
- Return the same result on retries rather than creating duplicates.
- Keep the invitee pending and unauthenticated.
- Record success and failure lifecycle events.
- Test authorization, rollback, retry, and cross-tenant isolation.

**Dependencies:** #74, #75, and #77.

**Scope boundary:** No outbound invitation, account activation, review UI, or
AI.

### 7. [#80 — Connect inquiry onboarding to deliberate invitation and activation](https://github.com/todd-brunia/ai-consulting-client-portal/issues/80)

**Outcome:** Reuse the portal's invitation-only authentication design for
inquiry-derived workspaces while keeping sending and activation explicit.

**Acceptance focus:**

- Allow an authorized consultant to create or send an invitation only after
  successful provisioning.
- Prevent submission, qualification, or provisioning from sending an
  invitation implicitly.
- Reuse invitation expiry, revocation, one-time redemption, and safe identity
  linking.
- Keep repeated sends and redemptions safe and auditable.
- Test invitation and activation behavior with a fake delivery boundary.

**Dependencies:** #79.

**Scope boundary:** No production email provider, notification operations,
public-site change, or workspace redesign.

### 8. [#81 — Add prepared-workspace and invitation controls to inquiry review](https://github.com/todd-brunia/ai-consulting-client-portal/issues/81)

**Outcome:** Complete the consultant-controlled Phase 1 journey in the staff
interface.

**Acceptance focus:**

- Show the organization, workspace, invitee, and membership produced from a
  qualified inquiry.
- Distinguish prepared, invitation-ready, sent, redeemed, expired, revoked,
  failed, and retryable states.
- Require a separate explicit action before sending an invitation.
- Prevent duplicate provisioning and unsafe repeated sends from the interface.
- Preserve an accessible chronological audit trail and clear recovery states.
- Add end-to-end coverage from review through prepared workspace and deliberate
  invitation.

**Dependencies:** #78 and #80.

**Milestone:** Completion of #74 through #81 establishes the core
human-controlled Phase 1 workflow. It does not by itself make the workflow
production-ready or integrate the public website.

### 9. [#82 — Establish the staff-triggered inquiry analysis lifecycle](https://github.com/todd-brunia/ai-consulting-client-portal/issues/82)

**Outcome:** Add a provider-neutral, auditable analysis boundary after the
human workflow is complete.

**Acceptance focus:**

- Let authorized staff explicitly request analysis for an inquiry.
- Model pending, running, succeeded, and failed attempts.
- Define a versioned structured result containing a summary, company context,
  likely challenges, suggested discovery questions, recommended next actions,
  uncertainty, and safety metadata.
- Keep provider request and response details out of client-visible records.
- Make repeated requests and failures safe without affecting inquiry decisions.
- Test with a deterministic fake analyzer.

**Dependencies:** #81.

**Scope boundary:** No live provider, automatic trigger, autonomous decision,
background queue, or client-visible AI output.

### 10. [#83 — Add the OpenAI inquiry-analysis adapter](https://github.com/todd-brunia/ai-consulting-client-portal/issues/83)

**Outcome:** Implement the first live provider adapter without coupling the
domain workflow to OpenAI.

**Acceptance focus:**

- Use the official OpenAI JavaScript SDK and Responses API.
- Request a strict structured output matching the versioned analysis schema.
- Keep the model configurable, with `gpt-5.6` as the initial documented
  default.
- Set `store: false`, avoid tools, and minimize submitted inquiry data.
- Map provider failures, refusals, and invalid output into stable domain
  failures.
- Keep secrets server-only and exclude live calls from CI.

**Dependencies:** #82.

**Scope boundary:** No prompt-management product, agent framework, web search,
autonomous actions, or additional provider.

### 11. [#84 — Present AI inquiry briefings and consultant feedback](https://github.com/todd-brunia/ai-consulting-client-portal/issues/84)

**Outcome:** Present advisory analysis to staff in the inquiry review
experience without displacing the source inquiry or consultant judgment.

**Acceptance focus:**

- Add an explicit analysis action and states for never run, running, succeeded,
  failed, and retrying.
- Present the structured briefing with clear AI labeling and uncertainty.
- Keep original inquiry content and lifecycle history visible.
- Let staff record useful, not useful, or corrected feedback.
- Ensure analysis cannot trigger qualification, rejection, provisioning, or
  invitation.
- Test the complete interface with the deterministic fake analyzer.

**Dependencies:** #82. It can proceed in parallel with #83.

**Milestone:** The OpenAI-backed advisory experience is complete only when both
#83 and #84 are complete.

## Dependency and parallel-work map

```text
Wave 1
  #74 Inquiry foundation ───────────────┐
  #75 Pre-auth invitees ────────────────┤  parallel
                                        │
Wave 2                                  │
  #76 Intake API (after #74) ───────────┤
  #77 Review APIs (after #74) ──────────┤  parallel
                                        │
Wave 3                                  │
  #78 Review UI (after #77) ────────────┤
  #79 Provisioning (after #74/#75/#77) ─┤  parallel
                                        │
Wave 4                                  │
  #80 Invitation connection (after #79) │  may overlap #78
                                        │
Wave 5                                  │
  #81 Onboarding controls (after #78/#80)
                                        │
Wave 6                                  │
  #82 Analysis lifecycle (after #81) ───┤
                                        │
Wave 7                                  │
  #83 OpenAI adapter (after #82) ───────┤
  #84 AI briefing UI (after #82) ───────┘  parallel
```

The dependency graph permits two independent foundation issues first, parallel
API work after the inquiry model exists, and parallel UI and provisioning work
once their respective contracts are available. AI work begins only after the
core onboarding milestone.

## Cross-cutting interfaces and validation

- Lifecycle and authorization rules belong in shared application services so
  server-rendered pages and JSON APIs cannot diverge.
- State-changing operations should be idempotent where retries are plausible.
- Database migrations, RLS policies, deterministic fixtures, application
  integration tests, and end-to-end tests should evolve with the relevant
  issue.
- UI work should use semantic HTML and Tailwind CSS 4. A narrowly scoped
  headless accessibility primitive is preferable to importing a broad visual
  component framework when a custom complex control would otherwise be risky.
- Inquiry and AI-analysis data must remain private to authorized staff unless
  a later, separately approved design introduces a client-visible artifact.
- Provider-specific code stays behind an adapter so domain services and tests
  remain deterministic and replaceable.

## Deferred and external work

This backlog intentionally does not include:

- replacing the public website's current email-based inquiry handoff with the
  authenticated intake integration;
- production email delivery, domain verification, abuse prevention, rate
  limiting, retention policy, or hosted-environment operations;
- a production release decision or public launch;
- platform-wide tenant branding, billing, licensing, dedicated deployments, or
  self-hosting;
- autonomous qualification, autonomous outreach, or autonomous provisioning;
- a background workflow engine or generalized agent topology.

Those concerns require their own evidence, planning, and approval. The
[multi-tenant platform architecture](./multi-tenant-platform-architecture.md)
remains the reference for later productization decisions.

## Related decision

[Client portal issue #73](https://github.com/todd-brunia/ai-consulting-client-portal/issues/73)
records the UI implementation strategy: prefer accessible custom components
built with semantic HTML and Tailwind CSS, add focused headless primitives when
needed, and avoid adopting a broad component framework by default. It informs
the portal issues above but is not a dependency that blocks this backlog.
