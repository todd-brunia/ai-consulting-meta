# AI Consulting Meta

This private repository holds cross-project planning and coordination material for Todd Brunia's AI consulting work. It provides a durable home for early product plans, architectural direction, and other artifacts that need to exist before—or independently of—a specific implementation repository.

## Repository organization

Planning documents are grouped by initiative under `plans/`:

```text
plans/
└── client-portal/
    └── initial-plan.md
```

Each initiative should have its own directory. Documents should use clear, stable names that communicate their purpose or planning stage.

## Working convention

- Use this repository for planning and coordination artifacts that span repositories or precede implementation.
- Treat approved plans as historical records; record meaningful revisions explicitly instead of silently rewriting prior decisions.
- Keep application code, deployment configuration, issues, and implementation pull requests in the corresponding project repository.
- Avoid storing credentials, client documents, personal data, or other operational secrets here.

The first initiative captured here is the incremental client portal, planned as a separate application repository under the `todd-brunia` GitHub account.
