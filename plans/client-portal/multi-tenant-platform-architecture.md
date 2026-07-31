# Multi-Tenant Consulting Platform Architecture

## Status

**Proposed product and architecture direction — not approved for
implementation.**

This plan describes how the client portal can begin as Todd's consulting
workspace while preserving a credible path to a configurable product for
consultants, consulting firms, and similar service businesses.

It extends the [revised plan](./revised-plan.md) and
[domain model](./domain-model.md). It does not authorize a SaaS launch,
dedicated deployment, self-hosted distribution, billing system, or migration
of current implementation foundations.

## Product direction

Build a tenant-aware platform first, expressed initially through one consulting
template:

```text
Platform capabilities
  -> consulting workflow template
  -> tenant configuration and branding
  -> optional, governed extensions
```

The first customer remains the consulting practice. Productization should
improve boundaries and configurability needed by the real workflow, not create
speculative framework work ahead of evidence.

## Tenant model

The current `Organization` remains the boundary for a consulting client and
its engagements. Productization adds a distinct `Tenant` representing the
consulting business operating the platform.

```text
Platform
  Tenant (consulting practice or firm)
    Tenant staff and roles
    Client organizations
      Client memberships
      Engagements
        inquiries, messages, documents, decisions, and handoffs
```

This distinction avoids conflating the company buying or operating the portal
with each of that company's clients.

Core invariants:

- Every tenant-owned record has an unambiguous tenant boundary.
- A client organization belongs to exactly one tenant in the initial model.
- Staff authority is tenant-scoped; platform operations authority is separate.
- A human identity may hold memberships in multiple tenants or organizations,
  but each request selects and authorizes one context.
- Tenant context comes from authenticated server-side resolution, never a
  trusted browser-supplied identifier alone.
- Database constraints, application authorization, and row-level security
  enforce isolation; interface filtering does not.
- Cross-tenant reporting, support access, migration, and impersonation are
  denied unless separately designed and audited.

## Configuration model

Prefer validated, versioned configuration over tenant-specific forks.
Configuration categories may include:

- Brand name, logo, color tokens, typography, sender identity, and custom
  domain.
- Locale, timezone, terminology, and legal or privacy links.
- Enabled capabilities and consulting workflow template version.
- Inquiry fields, review states, notification templates, and service windows.
- Role definitions within supported policy boundaries.
- Provider connections for email, storage, payments, signing, scheduling, and
  models.
- AI workflow enablement, prompt/template references, evaluation policy,
  budgets, and required human approvals.

Configuration changes require validation, actor and time attribution, version
history, preview where client-facing output changes, and safe rollback.
Secrets are references to a deployment-appropriate secret store, not values in
configuration records.

Not every behavior should be configurable. Security invariants, audit
requirements, idempotency, generated-versus-approved separation, and minimum
human checkpoints remain platform rules.

## Extension points

Use stable domain and provider boundaries rather than tenant conditionals
spread through application code:

- Versioned JSON:API resources and domain events.
- Provider interfaces for identity, email, storage, payments, signatures,
  scheduling, and model execution.
- Versioned workflow definitions with an explicit supported state vocabulary.
- Theme tokens and content templates rather than copied pages.
- Capability grants for human and machine principals.
- Validated outbound webhooks and asynchronous job handlers.

Extensions run with least privilege, receive only the tenant and engagement
data they need, and produce auditable intents rather than bypassing domain
authorization. Arbitrary tenant-supplied code, prompts with unrestricted tool
access, and direct database plugins are excluded.

## Deployment strategy

### Stage 1 — Shared SaaS

Begin with one managed application and data platform using logical tenant
isolation. This is the default direction because it enables one release train,
central operations, consistent security fixes, and recurring service delivery.

Before onboarding a second operating tenant, prove:

- Automated cross-tenant authorization and RLS coverage.
- Tenant-scoped jobs, storage, caches, search, logs, analytics, and exports.
- Per-tenant configuration, branding, provider credentials, quotas, and audit.
- Backup, restoration, deletion, incident response, and support boundaries.
- No tenant data in globally shared model context or evaluation datasets.

### Stage 2 — Dedicated managed deployment

Offer an isolated application and data environment only when procurement,
data residency, contractual isolation, performance, or provider requirements
justify the operational cost. Keep it on the same versioned product and
configuration model rather than creating a bespoke fork.

Define upgrade windows, support responsibility, observability, backup,
credential ownership, and exit procedures before offering this option.

### Stage 3 — Self-hosted distribution

Consider self-hosting after the deployment contract, upgrade mechanism,
security patch process, licensing, documentation, and support economics are
proven. Self-hosting is not the initial preference and should not constrain
early delivery beyond maintaining practical portability.

Whether dedicated environments are licensed software, managed hosting, or a
hybrid remains a commercial decision.

## Control plane and data plane

The shared SaaS may initially remain one deployable monolith, but code should
preserve two conceptual responsibilities:

- **Control plane:** tenant lifecycle, plans and entitlements, configuration
  versions, domains, provider connections, deployment assignments, and
  platform operations.
- **Tenant data plane:** inquiries, organizations, engagements, messages,
  documents, approvals, notifications, and tenant-scoped AI workflows.

A future physical separation is justified only by security, scale, deployment,
or operating evidence. Platform operators must not receive routine access to
tenant content merely because control-plane access exists.

## Branding and white-label boundaries

Initial branding supports tenant identity without falsely implying separate
software:

- Tenant logo, display name, theme tokens, email identity, and approved domain.
- Accessible contrast and responsive behavior enforced by the platform.
- Required security, privacy, legal, and platform notices preserved.
- Preview and automated visual or accessibility checks before publication.

Deep page-layout customization, arbitrary CSS or scripts, per-tenant source
forks, and removal of mandatory notices are deferred.

## AI and workflow configuration

AI behavior is configured as a governed workflow, not a free-form tenant bot.
Each enabled workflow specifies:

- Supported purpose and allowed data classes.
- Prompt/template and tool-policy versions.
- Model/provider selection policy and budget limits.
- Tenant, organization, or engagement scope.
- Structured outputs and validation.
- Required human review and permitted consequential actions.
- Provenance, evaluation, retention, and failure behavior.

Tenants may select among supported workflows and templates. They cannot grant
an agent permission beyond platform and tenant policy or eliminate mandatory
human approval for publication, invitations, access changes, approvals,
payments, or other consequential actions.

## Productization sequence

1. **Strengthen the single-practice product:** keep all existing organization
   boundaries and introduce no tenant-specific hardcoding.
2. **Add the explicit tenant model:** tenant-scoped staff roles,
   configuration, branding, provider connections, and isolation tests.
3. **Onboard one controlled second tenant:** validate setup, operations,
   support, export, deletion, cost allocation, and upgrade behavior.
4. **Standardize the consulting template:** version workflow and terminology
   configuration using evidence from both tenants.
5. **Evaluate commercialization:** pricing, licensing, support, legal,
   security, availability, and deployment options require separate approval.

## Architecture decision gates

Productization advances only when evidence answers:

- Which behaviors are genuinely shared across consulting practices?
- Which differences belong in configuration versus a supported extension?
- Can tenant isolation be demonstrated across every synchronous and
  asynchronous path?
- Can a tenant be provisioned, upgraded, exported, suspended, and deleted
  without manual database surgery?
- Does a second tenant justify the operational and commercial responsibilities?
- Do dedicated or self-hosted deployments have customers willing to fund their
  extra lifecycle cost?

## Explicitly deferred

- Automatic conversion of the current portal into a public SaaS offering.
- Tenant self-service signup and billing.
- Marketplace extensions or arbitrary tenant code.
- Per-tenant source forks and bespoke schemas.
- Cross-tenant benchmarking using identifiable or private content.
- A final licensing or dedicated-hosting commercial model.
- Physical microservice or control-plane separation without evidence.
