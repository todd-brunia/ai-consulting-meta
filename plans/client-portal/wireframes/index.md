# Client Portal Wireframes

## Status

**Low-fidelity planning artifact — not an implemented interface.**

The [interactive wireframe gallery](https://todd-brunia.github.io/ai-consulting-meta/plans/client-portal/wireframes/gallery.html) is the visual source of
truth for the client portal feature roadmap. It uses fictional data and has no
backend, authentication, persistence, provider connection, or production
behavior.

## Roadmap coverage

The gallery explicitly maps its screens to the ordered phases in
[`feature-roadmap.md`](../feature-roadmap.md):

1. Implemented local foundations: authenticated entry, tenant workspace, and
   staff invitation management.
2. Phase 1: public inquiry, neutral acknowledgment, consultant review queue,
   private AI briefing, qualification, workspace preparation, and deliberate
   invitation.
3. Phase 2: engagement conversation, activity timeline, empty state, and
   non-disclosing access failure.
4. Phase 3: immutable proposal version review.
5. Phase 4: agreement approval and external signing handoff.
6. Phase 5: deposit observation and Slack delivery handoff.
7. Phase 6: one private, human-gated AI proposal draft.

Each screen identifies its role, state, implementation status, authorization
boundary, and intentionally deferred scope.

## Using the gallery

Open `gallery.html` in a browser. Filter by role, roadmap phase, or interface
state, and switch between desktop and mobile simulations. The controls change
only the planning view; they do not simulate application data or permissions.

Recommended review order:

1. Compare implemented foundations with proposed screens.
2. Review all Phase 1 states before planning the next feature.
3. Inspect client and staff perspectives separately.
4. Use mobile mode to discuss information hierarchy, not finished responsive
   design.
5. Follow the guided narrative in the
   [storyboard presentation](https://todd-brunia.github.io/ai-consulting-meta/plans/client-portal/storyboard/client-portal-storyboard.html).

## Source files

- [`gallery.html`](https://todd-brunia.github.io/ai-consulting-meta/plans/client-portal/wireframes/gallery.html) provides gallery structure and filters.
- [`screens.js`](./screens.js) contains the shared wireframe registry used by
  both the gallery and storyboard.
- [`styles.css`](./styles.css) contains the reusable low-fidelity visual
  system.
- [`gallery.js`](./gallery.js) renders filters and viewport controls.

## Maintenance

Update `screens.js` first when a shared wireframe changes. Keep phase names and
sequence aligned with `feature-roadmap.md`. Do not add working authentication,
API calls, production data, tracking, or provider credentials to this
planning artifact.
