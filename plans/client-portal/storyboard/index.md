# Client Portal Storyboard

## Status

**Interactive planning presentation — not an implemented product flow.**

The [HTML storyboard presentation](./client-portal-storyboard.html) follows one
fictional client engagement through the feature sequence defined in
[`feature-roadmap.md`](../feature-roadmap.md). It reuses the shared wireframes
from [`../wireframes/screens.js`](../wireframes/screens.js) so the presentation
and gallery show the same planned screens.

## Story sequence

1. Roadmap overview and evidence gates.
2. Phase 1: public inquiry and neutral receipt confirmation.
3. Phase 1: AI-prepared consultant review and human qualification.
4. Phase 1: workspace preparation and deliberate invitation.
5. Implemented foundation: authenticated invitation entry.
6. Implemented foundation: tenant-scoped engagement workspace.
7. Phase 2: client-visible conversation and activity timeline.
8. Phase 3: immutable proposal publication and client review.
9. Phase 4: agreement approval and external signing-provider handoff.
10. Phase 5: deposit observation and Slack delivery handoff.
11. Phase 6: one private, human-gated AI drafting workflow.
12. Recommendation to plan Phase 1 as the next bounded feature.

Every scene names its roadmap phase and explains the dependency, boundary, or
evidence gate that controls advancement to the next phase.

## Presenting

Open `client-portal-storyboard.html` in a browser.

- Use the previous and next buttons or the left and right arrow keys.
- Press `O` or select **Overview** to jump between slides.
- Press `Escape` to close the overview.
- Print from the browser to create a deliberate PDF review snapshot. Generated
  PDFs are not committed by default.

## Source files

- [`client-portal-storyboard.html`](./client-portal-storyboard.html) contains
  slide narrative and phase mapping.
- [`storyboard.css`](./storyboard.css) contains presentation and print layout.
- [`deck.js`](./deck.js) provides navigation, progress, URL fragments, and
  overview behavior.
- [`../wireframes/screens.js`](../wireframes/screens.js) is the shared visual
  source.

## Maintenance

Keep the slide sequence synchronized with `feature-roadmap.md`. Use exports
only as stable review snapshots; edit the HTML, CSS, and shared wireframe
registry rather than editing screenshots or PDFs.
