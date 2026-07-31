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

This plan proposes a versioned automation kit installed in repositories owned
by clients, with:

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

### [Autonomous goal-to-deployment delivery pipeline](./goal-to-deployment-pipeline.md)

**Status: approved long-term direction.**

This plan evolves the current issue-level workflow toward governed
decomposition of business goals into milestones, epics, issues, plans, builds,
and pull requests. It keeps GitHub as the system of record, introduces a
durable state machine behind label projections, preserves human milestone
checkpoints, and keeps LangGraph replaceable behind an orchestrator interface.

### [Governed AI sprint delivery orchestrator implementation plan](./sprint-delivery-orchestrator-implementation-plan.md)

**Status: approved implementation direction.**

This is the recommended implementation starting point. It defines the private
`ai-delivery-orchestrator` repository, AWS Fargate and Aurora Serverless v2
deployment, LangGraph runtime, GitHub App callbacks, secured Bruno API, explicit
issue-list workflow, dependency-aware scheduling, risk-based plan approval,
automated pull request review and repair, and human merge pilot.

## Recommended reading path

For packaging and client adoption, read the
[client-sharing plan](./client-sharing-plan.md). For evolution of the internal
delivery workflow, read the
[goal-to-deployment pipeline](./goal-to-deployment-pipeline.md), then use the
[sprint delivery orchestrator implementation plan](./sprint-delivery-orchestrator-implementation-plan.md)
for the first build sequence.

Before proposing implementation, pay particular attention to:

1. The client-owned adapter and credential model.
2. The security boundary between generation, validation, and publishing.
3. Distribution and legal-readiness requirements.
4. The phased portability and client-pilot acceptance plan.
5. The approved risk-based plan gate and the requirement that merge, release,
   and deployment remain human-controlled in the first release.

## Current next step

For client sharing, the first bounded planning outcome remains the dedicated
implementation repository and versioned v1 workflow interface.

For goal-to-deployment automation, begin with Phase 1 of the approved
[sprint delivery orchestrator implementation plan](./sprint-delivery-orchestrator-implementation-plan.md):
create the private implementation repository and establish its local runtime,
security boundary, infrastructure, CI/CD, and operating documentation.

## Maintenance

Keep this index synchronized whenever a document in this folder is added,
removed, renamed, superseded, or materially changes purpose or status. Clearly
distinguish approved current guidance from proposals and historical material.
