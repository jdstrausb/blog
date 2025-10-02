# Project Architecture

## Core Technologies

- **SvelteKit 2.27+**: Full-stack framework with file-based routing
- **Svelte 5**: Component framework with modern runes syntax
- **MDSvex**: Markdown + Svelte integration for blog posts
- **TailwindCSS 4**: Utility-first CSS framework
- **Drizzle ORM**: Type-safe database toolkit for SQLite
- **TypeScript**: Static typing throughout the application

## Key Architectural Patterns

### Theme System

- CSS variables defined in `src/app.css` for both light/dark themes
- `ColorSchemeContext` class manages theme state with Svelte 5 runes
- Theme persistence via cookies and localStorage
- Smooth transitions using View Transitions API

### Content Management

- Blog posts written as `.svx` files in `src/posts/`
- Frontmatter metadata for post information
- Custom MDSvex configuration with Shiki syntax highlighting
- Reusable blog layout component (`BlogLayout.svelte`)

### Database Layer

- SQLite database with Drizzle ORM
- Schema defined in `src/lib/server/db/schema.ts`
- Migration system with drizzle-kit
- Server-side utilities for data access

### Component Architecture

- Atomic design principles
- Blog-specific components in `src/lib/components/blog/`
- Shared utilities in `src/lib/utils/`
- Type definitions in `src/lib/constants/`

## File-Based Routing

```
src/routes/
├── +layout.svelte          # Root layout with theme provider
├── +page.svelte            # Homepage
├── about/+page.svelte      # About page
└── blog/
    ├── +page.svelte        # Blog listing page
    └── [...slug]/          # Dynamic blog post routes
        ├── +page.server.ts # Server-side post loading
        └── +page.svelte    # Blog post rendering
```

## Build Configuration

- **Vite**: Build tool with SvelteKit integration
- **Enhanced Images**: Automatic image optimization
- **Node Adapter**: Production deployment to Node.js
- **ESLint + Prettier**: Code quality and formatting
- **TypeScript**: Strict type checking enabled
