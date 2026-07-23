# Governed Codex Automation Planning Index

## Purpose

This folder records the product, architecture, security, distribution, and
adoption direction for evolving the internal label-driven Codex workflow into
a reusable consulting accelerator.

The material is planning guidance only. It does not authorize implementation,
client installation, credential sharing, or operation of a hosted service.

## Current direction

### [Client-sharing plan](./client-sharing-plan.md)

**Status: working direction — not approved for implementation.**

This is the current and only planning document for the initiative. It proposes
a versioned automation kit installed in repositories owned by clients, with:

- A shared, centrally tested workflow core.
- Thin client-owned adapters and declarative policy.
- Client-controlled credentials and repository governance.
- Separation between untrusted generation and trusted publishing.
- Immutable release pins and reviewable upgrades.
- A consulting-led adoption path beginning with synthetic dry runs and a
  limited pilot.

The plan deliberately excludes distributing implementation from this meta
repository and defers any consultancy-operated, multi-client control plane
until it has a separate threat model and operating design.

## Recommended reading path

Read the [client-sharing plan](./client-sharing-plan.md) from beginning to end.
Its sections progress from product direction and architecture through service
delivery, implementation phases, interfaces, tests, and explicit boundaries.

Before proposing implementation, pay particular attention to:

1. The client-owned adapter and credential model.
2. The security boundary between generation, validation, and publishing.
3. Distribution and legal-readiness requirements.
4. The phased portability and client-pilot acceptance plan.
5. The assumption that human approval, merge, release, and deployment remain
   outside the automation.

## Current next step

The plan requires human review and approval before implementation. If approved,
the first bounded planning outcome should define the dedicated implementation
repository and the versioned v1 interface for workflow inputs, named secrets,
outputs, configuration, permissions, and the supported Node validation
profile.

## Maintenance

Keep this index synchronized whenever a document in this folder is added,
removed, renamed, superseded, or materially changes purpose or status. Clearly
distinguish approved current guidance from proposals and historical material.
