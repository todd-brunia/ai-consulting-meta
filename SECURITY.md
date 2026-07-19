# Security Policy

## Reporting a concern

Do not open a public issue for a suspected credential, sensitive-data exposure,
unremediated vulnerability, or other security concern.

Use GitHub's private vulnerability reporting for this repository when it is
available. If it is not available, use the private contact path at
https://ai-consulting-site-pied.vercel.app/contact and include only enough
information to arrange a secure follow-up. Do not submit credentials, client
documents, exploit details, or other sensitive material through the public
issue tracker or contact form.

## Scope

This repository contains planning documents rather than a deployed
application. Reports are still useful when they identify:

- A credential or secret in current content or Git history.
- Personal, client, or confidential commercial information.
- Operational detail that would materially weaken a live system.
- A malicious link or supply-chain change.

Implementation vulnerabilities should be reported to the repository that owns
the affected application unless disclosure would itself expose sensitive
information.

## Response

The maintainer will assess the report, revoke exposed credentials before
editing history, remove or generalize sensitive content where practical, and
document any public correction that can be made safely. Removing content from
the current branch does not guarantee removal from clones, caches, or forks.
