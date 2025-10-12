# Development Guidelines

## General Principles

### 1. Svelte 5 First
- Use Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) instead of legacy reactive syntax
- Avoid `$:` reactive declarations (use `$derived` instead)
- Avoid `export let` for props (use `$props()` instead)
- Use `$effect()` for side effects instead of lifecycle hooks

### 2. Type Safety
- Enable strict TypeScript mode (already configured)
- Define interfaces for all component props
- Type function parameters and return values
- Avoid `any` type unless absolutely necessary
- Use Drizzle's type inference for database queries

### 3. Server vs Client Code
- **Server-only**: Use `.server.ts` suffix (e.g., `posts.server.ts`)
- **Client-only**: Use `.client.ts` suffix (e.g., `enhanced-images.client.ts`)
- Keep database access server-side only
- Keep DOM manipulation client-side only

### 4. Component Design
- Small, focused, single-responsibility components
- Props over global state when possible
- Compose complex UIs from simple components
- Use slots for flexible content projection

### 5. Performance First
- Minimize client-side JavaScript
- Leverage SSR for SEO and initial load speed
- Use enhanced images for optimization
- Lazy load heavy components when possible
- Profile before optimizing (avoid premature optimization)

## SvelteKit Specific Guidelines

### Routing

#### File Naming
- Use `+page.svelte` for page components
- Use `+page.server.ts` for server-side data loading
- Use `+layout.svelte` for layout wrappers
- Use `+layout.server.ts` for layout data loading
- Use `+server.ts` for API endpoints

#### Dynamic Routes
```
blog/[slug]/           # Single parameter
blog/[...slug]/        # Catch-all (multiple segments)
blog/[[optional]]/     # Optional parameter
```

#### Load Functions
**Server Load** (`+page.server.ts`):
```typescript
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  // Database queries, API calls, etc.
  return { data };
};
```

**Universal Load** (`+page.ts`):
```typescript
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, data }) => {
  // Runs on server AND client
  return { clientData };
};
```

**Prefer server load** when:
- Accessing database
- Using private API keys
- Sensitive data processing

### Data Loading Patterns

#### Pattern 1: Server-Side Data Loading
```typescript
// +page.server.ts
export const load = async () => {
  const posts = await getPosts();
  return { posts };
};

// +page.svelte
<script lang="ts">
  let { data } = $props();
</script>

{#each data.posts as post}
  <!-- render post -->
{/each}
```

#### Pattern 2: Dependent Loads
```typescript
// +layout.server.ts (parent)
export const load = async () => {
  return { user: getUser() };
};

// +page.server.ts (child)
export const load = async ({ parent }) => {
  const { user } = await parent();
  return { posts: getPostsForUser(user) };
};
```

### Form Actions

For form submissions:
```typescript
// +page.server.ts
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');
    
    // Validation
    if (!email) {
      return { error: 'Email required' };
    }
    
    // Process
    await saveEmail(email);
    return { success: true };
  }
};
```

## MDsveX Guidelines

### Front Matter Structure
Always include required metadata:
```yaml
---
title: "Post Title"
summary: "Brief description for previews and SEO"
author: "Author Name"
publishedAt: "2025-01-01T00:00:00.000Z"  # ISO 8601 format
updatedAt: "2025-01-15T00:00:00.000Z"    # Optional
tags: ["tag1", "tag2"]
featuredImage: "/path/to/image.jpg"      # Optional
slug: "post-slug"                         # Auto-generated from filename
---
```

### Using Svelte Components in MDX
```svelte
<script>
  import Tip from '$lib/components/blog/Tip.svelte';
  import CodeBlock from '$lib/components/blog/CodeBlock.svelte';
</script>

Regular markdown content...

<Tip type="info">
  This is a tip with **markdown** inside!
</Tip>

More markdown...
```

### Code Blocks
Code blocks automatically use the `CodeBlock` component:
````markdown
```typescript
const example = 'This will be highlighted';
```
````

The mdsvex config converts this to:
```svelte
<CodeBlock code={`...`} language="typescript" />
```

### Images in MDX
Prefer relative paths from the post file:
```markdown
![Alt text](../../lib/assets/images/posts/example.png)
```

Or use the enhanced image import:
```svelte
<script>
  import image from '$lib/assets/images/example.png';
</script>

<enhanced:img src={image} alt="Description" />
```

## Styling Guidelines

### TailwindCSS Best Practices

#### Use Utility Classes
```svelte
<!-- Good -->
<div class="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
  ...
</div>

<!-- Avoid custom CSS when utilities work -->
<style>
  .my-custom-class {
    display: flex;
    align-items: center;
    /* ... */
  }
</style>
```

#### Responsive Design (Mobile-First)
```svelte
<!-- Mobile: stack vertically, Desktop: horizontal -->
<div class="flex flex-col md:flex-row">
  <div class="w-full md:w-1/2">Left</div>
  <div class="w-full md:w-1/2">Right</div>
</div>
```

Breakpoints:
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px
- `2xl:` - 1536px

#### Use CSS Variables for Theming
```css
/* app.css */
:root {
  --v-bg: #ffffff;
  --v-text: #1a1a1a;
}

.dark {
  --v-bg: #1a1a1a;
  --v-text: #ffffff;
}
```

```svelte
<!-- Component uses CSS variables automatically -->
<div class="bg-[var(--v-bg)] text-[var(--v-text)]">
  Content
</div>
```

### Component Styling

#### Scoped Styles
```svelte
<style>
  /* Scoped to this component */
  h1 {
    font-size: 2rem;
  }
</style>
```

#### Global Styles
Only in `app.css` or layouts:
```css
/* app.css */
:global(body) {
  font-family: sans-serif;
}
```

## State Management

### Local Component State
```svelte
<script lang="ts">
  let count = $state(0);
  
  function increment() {
    count++;
  }
</script>

<button onclick={increment}>
  Count: {count}
</button>
```

### Derived State
```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>

<p>Count: {count}, Doubled: {doubled}</p>
```

### Effects
```svelte
<script lang="ts">
  let count = $state(0);
  
  $effect(() => {
    console.log('Count changed:', count);
    // Cleanup function (optional)
    return () => {
      console.log('Cleaning up');
    };
  });
</script>
```

### Shared State (Module Context State)
```typescript
// theme.svelte.ts
function createTheme() {
  let theme = $state<'light' | 'dark'>('light');
  
  return {
    get value() { return theme; },
    toggle() { theme = theme === 'light' ? 'dark' : 'light'; }
  };
}

export const themeStore = createTheme();
```

```svelte
<!-- Any component -->
<script>
  import { themeStore } from '$lib/theme.svelte';
</script>

<button onclick={() => themeStore.toggle()}>
  Current: {themeStore.value}
</button>
```

## Database Guidelines

### Schema Definition
```typescript
// src/lib/server/db/schema.ts
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

### Querying
```typescript
// Server-side only (.server.ts)
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Select
const allPosts = await db.select().from(posts);

// Filter
const post = await db.select()
  .from(posts)
  .where(eq(posts.slug, 'example-slug'));

// Insert
await db.insert(posts).values({
  title: 'New Post',
  slug: 'new-post',
  created_at: new Date()
});
```

### Migrations
```bash
# Generate migration from schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Open database GUI
npm run db:studio
```

## Error Handling

### Server-Side Errors
```typescript
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
  const post = await getPost(params.slug);
  
  if (!post) {
    throw error(404, 'Post not found');
  }
  
  return { post };
};
```

### Client-Side Errors
```svelte
<script lang="ts">
  async function handleSubmit() {
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Submission failed');
      }
      
      // Success
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  }
</script>
```

## Testing Guidelines

### Manual Testing
1. Run dev server: `npm run dev`
2. Test in multiple browsers (Chrome, Firefox, Safari)
3. Test responsive breakpoints (mobile, tablet, desktop)
4. Test dark mode (if applicable)
5. Check browser console for errors
6. Verify network requests (DevTools → Network tab)

### Build Testing
```bash
npm run build
npm run preview
```
Test production build locally before deploying.

### Type Checking
```bash
npm run check
```
Run before every commit to catch type errors.

## Accessibility Guidelines

### Semantic HTML
```svelte
<!-- Good -->
<article>
  <header>
    <h1>Title</h1>
  </header>
  <section>Content</section>
</article>

<!-- Avoid -->
<div>
  <div>
    <div class="title">Title</div>
  </div>
  <div>Content</div>
</div>
```

### ARIA Attributes
```svelte
<!-- Icon button needs label -->
<button aria-label="Toggle theme">
  <svg>...</svg>
</button>

<!-- Image has alt text -->
<img src="..." alt="Descriptive text" />

<!-- Skip link for keyboard users -->
<a href="#main-content" class="sr-only focus:not-sr-only">
  Skip to content
</a>
```

### Keyboard Navigation
- Ensure all interactive elements are focusable
- Visible focus indicators
- Logical tab order
- Test with keyboard only (Tab, Enter, Space, Arrow keys)

### Color Contrast
- Text: 4.5:1 contrast ratio (WCAG AA)
- Large text: 3:1 contrast ratio
- Test with browser dev tools or online contrast checkers

## Git Workflow

### Commit Messages
```bash
# Good commit messages
git commit -m "Add feedback widget component"
git commit -m "Fix: Resolve mobile layout overflow"
git commit -m "Refactor: Extract post loading logic"

# Avoid vague messages
git commit -m "Update stuff"
git commit -m "Fix bug"
```

### Before Committing
```bash
npm run format      # Format code
npm run lint        # Check linting
npm run check       # Type check
npm run build       # Test build
```

### Branches (if used)
```bash
# Feature branch
git checkout -b feature/feedback-system

# Bug fix branch
git checkout -b fix/mobile-overflow

# After completion, merge to main
git checkout main
git merge feature/feedback-system
```

## Common Patterns

### Loading States
```svelte
<script lang="ts">
  let loading = $state(false);
  
  async function load() {
    loading = true;
    try {
      await fetchData();
    } finally {
      loading = false;
    }
  }
</script>

{#if loading}
  <p>Loading...</p>
{:else}
  <p>Content</p>
{/if}
```

### Conditional Rendering
```svelte
{#if condition}
  <p>True</p>
{:else if otherCondition}
  <p>Other</p>
{:else}
  <p>False</p>
{/if}
```

### Iterating Arrays
```svelte
{#each items as item, index (item.id)}
  <div>
    {index}: {item.name}
  </div>
{:else}
  <p>No items</p>
{/each}
```

### Event Handling
```svelte
<button onclick={handleClick}>Click</button>
<input oninput={(e) => handleInput(e.target.value)} />
<form onsubmit={handleSubmit}>...</form>
```

## Debugging Tips

### Server-Side Debugging
```typescript
console.log('Debug:', data); // Logs to terminal
```

### Client-Side Debugging
```svelte
<script>
  console.log('Debug:', data); // Logs to browser console
</script>
```

### TypeScript Errors
```bash
npm run check  # See all type errors
```

### Hot Reload Not Working
- Check for syntax errors
- Restart dev server: `Ctrl+C` → `npm run dev`
- Clear `.svelte-kit` directory: `rm -rf .svelte-kit`