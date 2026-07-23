# Repository Instructions for Agents

## Planning-folder indexes

Every folder under `plans/` that contains planning documents must maintain an
`index.md` that gives a human reader a structured understanding of that
folder's contents.

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
