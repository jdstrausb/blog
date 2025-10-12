# Project Architecture

## Application Type
**SvelteKit Full-Stack Blog Application** - Server-side rendered blog with MDsveX content authoring

## Architecture Pattern
**File-Based Routing with Server-Side Rendering (SSR)**

```
┌─────────────────────────────────────────────┐
│           Client (Browser)                   │
│  - Svelte Components (Hydrated)             │
│  - Reactive State ($state, $derived)        │
│  - Client-side Navigation                   │
└─────────────────┬───────────────────────────┘
                  │
                  │ HTTP Requests
                  │
┌─────────────────▼───────────────────────────┐
│         SvelteKit Server                     │
│  - SSR/SSG Pages                            │
│  - API Endpoints                            │
│  - Server Hooks                             │
│  - Database Queries (Drizzle)               │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┬─────────────┐
        │                   │             │
┌───────▼──────┐  ┌────────▼────────┐   │
│   SQLite DB   │  │  Email Service  │   │
│  (via Drizzle)│  │  (Nodemailer)   │   │
└───────────────┘  └─────────────────┘   │
                                          │
                            ┌─────────────▼──────────┐
                            │  MDsveX Posts          │
                            │  (src/posts/*.svx)     │
                            └────────────────────────┘
```

## Core Technologies

### Frontend Layer
- **Svelte 5** - Reactive UI framework with runes (`$state`, `$derived`, `$effect`)
- **SvelteKit 2** - Application framework providing:
  - File-based routing
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - API routes
  - Form actions
- **TailwindCSS 4** - Utility-first CSS framework
- **Enhanced Images** - Optimized image loading via `@sveltejs/enhanced-img`

### Content Management
- **MDsveX** - Markdown + Svelte preprocessing:
  - Converts `.svx` files to Svelte components
  - Enables Svelte component usage in markdown
  - Supports front matter for metadata
- **Remark/Rehype Plugins**:
  - `remark-unwrap-images` - Cleaner image markup
  - `remark-toc` - Auto-generate table of contents
  - `rehype-slug` - Add IDs to headings
  - `rehype-autolink-headings` - Make headings clickable
- **Shiki** - Syntax highlighting for code blocks
- **Gray Matter** - YAML front matter parsing

### Backend Layer
- **Node.js** - Server runtime
- **Drizzle ORM** - Type-safe database ORM:
  - SQLite dialect
  - Schema-first approach
  - Migration system
- **LibSQL Client** - SQLite database client
- **Nodemailer** - Email sending for feedback system

### Build System
- **Vite 7** - Fast build tool and dev server
- **TypeScript 5** - Type safety across entire stack
- **ESLint + Prettier** - Code quality and formatting

## Directory Structure & Responsibilities

### `/src/routes/` - Application Routes
File-based routing following SvelteKit conventions:

```
routes/
├── +layout.svelte              # Root layout (header, footer, theme)
├── +layout.server.ts           # Root layout data loading
├── +page.svelte                # Homepage
├── +page.server.ts             # Homepage data
├── about/
│   └── +page.svelte           # About page
└── blog/
    ├── +page.svelte           # Blog listing page
    ├── +page.server.ts        # Load all posts
    └── [...slug]/             # Dynamic blog post route
        ├── +page.svelte       # Blog post renderer
        └── +page.server.ts    # Load specific post by slug
```

**Key Patterns:**
- `+page.svelte` = Page component (rendered on server and client)
- `+page.server.ts` = Server-only data loading (runs on server before page render)
- `+layout.svelte` = Wraps child pages (for shared UI)
- `[...slug]` = Catch-all dynamic route parameter

### `/src/posts/` - Blog Content
Organized by year:
```
posts/
└── 2025/
    ├── welcome-to-mdsvex.svx
    ├── building-interactive-tutorials.svx
    └── test-codeblock.svx
```

Each `.svx` file contains:
- YAML front matter (title, author, date, tags, etc.)
- MDX content (markdown + embedded Svelte components)

### `/src/lib/` - Reusable Code

```
lib/
├── components/          # Svelte components
│   ├── blog/           # Blog-specific components
│   │   ├── BlogLayout.svelte        # Post wrapper
│   │   ├── BlogPostCard.svelte      # Post preview
│   │   ├── CodeBlock.svelte         # Syntax highlighting
│   │   ├── TableOfContents.svelte   # TOC sidebar
│   │   ├── FeedbackWidget.svelte    # Feedback system
│   │   ├── ShareWidget.svelte       # Social sharing
│   │   └── ...
│   └── ...             # General components (Header, ThemeToggle, etc.)
├── utils/              # Utility functions
│   ├── posts.server.ts            # Post loading logic
│   ├── scroll-toggler.svelte.ts   # Scroll state management
│   └── enhanced-images.client.ts  # Image optimization helpers
├── server/             # Server-only code
│   ├── db/
│   │   ├── schema.ts             # Drizzle schema definitions
│   │   └── index.ts              # Database client
│   ├── email/
│   │   ├── mailer.ts             # Email sending logic
│   │   ├── types.ts              # Email types
│   │   └── templates/            # Email templates
│   └── hooks.ts                  # Server hooks
├── actions/            # Svelte actions
│   └── clickoutside.ts
├── assets/             # Asset files
│   ├── images/
│   └── favicon.svg
├── constants/
│   └── index.ts        # Global constants
└── index.ts            # Re-exports for easy imports
```

### `/static/` - Static Assets
Served directly by web server:
```
static/
├── authors/            # Author avatar images
└── [other static files]
```

## Data Flow

### Blog Post Rendering Flow

1. **User requests** `/blog/2025/welcome-to-mdsvex`
2. **SvelteKit router** matches `[...slug]/+page.server.ts`
3. **Server load function** calls `load_post_by_slug('2025/welcome-to-mdsvex')`
4. **posts.server.ts**:
   - Uses Vite's `import.meta.glob()` to load all `.svx` files
   - Parses front matter with gray-matter
   - Returns post metadata and component
5. **+page.svelte** receives post data and renders:
   - Wraps content in `BlogLayout.svelte`
   - Injects metadata (title, author, date, tags)
   - Renders MDsveX-compiled Svelte component
6. **MDsveX compiler** transforms markdown:
   - Code blocks → `<CodeBlock>` component
   - Images → enhanced images (if configured)
   - Headings → auto-linked with slugs
   - TOC → generated from headings
7. **Server sends HTML** to browser (SSR)
8. **Client hydrates** Svelte components for interactivity

### Feedback System Flow

1. User clicks feedback button (positive/negative)
2. Component calls form action or API endpoint
3. Server stores feedback in SQLite database (Drizzle)
4. Server sends email via Nodemailer
5. Server returns success/error to client
6. Client shows confirmation message

## State Management

### Server State
- Database state managed by Drizzle ORM
- Post content loaded server-side (no client-side fetch)
- Server hooks handle database connections

### Client State (Svelte 5 Runes)
- **`$state()`** - Local reactive state
  - Example: Theme selection, UI toggles
- **`$derived()`** - Computed values
  - Example: Filtered posts, calculated reading time
- **`$effect()`** - Side effects
  - Example: Scroll listeners, localStorage sync
- **`$props()`** - Component props
  - Example: Component configuration

### Global State
- **Theme** - Managed in `theme.svelte.ts` using runes
- **Scroll State** - Managed in `scroll-toggler.svelte.ts`

No external state management libraries (Redux, Zustand) needed due to Svelte's reactivity.

## Rendering Strategy

### Server-Side Rendering (SSR)
- Default for all pages
- HTML generated on server
- SEO-friendly (crawlers see full content)
- Fast initial page load

### Client-Side Hydration
- Svelte components hydrated on client
- Interactive features activated
- Smooth navigation without full page reloads

### Static Generation (Optional)
SvelteKit supports prerendering:
```typescript
export const prerender = true; // In +page.server.ts
```
Can generate static HTML for blog posts at build time.

## Database Schema

### Current Tables
Defined in `src/lib/server/db/schema.ts`:

```typescript
// Post table (example - may vary)
export const post = sqliteTable('post', {
  id: integer('id').primaryKey(),
  created_at: integer('created_at').notNull(),
  // ... other fields
});
```

**Note:** Based on git status, the schema may be minimal or in development. Check `schema.ts` for actual tables.

## API Design

### No Traditional REST API
SvelteKit uses **Server Load Functions** instead of REST endpoints:

```typescript
// +page.server.ts
export async function load({ params }) {
  const post = await getPost(params.slug);
  return { post };
}
```

This is more efficient than separate API calls (no over-fetching).

### Form Actions (if needed)
```typescript
export const actions = {
  feedback: async ({ request }) => {
    const data = await request.formData();
    // Handle feedback
  }
};
```

## Build Output

### Adapter: Node.js
Uses `@sveltejs/adapter-node`:
- Outputs standalone Node.js server
- Can be deployed to any Node.js host
- Default output: `build/` directory

### Production Build
```bash
npm run build
```
Generates:
- Optimized JavaScript bundles
- Pre-rendered HTML (if prerender enabled)
- Static assets with hashed filenames
- Node.js server entry point

## Performance Optimizations

1. **Code Splitting** - Automatic route-based splitting
2. **Image Optimization** - Enhanced images with WebP/AVIF
3. **SSR** - Fast first contentful paint
4. **Minimal JavaScript** - Svelte compiles to efficient vanilla JS
5. **Tree Shaking** - Unused code removed during build
6. **CSS Purging** - TailwindCSS removes unused classes

## Security Considerations

1. **Environment Variables** - Stored in `.env` (not committed)
2. **Database** - Server-only access (Drizzle in `.server.ts` files)
3. **Email** - Server-side only (credentials not exposed)
4. **Input Validation** - Validate user input before database writes
5. **CORS** - Configured by SvelteKit (same-origin by default)

## Deployment Architecture

```
┌─────────────────────────────────────┐
│   Node.js Server                     │
│   (adapter-node output)              │
│                                      │
│   ├── Static file serving            │
│   ├── SSR rendering                  │
│   ├── API routes                     │
│   └── Database access (SQLite)       │
└─────────────────────────────────────┘
```

Deployment options:
- VPS (DigitalOcean, Linode, AWS EC2)
- Serverless (Vercel, Netlify - may need adapter change)
- Container (Docker + any host)

## Development Workflow

1. **Start dev server**: `npm run dev`
2. **Edit code** in `src/`
3. **Hot Module Replacement (HMR)** updates instantly
4. **Add blog post** in `src/posts/YYYY/slug.svx`
5. **Test changes** in browser
6. **Run checks**: `npm run check` + `npm run lint`
7. **Build**: `npm run build`
8. **Preview**: `npm run preview`