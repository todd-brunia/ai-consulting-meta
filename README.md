# AI Consulting Meta

This repository publishes selected, sanitized planning artifacts for Todd
Brunia's AI consulting work. It provides a durable record of early product
plans, counterproposals, architectural direction, and meaningful revisions
that exist before—or independently of—a specific implementation repository.

The purpose of publishing this history is to show the reasoning, uncertainty,
tradeoffs, and human decisions behind the work rather than presenting only a
polished final answer.

## Repository organization

Planning documents are grouped by initiative under `plans/`:

```text
plans/
└── client-portal/
    ├── initial-plan.md
    ├── counterproposal.md
    ├── estimated-operating-costs.md
    └── revised-plan.md
```

Each initiative should have its own directory. Documents should use clear, stable names that communicate their purpose or planning stage.

## Working convention

- Use this repository for planning and coordination artifacts that span repositories or precede implementation.
- Treat approved plans as historical records; record meaningful revisions explicitly instead of silently rewriting prior decisions.
- Keep application code, deployment configuration, issues, and implementation pull requests in the corresponding project repository.
- Treat every commit as permanently public, including deleted content and Git
  history.
- Never store credentials, environment files, private keys, account or resource
  identifiers, client documents, client or prospect names, personal data,
  confidential commercial terms, security findings, incident material, or
  private operational procedures here.
- Use fictional or generalized examples. Move real client evidence and private
  operating material to a separately access-controlled repository.
- Review every change for public suitability before committing; `.gitignore`
  and automated secret detection are safeguards, not publication approval.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the publication review and
[SECURITY.md](./SECURITY.md) for private reporting instructions.

## Client portal planning history

The client portal documents intentionally preserve the back-and-forth planning
process:

1. [Initial plan](./plans/client-portal/initial-plan.md) — the historical,
   maximum-control AWS design.
2. [Counterproposal](./plans/client-portal/counterproposal.md) — a critique of
   the original scope and its risk-to-learning tradeoffs.
3. [Historical AWS cost estimate](./plans/client-portal/estimated-operating-costs.md)
   — costs for the initial architecture, not the revised direction.
4. [Revised plan](./plans/client-portal/revised-plan.md) — the current working
   direction based on human review of the proposal and counterproposal.

Preserving these documents is deliberate. A superseded proposal is evidence of
how the decision evolved, not current implementation guidance.

## Reuse

Copyright © 2026 Todd Brunia. All rights reserved. No license to copy, modify,
or redistribute this material is granted unless a file explicitly states
otherwise. Public visibility provides transparency, not permission to reuse
the work. See [COPYRIGHT.md](./COPYRIGHT.md).

The first initiative captured here is the incremental client portal, planned as a separate application repository under the `todd-brunia` GitHub account.
