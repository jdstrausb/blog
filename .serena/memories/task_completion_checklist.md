# Task Completion Checklist

When completing any coding task, follow this checklist to ensure code quality and consistency:

## 1. Code Quality

### Type Checking
```bash
npm run check
```
- [ ] No TypeScript errors
- [ ] No Svelte component errors
- [ ] All props properly typed
- [ ] Return types explicit for complex functions

### Linting
```bash
npm run lint
```
- [ ] No ESLint errors or warnings
- [ ] No Prettier formatting issues
- [ ] Code follows project style conventions

### Formatting
```bash
npm run format
```
- [ ] All files formatted with Prettier
- [ ] Consistent indentation (4 spaces)
- [ ] Trailing commas removed
- [ ] Print width under 100 characters

## 2. Testing

### Manual Testing
- [ ] Run dev server and test changes: `npm run dev`
- [ ] Test on different screen sizes (mobile, tablet, desktop)
- [ ] Test in dark mode (if applicable)
- [ ] Verify no console errors in browser
- [ ] Check browser Network tab for errors

### Build Testing
```bash
npm run build
npm run preview
```
- [ ] Production build succeeds without errors
- [ ] Preview server runs correctly
- [ ] All functionality works in production build

### Cross-Browser Testing (if UI changes)
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, macOS)
- [ ] Edge (latest)

## 3. Component-Specific Checks

### For Svelte Components
- [ ] Props properly defined with `$props()`
- [ ] Reactive state uses `$state()` rune
- [ ] Computed values use `$derived()` rune
- [ ] Side effects use `$effect()` rune
- [ ] Event handlers properly bound
- [ ] Accessibility attributes present (aria-*, role, alt text)
- [ ] Semantic HTML used
- [ ] Component exports added to `src/lib/index.ts` (if reusable)

### For Server-Side Code
- [ ] Proper error handling with SvelteKit's `error()` function
- [ ] Server-only code in `.server.ts` files
- [ ] Database queries use Drizzle ORM properly
- [ ] Environment variables accessed safely
- [ ] Proper validation of user input

### For Blog Posts (.svx files)
- [ ] Front matter includes all required fields
- [ ] Featured image path correct (if used)
- [ ] Tags are relevant and consistent
- [ ] Post slug is URL-friendly
- [ ] No broken markdown syntax
- [ ] Images have alt text

## 4. Styling

### TailwindCSS
- [ ] Only utility classes used (minimal custom CSS)
- [ ] Responsive classes applied (`sm:`, `md:`, `lg:`, `xl:`)
- [ ] Mobile-first approach followed
- [ ] CSS variables used for theme colors
- [ ] Dark mode supported (if applicable)

### Visual Testing
- [ ] Layout looks correct at all breakpoints
- [ ] No overflow issues
- [ ] Proper spacing and alignment
- [ ] Typography hierarchy clear
- [ ] Color contrast sufficient (WCAG AA)

## 5. Performance

### Image Optimization
- [ ] Use `enhanced:img` for static images
- [ ] Lazy loading enabled where appropriate
- [ ] Proper image formats (WebP, AVIF)
- [ ] Responsive images with srcset

### Code Optimization
- [ ] No unnecessary dependencies imported
- [ ] Heavy computations moved server-side
- [ ] Minimal client-side JavaScript
- [ ] Code splitting used where beneficial

## 6. Database Changes (if applicable)

### Schema Updates
- [ ] Schema changes in `src/lib/server/db/schema.ts`
- [ ] Migration generated: `npm run db:generate`
- [ ] Migration tested locally: `npm run db:migrate`
- [ ] Type exports updated if needed

### Data Validation
- [ ] Input validation before database writes
- [ ] Proper constraints in schema (NOT NULL, UNIQUE, etc.)
- [ ] Indexes added for frequently queried columns

## 7. Documentation

### Code Documentation
- [ ] Complex logic commented
- [ ] JSDoc for public APIs
- [ ] TODOs include context and assignee

### Project Documentation
- [ ] Update relevant `.md` files in `docs/` (if major feature)
- [ ] Update README if setup steps changed
- [ ] Update memory files if architecture changed

## 8. Accessibility

### WCAG Compliance
- [ ] Semantic HTML structure
- [ ] Proper heading hierarchy (single H1, etc.)
- [ ] Alt text for images
- [ ] ARIA labels for icon buttons
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA (4.5:1 for text)

### Screen Reader Testing
- [ ] Test with VoiceOver (macOS) or NVDA (Windows)
- [ ] Ensure content reads in logical order
- [ ] Form labels properly associated

## 9. Version Control

### Git Workflow
- [ ] Changes committed with clear message
- [ ] Commit message follows convention (if any)
- [ ] No sensitive data in commits (.env not committed)
- [ ] Branch up to date with main (if using branches)

### Before Pushing
- [ ] All tests pass
- [ ] Build succeeds
- [ ] No debug code left in (console.log, debugger, etc.)

## 10. Deployment Readiness (for major changes)

### Environment Variables
- [ ] `.env.example` updated if new vars added
- [ ] Production environment variables configured
- [ ] No hardcoded secrets or API keys

### Build Configuration
- [ ] Adapter configuration correct (`@sveltejs/adapter-node`)
- [ ] Output directory properly configured
- [ ] Static files copied to `static/`

## Quick Pre-Push Checklist

Before pushing code, run these commands:

```bash
npm run format          # Format code
npm run lint           # Check linting
npm run check          # Type check
npm run build          # Test production build
```

All should pass without errors.

## Post-Deployment Verification

After deploying to production:
- [ ] Site loads without errors
- [ ] All pages accessible
- [ ] Database connection working
- [ ] Email functionality working (if used)
- [ ] Images loading correctly
- [ ] No 404 errors in browser console