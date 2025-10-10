# Code Style Conventions

## General Formatting (Prettier)

### Configuration (`.prettierrc`)
- **No Tabs**: Use spaces (4 spaces per indent)
- **Tab Width**: 4 spaces
- **Single Quotes**: Prefer `'string'` over `"string"`
- **Trailing Commas**: None
- **Print Width**: 100 characters max per line
- **Plugins**: 
  - `prettier-plugin-svelte` - Svelte formatting
  - `prettier-plugin-tailwindcss` - Auto-sort Tailwind classes

### File Type Specific
- `.svelte` files use Svelte parser
- Tailwind classes follow class ordering from `app.css` stylesheet

## TypeScript Configuration

### Compiler Options (`tsconfig.json`)
- **Strict Mode**: Enabled (`"strict": true`)
- **Allow JS**: `true` (for JS files in project)
- **Check JS**: `true` (type check JS files)
- **Module Resolution**: `bundler`
- **ES Module Interop**: `true`
- **Source Maps**: Enabled
- **Skip Lib Check**: `true`

### Type Safety
- Always use explicit types for function parameters
- Avoid `any` type unless absolutely necessary
- Use TypeScript interfaces for component props
- Type server-side functions with proper return types

## Svelte Conventions

### Component Structure
1. Script tag (`<script lang="ts">`) at top
2. Markup in middle
3. Style tag (`<style>`) at bottom (if needed)

### Svelte 5 Runes
This project uses Svelte 5 with runes:
- Use `$state()` for reactive state
- Use `$derived()` for computed values
- Use `$effect()` for side effects
- Use `$props()` for component props

### Props Pattern
```typescript
interface Props {
    title: string;
    optional?: number;
}

let { title, optional = 0 }: Props = $props();
```

### Naming Conventions
- **Components**: PascalCase (e.g., `BlogLayout.svelte`, `CodeBlock.svelte`)
- **Utilities**: camelCase (e.g., `posts.server.ts`)
- **Server-only files**: Include `.server.ts` suffix
- **Client-only files**: Include `.client.ts` suffix

## File Organization

### Route Structure
- Use SvelteKit's file-based routing
- `+page.svelte` - Page component
- `+page.server.ts` - Server-side page load
- `+layout.svelte` - Layout wrapper
- `+layout.server.ts` - Server-side layout load

### Component Organization
- Place reusable components in `src/lib/components/`
- Blog-specific components in `src/lib/components/blog/`
- Export from `src/lib/index.ts` for easy imports

### Utility Functions
- Server-only utils in `src/lib/utils/*.server.ts`
- Client-only utils in `src/lib/utils/*.client.ts`
- Shared utils without suffix

## Styling

### TailwindCSS Usage
- Prefer Tailwind utility classes over custom CSS
- Use CSS variables for theme colors (defined in `app.css`)
- Follow mobile-first responsive design (`sm:`, `md:`, `lg:`, `xl:`)
- Use `@apply` sparingly (prefer utilities in markup)

### CSS Variables
- Theme variables use `--v-` prefix (e.g., `--v-bg`, `--v-text-muted`)
- Component-specific variables use semantic names
- Define in `:root` selector in `app.css`

### Dark Mode
- Use CSS variables that adjust with theme
- Avoid hard-coded colors

## ESLint Rules

### Configuration (`eslint.config.js`)
- Extends recommended configs for JS, TypeScript, and Svelte
- **Disabled Rules**:
  - `no-undef` - Off for TypeScript files (TS handles this)
- **Svelte-specific**: Uses `typescript-eslint` parser for `.svelte` files

### Best Practices
- No unused variables
- Consistent return types
- Proper async/await usage
- No console.log in production (allowed in dev)

## Imports

### Import Order (Recommended)
1. External packages (e.g., `svelte`, `@sveltejs/kit`)
2. Internal `$lib` imports
3. Relative imports (`./`, `../`)
4. Type imports (if separate)

### Aliases
- `$lib` → `src/lib`
- `$posts` → `src/posts`

## MDsveX Conventions

### Front Matter
Use YAML front matter at top of `.svx` files:
```yaml
---
title: "Post Title"
summary: "Brief description"
author: "Author Name"
publishedAt: "2025-01-01T00:00:00.000Z"
tags: ["tag1", "tag2"]
featuredImage: "/path/to/image.jpg"
---
```

### Component Usage in Markdown
```svelte
<script>
  import ComponentName from '$lib/components/ComponentName.svelte';
</script>

<!-- Use component in markdown -->
<ComponentName prop="value" />
```

### Code Blocks
Use triple backticks with language identifier:
````markdown
```typescript
const example = 'code';
```
````

This automatically uses the custom `CodeBlock` component for syntax highlighting.

## Comments

### When to Comment
- Complex algorithms or business logic
- Non-obvious workarounds
- TODOs with context
- API documentation for exported functions

### JSDoc for Public APIs
```typescript
/**
 * Loads all blog posts from the posts directory
 * @returns Array of blog posts with metadata
 */
export function getPosts(): BlogPost[] {
  // implementation
}
```

## Database (Drizzle ORM)

### Schema Conventions
- Use `snake_case` for database column names
- Use `camelCase` for TypeScript property names
- Define schema in `src/lib/server/db/schema.ts`
- Export table definitions and types

### Example Pattern
```typescript
export const post = sqliteTable('post', {
  id: integer('id').primaryKey(),
  created_at: integer('created_at').notNull()
});

export type Post = typeof post.$inferSelect;
```

## Error Handling

### Server-Side
- Use `throw error(statusCode, message)` from `@sveltejs/kit`
- Log errors for debugging
- Return user-friendly error messages

### Client-Side
- Use try/catch for async operations
- Show user feedback for errors
- Gracefully degrade features if needed

## Performance Considerations

- Use `enhanced:img` for images when possible
- Lazy load components not needed immediately
- Minimize client-side JavaScript
- Prefer server-side rendering for SEO
- Use SvelteKit's built-in optimizations