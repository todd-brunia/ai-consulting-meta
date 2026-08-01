# Repository Instructions for Agents

## Planning-folder indexes

Every folder under `plans/` that contains planning documents must maintain an
`index.md` that gives a human reader a structured understanding of that
folder's contents.

Top-level initiative indexes at `plans/<initiative>/index.md` must also include
Pages discovery front matter: a human-readable `title`, short `description`,
`initiative: true`, numeric `initiative_order`, and `initiative_status`. Use
the optional `initiative_highlights` list for presentation-oriented Pages URLs
that should appear directly on the root showcase. This metadata lets the Pages
landing page index future initiatives without hard-coding their folder names.

When adding, removing, renaming, superseding, or materially repurposing a
planning document, update the affected folder's `index.md` in the same change.
The index must:

- Link to each planning document in the folder.
- Briefly explain the purpose and status of each document.
- Distinguish current guidance from historical or superseded material.
- Identify the recommended starting document or reading order.
- Point to the latest checkpoint when dated checkpoints exist.

If an agent adds planning content to a folder that does not yet have an
`index.md`, the agent must create the index as part of that change.

## GitHub Pages publishing

Markdown under `plans/` is the source of truth and is rendered to HTML by the
Pages build. Do not create a duplicate HTML version of a Markdown planning
document. Handwritten HTML is reserved for artifacts that require interactive
or presentation behavior, such as a storyboard or wireframe gallery.

Everything under `plans/` is copied into the public Pages artifact. Treat every
file added there as permanently public and complete the repository's public-
suitability review before committing it.

Follow these link conventions:

- Use relative Markdown links between planning documents so they work in both
  GitHub and the rendered Pages site.
- When Markdown links to client-shareable handwritten HTML, use its canonical
  `https://todd-brunia.github.io/ai-consulting-meta/...` Pages URL.
- In Liquid templates, pass repository-root paths through `relative_url` so
  links retain the `/ai-consulting-meta` project-site base path.

When adding a new initiative, interactive artifact, layout, or asset, preserve
the curated source boundary in `scripts/prepare-pages.sh`. Ensure the generated
site validator covers the resulting initiative and links. Pages pull requests
must pass the `Publish planning showcase` build before merge; deployment occurs
from `main` through the protected `github-pages` environment.

Read the [Pages publishing guide](./docs/pages-publishing.md) before changing
the site structure, Jekyll configuration, staging script, validation script, or
deployment workflow.

## Repository README

Keep the repository's top-level `README.md` synchronized with its published
content. When adding, removing, renaming, or materially reorganizing content,
update the README in the same change when its navigation or description is
affected.

README links must be human-usable Markdown links with descriptive labels, not
bare paths or a file listing that readers must interpret. At minimum, the
README must:

- Link to each initiative's `index.md` as its primary entry point.
- Surface important repository-wide guidance where a reader would reasonably
  look for it.
- Identify current or latest material without requiring readers to infer it
  from filenames.
- Remove or correct links and descriptions that have become stale.
