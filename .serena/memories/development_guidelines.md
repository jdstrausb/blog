# Development Guidelines

## Design Patterns & Best Practices

### Svelte 5 Patterns

- Use `$props()` for component properties with TypeScript interfaces
- Use `$state()` for reactive local component state
- Use `$derived()` for computed values
- Use `$effect()` for side effects and cleanup
- Prefer `$inspect()` for debugging reactive values

### Theme-Aware Development

- **Always use CSS variables** instead of hardcoded Tailwind colors
- Test components in both light and dark themes
- Use semantic variable names (e.g., `--text-color` not `--gray-900`)
- Group related variables by component or feature

### Component Development

- Create TypeScript interfaces for complex props
- Use composition over inheritance
- Keep components focused and single-purpose
- Export reusable types from component files when needed

### MDSvex Content Guidelines

- Include proper frontmatter metadata in all `.svx` files
- Use consistent date formats (YYYY-MM-DD)
- Include reading time estimates
- Tag posts appropriately for filtering
- Test interactive Svelte components within posts

## File Organization

```
src/lib/components/
├── blog/                   # Blog-specific components
│   ├── BlogLayout.svelte   # Main blog post layout
│   ├── BlogPostCard.svelte # Post preview cards
│   ├── CodeBlock.svelte    # Syntax highlighted code
│   └── TableOfContents.svelte
├── Header.svelte           # Site header with navigation
├── ThemeToggle.svelte      # Theme switching component
└── ShareWidget.svelte      # Social sharing component
```

## Performance Considerations

- Use `@sveltejs/enhanced-img` for automatic image optimization
- Lazy load components when appropriate
- Minimize CSS-in-JS usage, prefer CSS variables
- Test build output size after significant changes

## Security Guidelines

- Never commit secrets or API keys
- Use environment variables for sensitive configuration
- Validate user inputs on both client and server
- Follow OWASP guidelines for web security

## Testing Strategy

- Run type checking with `npm run check` frequently
- Test theme switching manually after UI changes
- Verify responsive design on different screen sizes
- Test MDSvex rendering with various content types
- Ensure database operations work correctly
