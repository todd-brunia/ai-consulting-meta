# GitHub Pages Publishing Guide

## Purpose

The repository publishes its sanitized planning library at
<https://todd-brunia.github.io/ai-consulting-meta/>. The root page indexes
planning initiatives, each initiative provides a rendered document index, and
selected initiatives may also expose interactive HTML presentations.

This guide defines the publishing contract. It does not relax the public-
information boundary in `CONTRIBUTING.md` or `SECURITY.md`.

## Publishing architecture

The publishing flow is:

1. Repository content remains authoritative.
2. `scripts/prepare-pages.sh` copies the curated public source into the ignored
   `_pages-source/` directory.
3. Jekyll renders Markdown and Liquid templates into `_site/`.
4. `scripts/validate-pages.mjs` checks initiative discovery and generated local
   links and assets.
5. `.github/workflows/pages.yml` uploads the artifact and deploys it through
   GitHub's protected `github-pages` environment.

Pull requests build and validate without deploying. A successful push to
`main` builds, validates, and deploys the public site.

## Source-of-truth policy

Keep planning documents as Markdown. Jekyll renders them to HTML during the
Pages build, so a manually maintained HTML copy would create a second source
that can drift.

Use handwritten HTML only when the artifact needs behavior Markdown cannot
provide, such as slide navigation, an overview mode, filtering, or viewport
simulation. Keep shared data and styles centralized when more than one HTML
artifact presents the same material.

The staging script currently publishes `_config.yml`, `_layouts/`, `assets/`,
the root `index.html`, and all of `plans/`. Update the script deliberately if a
new public source location is required. Do not broaden it to copy the entire
repository.

## Adding an initiative

Create `plans/<initiative>/index.md` and include discovery front matter:

```yaml
---
title: Human-readable initiative name
description: A short public summary used on the landing page.
initiative: true
initiative_order: 3
initiative_status: Working direction
initiative_highlights:
  - title: Presentation
    url: /plans/example/presentation.html
---
```

The root landing page discovers initiative indexes through `initiative: true`;
it does not hard-code folder names. Use a unique numeric `initiative_order`.
Omit `initiative_highlights` until the initiative has presentation-oriented
content worth linking directly. The normal **View plan index** action is always
generated.

Every initiative index must link and describe all planning documents in its
folder, distinguish current guidance from history, and provide a recommended
reading path as required by `AGENTS.md`.

## URL conventions

- Use relative `.md` links between Markdown documents. The
  `jekyll-relative-links` plugin converts them for Pages while they continue to
  work in GitHub's repository view.
- Use canonical Pages URLs when Markdown links to handwritten, client-shareable
  HTML: `https://todd-brunia.github.io/ai-consulting-meta/...`.
- Use repository-root paths with Jekyll's `relative_url` filter in Liquid
  templates. This preserves the `/ai-consulting-meta` base path.
- Keep published filenames stable. If a public filename must change, update all
  inbound links and consider whether existing client-shared URLs require a
  compatibility page.

## Interactive HTML

Interactive artifacts must:

- Use fictional or generalized data and display their planning-only status.
- Avoid authentication, persistence, analytics, provider credentials, and
  production integrations.
- Work beneath the `/ai-consulting-meta` project-site path.
- Support direct navigation to nested pages and meaningful fragments when the
  interface uses them.
- Remain usable at desktop and mobile widths and support printing when intended
  for presentation.
- Be linked from the owning initiative index; add an `initiative_highlights`
  entry only when it belongs on the root landing page.

Generated-site validation follows every local link emitted by the landing page,
so highlighted artifacts are automatically required to exist.

## Validation and deployment

Before opening a pull request, run:

```sh
bash scripts/prepare-pages.sh
bash -n scripts/prepare-pages.sh
node --check scripts/validate-pages.mjs
git diff --check
```

The authoritative Jekyll build runs in the `Publish planning showcase` GitHub
Actions workflow. Do not merge a Pages-related change until its `build` job
passes. After merge, verify the production deployment and smoke-test the root
page, the affected initiative index, and any changed interactive URLs.

The validator requires every immediate folder under `plans/` to have an
initiative index with complete discovery metadata, a unique order, a rendered
index page, and a card on the generated landing page. It also checks local
links and assets throughout generated HTML, CSS, and JavaScript.
