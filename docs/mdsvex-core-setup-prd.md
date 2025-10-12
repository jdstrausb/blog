# PRD: Core MDSvex Setup

## Overview

- Introduce MDSvex-based markdown authoring to the SvelteKit blog so writers can compose posts with interactive Svelte components, frontmatter metadata, and enhanced code snippets.
- Maintain compatibility with the existing database-driven features while preparing for future hybrid content workflows.
- All future blog posts will be written using MDSvex conventions and the existing means of writing and publishing posts from the site interface is to be removed.
- Phase 1 focuses on foundational configuration: installing dependencies, wiring build tooling, creating a reusable post layout, and validating content loading.

## Goals & Success Metrics'

- Remove the workflow for publishing posts from `src/routes/posts/new`.
- Enable authoring and rendering of `.md` and `.svx` files through MDSvex.
- Deliver high-quality code highlighting across all sample posts using Shiki.
- Provide a reusable layout component that surfaces metadata and table-of-contents support.
- Demonstrate end-to-end loading of at least two migrated posts via new utilities.
- Success metric: two migrated posts render without console/runtime errors, and generated pages pass `bun run check` (or equivalent) without MDSvex-related warnings.

## Non-Goals

- Full migration of the existing post catalogue.
- Integration of comments, analytics counters, or other database-only features inside MDSvex layouts.
- Advanced image optimization beyond enabling `@sveltejs/enhanced-img`.

## User Stories

- **As a content creator**, I want to write blog posts in Markdown/Svelte files with frontmatter so I can author rich, component-driven articles without touching the database.
- **As a developer**, I want MDSvex integrated into the build toolchain so `.md` and `.svx` files compile alongside `.svelte` components.
- **As a reader**, I want blog posts to preserve consistent styling and metadata (titles, descriptions, TOC) so the experience is uniform across legacy and new posts.

## Acceptance Criteria

### Story: Content Creator

- [ ] A sample `.svx` post in `src/posts/` renders successfully with frontmatter fields (`title`, `summary`, `author`, `published_at`, `tags`, `reading_time`, `published`).
- [ ] The layout component displays metadata (title, author, published date, reading time) in the rendered page.
- [ ] Interactive Svelte snippets inside the `.svx` file execute during runtime without errors.

### Story: Developer

- [ ] `svelte.config.js` includes MDSvex preprocessing with `.md` and `.svx` extensions, Shiki highlighter configuration, and required remark/rehype plugins.
- [ ] `vite.config.ts` registers `@sveltejs/enhanced-img` and allows project paths used by posts/imports.
- [ ] Project dependencies (`mdsvex`, `shiki`, specified remark/rehype plugins, `@sveltejs/enhanced-img`, `gray-matter` if needed) are added to `devDependencies`.
- [ ] Running the dev server compiles MDSvex content without TypeScript or runtime errors.

### Story: Reader Experience

- [ ] Code blocks in sample posts render with Shiki highlighting in both light and dark themes (matching existing theme toggle behavior).
- [ ] Automatic table of contents appears when headings are present, using the layout’s TOC component.
- [ ] Routing to `/blog/{slug}` (for migrated posts) returns prerendered content with correct metadata in `<svelte:head>`.

## Phase 1 Implementation Plan

0. **Remove Existing Post Publishing Workflow**
1. **Install Dependencies**
    - Add MDSvex, Shiki, remark/rehype plugins, `@sveltejs/enhanced-img`, and supporting utilities using the project’s package manager (confirm bun vs bun).
2. **Configure Tooling**
    - Update `svelte.config.js` with MDSvex options (extensions, preprocess array, syntax highlighting, layout mapping, TOC/slug plugins).
    - Update `vite.config.ts` to include the enhanced image plugin and any filesystem allowlists.
3. **Create Blog Layout Component**
    - Implement `src/lib/components/blog/blog_layout.svelte` to render metadata, main content slot, and an aside TOC area.
    - Ensure `<svelte:head>` elements use frontmatter values.
4. **Build Post Utilities**
    - Implement `src/lib/utils/posts.ts` to glob `.md`/`.svx` files, parse metadata, and return sorted post lists/loading helpers.
5. **Wire Routes**
    - Add `/blog/+page.ts` and `/blog/[slug]/+page.ts` loaders using the utilities.
    - Implement `/blog/+page.svelte` and `/blog/[slug]/+page.svelte` shells; ensure prerender settings are applied.
6. **Migrate Sample Posts**
    - Create at least two `.svx` files under `src/posts/` with realistic content, frontmatter, and an interactive component snippet.
7. **Validate Build & Rendering**
    - Run `bun run check` (or equivalent) and address MDSvex-related issues.
    - Launch dev server, visit listing and individual post pages, confirm highlighting, TOC, metadata, and interactive components work.

## Open Questions

- Which package manager should the team standardize on for new devDependencies (existing scripts use bun, guide references bun)?
- Which existing posts should be migrated first to `.svx` for validation?
- Are there branding requirements for the blog layout (e.g., header imagery, typography tweaks) beyond the default Tailwind prose styling?
