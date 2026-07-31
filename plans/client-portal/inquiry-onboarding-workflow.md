# Inquiry Intake and Client Onboarding Workflow

## Status

**Proposed current direction — not approved for implementation.**

This plan expands the inquiry qualification track in the
[feature roadmap](./feature-roadmap.md) and the inquiry concepts in the
[domain model](./domain-model.md). It defines the path from an unauthenticated
website inquiry to an intentionally prepared client workspace.

The central decision is that an inquiry never creates a portal account,
organization, membership, or invitation by itself. A consultant reviews the
inquiry and deliberately approves provisioning.

## Desired outcome

The workflow should give a prospective client prompt confirmation without
implying acceptance, while giving the consultant an AI-prepared review surface
instead of a list of raw form submissions.

```text
Website inquiry
  -> receipt confirmation
  -> intake validation and AI analysis
  -> consultant review queue
  -> qualify, decline, mark spam, or request follow-up
  -> organization and workspace provisioning
  -> deliberate invitation send
  -> discovery and active client work
```

Organization provisioning and invitation sending are separate, auditable
actions. An approved inquiry may be prepared without immediately contacting
the prospect.

## Lifecycle and state model

### Inquiry states

| State | Meaning | Permitted next states |
| --- | --- | --- |
| `received` | A valid public submission was durably recorded. | `analyzing`, `needs_review`, `spam` |
| `analyzing` | Background intake analysis is pending or running. | `needs_review`, `analysis_failed` |
| `analysis_failed` | Analysis did not complete; the inquiry remains reviewable. | `analyzing`, `needs_review` |
| `needs_review` | The inquiry is ready for a consultant decision. | `follow_up`, `qualified`, `declined`, `spam` |
| `follow_up` | More information or a conversation is needed before deciding. | `needs_review`, `qualified`, `declined`, `spam` |
| `qualified` | A consultant approved the prospect for portal preparation. | `provisioning`, `declined` |
| `provisioning` | Organization, engagement, and pending membership are being created or linked. | `ready_to_invite`, `provisioning_failed` |
| `provisioning_failed` | Provisioning needs retry or correction. | `provisioning`, `declined` |
| `ready_to_invite` | The workspace exists, but no invitation has necessarily been sent. | `invited`, `declined` |
| `invited` | A consultant deliberately sent an invitation. | `activated`, `invitation_expired`, `declined` |
| `invitation_expired` | The invitation expired without activation. | `invited`, `declined` |
| `activated` | The invited client accepted and activated membership. | terminal for onboarding |
| `declined` | The consultant decided not to proceed. | terminal, except an explicit reopen |
| `spam` | The inquiry was classified as abusive or irrelevant. | terminal, except an explicit reopen |

The implementation may separate inquiry, provisioning, invitation, and
membership states physically. It must preserve the decisions and transitions
above rather than compressing them into one ambiguous status.

### Required transition rules

- Public submission can reach only `received`; it cannot qualify a prospect.
- AI analysis may recommend a disposition but cannot set `qualified`,
  `declined`, or `spam` as the final consultant decision.
- Only an authorized consultant can approve provisioning or send an
  invitation.
- Qualification must not silently send an invitation.
- Provisioning must be idempotent and must not create duplicate organizations,
  engagements, memberships, or invitations when retried.
- Decline and spam actions must not reveal internal reasoning to the submitter.
- Every consequential transition records actor, time, prior state, new state,
  and a safe reason or provenance reference.

## Public inquiry intake

The public consulting site owns the form experience. It sends the portal an
authenticated, replay-safe handoff containing:

- Structured inquiry fields and an immutable submitted-content snapshot.
- Submitter contact snapshot and communication preferences.
- Submission time, source, campaign metadata when appropriate, and an
  idempotency key.
- Bot or abuse-screening evidence that is safe to retain.
- The version of the form and privacy notice presented.

The endpoint must treat every field as untrusted, apply size and type limits,
rate-limit abuse, and return a non-disclosing response. Repeated delivery with
the same idempotency key returns the original result.

### Submitter confirmation

After durable receipt, send or display a neutral acknowledgment:

> Thank you for your inquiry. We've received it and will review it. We'll
> contact you shortly.

The message must not promise acceptance, an account, response time, or portal
access. Delivery failure does not roll back the inquiry.

## AI intake analysis

AI acts as an analyst preparing a private briefing for the consultant. Its
output may include:

- Concise inquiry and company summary.
- Apparent goals, constraints, urgency, and missing information.
- Likely business challenges and engagement fit.
- Suggested discovery questions and next actions.
- Duplicate or related inquiry candidates.
- Risk, abuse, or uncertainty flags with evidence references.

Generated analysis is advisory, private, and attributable to its model,
prompt/workflow version, source inputs, time, cost, and execution result.
The interface must distinguish submitted facts from inference. Analysis failure
must never prevent manual review, and raw untrusted text must not be allowed to
instruct tools or trigger external actions.

## Consultant review experience

The staff dashboard centers on a review queue, not raw form records. A review
view presents:

1. The AI briefing, with facts and inferences visibly separated.
2. Original inquiry content and contact details.
3. Related history and duplicate candidates.
4. Suggested discovery questions and next actions.
5. An audit history of analysis and human decisions.

Available consultant actions are:

- Request or record follow-up.
- Qualify for portal preparation.
- Decline.
- Mark as spam.
- Correct or rerun analysis.
- After qualification, create or link an organization and prepare a workspace.
- Preview, edit, and deliberately send an invitation.

Bulk qualification, bulk invitation, and autonomous sending are excluded from
the initial workflow.

## Provisioning and invitation

Qualification authorizes preparation; it does not itself provision or invite.
The consultant confirms:

- Whether to create a new organization or link an existing one.
- Organization display name and tenant configuration.
- Initial engagement name and relevant inquiry context.
- Intended invitee and pending membership role.
- Invitation message, expiry, and send timing.

Provisioning links the original inquiry to the resulting organization and
staff-only prequalification engagement without rewriting history. The
invitation uses the controls in the
[authentication design](./authentication-design.md). Only invitation
acceptance activates membership and client access.

## Notifications

Initial notification events are:

- Receipt confirmation to the submitter.
- New inquiry notification to authorized staff.
- Optional internal notification when analysis completes or fails.
- Optional follow-up message deliberately sent by a consultant.
- Invitation deliberately sent by a consultant.
- Invitation expiry or acceptance notification to staff.

Messages use templates with tenant-aware branding, safe variables, versioning,
and an auditable send record. Internal analysis and decline reasons never
appear in prospect-facing messages.

## Security, privacy, and operations

- Inquiry data is private and tenant-scoped even before an organization exists.
- Staff access requires explicit authority; AI access uses a named,
  least-privilege machine principal.
- Retention and deletion policy must cover rejected, spam, duplicate, and
  abandoned inquiries.
- Logs and analytics must exclude inquiry content and direct contact data.
- Background jobs must be retryable and idempotent.
- Queue age, analysis failures, provisioning failures, invitation delivery,
  and activation should be observable without exposing content.
- Real inquiry data is prohibited until hosted security, privacy, abuse, email,
  backup, and recovery controls are approved.

## Implementation slices and evidence gates

1. **Durable intake:** authenticated site handoff, idempotent persistence,
   neutral confirmation, abuse controls, and staff-only raw review.
2. **Human decision workflow:** explicit states, audit events, review queue,
   qualification, decline, spam, and follow-up.
3. **Prepared onboarding:** idempotent organization/workspace provisioning,
   invitation preview/send, and activation tracking.
4. **AI briefing:** private structured analysis, provenance, failure recovery,
   consultant feedback, and evaluation.

AI briefing should follow a proven human review workflow unless a small
staff-only experiment can be isolated without delaying the non-AI path.
Advance each slice only after tenant isolation, replay behavior, transition
authorization, failure recovery, and browser behavior are tested.

## Success measures

- Time from receipt to first consultant review.
- Percentage of inquiries reviewed within the intended service window.
- Qualification, decline, spam, invitation, and activation rates.
- Duplicate provisioning and invitation incidents, which should remain zero.
- Consultant time saved and usefulness rating for AI briefings.
- Briefing correction rate and discovery-question adoption.
- Prospect confusion or support contacts about account availability.

## Explicitly deferred

- Automatic qualification, organization creation, or invitation.
- Public account registration.
- AI-authored messages sent without consultant review.
- Autonomous scheduling or external CRM changes.
- A fixed CRM or model-provider dependency.
- Client-visible AI analysis or internal decision reasons.
