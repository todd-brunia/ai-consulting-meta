# Client Repository Provisioning Plan

## Status

**Working direction — not approved for implementation.** This plan defines a
repeatable way for clients operating their own `ai-delivery-orchestrator` fork
to create compatible repositories. It does not authorize repository creation,
GitHub configuration changes, App installation, credential entry, or client
onboarding.

## Outcome

Provide a client-owned Node.js and TypeScript template plus an idempotent
provisioner from the client's orchestrator fork. The template supplies reviewed
repository files; the provisioner configures and verifies GitHub state that a
template does not carry reliably.

Do not fork the client portal for each new application or copy its monolithic
automation workflow. New repositories should be independent projects that
implement a small, versioned adapter contract while orchestration policy and
compatibility validation remain centralized in the client's orchestrator.

Node.js and TypeScript are the only initial application profile. Add another
profile only after its workflows, required checks, validation behavior, and
support boundary have independent acceptance evidence.

## Repository creation flow

1. Create an independent repository from the client's `node-v1` GitHub
   template.
2. From an authenticated checkout of the client's orchestrator fork, preview
   provisioning:

   ```text
   npm run repo:provision -- \
     --repository client-org/new-service \
     --profile node-v1
   ```

3. Review the resolved target, proposed GitHub mutations, missing controls,
   GitHub-plan limitations, and orchestrator registration change. Require
   explicit confirmation before applying anything.
4. Reconcile repository settings, install or select the client-owned GitHub
   App for the repository, register the adapter with the orchestrator, and run
   compatibility checks.
5. Create a fictional synthetic issue and exercise the flow through a draft
   pull request and required checks. Stop for human review; do not merge,
   release, deploy, or retain the fixture unless separately authorized.
6. Record a sanitized readiness report and remove any temporary fixture through
   an explicit, reviewable cleanup step.

Provide this mode for non-mutating compatibility and drift checks:

```text
npm run repo:provision -- \
  --repository owner/name \
  --profile node-v1 \
  --check
```

Both modes must use the same resolver and validators so check results predict
apply behavior.

## Node v1 template

The client-owned template should contain only reusable, fictional, and
credential-free material:

- Generic product, engineering, and DevOps issue forms. Independently
  actionable issues begin with `needs-planning`.
- The canonical workflow labels: `needs-planning`, `plan-ready`,
  `changes-requested`, `approved-for-build`, `approved-for-ai-build`,
  `in-progress`, `preview-ready`, `blocked`, `needs-decision`,
  `split-proposed`, `approved-for-split`, and `split-parent`.
- Thin planning, implementation, repair, and synchronization workflows. They
  validate trusted repository state and dispatch bounded work; they do not
  duplicate the orchestrator's scheduling, risk, retry, or review policy.
- `.github/ai-delivery-orchestrator.yml`, using the strict v1 repository
  adapter: repository identity, default branch, enable switch, exact
  orchestrator App slug, workflow filenames, label mapping, required checks,
  maximum parallel implementations, and human-only risk policy.
- Baseline Node validation, a pull-request template, contribution and recovery
  guidance, CODEOWNERS, and the canonical marked-plan format.

Keep application scaffolding separate from the governance pack inside the
template source. This allows a future supported Node profile to change its
framework or build commands without changing the label-state or authority
contract.

All actions and reusable external dependencies must be pinned to immutable
commits. Template examples must not contain consultancy or client account IDs,
repository names, App IDs, private URLs, credentials, production identifiers,
or real issue content.

## Provisioning contract

### Preview, apply, and repeatability

The provisioner must resolve one explicit `owner/name` target, fetch canonical
GitHub state, and produce a deterministic plan before mutation. Applying the
same profile twice must converge without duplicating labels, environments,
rules, App selection, or orchestrator registration.

Partial failure must return a sanitized per-step result and a safe retry path.
Do not roll back by deleting pre-existing client settings. Report conflicting
controls for human resolution, and fail closed when a conflict could weaken an
approval, branch, credential, or repository boundary.

### Reconciled GitHub state

For the selected repository, reconcile and verify:

- Required workflow labels, descriptions, colors, and documented state
  transitions. Topic labels may vary and must remain separate from workflow
  labels.
- Default Actions token permissions, allowed actions policy, workflow
  variables, protected environments, and the absence of client or
  orchestrator secrets in the application repository.
- Required CI checks, pull-request-before-merge policy, human review, blocked
  force pushes and deletions, and no automation bypass of human merge in v1.
- Client-owned GitHub App repository selection, minimum permissions, subscribed
  events, webhook reachability, and exact App slug in the adapter.
- The adapter repository identity, default branch, workflow files, labels,
  required checks, risk settings, and kill switch.
- An allowlisted, versioned registration in the client-owned orchestrator. A
  repository file alone must not grant the orchestrator authority.

For GitHub Team or Enterprise, prefer an organization ruleset targeted by a
custom property such as `ai_delivery_profile=node-v1`. Organization owners
control that ruleset, and repository administrators may only add stricter
repository rules. For GitHub Free, apply supported repository-level protection
and report every unavailable private-repository control. A missing mandatory
control blocks readiness rather than producing a warning-only success.

### Credentials and authority

The application repository must not receive AWS credentials, Terraform state
access, the OpenAI API key, the GitHub App private key, or orchestrator runtime
secrets. Keep those in the client's orchestrator deployment and mint
short-lived, repository-scoped installation tokens only inside trusted
publisher operations.

The provisioner requires an explicit client-owned operator identity with only
the organization and repository administration permissions needed for the
selected changes. It must not assume consultancy access, request a broad
organization installation when a selected-repository installation is enough,
or silently expand an existing App installation.

## Compatibility and drift

Treat the template release, `node-v1` profile, repository adapter version,
label-state contract, workflow inputs, required-check names, and App permission
contract as versioned interfaces. Unknown versions and fields fail closed.

The non-mutating check must report:

- Missing or renamed workflow labels and invalid state-label combinations.
- Missing, unpinned, or unexpected workflow files.
- Adapter identity, App slug, default branch, check, risk, or enable-state
  drift.
- Missing App installation or permissions, unreachable webhook configuration,
  and a repository absent from the orchestrator allowlist.
- Missing required checks or branch/ruleset controls, including controls the
  client's GitHub plan cannot enforce.
- Template/profile version drift and the supported reviewable upgrade path.

Do not overwrite intentional application code or client policy during drift
repair. Deliver template and profile upgrades as reviewable pull requests;
apply settings migrations through a new provisioning preview and explicit
operator confirmation.

## Test and acceptance plan

- Unit-test profile parsing, adapter validation, desired-state calculation,
  plan rendering, redaction, and idempotent reconciliation.
- Test clean provisioning, a no-op repeat, non-mutating check mode, detected
  drift, approved repair, partial failure, safe retry, insufficient permission,
  App absence, and conflicting pre-existing controls.
- Reject unsupported GitHub controls, unknown adapter or profile versions,
  duplicate or missing labels, absent workflows or required checks, mutable
  action references, broader-than-declared App access, and weakened approval
  gates.
- Use mocked GitHub mutations for automated destructive-path tests. Automated
  tests must not create repositories, Apps, issues, branches, or pull requests
  in a real client organization.
- Prove the complete path in an authorized synthetic organization: create from
  the template, provision, request a plan, authorize an ordinary synthetic
  implementation, open a draft pull request, observe required checks, and stop
  for human review without merge or deployment.
- Require a second authorized operator to follow only published documentation
  and reach the same passing readiness result without repository-author or
  consultancy intervention.

## Readiness criteria

A repository is ready only when:

- The provisioner check reports no critical drift or unenforced mandatory
  control.
- The adapter and orchestrator allowlist agree on the exact repository,
  workflow, label, check, risk, App, and enable-state contract.
- The client owns and can revoke every credential and permission involved.
- The synthetic flow reaches a checked draft pull request and waits for human
  review without duplicate mutation or leaked sensitive output.
- Maintainers have the disable, retry, recovery, upgrade, and removal guidance
  needed to operate the repository without undocumented assistance.

The repository provisioner, real GitHub adapter, registration interface, thin
target workflows, and end-to-end readiness test do not exist yet. This plan is
the acceptance contract for those later implementation slices.
