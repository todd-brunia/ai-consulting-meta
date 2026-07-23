# Client Portal Authentication Design

## Status

**Current design direction — not approved for implementation.** This document
extends [the client portal domain model](./domain-model.md) with human and
machine authentication, account verification, session, credential, and secure
deep-link behavior.

It is not production configuration, a credential-handling runbook, or evidence
that the proposed controls have been implemented or legally reviewed.

## Authentication boundary

Supabase Auth owns human authentication and browser sessions. The application
owns staff roles, client profiles, organization membership, invitations,
authorization, communication consent, and AI-agent grants. Twilio verifies
mobile contact points and delivers transactional SMS. Postmark delivers
production authentication and portal email.

Every successful human session or API-key request is translated into an
application authorization context before domain services load or change data.
Server-side authorization is required for every operation; PostgreSQL row-level
security remains defense in depth.

The browser may use Supabase for the authentication protocol. It must not use
Supabase's generated data API as the portal's application contract. Neither
browser clients nor agent integrations receive Supabase service-role
credentials.

## Human identity and account activation

### Stable identity

The application user UUID is the durable identity referenced by memberships,
messages, approvals, audit events, and agent ownership. A verified email
address is the unique sign-in name, not the user identifier.

Phone numbers are application contact points rather than Supabase phone-login
identities. This keeps email as the only login identifier and separates SMS
notification consent from authentication.

### Invitation-only activation

Public account creation is disabled for the production portal. Todd qualifies
an inquiry, creates or links an organization, and issues an invitation to the
prospect's email address. An invitation is single-use, expires, and can be
revoked or replaced.

Invitation acceptance requires the client to:

1. Follow the verified email invitation.
2. Establish a password under the configured password policy.
3. Confirm their name.
4. Provide a mobile number normalized to E.164.
5. Complete user-initiated phone verification through Twilio Verify.
6. Select a timezone.
7. Accept the portal terms and privacy notice.
8. Make a separate, initially unchecked choice about transactional SMS
   activity notifications.

The phone number is required, but SMS activity consent is optional. Declining
or later revoking consent does not block account activation or portal access;
email becomes the activity-notification fallback.

The application records only the verification result and provider reference
needed for audit and idempotency. Verification codes and provider credentials
are never stored in application records or logs.

### Contact changes

A client may change the login email while retaining the same application UUID.
The change requires recent authentication and confirmation through both the
old and new email addresses. Memberships, authored content, approvals, and
audit history remain unchanged.

Changing a phone number requires recent authentication and verification of the
new number before it replaces the prior contact point. SMS consent does not
silently transfer to a new number; the client makes a new consent choice.

## Browser sessions

### Session policy

The intended hosted Supabase Auth policy is:

- One-hour access-token lifetime.
- Refresh-token rotation with reuse detection left at the provider-recommended
  default.
- Thirty-day inactivity timeout.
- Ninety-day absolute session lifetime.
- Explicit sign-out for the current session and an option to terminate all
  sessions.

Supabase sessions use short-lived access tokens and rotating refresh tokens.
Its hosted inactivity, time-box, and single-session controls are available on
Pro plans and are evaluated when a session refreshes. The effective timeout may
therefore include the remaining access-token lifetime. See
[Supabase user sessions](https://supabase.com/docs/guides/auth/sessions).

The Next.js server boundary refreshes an eligible session during an ordinary
portal visit. A client who returns before thirty idle days remains signed in,
subject to the ninety-day maximum. Session cookies use production HTTPS and
provider-supported secure cookie attributes. Tokens never appear in application
URLs, analytics, or logs.

### Recent authentication

Session refresh proves session continuity; it does not prove that the human
recently entered a credential. The application separately records a successful
password challenge and treats it as recent for fifteen minutes.

Recent authentication is required for:

- Proposal and agreement approval.
- Login-email or phone changes.
- Password changes.
- Viewing or terminating other sessions.
- Creating, rotating, changing, or revoking agent credentials and grants.

Viewing content and posting ordinary messages require a valid session but not
a fresh password challenge. Supabase supports an explicit reauthentication
flow for sensitive operations; see
[Supabase password security](https://supabase.com/docs/guides/auth/password-security).

## Notification deep links

SMS and email notifications contain ordinary HTTPS links on the branded portal
domain. They are navigation hints, not authentication credentials. Link text
and URLs contain no message body, agreement terms, invoice amounts, personal
information, session token, or API key.

The link targets an opaque resource identifier and an allowlisted portal route:

1. A valid browser session opens the authorized destination directly.
2. An absent or expired session redirects to sign-in with an allowlisted,
   relative return destination.
3. Successful sign-in returns the client to that destination.
4. Authorization is evaluated again after sign-in.
5. An unauthorized or deleted target produces a non-disclosing response.

The application never accepts an arbitrary absolute return URL. A notification
link cannot bypass recent authentication for a sensitive action.

## Email delivery

Supabase's default mail service is intended for non-production exploration and
has restrictive delivery and rate limits. Production authentication email uses
Postmark custom SMTP, following
[Supabase custom SMTP guidance](https://supabase.com/docs/guides/auth/auth-smtp)
and [Postmark's Supabase integration](https://postmarkapp.com/support/article/integrating-postmark-with-supabase-via-smtp).

Portal activity email uses the Postmark API behind an application provider
interface. Authentication and portal-notification mail use separate
transactional message streams so delivery monitoring and templates remain
distinct. Provider delivery, bounce, and complaint events are authenticated,
idempotent inputs to delivery-attempt status; they do not change the domain
action that caused the email.

## SMS verification and notification authentication

Twilio Verify performs user-initiated phone verification. Twilio Programmable
Messaging sends transactional activity notifications through a registered
Messaging Service. Verification codes are not reused as portal-session or
recent-authentication credentials.

The first activity message identifies the consultancy and explains how to opt
out. Standard STOP, START, and HELP behavior is managed by Twilio and reflected
into portal consent through a signature-validated, replay-safe webhook. Twilio
documents these events and the `OptOutType` webhook field in its
[Advanced Opt-Out guidance](https://www.twilio.com/docs/messaging/tutorials/advanced-opt-out).

Non-keyword SMS replies are not authenticated portal messages. They receive a
generic direction to use the portal and are not attached to an engagement.

Before sending real US application-to-person messages, the consultancy must
complete the appropriate sender and campaign registration, publish reviewed
privacy and terms pages, document its consent flow, and test opt-out behavior.
Twilio describes these requirements in its
[A2P 10DLC guidance](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc)
and [Messaging Policy](https://www.twilio.com/en-us/legal/messaging-policy).

Provider webhook endpoints verify authenticity before processing, reject stale
or replayed events, use provider event identifiers for idempotency, and redact
message content and contact details from routine logs.

## AI-agent API keys

### Machine identity

An API key authenticates one named `AgentIntegration`; it does not authenticate
as Todd, a client, or a Supabase user. Agent authorization comes from the
capabilities and resource allowlists described in the domain model.

Agent requests use:

```text
Authorization: Bearer <portal-issued-api-key>
```

Keys are accepted only over HTTPS and never in query parameters, form fields,
or notification links.

### Credential lifecycle

Each credential consists of a non-secret lookup prefix and a cryptographically
random secret. The full value is displayed once. The portal stores only a
secure verification hash, prefix, integration reference, creation and expiry
times, last-used time, and revocation state.

The default lifetime is ninety days. Rotation creates a new credential and may
leave the old credential active for at most twenty-four hours. Todd may revoke
either credential immediately. Revocation and expiry take effect before domain
authorization is evaluated.

Key administration requires a staff session with recent authentication.
Credentials are never returned by list or detail APIs after creation.

### Request authorization

The API authentication boundary:

1. Parses and validates the bearer credential.
2. Rejects missing, malformed, expired, or revoked credentials with a generic
   authentication error.
3. Resolves the machine principal, capabilities, and resource allowlist.
4. Builds the same application authorization context used by human requests.
5. Applies domain authorization and tenant constraints before data access.
6. Records sanitized request audit metadata and draft-write attribution.

Missing capability or out-of-scope resource access returns a non-disclosing
authorization error. Per-key rate limits return a standard retryable error.
Draft writes require idempotency keys so a network retry cannot create duplicate
revisions.

API-key authentication never grants direct PostgreSQL or Supabase access and
never exposes a service-role credential. A machine principal cannot create or
change its own grants.

## Threats and controls

| Threat | Required control |
| --- | --- |
| Account enumeration | Use generic invitation, sign-in, recovery, and verification responses. |
| Stolen browser session | Short access tokens, refresh rotation, idle and absolute limits, session revocation, and recent authentication. |
| Open redirect | Accept only allowlisted relative return destinations. |
| Deep-link disclosure | Keep links free of credentials and sensitive content; authorize every destination request. |
| Cross-tenant access | Enforce membership or agent grants in domain services and RLS, independent of UI filtering. |
| Phone reassignment or incorrect entry | Verify each new number and do not transfer consent automatically. |
| SMS opt-out loss | Process authenticated provider events idempotently and fall back to email. |
| API-key disclosure | One-time display, hash-only storage, bounded lifetime, rotation, revocation, rate limiting, and secret redaction. |
| Credential replay | HTTPS, rate limits, idempotency for writes, and audit anomaly review. |
| Webhook forgery or replay | Verify provider authenticity, reject stale events, and deduplicate provider event identifiers. |
| Privileged agent action | Deny client messaging, publication, approval, membership, payment, handoff, and notification operations to agents. |

## Validation scenarios

- A non-invited visitor cannot create a production portal account.
- An invitation cannot be accepted after expiry, revocation, or prior use.
- Account activation requires verified email and phone but not SMS activity
  consent.
- Changing email or phone retains the application UUID and requires recent
  authentication and new verification.
- Returning within thirty idle days refreshes the session until the ninety-day
  maximum; access-token refresh does not satisfy recent authentication.
- A valid deep link opens directly for an active authorized session and returns
  through sign-in safely for an expired session.
- A copied deep link grants no access to a different user or organization.
- STOP prevents later SMS and causes email fallback without disabling portal
  access.
- Forged and duplicate provider webhooks cannot change verification, consent,
  or delivery state.
- Expired, revoked, malformed, and rotated-out API keys fail without revealing
  whether an integration or resource exists.
- A valid key cannot exceed its capabilities or resource allowlist, and every
  agent-created draft revision identifies the machine principal.
- No session token, API secret, verification code, provider credential, or
  sensitive message body appears in URLs, logs, API responses, or client
  bundles.

## Deferred decisions

Concrete password policy, CAPTCHA and abuse-control provider, physical credential
schema, production rate limits, alert thresholds, retention periods, provider
reconciliation schedules, international phone support, and legal approval of
consent language require separately reviewed implementation plans.
