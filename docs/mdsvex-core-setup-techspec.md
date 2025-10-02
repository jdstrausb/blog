# MDSvex Core Setup Tech Spec

## Overview

- Establish MDSvex as the authoritative source for blog content, replacing the existing database-driven publishing workflow.
- Configure the SvelteKit build pipeline (Svelte config, Vite plugins, aliases) to compile `.md` and `.svx` files with Shiki-powered syntax highlighting, remark/rehype plugins, and enhanced image handling.
- Introduce reusable layout and utility modules that render metadata, table of contents, and interactive Svelte components inside posts.
- Deliver an end-to-end experience where at least two sample posts authored in MDSvex appear in a new blog listing and individual post pages, while the legacy `/posts/new` authoring route is removed.

## Assumptions

- bun is the package manager; all dependency additions will use `bun add <package-name> -d`.
- Blog posts will be stored under `src/posts/` with yearly subdirectories to keep content organized.
- We will continue to serve a landing experience at `/`; it can either become an alias of the new `/blog` listing or host a curated subset of posts fetched from the same utilities.
- Existing database tables remain for potential future use (comments, analytics) but no longer own post content.

## Current State Assessment

- `svelte.config.js` already imports `mdsvex` but lacks custom options (extensions, highlight config, layout mapping, plugins).
- `vite.config.ts` only registers Tailwind and SvelteKit plugins; no enhanced image support or filesystem allowlist.
- Database-backed routes: `src/routes/+page.server.ts` and `src/routes/[slug]/+page.server.ts` query Drizzle tables; `/posts/new` provides the authoring UI and action to insert posts.
- Navigation: `src/lib/components/PageMenu.svelte` links to `/posts/new`; `src/routes/+page.svelte` lists posts from the database and displays a call-to-action pointing to the removed route when no posts exist.
- There is no `src/posts/` directory, blog layout components, or post-loading utilities in `src/lib/utils`.

## Proposed Architecture

### Content Source

- Author content in `.svx` (and optionally `.md`) files placed beneath `src/posts/` with frontmatter describing title, summary, author, publish dates, tags, reading time, and published flag.
- Organize posts in nested folders (e.g., `src/posts/2025/example-post.svx`) and allow per-post asset folders colocated with content.

### Build Pipeline

- Expand `svelte.config.js` to configure MDSvex with:
    - Supported extensions (`.svelte`, `.md`, `.svx`).
    - `vuePreprocess` plus `mdsvex({ ...options })` where options include Shiki highlighter definitions for both light and dark themes, remark plugins (unwrap images, TOC), rehype plugins (slug generation, auto-link headings), and a default layout path for posts.
    - SvelteKit `kit.alias` entry for `$posts` pointing to `src/posts` to simplify imports.
- Update `vite.config.ts` to add the enhanced image plugin and allow the `src/posts` directory in `server.fs.allow` so posts referencing relative assets compile during development.

### Dependencies

- Add devDependencies: `mdsvex`, `shiki`, `@sveltejs/enhanced-img`, `remark-unwrap-images`, `remark-toc`, `rehype-slug`, `rehype-autolink-headings`, `zod` (for frontmatter validation), plus any typings if the compiler reports gaps.
- Document installation commands and lockfile updates in the implementation steps.

### Layout & Components

- Create `src/lib/components/blog/blog_layout.svelte` to:
    - Accept frontmatter metadata as props and inject them into `<svelte:head>` tags for SEO.
    - Render metadata (tags, author, publish date, reading time) above the post content.
    - Wrap the post body in prose styling and include an aside hosting a table-of-contents component.
- Build supporting components within `src/lib/components/blog/` as needed:
    - `table_of_contents.svelte` to render the TOC produced by the remark plugin.
    - Optional `code_block.svelte` or other helpers anticipated by the PRD (these can be simple wrappers leveraging Shiki output).

### Utilities

- Implement `src/lib/utils/posts.ts` with functions to:
    - Lazily glob all `.md` and `.svx` files using `import.meta.glob` to ensure scalability. Metadata is extracted for listing pages, while full post content is loaded on demand.
    - Validate frontmatter for each post at build time using a `zod` schema. The build will fail if required fields are missing or malformed, preventing runtime errors.
    - Normalize slugs from file paths and detect duplicates. The build will fail with a clear error message if two posts resolve to the same slug.
    - Filter unpublished posts (frontmatter `published` flag) and sort by `published_at` descending.
    - Provide `load_all_posts()` for listing pages and `load_post_by_slug(slug)` for individual post routes, returning component references and metadata required by SvelteKit load functions.

### Routing & Pages

- Introduce `src/routes/blog/+page.ts` and `+page.svelte` to display the blog index using the utilities; mark `prerender = true` to statically generate the page.
- Add `src/routes/blog/[slug]/+page.ts` and `+page.svelte` to load and render individual posts via `<svelte:component>`, also prerendered.
- The root `/` route will be converted to a permanent (301) redirect to `/blog`.
- The legacy `/posts/new` route and its corresponding files (`src/routes/posts/new/+page.svelte` and `+page.server.ts`) will be deleted.
- The legacy `/[slug]` route and its corresponding files (`src/routes/[slug]/+page.svelte` and `+page.server.ts`) will be deleted.
- Navigation links in `src/lib/components/PageMenu.svelte` pointing to `/posts/new` will be removed.

### Data & Cleanup

- The `post` table in the database will be deprecated and all related Drizzle schema, queries, and migrations will be removed.
- A full list of files to be removed includes:
    - `src/routes/posts/new/+page.svelte`
    - `src/routes/posts/new/+page.server.ts`
    - `src/routes/[slug]/+page.svelte`
    - `src/routes/[slug]/+page.server.ts`
    - `src/routes/+page.server.ts` (and its usage in `src/routes/+page.svelte`)
    - Any Drizzle schema definitions and queries related to the `post` table.
- This ensures no dead code or orphaned database artifacts remain.

## Implementation Steps

1. **Dependency Installation**
    - Add all required devDependencies via bun, update lockfile, and confirm `package.json` includes them under `devDependencies`.
    - Record any TypeScript type packages required by new plugins.
2. **File System Preparation**
    - Create `src/posts/` with year-based subdirectories and at least two sample `.svx` files including frontmatter, interactive component usage, code block, and example enhanced image markup.
    - Place any sample assets (images) under `src/lib/assets/images/posts/` or colocated folders, updating `.gitignore` if necessary.
3. **Svelte Config Adjustments**
    - Modify `svelte.config.js` to register mdsvex options (extensions array, highlight configuration using Shiki themes for both color schemes, remark/rehype plugins, layout mapping) and add an alias for the posts directory.
    - Ensure preprocess order places `vitePreprocess()` before `mdsvex()` with configured options.
4. **Vite Config Updates**
    - Register the enhanced images plugin in `vite.config.ts` ahead of `sveltekit()` and allow `src/posts` in the filesystem whitelist so relative imports resolve.
5. **Blog Components**
    - Implement the blog layout and supporting components described above, including metadata rendering, TOC integration, and accessible styling consistent with existing Tailwind classes.
6. **Post Utilities Module**
    - Build functions for listing/loading posts, using glob imports and frontmatter metadata extraction, handling unpublished content, sorting, and returning component references for SvelteKit.
    - Export TypeScript interfaces for post metadata to ensure loaders and components share consistent types.
7. **Routing Overhaul**
    - Add the `/blog` listing and `[slug]` routes using the utilities; ensure both pages request only published posts and pass metadata to the layout via props.
    - Update `/` to either redirect to `/blog` or render the same content; remove reliance on Drizzle queries.
    - Delete `/posts/new` page and server action, remove its link from `PageMenu.svelte`, and update copy anywhere that referenced the form.
    - Sunset the old `[slug]` route by removing its server loader and Svelte page or turning it into a redirect to `/blog/{slug}`.
8. **Authoring Experience**
    - Create a simple CLI script (e.g., `bun run new-post "My New Post"`) that generates a new `.svx` file in the correct directory (`src/posts/YYYY/`) with a pre-filled frontmatter template.
9. **Documentation & Developer Guidance**
    - Update `README` or create a contributor doc outlining how to author new `.svx` posts, including required frontmatter fields and how to preview content locally.
10. **Validation**
    - Run `bun run check` and confirm there are no TypeScript or Svelte warnings.
    - Launch the dev server, visit `/blog`, `/blog/{slug}`, and `/` to ensure pages render, metadata populates `<head>`, TOC anchors link correctly, Shiki highlighting reflects both light/dark themes, and interactive components function.
    - Optionally execute a production build (`bun run build`) to verify prerendering succeeds.

## Testing Strategy

- **Automated**: rely on `bun run check` (SvelteKit sync + svelte-check) to validate type safety and new module definitions; consider adding a smoke test that imports `load_all_posts()` to catch glob regressions.
- **Manual**: verify both sample posts load correctly, TOC links work, code blocks are syntax highlighted, enhanced images emit `<picture>` elements, and the site functions without database connectivity.
- **Regression**: confirm removal of `/posts/new` does not break navigation (PageMenu, header) and that stale routes return 404 or redirect appropriately.

## Risks & Mitigations

- **Package Compatibility**: Shiki and enhanced image plugins may increase build time; mitigate by lazy-creating the highlighter and caching within the MDSvex config.
- **Frontmatter Drift**: Writers might omit required fields. Mitigated by implementing build-time validation with `zod`. The build will fail if frontmatter is invalid, preventing errors in production.
- **Broken Links**: Removing database posts could orphan existing slugs; mitigate by mapping legacy slugs to new files or adding redirects during migration.
- **Asset Handling**: Enhanced image plugin requires importable assets; enforce a convention for storing images under Vite-controlled directories.

## Decisions

- **Landing Page**: The root path `/` will be permanently redirected (301) to `/blog` to consolidate the user journey.
- **Database**: The `post` table is deprecated and will be fully removed. Historical data migration is out of scope for Phase 1.
- **Styling**: The initial blog layout will adhere to existing styles. Brand-specific requirements like hero images or advanced typography will be addressed in a future phase; the component structure will be kept flexible to accommodate this.
