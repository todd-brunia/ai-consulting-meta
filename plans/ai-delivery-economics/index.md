---
title: AI Delivery Economics
description: A measurement and estimation framework for understanding AI consumption, delivery cost, elapsed time, and human effort from issues through complete products.
initiative: true
initiative_order: 3
initiative_status: Working direction with an active portal pilot
---
# AI Delivery Economics Planning Index

## Purpose

This initiative defines how AI-assisted software delivery can be measured from
individual model invocations through issues, features, epics, and products. It
separates immutable observations from derived cost and forecasting models so
historical evidence can support new questions without rewriting the source
record.

The material is generalized public planning guidance. It does not contain real
usage records, prompts, source code, client identities, account identifiers,
credentials, or private commercial data.

## Current direction

### [AI delivery measurement and estimation framework](./measurement-and-estimation-framework.md)

**Status: working direction — first repository pilot proposed.**

This is the recommended starting document. It defines:

- A versioned event model for model invocations, estimates, evaluations,
  pricing snapshots, and human effort.
- The boundary between immutable measurements and replaceable rollups.
- The initial client-portal automation pilot.
- A staged path to local interactive measurement, delivery-orchestrator
  integration, centralized storage, cost analysis, and calibrated estimation.
- Data-minimization, access-control, and public publishing boundaries.

The first implementation issue is
[`ai-consulting-client-portal` issue #90](https://github.com/todd-brunia/ai-consulting-client-portal/issues/90).
It proposes issue-attributed token measurement for the portal's existing
label-triggered Codex planning, revision, and implementation workflow. The
issue remains subject to that repository's planning and approval gates.

## Relationship to other initiatives

- The [Client Portal](../client-portal/index.md) supplies the first bounded
  measurement pilot because its automated work already has explicit issue,
  workflow-stage, model, and reasoning-effort context.
- [Governed Codex Automation](../governed-codex-automation/index.md) defines the
  delivery orchestrator that can later emit canonical events for coordinated
  planning, building, and review activity.
- This initiative owns the cross-repository measurement vocabulary, economic
  analysis, forecasting, and evaluation loop. It does not own application
  implementation or grant new model, GitHub, AWS, or deployment authority.

## Recommended reading path

1. Read the
   [measurement and estimation framework](./measurement-and-estimation-framework.md).
2. Review the portal pilot issue for its repository-specific security and
   workflow constraints.
3. Consult the governed automation plans before proposing centralized
   ingestion or delivery-orchestrator integration.

## Maintenance

Keep this index synchronized whenever a planning document is added, removed,
renamed, superseded, or materially repurposed. Clearly distinguish proposed
capabilities from implemented measurement and label dated cost or pricing
assumptions so they are not mistaken for current rates.
