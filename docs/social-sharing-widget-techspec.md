# Social Sharing Widget Tech Spec

## Background

- Blog posts currently end after the rendered markdown content with no affordance for social sharing or engagement tracking.
- Product is introducing a share widget with Umami analytics events to measure button usage and downstream referrals.
- The implementation must respect existing styling conventions (Tailwind utility classes within Svelte components) and rely on public environment variables for runtime configuration.

## Goals

- Deliver a reusable `ShareWidget.svelte` component that displays share actions for X, BlueSky, LinkedIn, Hacker News, and Reddit.
- Ensure every share link is absolute, contains the required UTM parameters, and opens in a new tab.
- Fire Umami analytics events on button clicks and register the global tracking script for the entire site.
- Surface the widget at the bottom of every individual blog post page without impacting other routes.

## Non-Goals

- Adding social platforms outside the MVP list.
- Changing existing post layout or typography outside the share widget area.
- Building automated tests or dashboards for Umami; only integration hooks are required.

## Assumptions

- `PUBLIC_BASE_URL` resolves to the canonical blog origin including protocol (e.g., `https://example.com`).
- `PUBLIC_ANALYTICS_SITE_ID` is provided by the Umami instance and is safe to embed client-side.
- Umami’s global script is hosted at `https://analytics.umami.is/script.js` and exposes `window.umami.track` once loaded.
- Post slugs are unique and stable; combining `PUBLIC_BASE_URL` with `postSlug` forms the canonical share URL.
- Icons can be shipped as inline SVG paths that do not require additional dependencies.

## Current State Overview

- `src/routes/[slug]/+page.server.ts` loads post data but omits the slug from the returned payload, so the page currently has no access to `params.slug` after the initial load.
- `src/routes/[slug]/+page.svelte` renders the article body and metadata inside a centered container, leaving room beneath the content for a call-to-action.
- `src/routes/+layout.svelte` sets the site `<head>` metadata but does not include any analytics scripts.
- `.env` and `.env.example` list existing environment variables but have no entries for the planned public configuration keys.
- There is no shared component for social links within `src/lib/components`.

## Proposed Solution

### ShareWidget Component

- Create `src/lib/components/ShareWidget.svelte` expecting `postTitle` and `postSlug` (both strings) as required props; validate via component typing.
- Read `PUBLIC_BASE_URL` and `PUBLIC_ANALYTICS_SITE_ID` from `$env/static/public` within the component so values are embedded at build time.
- Derive the canonical post URL by joining `PUBLIC_BASE_URL` with `/posts/` semantics if necessary (verify route structure) and ensure there is exactly one `/` separator before `postSlug`.
- Build platform metadata as an array of objects containing:
    - `id` (lowercase identifier for analytics and UTM campaign usage).
    - `label` (user-facing name such as “X” or “Hacker News”).
    - `icon` description (inline SVG markup sized to 20–24px, `aria-hidden="true"`).
    - `buildShareUrl` logic that accepts the canonical URL and post title, applies `encodeURIComponent`, and returns the platform-specific share link with appended UTM parameters (`utm_source=social`, `utm_medium=share_button`, `utm_campaign={platform id}`).
- Sharing endpoints to support:
    - X intent endpoint with `url` and `text` parameters.
    - BlueSky compose endpoint where the `text` query includes both title and URL (space separated or newline).
    - LinkedIn shareArticle endpoint with `mini=true`, `url`, and `title` parameters.
    - Hacker News submitlink endpoint with `u` (URL) and `t` (title) parameters.
    - Reddit submit endpoint with `url` and `title` parameters.
- Render the buttons using `<a>` elements styled as buttons (flex row with gaps, padding, border radius, hover/focus outlines). Keep visuals consistent with existing Tailwind usage (`flex`, `gap-3`, `justify-center`, `border`, `rounded-md`, etc.).
- Provide accessible text via `span` inside each button and `aria-label` summarizing the action (e.g., “Share on X”). Icons should remain hidden from screen readers.
- Ensure each link opens in a new tab/window by setting `target="_blank"` and include `rel="noopener noreferrer"` for security.
- Hook a click handler that calls `window.umami?.track('Share', { platform: platform label, post: postTitle })` before navigation. Use `event.preventDefault` plus `window.open` if necessary to avoid racing the tracker; otherwise rely on standard anchor behavior, but ensure the analytics call fires synchronously during the click event.
- Guard against a missing `PUBLIC_BASE_URL` by optionally logging a warning and disabling rendering if unset (documented as a development safeguard).

### Analytics Script Integration

- Update `src/routes/+layout.svelte` to inject the Umami script into the existing `<svelte:head>` block. Use the official script URL, add `data-website-id` populated from `PUBLIC_ANALYTICS_SITE_ID`, and mark the script as `async` and `defer`.
- Only render the script tag when the site ID is truthy to avoid loading analytics with an empty identifier. Optionally log to the console during development if the ID is missing.
- Ensure the script inclusion occurs before other head content so Umami is available globally across routes.

### Global Type Definitions

- Extend `src/app.d.ts` to include a `window.umami` declaration with a `track` function signature accepting the event name (`string`) and payload (`Record<string, string>`). Mark the property optional so TypeScript allows runtime checks.

### Data Loading Updates

- Modify `src/routes/[slug]/+page.server.ts` to include the slug in the selected columns or append `params.slug` to the returned object. This ensures the page component can pass `postSlug` to the widget.
- After adjusting the load function, rerun `svelte-kit sync` (or allow the dev server to regenerate) so generated types reflect the new `PageData` shape.

### Page Integration

- Import `ShareWidget` inside `src/routes/[slug]/+page.svelte` and render it beneath the article content (e.g., within the existing container after the prose block).
- Pass `data.post.title` and `data.post.slug` (or the renamed fields) into the component.
- Surround the widget with spacing utilities (top margin, divider) to match the blog’s aesthetic without disrupting existing typography.
- Confirm the widget only appears on individual post pages; no changes are needed for the homepage or other routes.

### Environment Configuration

- Add `PUBLIC_BASE_URL` and `PUBLIC_ANALYTICS_SITE_ID` placeholders to `.env.example` with comments explaining expected values.
- Mirror the same keys in `.env` (local development) with reasonable defaults.
- After updating `.env`, document the need to restart Vite for changes to take effect.

## Implementation Steps

1. Add the two new public environment variables to `.env.example` and `.env`; restart the dev server if running.
2. Update `src/app.d.ts` to declare the optional `window.umami` interface so the tracker call is type-safe.
3. Modify `src/routes/[slug]/+page.server.ts` to return the post slug alongside existing fields; regenerate Svelte types.
4. Create `src/lib/components/ShareWidget.svelte` with the props, platform metadata, share URL builder, layout, and click tracking described above.
5. Integrate the component into `src/routes/[slug]/+page.svelte`, positioning it after the article content and supplying `postTitle` / `postSlug`.
6. Inject the Umami script into `src/routes/+layout.svelte`’s head block using `PUBLIC_ANALYTICS_SITE_ID` for configuration.
7. Manually verify local behavior (see Testing Strategy) and adjust styling or metadata as needed.

## Testing Strategy

- Manual QA in `npm run dev`:
    - Visit a post at `/posts/{slug}` and confirm the widget appears below the article with all five platform buttons rendered.
    - Inspect each share link’s `href` to ensure it is absolute, includes the correct UTM parameters, and matches the expected platform domain.
    - Click each button and confirm a new tab opens with the correct share dialog populated (browser must allow pop-ups). Validate the existing page remains open.
    - Use browser devtools to confirm `window.umami` exists after the script loads; simulate button clicks and check the network panel for the corresponding Umami event requests, or at minimum verify `umami.track` executes without errors when the script is unavailable.
    - Load any non-post page and ensure no errors are thrown due to missing analytics configuration.
- Optional: Temporarily log the event payload in development to confirm values before removing debugging output.

## Risks & Mitigations

- **Missing environment values:** Guard widget rendering and script injection when `PUBLIC_BASE_URL` or `PUBLIC_ANALYTICS_SITE_ID` are undefined; surface console warnings to aid setup.
- **URL encoding issues:** Centralize encoding logic in the platform metadata to avoid missing `encodeURIComponent` calls.
- **Icon accessibility:** Provide text labels and hidden SVGs to maintain compliance with screen readers.
- **Analytics race conditions:** Trigger tracking synchronously within the click handler and avoid asynchronous operations before navigation.

## Follow-Up Questions

- Should the canonical share URL include additional path segments (e.g., `/blog/`) or is `/posts/{slug}` the final route? Clarify before concatenating paths.
- Confirm whether Umami self-hosting requires a different script domain; if so, expose it through configuration rather than hardcoding the hosted URL.
