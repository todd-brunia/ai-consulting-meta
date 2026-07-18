# Incremental Client Portal

## Summary

Create a new private `todd-brunia/client-portal` repository containing a cost-sensitive client review hub that runs fully through Docker Compose locally and deploys to AWS.

The first release will support client workspaces, uploaded proposal/agreement versions, comments and change requests, approvals, bilateral agreement signing evidence, structured invoice records with PDFs, and email notifications. Payments, SMS, document authoring, production AI drafting, and DocuSign integration remain later increments.

## Architecture and Infrastructure

- Build a Next.js 15/React/TypeScript monolith with server components, server actions, and protected route handlers. Pin the latest Amplify-supported Next.js 15 patch because Amplify currently supports Next.js only through version 15. [AWS Amplify Next.js support](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html)
- Keep one application package with domain, service, repository, and provider boundaries; avoid a separate API or microservices in v1.
- Host Next.js SSR on Amplify Hosting. Attach a least-privilege Amplify SSR compute role for AWS access without static credentials. [Amplify SSR compute roles](https://docs.aws.amazon.com/amplify/latest/userguide/amplify-SSR-compute-role.html)
- Define backend infrastructure in an `infra/` TypeScript AWS CDK app:
  - Cognito user pool and managed login
  - Aurora PostgreSQL Serverless v2, `0–2` ACUs, ten-minute auto-pause
  - RDS Data API and Secrets Manager
  - Private, versioned S3 document bucket
  - SES identity and sending permissions
  - IAM roles, CloudWatch logging, alarms, and AWS Budget alerts
- Access production PostgreSQL through the HTTPS RDS Data API, avoiding a VPC-attached web runtime, NAT Gateway, persistent connections, and connection pool. Aurora can pause at zero capacity; implement retries and a “portal is waking up” response for the expected 15–30 second cold resume. [RDS Data API](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/data-api.html), [Aurora auto-pause](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2-auto-pause.html)
- Use Drizzle schemas and migrations with a production Data API driver and local PostgreSQL driver. Maintain one migration history and restrict queries to SQL supported consistently by both drivers.
- Provide `docker compose up --build` for the complete local system: Next.js app, PostgreSQL, MinIO, and Mailpit, with persistent named volumes, migrations, seed data, and seeded admin/client accounts.
- Use an environment-gated local authentication adapter with signed sessions. CDK synthesis and deployment must fail if local-auth mode is enabled outside development.
- Deploy one AWS production environment in `us-east-1`; use local development instead of a second cloud environment initially. Disable automatic production deployment and provide a human-triggered release workflow using GitHub OIDC: deploy CDK, run migrations, deploy Amplify, then smoke-test.
- Avoid ECS/Fargate, ALB, NAT Gateway, WAF, read replicas, and always-on workers initially. Add Fargate later for sustained or long-running LangGraph workloads without moving the web application or database.

## Product, Data, and Interfaces

- Model `Organization`, `User`, `Membership`, `Engagement`, `Document`, `DocumentVersion`, `DocumentParticipant`, `Comment`, `ReviewDecision`, `Signature`, `Invoice`, `NotificationAttempt`, and append-only `AuditEvent`.
- Treat roles as application authorization:
  - `ADMIN`: Todd, with access to all organizations.
  - `CLIENT`: access only through explicit organization membership.
  - Enforce organization scope in the service/repository layer for every operation, not only in UI routing.
- Use Cognito as the production OAuth 2.0/OIDC identity provider. Keep application roles and memberships in PostgreSQL. Future Okta adoption becomes Cognito OIDC/SAML federation or a replacement identity adapter rather than a data-model migration. [Cognito federation](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-identity-federation.html)
- Provide invitation-based onboarding; public registration is disabled. Admin creates the organization and client membership, then Cognito and SES deliver the invitation.
- Support PDF uploads up to 20 MB through short-lived, single-object presigned URLs. Generate unique immutable keys, require SHA-256 checksums, verify object metadata before publishing, and never expose bucket-wide permissions. [S3 presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)
- Document workflow:
  - Admin uploads a draft version and designates the required client reviewer/signer.
  - Publishing changes the document to `IN_REVIEW` and sends email.
  - Clients can comment or submit `CHANGES_REQUESTED`.
  - Revisions always create a new immutable version; prior comments and decisions remain historical.
  - Proposals become `APPROVED` after the designated client approves the current version.
  - Agreements become `SIGNED` only after the designated client and admin sign the same current version, in either order.
  - Publishing a replacement version invalidates outstanding approval/signature requests but never alters historical evidence.
- Hand-rolled signing captures authenticated identity, typed legal name, explicit consent text/version, UTC timestamp, document-version ID, SHA-256 document hash, IP address, user agent, and immutable audit events. Evidence is admin-only and encrypted at rest. UI language must describe this as captured electronic consent and must not claim DocuSign-equivalent legal or regulatory compliance.
- Put signing behind a `SignatureProvider` interface so a later DocuSign/Adobe Sign provider can replace the internal implementation while preserving document participants and status history.
- Invoice workflow stores invoice number, currency, amount, issue date, due date, manually managed `DRAFT | SENT | PAID | VOID | OVERDUE` status, and an uploaded PDF. Do not generate invoices or collect payments in v1.
- Send transactional SES email for invitations, published documents, change requests, approvals/signatures, and invoices. Emails contain links rather than document contents. Persist delivery attempts and expose admin retry; notification failure must not roll back the business action.
- Verify the sender domain and obtain SES production access before inviting real clients; new SES accounts otherwise can send only to verified recipients. [SES production access](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
- Define provider interfaces for `AuthProvider`, `DocumentStore`, `Mailer`, and future `WorkflowRunner`. Add SMS, payment, external signature, and LangGraph implementations behind these boundaries rather than changing portal domain behavior.
- Do not create generic AI workflow tables in v1. The first drafting increment will add durable workflow runs/human tasks and an SQS-triggered Lambda or Fargate LangGraph worker using the existing review/approval concepts.

## Repository Automation and Delivery

- Adapt the existing `ai-consulting-site` human-gated Codex workflow:
  - `needs-planning → plan-ready → approved-for-build → approved-for-ai-build → in-progress → preview-ready`
  - AI may plan and open a validated draft PR but may not approve scope, deploy, merge, or push to `main`.
  - Keep OpenAI generation and GitHub publishing credentials in separate jobs.
  - Preserve trusted-actor validation, replay protection, concurrency control, failure markers, and `blocked` recovery.
- Add repository instructions, product brief, architecture decisions, security guidance, issue/PR templates, and branch protection requiring the validation workflow.
- Validate pull requests with linting, formatting checks, type checking, unit/integration tests, production build, CDK synthesis, migration validation, dependency audit, and secret scanning.
- Keep production releases manually dispatched after merge. Use short-lived GitHub-to-AWS OIDC credentials and require an explicit production environment approval.
- Add cost controls: Aurora maximum 2 ACUs, 14-day log retention, incomplete-upload cleanup, seven-day database backup retention, and AWS Budget notifications at approximately `$20` warning and `$40` critical. Revisit limits when client activity or observed latency justifies always-warm capacity.
- Document the later growth path:
  1. AI-assisted proposal/message drafting with LangGraph and human review.
  2. Stripe or accounting-system invoice/payment adapter.
  3. SMS consent/preferences and delivery adapter.
  4. External e-signature provider.
  5. Fargate workflow workers, SQS, stronger observability, WAF, and additional database capacity/readers.

## Test and Acceptance Plan

- Unit-test role and tenant isolation, document transitions, version invalidation, bilateral signing, invoice transitions, hashes, consent evidence, and notification retry behavior.
- Integration-test migrations and repositories against local PostgreSQL, uploads/downloads against MinIO, and rendered emails against Mailpit.
- E2E-test:
  - Admin creates an organization and invites a client.
  - Client cannot access another organization or admin routes.
  - Proposal review cycles through comment, change request, replacement version, and approval.
  - Agreement requires matching client/admin signatures on the current version.
  - A replacement version cannot inherit a prior signature.
  - Invoice PDF and status are visible only to the correct organization.
  - Failed email remains retryable without losing the document action.
  - Expired or cross-tenant document URLs are rejected.
- Test both warm and cold Aurora behavior, including transient Data API retries and a clear user-facing timeout path.
- Port the existing Codex workflow-state tests and add replay, unauthorized-trigger, missing-approval, empty-patch, and draft-PR idempotency scenarios.
- Acceptance requires one-command local startup with persistent data, passing CI/CDK synthesis, successful production sign-in, complete admin/client review flow, verified audit evidence, SES delivery to a real invited address, budget alarms, and a documented backup/restore check.

## Assumptions and Defaults

- The new repository is private initially because it will contain security-sensitive infrastructure and eventually process client documents.
- The Amplify-generated domain is acceptable for the first deployment; a custom portal domain can be attached once selected.
- V1 has one designated client reviewer/signer per document and one admin countersigner; arbitrary signer routing is deferred.
- No online payment, SMS, rich-text authoring, malware-scanning pipeline, public API, production AI inference, or claim of regulated e-signature compliance is included.
- Documents and audit evidence have no automated deletion policy in v1; removal requires an explicit administrative process. A formal retention/privacy policy must be chosen before regulated or high-sensitivity client material is accepted.
- Cold-start latency is accepted in exchange for the lowest idle AWS cost. If real-client usage makes it disruptive, raise Aurora’s minimum capacity without changing application architecture.
