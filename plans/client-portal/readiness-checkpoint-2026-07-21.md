# Client Portal Readiness Checkpoint — 2026-07-21

## Status

**Working checkpoint — point-in-time assessment, not a production-readiness
claim.** This document records where the client portal exploration stopped on
2026-07-21 and the recommended place to resume. It supplements the
[revised plan](./revised-plan.md); it does not approve hosted deployment, real
client data, or public release.

## Current verdict

The repository is ready for low-risk feature exploration against a local
Next.js and Supabase stack. It is not yet ready for production client data,
hosted Vercel and Supabase environments, or public MVP release.

| Area | Assessment |
| --- | --- |
| Local feature development | Ready, with testing-foundation work first |
| Governed AI-assisted changes | Operational with human planning and merge gates |
| Hosted staging | Not yet ready |
| Real client data | Not ready |
| Public MVP release | Not ready |

## Evidence reviewed

At this checkpoint:

- The local application stack supports Next.js, Supabase Auth, PostgreSQL,
  Storage, organization membership, engagement records, and row-level
  security.
- Database migrations are tracked, applied locally, and pass Supabase schema
  linting.
- Linting, TypeScript checks, unit tests, and the production build pass.
- The dependency audit reports no known vulnerabilities at the time of review.
- A Git-history credential scan reports no detected leaks in the existing
  history.
- The label-driven Codex workflow completed a full planning, approval,
  implementation, draft-pull-request, CI, and human-merge cycle.
- The repository documents its thin collaboration-layer direction and managed
  provider boundaries.

These results establish a useful architecture demonstration. They do not yet
establish that tenant isolation and client workflows will remain correct as the
schema and application grow.

## Primary readiness gap

The most important missing foundation is automated application and database
integration coverage. Most existing tests exercise the governed Codex workflow;
application coverage is limited.

Before accumulating client-facing features, automated tests should prove:

- Authenticated and unauthenticated behavior.
- Same-organization access and cross-organization denial.
- PostgreSQL row-level-security policies.
- Organization membership and workspace provisioning.
- JSON:API authentication, success, and error documents.
- Migration replay from an empty local database.
- At least one complete browser journey when the first durable client workflow
  is selected.

Continuous integration should start an isolated Supabase stack, apply
migrations, lint the database, create at least two tenants, and fail if either
tenant can observe the other's records.

## Architecture work before feature expansion

The server-rendered workspace and JSON:API handler currently reach Supabase
through separate query paths. They should share an application service rather
than duplicate authorization, query, and error-handling behavior.

The intended shape is:

```text
Server-rendered page ─┐
                      ├→ Engagement application service → Supabase
JSON:API handler ─────┘
```

The Server Component does not need to make an HTTP request to its own API. The
shared service should provide the reusable application boundary, while JSON:API
serialization remains at the transport boundary.

Near-term supporting improvements include:

- Validate required environment variables at application startup.
- Add consistent empty, failure, and authorization states.
- Add repeatable database fixtures for local and CI use.
- Provide one local verification command that checks the application and
  database stack together.
- Keep local and CI Node versions aligned.

## Gates before hosted staging

Before connecting live Vercel and Supabase projects:

- Replace local open signup assumptions with an invitation and membership
  process.
- Decide who creates organizations and who may invite or remove members.
- Configure email confirmation, password policy, redirects, rate limits, and
  abuse controls for the hosted environment.
- Select compatible application and database regions.
- Separate development, staging, and production data and credentials.
- Define migration promotion, rollback, and reconciliation procedures.
- Test PostgreSQL, Auth, and Storage recovery independently.
- Add structured server-side logging without recording sensitive content.
- Document permitted client data, retention, and model-processing boundaries.
- Produce the revised operating-cost estimate required by the revised plan.

Hosted staging should begin without real client data and should preserve the
ability to run the same workflows locally.

## Gates before public MVP release

Treat public visibility as its own governed milestone. Before release:

- Enforce pull requests and required validation on the default branch.
- Prohibit force pushes and automated bypass of human merge decisions.
- Add dependency and GitHub Actions update automation.
- Pin third-party Actions appropriately.
- Add a security policy and private vulnerability-reporting path.
- Decide and document the repository's license and copyright terms.
- Re-run a complete history and artifact review for credentials and private
  operational information.
- Review issue templates, prompts, workflow logs, repository metadata, and
  documentation for public suitability.
- Document the MVP acceptance criteria, threat model, recovery expectations,
  and known limitations.

No demo identity, client record, private resource identifier, or operational
credential should become part of the public history.

## Recommended feature sequence

Use one bounded, human-approved issue for each outcome:

1. Add Supabase integration and cross-tenant RLS tests to CI.
2. Introduce a shared engagement application service and consistent errors.
3. Add environment validation and a one-command local verification path.
4. Design invitation-only onboarding and organization membership management.
5. Add engagement detail and activity history.
6. Add comments and change requests.
7. Add explicit human approval tasks.
8. Add private file references with narrowly scoped access.
9. Establish hosted staging on independently owned Vercel and Supabase
   projects.
10. Complete public-release hardening and an MVP readiness review.

Stripe synchronization, agreement-provider integration, and AI-assisted client
workflows should remain deferred until the collaboration surface and tenant
tests are stable.

## Resume here

Create and plan the next client-portal engineering issue with this outcome:

> Add local Supabase integration tests that rebuild the database, create two
> organizations and users, prove same-tenant access, prove cross-tenant denial,
> exercise the authenticated engagements JSON:API endpoint, and run the
> database checks in continuous integration.

Review that issue's plan specifically for test isolation, deterministic
fixtures, CI runtime cost, and whether the tests exercise both application
authorization and PostgreSQL row-level security. Do not begin broader feature
work until this foundation is merged and reliably green.
