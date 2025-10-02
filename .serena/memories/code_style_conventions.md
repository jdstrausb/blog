# Code Style & Conventions

## Formatting (Prettier Configuration)

- **Indentation**: 4 spaces (no tabs)
- **Quotes**: Single quotes preferred
- **Trailing Commas**: None
- **Print Width**: 100 characters
- **Plugins**: prettier-plugin-svelte, prettier-plugin-tailwindcss

## TypeScript Configuration

- **Strict Mode**: Enabled
- **Module Resolution**: bundler
- **Allow JS**: true (with type checking)
- **Source Maps**: Enabled for debugging

## File Structure Conventions

```
src/
├── lib/
│   ├── components/          # Reusable Svelte components
│   │   └── blog/           # Blog-specific components
│   ├── utils/              # Utility functions
│   ├── server/             # Server-side code
│   │   └── db/            # Database schema and config
│   ├── constants/          # Type definitions and constants
│   └── assets/             # Static assets
├── routes/                 # SvelteKit file-based routing
├── posts/                  # MDSvex blog posts (.svx files)
└── app.css                 # Global styles with CSS variables
```

## Naming Conventions

- **Files**: kebab-case (e.g., `blog-post-card.svelte`)
- **Components**: PascalCase (e.g., `BlogPostCard`)
- **Variables**: camelCase (e.g., `colorScheme`)
- **CSS Variables**: kebab-case with prefixes (e.g., `--blog-card-bg`)
- **Types**: PascalCase (e.g., `ColorScheme`)

## Component Architecture

- Use Svelte 5 syntax with `$props()`, `$state()`, `$derived()`
- CSS variables for theming instead of hardcoded Tailwind classes
- Export interfaces for component props when needed
- Prefer composition over large monolithic components

## Theme System

- All colors managed through CSS variables in `app.css`
- Light theme defined in `:root`
- Dark theme defined in `.dark` selector
- Components use `var(--variable-name)` instead of hardcoded colors
