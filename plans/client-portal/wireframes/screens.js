(function () {
  "use strict";

  const screens = [
    {
      id: "login",
      title: "Authenticated entry",
      phase: "implemented",
      role: "client",
      state: "happy",
      status: "Implemented locally",
      description:
        "Email and password entry with a safe return to the requested portal route.",
      boundary:
        "Authentication proves identity; organization membership still controls engagement access.",
      defer:
        "Recovery, production session policy, recent authentication, phone verification, and consent.",
      render: () => `
        <div class="login-shell">
          <section class="login-card" aria-label="Sign in wireframe">
            <p class="eyebrow">Client portal</p>
            <h3>Welcome back</h3>
            <p class="subtle small">Sign in to continue to your invitation.</p>
            <label class="field">Email
              <span class="input">alex@northstar.example</span>
            </label>
            <label class="field">Password
              <span class="input">••••••••••••</span>
            </label>
            <div class="button-row">
              <span class="mock-button">Sign in</span>
            </div>
            <p class="callout">Returns only to an allowlisted relative route.</p>
          </section>
        </div>`,
    },
    {
      id: "workspace",
      title: "Tenant-scoped workspace",
      phase: "implemented",
      role: "client",
      state: "happy",
      status: "Implemented locally",
      description:
        "A client sees only engagements belonging to an organization with active membership.",
      boundary:
        "Server authorization and PostgreSQL RLS both enforce the organization boundary.",
      defer:
        "Timeline, unread state, documents, commercial milestones, and notifications.",
      render: () =>
        portalShell(`
          <p class="eyebrow">Northstar Studio</p>
          <h3>Engagement workspace</h3>
          <p class="subtle small">Commercial context for your active consulting work.</p>
          <div class="status-strip">
            <span class="status-chip">Active membership</span>
            <span class="status-chip">1 engagement</span>
          </div>
          <section class="panel">
            <p class="panel__title">AI workflow discovery</p>
            <div class="grid-2">
              <div class="metric"><strong>Prospect</strong><span class="small subtle">Current stage</span></div>
              <div class="metric"><strong>July 29</strong><span class="small subtle">Last activity</span></div>
            </div>
            <div class="button-row">
              <span class="mock-button">Open engagement</span>
            </div>
          </section>
        `),
    },
    {
      id: "staff-invitations",
      title: "Staff invitation management",
      phase: "implemented",
      role: "staff",
      state: "happy",
      status: "Implemented locally",
      description:
        "Authorized staff issue, inspect, replace, and revoke invitations without exposing tokens.",
      boundary:
        "Staff authority is independent of ordinary organization membership.",
      defer:
        "Production email delivery, hosted configuration, public signup, and organization provisioning.",
      render: () =>
        portalShell(
          `
          <p class="eyebrow">Staff workspace</p>
          <h3>Invitation management</h3>
          <div class="grid-2">
            <label class="field">Organization
              <span class="select-box">Northstar Studio ▾</span>
            </label>
            <label class="field">Invitee email
              <span class="input">alex@northstar.example</span>
            </label>
          </div>
          <div class="button-row"><span class="mock-button">Issue invitation</span></div>
          <section class="panel">
            <p class="panel__title">Pending invitations</p>
            <div class="version version--current">
              <strong>alex@northstar.example</strong><br>
              <span class="subtle">Pending · expires Aug 5</span>
              <div class="button-row">
                <span class="mock-button mock-button--secondary">Inspect</span>
                <span class="mock-button mock-button--secondary">Replace</span>
                <span class="mock-button mock-button--danger">Revoke</span>
              </div>
            </div>
          </section>
        `,
          "staff",
        ),
    },
    {
      id: "timeline",
      title: "Engagement conversation",
      phase: "phase-1",
      role: "both",
      state: "happy",
      status: "Recommended next",
      description:
        "Staff and active clients share a deterministic, client-visible engagement timeline.",
      boundary:
        "Messages are tenant-authorized; staff-only notes never enter client queries or serialization.",
      defer:
        "Unread counts, notifications, attachments, editing, reactions, and AI drafting.",
      render: () =>
        portalShell(`
          <p class="eyebrow">AI workflow discovery</p>
          <h3>Conversation</h3>
          <p class="subtle small">Oldest to newest · fictional planning data</p>
          <div class="timeline">
            ${message("TB", "Todd · Staff", "9:14 AM", "I’ve summarized the discovery goals and open questions for review.")}
            <div class="timeline-event"><strong>Activity</strong> · Engagement moved to negotiating</div>
            ${message("AN", "Alex · Client", "10:02 AM", "The scope looks right. Please include the handoff process in the proposal.")}
          </div>
          <section class="panel panel--soft">
            <label class="field">Add a client-visible message
              <span class="textarea">Write a message…</span>
            </label>
            <div class="button-row"><span class="mock-button">Post message</span></div>
          </section>
        `),
    },
    {
      id: "timeline-empty",
      title: "New engagement empty state",
      phase: "phase-1",
      role: "both",
      state: "empty",
      status: "Proposed",
      description:
        "A useful empty state explains the collaboration boundary before the first message.",
      boundary:
        "The empty state reveals no other tenant, engagement, or staff-only information.",
      defer: "Templates, automatic greetings, suggested prompts, and notifications.",
      render: () =>
        portalShell(`
          <p class="eyebrow">AI workflow discovery</p>
          <h3>Conversation</h3>
          <div class="empty-state">
            <div>
              <strong>No activity yet</strong>
              <p class="small subtle">Start the commercial conversation for this engagement.</p>
              <span class="mock-button">Write first message</span>
            </div>
          </div>
        `),
    },
    {
      id: "timeline-forbidden",
      title: "Non-disclosing access failure",
      phase: "phase-1",
      role: "client",
      state: "error",
      status: "Proposed",
      description:
        "A copied or cross-tenant engagement link produces a generic unavailable outcome.",
      boundary:
        "The response does not confirm whether the engagement exists for another organization.",
      defer: "Support escalation and production audit-alert policy.",
      render: () =>
        portalShell(`
          <p class="eyebrow">Engagement</p>
          <h3>Workspace unavailable</h3>
          <div class="error-state">
            <div>
              <strong>This engagement is not available.</strong>
              <p class="small">Return to your workspace or contact the consultancy if you need help.</p>
              <span class="mock-button mock-button--secondary">Return to workspace</span>
            </div>
          </div>
        `),
    },
    {
      id: "proposal-review",
      title: "Immutable proposal review",
      phase: "phase-2",
      role: "client",
      state: "happy",
      status: "Proposed",
      description:
        "The designated client approver reviews one exact, immutable published version.",
      boundary:
        "Approval belongs only to the displayed version and never transfers to a replacement.",
      defer:
        "Rich authoring, PDF generation, electronic signatures, and automated publication.",
      render: () =>
        portalShell(`
          <p class="eyebrow">Proposal review</p>
          <h3>AI workflow discovery</h3>
          <div class="status-strip">
            <span class="status-chip">Version 2 · Current</span>
            <span class="status-chip">Awaiting your review</span>
          </div>
          <div class="document">
            <div class="document__page"><strong>Proposal — Version 2</strong></div>
            <aside class="version-list">
              <div class="version version--current"><strong>Version 2</strong><br>Published Jul 29</div>
              <div class="version"><strong>Version 1</strong><br>Superseded</div>
            </aside>
          </div>
          <section class="approval-box">
            <p class="panel__title">Your decision applies to version 2 only.</p>
            <div class="button-row">
              <span class="mock-button mock-button--secondary">Request changes</span>
              <span class="mock-button">Approve version 2</span>
            </div>
          </section>
        `),
    },
    {
      id: "agreement-handoff",
      title: "Agreement approval and signing handoff",
      phase: "phase-3",
      role: "client",
      state: "happy",
      status: "Proposed",
      description:
        "Portal-native business approval remains distinct from an external legal signing ceremony.",
      boundary:
        "The external provider owns signer authentication, consent evidence, audit trail, and completed agreement.",
      defer: "Provider selection, webhooks, reconciliation, and legal review.",
      render: () =>
        portalShell(`
          <p class="eyebrow">Agreement</p>
          <h3>Statement of work · Version 1</h3>
          <section class="approval-box">
            <p class="panel__title">Business approval recorded</p>
            <p class="small subtle">Approved by Alex Nguyen · Jul 30, 11:42 AM</p>
          </section>
          <section class="panel panel--external">
            <p class="eyebrow">External provider boundary</p>
            <p class="panel__title">Complete the legal signing process</p>
            <p class="small">You will leave the portal for the provider-hosted signing ceremony.</p>
            <div class="button-row"><span class="mock-button">Continue to signing provider ↗</span></div>
          </section>
          <p class="callout">Portal approval is not described as an electronic signature.</p>
        `),
    },
    {
      id: "commercial-handoff",
      title: "Deposit and delivery handoff",
      phase: "phase-4",
      role: "both",
      state: "happy",
      status: "Proposed",
      description:
        "The portal records commercial milestones while Stripe and Slack remain authoritative.",
      boundary:
        "Deposit state is an observation, not a duplicate invoice or payment ledger.",
      defer: "Stripe webhooks, reconciliation automation, and delivery conversation.",
      render: () =>
        portalShell(`
          <p class="eyebrow">Commercial handoff</p>
          <h3>Ready for delivery</h3>
          <div class="handoff-flow">
            <div class="handoff-node"><strong>Portal</strong><br><span class="small">Agreement approved</span></div>
            <span class="handoff-arrow">→</span>
            <div class="handoff-node handoff-node--external"><strong>Stripe</strong><br><span class="small">Hosted invoice · Deposit received</span></div>
            <span class="handoff-arrow">→</span>
            <div class="handoff-node handoff-node--external"><strong>Slack</strong><br><span class="small">Delivery conversation</span></div>
          </div>
          <section class="panel">
            <p class="panel__title">Recorded milestones</p>
            <div class="timeline-event">Deposit observed · Jul 31, 9:08 AM · recorded by Todd</div>
            <div class="timeline-event">Delivery moved to Slack · Jul 31, 9:15 AM</div>
          </section>
        `),
    },
    {
      id: "ai-draft",
      title: "Human-gated AI proposal draft",
      phase: "phase-5",
      role: "staff",
      state: "happy",
      status: "Proposed after evidence",
      description:
        "AI creates a private attributed draft; staff reviews and deliberately publishes.",
      boundary:
        "The agent cannot publish, message clients, approve, change access, or trigger external actions.",
      defer:
        "Generic agent infrastructure, autonomous actions, and model access to unapproved client data.",
      render: () =>
        portalShell(
          `
          <p class="eyebrow">Private staff workspace</p>
          <h3>Proposal drafts</h3>
          <div class="draft-columns">
            <aside class="version-list">
              <div class="draft-card"><strong>Human draft 1</strong><br><span class="subtle">Todd · 9:03 AM</span></div>
              <div class="draft-card draft-card--selected"><strong>AI draft 2</strong><br><span class="subtle">Proposal assistant · 9:08 AM</span></div>
            </aside>
            <section class="panel">
              <p class="panel__title">AI draft 2 · Not client-visible</p>
              <div class="textarea">Draft proposal content based on approved engagement context…</div>
              <div class="status-strip">
                <span class="status-chip">Model recorded</span>
                <span class="status-chip">1,840 tokens</span>
                <span class="status-chip">3.2 seconds</span>
              </div>
              <div class="button-row">
                <span class="mock-button mock-button--secondary">Edit draft</span>
                <span class="mock-button">Select for publication review</span>
              </div>
            </section>
          </div>
          <p class="callout">A separate authenticated human action publishes a selected revision.</p>
        `,
          "staff",
        ),
    },
  ];

  function portalShell(content, role = "client") {
    const roleLabel = role === "staff" ? "Staff" : "Client";
    return `
      <div class="browser">
        <div class="browser__chrome" aria-hidden="true">
          <span class="browser__dot"></span><span class="browser__dot"></span><span class="browser__dot"></span>
        </div>
        <div class="portal">
          <nav class="portal__nav">
            <span class="portal__brand">Brunia Consulting</span>
            <span class="portal__nav-items"><span>${roleLabel} view</span><span>Sign out</span></span>
          </nav>
          <div class="portal__layout">
            <aside class="portal__sidebar">
              <p class="portal__sidebar-label">Workspace</p>
              <div class="portal__sidebar-item portal__sidebar-item--active">Overview</div>
              <div class="portal__sidebar-item">Conversation</div>
              <div class="portal__sidebar-item">Documents</div>
              <div class="portal__sidebar-item">Handoffs</div>
            </aside>
            <main class="portal__main">${content}</main>
          </div>
        </div>
      </div>`;
  }

  function message(initials, author, time, body) {
    return `
      <article class="timeline-item">
        <div class="avatar" aria-hidden="true">${initials}</div>
        <div class="timeline-item__body">
          <div class="timeline-item__meta"><strong>${author}</strong><span>${time}</span></div>
          <div>${body}</div>
        </div>
      </article>`;
  }

  function renderScreen(screenId) {
    const screen = screens.find((candidate) => candidate.id === screenId);
    if (!screen) return "";
    return `<div class="viewport">${screen.render()}</div>`;
  }

  function statusClass(screen) {
    if (screen.phase === "implemented") return "implemented";
    if (screen.state === "error") return "error";
    return "proposed";
  }

  window.PortalWireframes = {
    screens,
    renderScreen,
    statusClass,
  };
})();
