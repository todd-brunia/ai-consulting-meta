# Client Portal Readiness Checkpoint — 2026-07-22

## Status

**Working checkpoint — point-in-time assessment, not a production-readiness
claim.** This document records the client portal work completed on 2026-07-22
and the recommended place to resume on 2026-07-23. It follows the
[2026-07-21 readiness checkpoint](./readiness-checkpoint-2026-07-21.md) and
supplements the [revised plan](./revised-plan.md).

The portal remains suitable for local development and architecture
exploration. This checkpoint does not approve hosted deployment, real client
data, or public release.

## Accomplishments

The testing-foundation outcome identified in the previous checkpoint was
decomposed into bounded issues, implemented locally, verified, reviewed through
draft pull requests, and merged.

### Governed issue decomposition

- Closed parent issue
  [#6](https://github.com/todd-brunia/ai-consulting-client-portal/issues/6)
  after splitting it into independently buildable issues.
- Used the repository's planning and `approved-for-build` workflow for each
  implementation.
- Preserved human approval and merge decisions throughout the work.

### Deterministic Supabase test foundation

- Merged
  [PR #11](https://github.com/todd-brunia/ai-consulting-client-portal/pull/11)
  for issue
  [#7](https://github.com/todd-brunia/ai-consulting-client-portal/issues/7).
- Added repeatable Supabase integration-test lifecycle commands and fixtures.
- Created deterministic users, organizations, memberships, and engagement data
  for two isolated tenants.
- Established a reusable local foundation for database and application
  integration tests.

### PostgreSQL tenant-isolation coverage

- Merged
  [PR #12](https://github.com/todd-brunia/ai-consulting-client-portal/pull/12)
  for issue
  [#8](https://github.com/todd-brunia/ai-consulting-client-portal/issues/8).
- Added authenticated row-level-security tests that prove allowed same-tenant
  access and denied cross-tenant access.
- Verified tenant isolation through PostgreSQL rather than relying only on
  application behavior.

### Authenticated JSON:API coverage

- Merged
  [PR #13](https://github.com/todd-brunia/ai-consulting-client-portal/pull/13)
  for issue
  [#9](https://github.com/todd-brunia/ai-consulting-client-portal/issues/9).
- Added integration coverage for the authenticated engagements JSON:API
  endpoint.
- Covered authentication, tenant-scoped success behavior, and API error
  behavior using deterministic fixtures.

### Supabase integration checks in CI

- Merged
  [PR #14](https://github.com/todd-brunia/ai-consulting-client-portal/pull/14)
  for issue
  [#10](https://github.com/todd-brunia/ai-consulting-client-portal/issues/10).
- Added an isolated Supabase lifecycle to continuous integration.
- CI now starts Supabase, rebuilds the database from tracked migrations, lints
  the schema, provisions fixtures, runs RLS and API integration tests, and
  cleans up the stack.
- Added a combined local integration command and corrected API test-server
  process cleanup found during CI validation.

### Conditional Supabase CI execution

- Documented the required policy decision on issue
  [#15](https://github.com/todd-brunia/ai-consulting-client-portal/issues/15):
  retain one unconditional aggregate CI gate while conditionally running the
  expensive Supabase job.
- Merged
  [PR #16](https://github.com/todd-brunia/ai-consulting-client-portal/pull/16)
  implementing that decision.
- Fast validation and a read-only relevant-path detector now run on every pull
  request.
- Supabase integration checks run when database, authentication, API,
  integration-test, dependency, configuration, workflow, or path-filter files
  change.
- The aggregate CI gate accepts only a successful Supabase run for relevant
  changes or an intentional skip for unrelated changes.
- Added unit coverage for relevant, unrelated, multi-file, rename, and empty
  change sets, plus documentation for maintaining the path list.

## Validation completed

The merged work was exercised locally with:

- ESLint.
- TypeScript checks.
- Unit tests.
- Production builds.
- Supabase schema linting.
- Deterministic fixture provisioning.
- Authenticated PostgreSQL tenant-isolation tests.
- Authenticated engagements API integration tests.

The final workflow pull request also passed its GitHub Actions fast validation
and relevant-path detection. Because it changed the workflow and filter
configuration, the detector correctly treated it as Supabase-relevant and ran
the full integration job.

## Current assessment

| Area | Assessment |
| --- | --- |
| Deterministic local integration fixtures | Established |
| Cross-tenant PostgreSQL RLS coverage | Established for current engagement paths |
| Authenticated engagements API coverage | Established for the current endpoint |
| Isolated Supabase checks in CI | Established |
| CI runtime control | Established through relevant-path detection |
| Shared application-service boundary | Not yet implemented |
| Invitation-only onboarding | Not yet designed |
| Hosted staging | Not yet ready |
| Real client data | Not ready |
| Public MVP release | Not ready |

The primary testing-foundation gap from the 2026-07-21 checkpoint is closed for
the current schema and engagements endpoint. Coverage must continue to grow
with new data paths and client workflows.

## Recommended next step

Resume with the next architecture item from the prior checkpoint:

> Introduce a shared engagement application service used by both the
> server-rendered workspace and the engagements JSON:API handler, with
> consistent authorization and error behavior while keeping JSON:API
> serialization at the transport boundary.

Create one planning issue for this outcome before implementation. During
planning, identify the duplicated query and authorization behavior in the
current page and route handler, define the service's inputs and typed outcomes,
and specify how existing integration tests will prove there is no tenant-access
regression.

The intended boundary remains:

```text
Server-rendered page ─┐
                      ├→ Engagement application service → Supabase
JSON:API handler ─────┘
```

The Server Component should call the shared service directly rather than make
an HTTP request to its own API. JSON:API document construction should remain in
the route layer.

## Resume here on 2026-07-23

1. Confirm the default branch is green after the merged CI workflow changes.
2. Create a bounded engineering issue for the shared engagement application
   service.
3. Let the planning workflow inspect the existing page, API route, Supabase
   clients, authorization assumptions, and integration tests.
4. Review the proposed service contract and error model before applying
   `approved-for-build`.
5. Implement only after human approval, then require the existing fast and
   Supabase integration checks before merge.

After the shared service is stable, the next likely foundation item is
environment validation and a single documented local verification entry point.
Invitation-only onboarding and broader client-facing features should remain
behind those architecture improvements.
