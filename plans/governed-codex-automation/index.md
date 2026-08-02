---
title: Governed Codex Automation
description: Product, architecture, security, and adoption plans for evolving a governed internal Codex workflow into a reusable consulting accelerator.
initiative: true
initiative_order: 2
initiative_status: Published planning documents
---
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

**Status: approved implementation direction — implementation active.**

This is the recommended implementation starting point. It defines the private
`ai-delivery-orchestrator` repository, AWS Fargate and Aurora Serverless v2
deployment, LangGraph runtime, GitHub App callbacks, secured Bruno API, explicit
issue-list workflow, dependency-aware scheduling, risk-based plan approval,
automated pull request review and repair, and human merge pilot.

The [2026-08-01 implementation checkpoint](./sprint-delivery-orchestrator-implementation-plan.md#implementation-checkpoint--2026-08-01)
records the merged domain, PostgreSQL persistence, orchestration primitives,
secure webhook-intake, provider-stub, and operating-runbook slices, along with
the unapplied Terraform state/OIDC/ECR/network foundation, current validation
evidence, and explicitly pending work.

### [Sprint delivery orchestrator cost estimate](./sprint-delivery-orchestrator-cost-estimate.md)

**Status: planning estimate as of 2026-08-02 — validate before deployment.**

This companion estimate translates the implementation architecture into
weekly AWS operating ranges for idle, light, typical, and heavy sprint use. It
documents workload assumptions, separates excluded OpenAI and GitHub costs,
identifies Aurora wake time and CloudWatch logging as the main AWS cost risks,
and defines measurement and budget controls for the pilot.

## Recommended reading path

For packaging and client adoption, read the
[client-sharing plan](./client-sharing-plan.md). For evolution of the internal
delivery workflow, read the
[goal-to-deployment pipeline](./goal-to-deployment-pipeline.md), then use the
[sprint delivery orchestrator implementation plan](./sprint-delivery-orchestrator-implementation-plan.md)
for the first build sequence and its
[cost estimate](./sprint-delivery-orchestrator-cost-estimate.md) for the pilot
budget assumptions.

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

For goal-to-deployment automation, continue the approved
[sprint delivery orchestrator implementation plan](./sprint-delivery-orchestrator-implementation-plan.md)
from its [latest checkpoint](./sprint-delivery-orchestrator-implementation-plan.md#implementation-checkpoint--2026-08-01).
The current pause point follows the merged, unapplied Terraform foundation.
When work resumes, first choose between a separately authorized human bootstrap
operation and continued definition of unapplied Phase 1 infrastructure.
Secrets, observability, budgets, Bruno smoke tests, application compute,
GitHub mutation authority, ingress, LangGraph, reconciliation, model
integration, and the operator API remain later reviewed slices.

## Maintenance

Keep this index synchronized whenever a document in this folder is added,
removed, renamed, superseded, or materially changes purpose or status. Clearly
distinguish approved current guidance from proposals and historical material.
