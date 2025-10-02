# Task Completion Checklist

## Before Committing Changes

### 1. Code Quality Checks

```bash
npm run check               # Ensure no TypeScript errors
npm run lint                # Check code style and ESLint rules
npm run format              # Format code with Prettier
```

### 2. Build Verification

```bash
npm run build               # Ensure production build succeeds
```

### 3. Development Testing

```bash
npm run dev                 # Test in development mode
# Manually verify:
# - Theme switching works (light/dark/system)
# - No console errors
# - Responsive design works
# - MDSvex posts render correctly
```

### 4. Database Changes (if applicable)

```bash
npm run db:push             # Push schema changes
npm run db:generate         # Generate migrations if needed
```

## Quality Standards

- **Zero TypeScript errors**: All code must pass `npm run check`
- **Clean formatting**: Code must pass `npm run lint`
- **No console errors**: Development server should run without errors
- **Theme compatibility**: Components must work in both light and dark themes
- **Responsive design**: Test on different screen sizes

## Git Workflow

1. Stage changes: `git add .`
2. Commit with descriptive message: `git commit -m "descriptive message"`
3. Push to repository: `git push`

## Common Issues to Check

- Ensure CSS variables are used instead of hardcoded Tailwind classes
- Verify event handlers use proper Svelte syntax (functions, not strings)
- Check that new components follow the established naming conventions
- Ensure MDSvex files have proper frontmatter metadata
- Test theme switching functionality after UI changes
