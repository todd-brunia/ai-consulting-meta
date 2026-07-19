# Contributing

This repository is a curated public record of selected AI consulting planning.
Changes must improve that record without exposing private operating or client
information.

## Before proposing a change

1. Confirm that the material belongs in a public planning repository rather
   than a private operations or implementation repository.
2. Remove or generalize all client, prospect, employee, and third-party personal
   information.
3. Remove credentials, account identifiers, infrastructure identifiers,
   confidential commercial terms, security findings, and private procedures.
4. Confirm that factual claims and external links are current and attributable.
5. Mark the document's status clearly: working, current, historical,
   superseded, or decision input.
6. Preserve meaningful decision history instead of silently rewriting it.

## Change process

- Use a focused branch and pull request.
- Explain the planning purpose, affected decision, and publication risks.
- Run `git diff --check` and scan the complete branch history for secrets.
- Review the rendered Markdown and every changed link.
- Do not add executable workflows, dependencies, or automation as part of a
  documentation change without separate review of permissions and supply-chain
  risk.

Maintainers may close contributions that are implementation-specific,
confidential, promotional, or unrelated to the repository's planning record.

## Public-information boundary

Allowed material includes sanitized plans, counterproposals, architecture
decisions, retrospectives, and directional cost models.

Prohibited material includes credentials, `.env` files, private keys, client
documents, real client workflow inputs, personal data, confidential pricing or
contract terms, live resource names or IDs, incident details, unremediated
vulnerabilities, and private recovery procedures.

When uncertain, do not commit the material. Keep it private and ask the
maintainer to decide where it belongs.
