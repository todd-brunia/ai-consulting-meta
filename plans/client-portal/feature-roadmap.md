# Client Portal Feature Roadmap

## Status and purpose

**Current sequencing guidance — individual features still require separate
planning and approval.**

This roadmap translates the [revised plan](./revised-plan.md), the
[domain model](./domain-model.md), and completed implementation checkpoints
into an ordered feature direction. It distinguishes implemented local
foundations from future product work and does not itself authorize
implementation, hosted deployment, production credentials, or real client
data.

The roadmap favors complete, testable vertical slices over parallel
implementation. Each feature should preserve tenant isolation, use the
versioned JSON:API boundary for reusable application behavior, and add
applicable browser regression coverage.

## Roadmap principles

- Build the client collaboration loop before adding broad integrations.
- Validate the non-AI workflow before automating it with AI.
- Keep Stripe and an external signature provider authoritative for payments
  and legal signing.
- Treat generated content as a private draft until an authenticated human
  deliberately publishes or sends it.
- Add hosted infrastructure and production controls only through separately
  approved readiness work.
- Measure useful client and staff outcomes rather than feature volume.

## Implemented local foundations

The following capabilities are implemented for local development and
controlled testing with fictional fixtures. They are foundations for the
roadmap, not a claim of production readiness.

### Application and data foundation

- Next.js application with TypeScript, Tailwind CSS, and a production build.
- Local Supabase PostgreSQL, Auth, Storage, and email-development services.
- Tracked schema migrations and deterministic integration fixtures.
- Application users, organizations, memberships, engagements, and
  tenant-scoped row-level security.
- Shared engagement application service used by the server-rendered workspace
  and the versioned JSON:API engagements route.

### Human authentication and authorization

- Local email-and-password sign-in and sign-out through Supabase Auth.
- Server-side translation from provider identity to application identity,
  organization membership, and authorization context.
- Authenticated workspace access with tenant-scoped engagement visibility.
- Safe relative return destinations for invitation and staff routes, with
  external and protocol-relative redirects rejected.
- Generic forbidden outcomes for users without staff authority.

This is only the implemented authentication slice. Production account
activation, password and session policy, recovery, recent authentication,
phone verification, contact changes, terms acceptance, and communication
consent remain future work described in the
[authentication design](./authentication-design.md).

### Invitation-only onboarding

- Invitation persistence with opaque tokens stored only as hashes.
- Expiry, revocation, replacement, consumption, and idempotent acceptance
  behavior.
- Client authentication and acceptance that activates only the intended
  pending organization membership.
- Staff-only JSON:API routes to issue, inspect, replace, and revoke
  invitations.
- Accessible, responsive staff invitation-management workspace.
- Non-disclosing outcomes for invalid, inactive, unknown, or mismatched
  invitations.

Production invitation delivery, public registration, phone verification,
terms acceptance, and hosted provider configuration are not implemented.

### Machine access and application API

- Versioned JSON:API engagement resources with consistent media types and error
  handling.
- Named machine principals with hashed API credentials, capabilities, and
  organization or engagement grants.
- Read-only, tenant-scoped machine engagement access with sanitized audit
  metadata.
- Maintained Bruno collection covering authenticated, unauthenticated,
  capability-denied, grant-free, and granted-only outcomes.

Machine draft creation, hosted credential administration, rotation interfaces,
production rate limits, and operational alerting remain future work.

### Automated quality and regression coverage

- ESLint, TypeScript, unit, React interface, production-build, PostgreSQL RLS,
  and JSON:API integration checks.
- Deterministic disposable Supabase lifecycle for integration and browser
  tests.
- Playwright coverage for authentication, workspace access, tenant visibility,
  client invitation acceptance, and staff invitation management.
- Chromium regression execution for every pull request and push to `main`.
- Stable `CI Gate` aggregation and secret-safe, failure-only Playwright
  diagnostics.

## Recommended feature sequence

### Phase 1 — Engagement conversation and activity timeline

Build the first complete client collaboration loop around an existing
engagement.

Initial scope:

- Persist client-visible engagement messages with author and occurrence time.
- List and create messages through tenant-authorized JSON:API routes.
- Render a deterministic, oldest-to-newest timeline in the authenticated
  engagement workspace.
- Allow authorized staff and active organization members to contribute.
- Keep staff-only notes outside client queries and serialization.
- Add RLS, application-service, API, interface, and Playwright coverage.

Defer unread counts, notifications, attachments, staff notes, message editing,
reactions, and AI drafting until the basic conversation is proven.

Why first: this directly advances the portal's purpose of preserving
commercial context, exercises all existing identity and tenant foundations,
and creates the activity projection needed by later document and approval
features.

### Phase 2 — Immutable proposal versions and client review

Add the first structured review workflow after ordinary engagement
conversation works.

Initial scope:

- Private staff proposal drafts and deliberate publication.
- Immutable, numbered published proposal versions with hashes and attribution.
- One current version while retaining superseded history.
- A designated client approver.
- Version-specific approval or change-request decisions.
- Timeline events and messages that reference the exact proposal version.
- Recent-authentication enforcement before approval if that prerequisite has
  been implemented.

Publishing a replacement must close outstanding review requests without
transferring approval from the previous version.

### Phase 3 — Agreement review and external signing handoff

Reuse the proven document-review behavior for agreements while keeping legal
signing outside the portal.

Initial scope:

- Immutable agreement versions and version-specific client review.
- Portal-native business approval described explicitly as approval, not
  electronic signature.
- Stable reference and link to a selected external signature provider.
- Provider status recorded only when it improves the workflow.

Provider selection, webhook synchronization, reconciliation, and production
legal controls require separate decisions before implementation.

### Phase 4 — Commercial completion and delivery handoff

Represent the remaining commercial milestones without creating duplicate
financial or delivery systems.

Initial scope:

- Manual Stripe invoice identifier and hosted-payment link.
- Deposit status as a synchronized observation rather than a portal ledger.
- Engagement transition from negotiation to awaiting deposit and delivery.
- Recorded Slack delivery handoff with actor, time, and optional destination
  reference.
- Timeline events for deposit confirmation and delivery handoff.

Stripe webhooks should remain deferred until manual operation demonstrates
that synchronization will save enough effort to justify signature validation,
idempotency, and reconciliation.

### Phase 5 — One bounded, human-gated AI drafting workflow

Add AI only after the corresponding human workflow produces enough evidence to
evaluate it. Proposal drafting is the leading candidate; client-message
drafting is the alternative if message repetition proves more valuable.

Required behavior:

- Preserve inputs, drafts, revisions, reviewer feedback, and final decisions.
- Treat all client content and attachments as untrusted.
- Record model, tool, latency, token usage, failures, and workflow cost.
- Keep every generated result private until a staff user selects and
  publishes it.
- Support retries and recovery without duplicate publication or external
  action.
- Measure edit distance, acceptance, time saved, and failure modes.

Agents must not publish documents, send client-visible messages, approve
content, change membership, record payment state, or expand their own grants.

## Supporting tracks

These tracks support feature delivery but should not silently expand a feature
slice.

### Inquiry qualification and organization provisioning

Before using the portal for a real prospect flow, connect an inquiry to a
staff-only prequalification engagement, qualification decision, organization,
and invitation. Public submission can remain owned by the consulting site, but
the handoff must be authenticated, idempotent, and preserve the original
inquiry history.

### Read state and notifications

After the timeline is useful, add per-member read position and unread counts.
Only then introduce notification intents, email fallback, optional SMS
consent, quiet hours, suppression, coalescing, provider delivery attempts, and
replay-safe webhooks.

### Production authentication and onboarding

Before real client use, implement and verify the remaining authentication
design: production invitation delivery, account recovery, password policy,
session limits, recent authentication, verified contact changes, phone
verification, terms and privacy acceptance, and optional communication
consent.

### Hosted readiness and operations

Hosted staging and production require separately approved Vercel and Supabase
configuration, region selection, secrets management, backups and restoration,
monitoring, alerting, retention, abuse controls, rate limits, provider
runbooks, and a current operating-cost estimate.

## Evidence gates

Advance from one product phase to the next only when the current phase answers
the relevant questions:

- Do clients and staff use the collaboration surface instead of reverting to
  email or disconnected documents?
- Does the timeline preserve enough context to reduce administrative effort?
- What proposal and agreement revision patterns occur in practice?
- Which handoffs need synchronization rather than a reliable manual link?
- Which drafting activity is repetitive enough for bounded AI assistance?
- Can authorization, recovery, and audit behavior be demonstrated through
  automated tests and operating evidence?

If evidence does not support custom implementation, prefer a managed service,
manual operation, or explicit deferral.

## Explicitly deferred

- Portal-owned invoices, payment collection, receipts, taxes, or financial
  reconciliation.
- Portal-native electronic signatures or legal signing claims.
- Autonomous publication, client communication, approval, or external action.
- Generic AI workflow infrastructure without a selected use case.
- Production infrastructure justified only by hypothetical scale.
- Real client data before production security and operational readiness are
  independently reviewed.

## Maintenance

Update this roadmap when a feature phase is approved, materially resequenced,
implemented, or deliberately deferred. Record detailed completion evidence in
a dated implementation checkpoint rather than turning this roadmap into a
release log.
