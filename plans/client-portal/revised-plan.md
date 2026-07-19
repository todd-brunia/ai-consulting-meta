# Client Portal Revised Plan

## Status

**Current working direction — not yet approved for implementation.** This
document supersedes the [initial plan](./initial-plan.md) as planning guidance.
It incorporates the analysis in the [counterproposal](./counterproposal.md),
beginning with the decision to use Stripe instead of building invoicing
capability. It does not replace the historical documents, and implementation
approval still requires resolving the remaining decisions and producing the
revised cost estimate identified below.

## Strategic direction

Build custom software only where it improves the client relationship, creates
a useful consulting asset, or develops transferable agentic-AI capability.
Use established services for commodity business functions when subscribing is
safer and more economical than owning their implementation.

The client portal should therefore begin as a thin collaboration layer rather
than a complete transaction platform. Its primary purpose is to preserve
engagement context, support client review, and provide safe human control over
AI-assisted work. It should not become the financial system of record.

## Decisions

### Use Stripe for invoicing and payments

Stripe will own invoice creation, delivery, hosted payment, payment status,
receipts, and the authoritative financial record for the portal workflow.

The portal may eventually:

- Link an engagement to its Stripe customer and invoice identifiers.
- Display a synchronized summary of invoice state.
- Direct an authorized client to Stripe's hosted invoice experience.
- Consume verified, idempotent Stripe webhooks when automation provides enough
  value to justify the integration.

The portal will not initially implement invoice numbering, PDF generation,
payment collection, receipts, reminders, reconciliation, disputes, taxes, or a
parallel invoice state machine.

This decision trades a fully native invoice experience for faster launch,
lower financial and operational risk, and a mature system of record. Building
commodity invoicing does not provide enough strategic advantage or relevant
AI learning to justify its ownership.

### Use an external provider for electronic signatures

An established external provider will own the signing ceremony, signer
authentication, consent evidence, audit trail, completed agreement, and
authoritative signature status. The provider must be selected before the
portal is used for real client agreements.

The portal may store only the integration data needed for the engagement
workflow, including the provider's agreement or envelope identifier,
synchronized status, relevant timestamps, and a link to the provider-hosted
experience. If synchronization is implemented, verified webhooks, idempotency,
and reconciliation must prevent duplicate or stale transitions.

Portal-native approval or acknowledgment is distinct from an electronic
signature and must never be described as signing. The portal will not recreate
the signing ceremony, legal consent evidence, completed-document record, or
provider audit trail.

This decision delegates a legally consequential commodity function to a
qualified service. It preserves custom development for collaboration and
human-gated AI workflows where the learning is more relevant to the consulting
practice.

### Preserve earlier plans as decision history

The initial plan remains the maximum-control AWS architecture and a record of
the original assumptions. The counterproposal remains the critique and source
of alternatives. This revision records the direction chosen after considering
both; it does not rewrite either document.

### Prioritize learning that transfers to AI consulting

Custom development should concentrate on capabilities such as:

- Durable workflow state and recoverable execution.
- Explicit human review and approval interrupts.
- Safe handling of untrusted client content.
- Least-privilege model and tool access.
- Separation between generated suggestions and authorized external actions.
- Evaluation of quality, time saved, revisions, failures, and cost.
- Observable, idempotent integrations with external systems.

### Use JSON:API for the application API

The API boundary between the frontend and backend will follow the JSON:API
specification. This provides a standards-based convention for resources,
relationships, requests, responses, errors, filtering, pagination, and related
metadata instead of creating a portal-specific protocol.

The API should be designed around stable business resources and behaviors that
can be reused across different clients and use cases. Client-specific rules
belong in domain services, authorization policies, configuration, or explicit
extensions rather than incompatible response shapes.

Following JSON:API does not require splitting the first implementation into
separate deployments or microservices. The frontend and backend may remain in
one application and repository while communicating through a clearly defined,
versioned interface. Framework-specific server actions may support local user
interface behavior, but they should not become a competing public application
protocol for capabilities intended to be reusable.

Initial API work should define and test:

- Consistent JSON:API media types and top-level document structure.
- Resource types, identifiers, attributes, and relationships.
- Standard error documents and application error codes.
- Pagination, filtering, sorting, and sparse fieldsets where a use case needs
  them.
- Tenant-aware authorization independent of response serialization.
- A documented approach to versioning and backward-compatible extensions.
- Contract tests that can be reused by other approved clients of the API.

### Use Vercel and Supabase as separate managed platforms

Deploy the Next.js application to Vercel. The Vercel deployment will contain
the user interface, server-rendered routes, JSON:API route handlers, and
application domain services; it is the application tier, not only a static
frontend.
[Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)

Use a directly owned Supabase project for managed PostgreSQL, authentication,
and object storage. Create and administer the project through Supabase rather
than purchasing or provisioning it as a Vercel Marketplace resource. Connect
it to Vercel with environment variables or an external integration. This keeps
the vendors, billing relationships, and administrative recovery paths
independent even though the services work together.
[Supabase for Vercel](https://vercel.com/marketplace/supabase)

Use Stripe through a separately owned Stripe account. Vercel, Supabase, and
Stripe remain independent vendors, and the design must not assume that an
integration or consolidated dashboard transfers responsibility between them.

This selection intentionally replaces the initial plan's Amplify Hosting,
Cognito, Aurora Serverless and Data API, S3, CDK deployment, and custom local
substitutes. AWS services may be reconsidered individually later under the
evidence gates in Stage 4.

The principal vendor exposure is:

- **Vercel:** application hosting and request execution. Keep the Next.js
  application self-hostable and avoid Vercel-only data or workflow services
  unless separately justified.
- **Supabase PostgreSQL:** relatively portable when migrations and tested
  exports use standard PostgreSQL tooling.
- **Supabase Auth:** less portable because identities, credentials, tokens,
  provider configuration, and active sessions require a coordinated migration.
- **Supabase Storage:** less portable than PostgreSQL because both object data
  and storage metadata or policies must be exported and reconstructed.
- **Stripe:** authoritative financial history remains provider-owned; retain
  stable external identifiers and documented reconciliation procedures rather
  than duplicating its ledger in the portal.
- **Agreement provider:** authoritative signature evidence and completed
  agreements remain provider-owned; preserve identifiers and reconciliation
  procedures without duplicating the signing record.

Reduce that exposure by keeping SQL migrations in source control, placing Auth
and Storage behind provider interfaces, testing database and object exports,
keeping roles and organization membership in the application schema, and
avoiding Supabase Realtime, Edge Functions, and generated application APIs
until a measured need justifies them.

## Selected platform architecture

The initial runtime boundary is:

```text
Browser
  |
  v
Vercel: Next.js UI, JSON:API, and domain services
  |
  +-- Supabase: PostgreSQL, Auth, and Storage
  +-- Stripe: invoices, hosted payments, and financial status
  +-- Agreement provider: agreement workflow, when selected
  +-- Model provider: bounded AI workflow, when approved
```

Implementation should follow these constraints:

- Expose reusable application resources through versioned Next.js JSON:API
  route handlers. Do not make Supabase's generated REST API the frontend's
  application-data contract.
- Permit the Supabase authentication client to perform the protocol-specific
  sign-in and session exchange, but translate the resulting identity into an
  application user, membership, and authorization context on the server.
- Keep Supabase service-role credentials and Stripe secret keys exclusively in
  server-side environment variables. Never expose them to browser bundles.
- Authorize every resource operation in server-side domain or service code.
  Use PostgreSQL row-level security as defense in depth where appropriate, not
  as a substitute for application authorization.
- Issue short-lived, narrowly scoped upload or download access for private
  objects. Store stable object identifiers rather than provider-generated URLs
  in domain records.
- Track schema migrations, seed data, Supabase configuration, and access-policy
  changes in Git and validate them in continuous integration.
- Run Next.js with the Supabase CLI's local PostgreSQL, Auth, Storage, and email
  development services for local work. Use provider test modes or local webhook
  forwarding for Stripe and other external integrations.
  [Supabase local development](https://supabase.com/docs/guides/local-development)
- Select production regions deliberately to minimize application-to-database
  latency and document the region and data-residency choice before accepting
  real client data.
- Maintain a conventional production build and documented self-hosting path for
  the Next.js application. Avoid making portability depend on an emergency
  rewrite.
- Test restoration of PostgreSQL data, Auth configuration or identities, and
  stored objects separately; a database backup alone is not a complete portal
  recovery plan.

## Proposed first implementation

### Stage 1 — Validate the operating process

Use familiar managed tools for one to three fictional, internal, or low-risk
pilot engagements. Use shared documents for collaboration, Stripe for hosted
invoices, and an established signing process where an agreement is needed.

Record:

- Proposal drafting and revision steps.
- Client questions, comments, and change requests.
- Agreement and invoice handoffs.
- Reminders, exceptions, and manual decisions.
- Which information clients expect to find in one place.
- Whether a portal would materially improve their experience.

Deliverable: a service blueprint and a small event vocabulary grounded in
observed work rather than an assumed schema.

### Stage 2 — Build only the useful collaboration surface

If Stage 1 supports a portal, build a branded workspace focused on context and
review. Candidate capabilities are:

- Invitation-only client access and organization boundaries.
- Engagement summaries and activity history.
- Links or immutable references to proposal and agreement versions.
- Comments, change requests, and human approval tasks.
- Links to externally hosted signature and Stripe invoice experiences.
- Provider status summaries only where synchronization improves the workflow.

The initial portal should not duplicate functionality already provided
reliably by Stripe, a signature provider, or a document collaboration tool.

### Stage 3 — Add one bounded AI workflow

Introduce one human-gated workflow after its non-AI process is understood.
Proposal drafting or client-message drafting is the leading candidate.

The workflow should:

- Preserve inputs, drafts, revisions, reviewer feedback, and final decisions.
- Treat client-supplied text and files as untrusted content.
- Record model, tool, latency, token-usage, and failure metadata.
- Require authenticated human approval before publishing, sending, or invoking
  a consequential external action.
- Support retry, interruption, and recovery without duplicating an action.
- Measure quality, edit distance, time saved, failure modes, and workflow cost.

Deliverable: a credible demonstration of practical, observable,
human-controlled agentic automation.

### Stage 4 — Expand only from evidence

Add or replace a component only when a paying-client requirement, measured
workflow benefit, security need, provider limitation, scale constraint, or
explicit learning objective justifies it. AWS services and deeper provider
integrations should be selected independently instead of adopted as one large
architectural commitment.

## Architecture principles

- Prefer a simple Next.js monolith with clear domain and provider boundaries.
- Deploy that monolith to Vercel and use a directly owned Supabase project for
  PostgreSQL, Auth, and Storage.
- Use JSON:API as the consistent contract between frontend and backend, even
  when both are deployed together initially.
- Keep JSON:API serialization at the transport boundary so domain logic remains
  reusable without depending on HTTP document shapes.
- Keep legal and financial systems authoritative for their own records.
- Store only the external identifiers and synchronized state the collaboration
  workflow actually needs.
- Verify webhook signatures, use idempotency keys, and reconcile missed events.
- Enforce organization access in server-side application boundaries, not only
  in the interface.
- Keep generated content separate from approved content and external actions.
- Avoid infrastructure whose operational burden is not supported by current
  usage or a deliberate learning objective.
- Preserve a practical local development and test path for custom behavior.

## Scope deliberately excluded from the first implementation

- Custom invoice generation, invoice PDFs, payment collection, and financial
  reconciliation.
- A portal-owned invoice lifecycle parallel to Stripe.
- Hand-rolled electronic signatures or claims of signature compliance.
- SMS, public registration, and an unauthenticated public API.
- Generic AI workflow infrastructure without a chosen use case.
- Production infrastructure selected primarily for hypothetical scale.
- Automatic publication or sending of AI-generated client material.

## Validation and success measures

Before expanding the portal, collect evidence about:

- The number and shape of real proposal revision loops.
- Client preference for a portal versus email and shared documents.
- Time spent moving context between tools.
- Stripe invoice handoff and reconciliation effort.
- Repetitive drafting work suitable for AI assistance.
- Draft acceptance, edit distance, time saved, failures, and per-workflow cost.
- Security, procurement, or retention needs raised by actual clients.

Success is not measured by how much of the client transaction stack is custom.
It is measured by a reliable client experience, reduced administrative effort,
and defensible learning about safe AI-enabled workflows.

## Cost documentation

The existing [estimated operating costs](./estimated-operating-costs.md) apply
to the historical AWS-centered initial plan. They are not an estimate for this
revision and must not be used to approve or budget the Vercel, Supabase, and
Stripe architecture.

Create `revised-estimated-operating-costs.md` as the single authoritative cost
companion for this plan before implementation is approved. To make its scope
unambiguous, that document should begin with:

- `Applies to: revised-plan.md`
- A planning status and effective or as-of date.
- Currency, billing interval, region, usage, and client-volume assumptions.
- Explicit inclusions and exclusions.
- Links to the vendor pricing sources used for each estimate.

Organize the revised estimate by the same implementation stages as this plan.
For each stage, separate:

- Fixed recurring subscriptions or minimum platform charges.
- Usage-based application, database, storage, bandwidth, build, and email cost.
- Stripe transaction fees and other pass-through financial costs.
- Agreement-provider and model-provider charges.
- One-time setup or migration costs.
- Costs deliberately excluded, especially engineering labor, taxes, disputes,
  compliance work, and client support.

Show low, expected, and high planning scenarios instead of one monthly number,
and state the usage assumptions that cause each scenario. Record actual spend
beside the estimate once the service is operating. Cost figures should live in
the companion document rather than being copied into this plan; this section
defines cost scope and decision rules, while the companion remains the only
source for amounts.

When the revised cost document is created, add a brief historical-status notice
to `estimated-operating-costs.md` pointing to it without rewriting the original
AWS estimates.

## Open decisions

The following choices remain intentionally unresolved while this revision is
developed:

- Whether to build a client-facing portal after Stage 1 or begin with an
  internal workflow tool.
- Which document collaboration process to use during pilots.
- Which external agreement and signature provider to select.
- Whether Stripe integration should initially be links and manual references or
  include webhook synchronization.
- Which AI-assisted workflow should be implemented first.
- What client data may be processed by models and what retention policy applies.
- Which repository automation controls are necessary at inception.
- The production regions, service tiers, usage assumptions, and resulting
  estimates to record in `revised-estimated-operating-costs.md`.

## Next planning pass

Review each open decision against three questions:

1. Does this improve the experience or reliability of serving a client now?
2. Does custom implementation create transferable AI-consulting knowledge or a
   useful demonstration?
3. Is the ownership cost justified by observed needs instead of hypothetical
   future requirements?

Decisions that do not satisfy one of these tests should default to a managed
service, a manual process, or deferral.
