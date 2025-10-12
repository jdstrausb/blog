# Avatar with Superellipse Shape - Technical Specification

## Document Overview

This technical specification provides implementation guidance for creating an avatar component with experimental CSS superellipse shape support and updating the About page with real avatar imagery and FontAwesome social media icons.

## Architecture Overview

### Component Structure
```
src/lib/components/ui/Avatar.svelte (NEW)
src/routes/about/+page.svelte (MODIFIED)
```

### Dependencies
- **SvelteKit Enhanced Images** - Already configured in vite.config.ts via `@sveltejs/enhanced-img`
- **Svelte 5 Runes** - Use `$props()` for component props
- **TailwindCSS** - For base styling and responsive layout
- **CSS @supports** - For progressive enhancement of superellipse feature

### Integration Points
1. **Enhanced Images System** - Avatar component will use the same pattern as BlogLayout.svelte for enhanced image loading
2. **Theme System** - Social icon hover effects must work in both light and dark modes (defined in app.css)
3. **Responsive Layout** - Maintain existing About page responsive breakpoints (md:)

## Implementation Steps

### Step 1: Create Avatar Component Structure

**Location:** `src/lib/components/ui/Avatar.svelte`

**Directory Creation:**
- First create the `ui` directory at `src/lib/components/ui/` (this directory does not currently exist)

**Component Requirements:**

1. **Props Interface:**
   - `src`: string (required) - Path to avatar image
   - `alt`: string (required) - Alt text for accessibility
   - `size`: number (optional, default: 192) - Size in pixels for height and width
   - `class`: string (optional, default: '') - Additional CSS classes

2. **Script Section Structure:**
   - Import statement for Svelte's $props rune (built-in, no import needed)
   - Define Props interface using TypeScript
   - Destructure props using `let { src, alt, size = 192, class: className = '' }: Props = $props();`
   - Calculate dynamic inline styles for width and height based on size prop

3. **Markup Section:**
   - Use `<enhanced:img>` for the avatar image source
   - Apply dynamic width/height via inline styles
   - Include a wrapper div for shape clipping
   - Add appropriate classes for styling
   - Use the `class` prop to allow parent components to add additional styles

4. **Style Section:**
   - Implement CSS `@supports` feature detection for superellipse
   - Define two CSS classes: one for superellipse support, one for fallback
   - Use scoped styles (within `<style>` tag)

**CSS Implementation Details:**

The style section must implement progressive enhancement:

**For Browsers Supporting Superellipse:**
- Use `@supports (clip-path: superellipse(5))` to detect support
- Apply `clip-path: superellipse(5);` where 5 is the starting curvature parameter
- Note: The value 5 creates a square with moderately curved corners (higher than 4 which approximates a circle)

**For Browsers Without Superellipse Support:**
- Use `@supports not (clip-path: superellipse(5))` for fallback
- Apply `border-radius: 9999px;` (equivalent to TailwindCSS `rounded-full`)

**Additional Style Considerations:**
- Set `overflow: hidden;` on the wrapper to ensure image clipping works
- Use `display: block;` on the image element
- Set `width: 100%;` and `height: 100%;` on the image
- Apply `object-fit: cover;` to maintain aspect ratio

5. **JSDoc Documentation:**
   - Add JSDoc comment block above the component describing its purpose
   - Document each prop with `@prop` tags
   - Include usage example in the doc comment
   - Note browser compatibility for superellipse feature

### Step 2: Update About Page - Avatar Section

**Location:** `src/routes/about/+page.svelte`

**Changes to Script Section:**

1. Add import statement for the new Avatar component:
   - Import from `$lib/components/ui/Avatar.svelte`

2. Add import statement for the avatar image:
   - Import the image file: `import avatarImage from '$lib/assets/images/jamie-strausbaugh.png';`
   - Note: The image currently exists at `/static/authors/jamie-strausbaugh.png` and needs to be moved to `src/lib/assets/images/` directory for enhanced image processing

**Directory and File Operations Required:**

1. Create `src/lib/assets/images/` directory if it doesn't exist
2. Move `static/authors/jamie-strausbaugh.png` to `src/lib/assets/images/jamie-strausbaugh.png`
3. Verify the file has been moved successfully

**Changes to Markup Section:**

1. Locate the avatar placeholder div (currently lines 11-18 in the file)
2. Replace the entire placeholder div structure with the Avatar component
3. Pass the following props to Avatar component:
   - `src={avatarImage}`
   - `alt="Jamie Strausbaugh"`
   - No size prop needed (will use default 192px which matches h-48 w-48)
   - No additional class prop needed

4. Keep the parent wrapper div with existing classes:
   - `class="flex w-full justify-center md:w-1/3 md:justify-start"`
   - This maintains responsive layout (centered on mobile, left-aligned on medium+ screens)

### Step 3: Update About Page - Social Media Links

**Location:** `src/routes/about/+page.svelte`

**Section to Modify:** Lines 34-104 (Social Media Links section)

**Changes Required for Each Link:**

**LinkedIn Link (currently lines 35-59):**

1. Update `href` attribute from `"#"` to `"https://www.linkedin.com/in/jamiestrausbaugh"`
2. Add `target="_blank"` attribute
3. Add `rel="noopener noreferrer"` attribute for security
4. Keep existing `aria-label="LinkedIn Profile"`
5. Update `class` attribute on the `<a>` tag:
   - Remove: `text-gray-500 transition hover:text-indigo-600`
   - Add: `social-icon` (for custom hover styling)
   - Keep: `p-2` (padding)
6. Replace the entire `<svg>` element with the LinkedIn FontAwesome SVG from requirements
7. On the replacement SVG element:
   - Add `class="h-6 w-6"` (maintains 24px x 24px size)
   - Add `fill="currentColor"` attribute (inherit text color for theme compatibility)
   - Remove stroke-related attributes from the provided FontAwesome SVG
   - Keep the `viewBox="0 0 640 640"` from FontAwesome version

**GitHub Link (currently lines 60-80):**

1. Update `href` attribute from `"#"` to `"https://github.com/Jamoverjelly"`
2. Add `target="_blank"` attribute
3. Add `rel="noopener noreferrer"` attribute
4. Keep existing `aria-label="GitHub Profile"`
5. Update `class` attribute on the `<a>` tag:
   - Remove: `text-gray-500 transition hover:text-indigo-600`
   - Add: `social-icon`
   - Keep: `p-2`
6. Replace the entire `<svg>` element with the GitHub FontAwesome SVG from requirements
7. On the replacement SVG element:
   - Add `class="h-6 w-6"`
   - Add `fill="currentColor"` attribute
   - Remove stroke-related attributes
   - Keep the `viewBox="0 0 640 640"` from FontAwesome version

**BlueSky Link (currently lines 81-104):**

1. Update `href` attribute from `"#"` to `"https://bsky.app/profile/jstrausb.bsky.social"`
2. Add `target="_blank"` attribute
3. Add `rel="noopener noreferrer"` attribute
4. Keep existing `aria-label="BlueSky Profile"`
5. Update `class` attribute on the `<a>` tag:
   - Remove: `text-gray-500 transition hover:text-indigo-600`
   - Add: `social-icon`
   - Keep: `p-2`
6. Replace the entire `<svg>` element with the BlueSky FontAwesome SVG from requirements
7. On the replacement SVG element:
   - Add `class="h-6 w-6"`
   - Add `fill="currentColor"` attribute
   - Remove stroke-related attributes
   - Keep the `viewBox="0 0 640 640"` from FontAwesome version

### Step 4: Add Social Icon Hover Styles

**Location:** `src/routes/about/+page.svelte`

**Style Section Addition:**

Add a `<style>` section at the bottom of the component (after the closing `</div>` of markup) if it doesn't exist.

**CSS Rules to Add:**

1. **Base Social Icon Styling:**
   - Selector: `.social-icon`
   - Properties:
     - `color: var(--v-text-muted);` - Use theme-aware muted text color (defined in app.css)
     - `transition: all 0.3s ease;` - Smooth transition for hover effects

2. **Hover State Styling:**
   - Selector: `.social-icon:hover`
   - Properties:
     - `filter: drop-shadow(0 0 0.75rem #196f82);` - Teal drop shadow as specified in requirements
     - `color: var(--v-primary);` - Change to primary theme color on hover

**Important Notes:**
- The color `#196f82` is a hardcoded teal that should be visible in both light and dark modes
- The `var(--v-text-muted)` and `var(--v-primary)` CSS variables are already defined in `src/app.css`
- These variables automatically adjust for dark mode via the `.dark` class selector

### Step 5: Enhanced Images Configuration

**Verification Steps:**

The project already has enhanced images configured. Verify the following:

1. **Vite Config (vite.config.ts):**
   - Contains `enhancedImages()` plugin - VERIFIED (line 7)
   - No changes needed

2. **Enhanced Images Client Utility (src/lib/utils/enhanced-images.client.ts):**
   - Already exists and uses `import.meta.glob` pattern
   - Glob pattern: `/src/lib/assets/images/**/*.{avif,gif,jpeg,jpg,png,webp}`
   - This matches our avatar image location after moving it

3. **No Server-Side Configuration Needed:**
   - Unlike BlogLayout.svelte which uses `getEnhancedImage()` utility for runtime resolution
   - Avatar component can use direct `enhanced:img` syntax since the import is static

**How Enhanced Images Work in This Context:**

When you write:
```svelte
import avatarImage from '$lib/assets/images/jamie-strausbaugh.png';
```

And then use:
```svelte
<enhanced:img src={avatarImage} alt="..." />
```

The `@sveltejs/enhanced-img` plugin automatically:
1. Generates multiple image formats (WebP, AVIF, original PNG)
2. Creates multiple sizes for responsive loading
3. Adds lazy loading attributes
4. Optimizes image compression
5. Returns a Picture element with source sets

**No additional configuration needed** - the system is already set up.

### Step 6: TypeScript Type Definitions

**For Avatar Component:**

The component uses standard TypeScript interface for props. No separate `.d.ts` file needed since types are defined inline.

**Type Safety Checklist:**
- Props interface uses TypeScript syntax
- Optional props have default values
- Required props are enforced by TypeScript compiler
- Image import will be typed by Vite's module resolution

**For About Page:**

No type changes needed. The page already uses TypeScript (`<script lang="ts">`).

## File Operations Summary

### Files to Create:
1. `src/lib/components/ui/` directory
2. `src/lib/components/ui/Avatar.svelte` - New component file
3. `src/lib/assets/images/` directory (if not exists)

### Files to Move:
1. Move `static/authors/jamie-strausbaugh.png` → `src/lib/assets/images/jamie-strausbaugh.png`

### Files to Modify:
1. `src/routes/about/+page.svelte` - Update avatar section and social links

### Files to Verify (No Changes):
1. `vite.config.ts` - Enhanced images plugin present
2. `src/app.css` - CSS variables defined
3. `src/lib/utils/enhanced-images.client.ts` - Client utility exists

## Testing & Validation Checklist

### Functional Testing:

**Avatar Display:**
- [ ] Avatar image loads successfully on About page
- [ ] Image maintains 192px x 192px dimensions
- [ ] Image is responsive on mobile (centered), tablet, and desktop (left-aligned)
- [ ] No layout shift occurs during image load
- [ ] Image has proper alt text for screen readers

**Superellipse Shape:**
- [ ] Chrome/Edge browsers display squircle shape (use DevTools to inspect clip-path)
- [ ] Firefox displays circular fallback (rounded-full)
- [ ] Safari displays circular fallback (rounded-full)
- [ ] No console errors related to CSS in any browser
- [ ] Shape is smooth without jagged edges

**Social Media Links:**
- [ ] LinkedIn link opens correct URL in new tab
- [ ] GitHub link opens correct URL in new tab
- [ ] BlueSky link opens correct URL in new tab
- [ ] All links have `rel="noopener noreferrer"` for security
- [ ] Icons are visible and properly sized (24px x 24px)

**Hover Effects:**
- [ ] Icons show teal drop shadow on hover in light mode
- [ ] Icons show teal drop shadow on hover in dark mode
- [ ] Drop shadow is clearly visible against both backgrounds
- [ ] Transition animation is smooth (0.3s ease)
- [ ] Icons change color on hover (to primary theme color)

**Accessibility:**
- [ ] All links have descriptive aria-labels
- [ ] Avatar image has meaningful alt text
- [ ] Social links are keyboard navigable (tab through them)
- [ ] Focus indicators are visible on keyboard navigation
- [ ] Screen reader announces link purposes correctly

### Performance Testing:

- [ ] Image loads with lazy loading (check Network tab)
- [ ] Multiple image formats generated (WebP, AVIF, PNG)
- [ ] No unnecessary re-renders of Avatar component
- [ ] Page load time remains acceptable (<2s on 3G)
- [ ] No layout shift (check Lighthouse CLS score)

### Browser Compatibility Testing:

Test in the following browsers:
- [ ] Chrome (latest) - Should show superellipse
- [ ] Firefox (latest) - Should show circle fallback
- [ ] Safari (latest) - Should show circle fallback
- [ ] Edge (latest) - Should show superellipse
- [ ] Mobile Safari (iOS) - Should show circle fallback
- [ ] Mobile Chrome (Android) - Should show superellipse

### Code Quality:

- [ ] TypeScript compiles without errors (`npm run check`)
- [ ] ESLint passes without errors (`npm run lint`)
- [ ] Prettier formatting is correct (4 spaces, single quotes)
- [ ] No console.log statements left in code
- [ ] Component has JSDoc documentation
- [ ] Code follows project conventions from code_style_conventions memory

## Design Decisions & Rationale

### Decision 1: Use CSS @supports Instead of JavaScript Detection

**Rationale:**
- More performant (no JavaScript execution needed)
- No layout shift (CSS is evaluated before paint)
- Progressive enhancement built into CSS spec
- Simpler implementation with no state management

**Alternative Considered:** JavaScript feature detection with `CSS.supports()`
**Rejected Because:** Would require client-side state, useEffect/onMount, potential layout shift

### Decision 2: Move Avatar Image to src/lib/assets/images/

**Rationale:**
- Enhanced images system uses `import.meta.glob` on this directory
- Allows Vite to process and optimize the image at build time
- Static folder is for assets that should NOT be processed
- Matches existing pattern used for blog featured images

**Alternative Considered:** Keep in static/ and use regular img tag
**Rejected Because:** Would not benefit from enhanced images optimization (WebP, AVIF, responsive sizes)

### Decision 3: Hardcode Drop Shadow Color (#196f82)

**Rationale:**
- Needs to be visible in BOTH light and dark modes
- Teal/cyan color provides good contrast in both themes
- Theme variables (--v-primary) change between modes, could be too dark in dark mode
- Specification explicitly requests this exact color value

**Alternative Considered:** Use CSS variable like `var(--v-primary)`
**Rejected Because:** Requirement states shadow must be visible in both modes; theme variables might not provide sufficient contrast

### Decision 4: Default Avatar Size to 192px

**Rationale:**
- Matches current placeholder dimensions (h-48 w-48 = 12rem = 192px)
- Good balance between quality and file size
- Sufficient for high-DPI displays (2x = 384px effective)
- Easy to remember (divisible by 8, aligns with Tailwind's spacing scale)

**Alternative Considered:** Make it required prop with no default
**Rejected Because:** Makes component harder to use; most use cases will be same size

### Decision 5: Use Superellipse Value of 5

**Rationale:**
- Higher than 4 (which approximates a circle) as requested
- Creates "squircle" effect (square with smooth corners)
- Not too high (6-10 would look too sharp/square)
- Allows for future adjustment via prop if needed

**Alternative Considered:** Start with value 6 or higher
**Rejected Because:** Conservative approach; 5 provides noticeable effect while remaining aesthetically pleasing

## Potential Issues & Solutions

### Issue 1: Enhanced Image Import Not Found

**Symptom:** TypeScript error about image import not being recognized

**Solution:**
- Verify image is in `src/lib/assets/images/` directory
- Check file extension matches glob pattern (png, jpg, jpeg, webp, avif, gif)
- Restart dev server (`npm run dev`) to refresh Vite's file watcher
- Verify vite.config.ts includes `enhancedImages()` plugin

### Issue 2: Superellipse Not Rendering in Chrome

**Symptom:** Chrome shows circular fallback instead of squircle

**Possible Causes:**
- Feature is experimental and may require Chrome flag
- CSS syntax error in @supports query
- clip-path value malformed

**Solutions:**
- Check Chrome version (feature may not be in stable yet)
- Enable experimental web platform features in chrome://flags
- Verify CSS syntax: `clip-path: superellipse(5);` (no units)
- Check browser console for CSS parsing errors

### Issue 3: Drop Shadow Not Visible in Dark Mode

**Symptom:** Teal drop shadow hard to see against dark background

**Solutions:**
- Increase blur radius: `drop-shadow(0 0 1rem #196f82)`
- Add multiple drop shadows: `drop-shadow(0 0 0.75rem #196f82) drop-shadow(0 0 0.5rem #196f82)`
- Adjust color to lighter teal: `#1e9fb8` or `#2bb0c9`
- Add background glow to icons in dark mode using separate dark mode selector

### Issue 4: Layout Shift When Avatar Loads

**Symptom:** Page content jumps when avatar image loads

**Solutions:**
- Enhanced images should include width/height attributes automatically
- Add explicit `width` and `height` attributes to enhanced:img tag
- Use aspect-ratio CSS: `aspect-ratio: 1 / 1;` on wrapper div
- Ensure wrapper div has explicit dimensions before image loads

### Issue 5: Social Icons Too Small on Mobile

**Symptom:** Icons appear smaller than 24px on mobile devices

**Solutions:**
- Verify Tailwind's h-6 w-6 classes are applied
- Check if parent container has font-size affecting em-based sizing
- Add explicit width/height attributes to SVG: `width="24" height="24"`
- Test actual pixel size using browser DevTools

## Future Enhancements

### Enhancement 1: Configurable Superellipse Curvature

**Description:** Allow parent component to customize the superellipse curvature value via prop

**Implementation:**
- Add `curvature?: number` prop (default: 5)
- Use CSS custom property: `style="--curvature: {curvature}"`
- Update CSS: `clip-path: superellipse(var(--curvature));`

**Use Case:** Different avatar sizes might look better with different curvatures

### Enhancement 2: Loading Skeleton

**Description:** Show placeholder while avatar image loads

**Implementation:**
- Add loading state using Svelte's onMount lifecycle
- Display gray animated skeleton (pulse effect)
- Hide skeleton when image loaded event fires

**Use Case:** Improve perceived performance on slow networks

### Enhancement 3: Multiple Shape Options

**Description:** Support circle, square, squircle, and custom shapes

**Implementation:**
- Add `shape?: 'circle' | 'square' | 'squircle' | 'custom'` prop
- Apply different CSS classes based on shape value
- Allow custom CSS via prop for advanced use cases

**Use Case:** Reuse component across different design contexts

### Enhancement 4: Avatar in Blog Post Headers

**Description:** Display author avatar in blog post byline

**Implementation:**
- Import Avatar component into BlogLayout.svelte
- Place in author metadata section (currently lines ~160-190)
- Use smaller size prop: `size={48}` for 48px x 48px
- Update posts.server.ts to include author avatar path in metadata

**Use Case:** Connect author identity with blog content (matches PRD future work)

## Assumptions Made

1. **Image Format:** Avatar image (jamie-strausbaugh.png) is web-ready and doesn't need manual optimization
2. **Browser Support:** Chrome version is recent enough to support superellipse (experimental feature)
3. **Icon Sizing:** 24px x 24px is appropriate size for social icons at all screen sizes
4. **Drop Shadow Color:** Teal (#196f82) provides sufficient contrast in both light/dark modes
5. **Alt Text:** "Jamie Strausbaugh" is appropriate alternative text for the avatar
6. **Performance:** Single 192px avatar image won't significantly impact page load time
7. **Mobile Layout:** Current responsive breakpoints (md:) are appropriate and don't need adjustment
8. **Accessibility:** Current aria-labels on social links are sufficiently descriptive

## Integration Testing

### Test Scenario 1: Avatar Component in Isolation

**Setup:**
1. Create test page at `src/routes/test-avatar/+page.svelte`
2. Import Avatar component
3. Test with different prop combinations

**Test Cases:**
- Default props (just src and alt)
- Custom size (96px, 192px, 256px)
- Additional classes (border, shadow)
- Invalid image path (error handling)

### Test Scenario 2: About Page Full Integration

**Setup:**
1. Run dev server: `npm run dev`
2. Navigate to `/about` page
3. Test in multiple browsers

**Test Cases:**
- Avatar displays correctly
- Social links functional
- Responsive layout works
- Theme toggle doesn't break styles
- Page accessible via keyboard
- Screen reader announces content correctly

### Test Scenario 3: Cross-Browser Compatibility

**Setup:**
1. Build production version: `npm run build`
2. Preview production: `npm run preview`
3. Test in BrowserStack or local browsers

**Test Cases:**
- Chrome (Windows, Mac, Android)
- Firefox (Windows, Mac)
- Safari (Mac, iOS)
- Edge (Windows)
- Verify superellipse in Chromium browsers
- Verify circle fallback in others

## Deployment Considerations

### Pre-Deployment Checklist:

- [ ] All TypeScript errors resolved (`npm run check`)
- [ ] All linting errors resolved (`npm run lint`)
- [ ] Production build successful (`npm run build`)
- [ ] Production preview tested (`npm run preview`)
- [ ] Avatar image included in build output
- [ ] Enhanced images generated correctly
- [ ] No broken links in social media section
- [ ] Performance metrics acceptable (Lighthouse score)

### Post-Deployment Verification:

- [ ] Avatar loads on production About page
- [ ] Social links point to correct URLs
- [ ] HTTPS enforced (for security with target="_blank")
- [ ] Images served with correct cache headers
- [ ] No 404 errors in browser console
- [ ] Page loads in <3 seconds on production server

## Maintenance Notes

### When to Update This Component:

1. **Avatar Image Changes:** Replace file at `src/lib/assets/images/jamie-strausbaugh.png`
2. **Social Links Change:** Update href attributes in About page
3. **Browser Support Improves:** When superellipse is widely supported, consider removing fallback
4. **Design System Updates:** If theme colors change, update drop-shadow color
5. **Accessibility Standards Change:** Update aria-labels and alt text as needed

### Monitoring:

- Check browser compatibility quarterly (MDN docs for superellipse support)
- Monitor page performance metrics (Core Web Vitals)
- Test accessibility with new screen reader versions
- Validate social links remain active (no 404s)

## References

### External Documentation:
- [MDN: CSS superellipse() function](https://developer.mozilla.org/en-US/docs/Web/CSS/superellipse)
- [MDN: corner-shape-value data type](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape-value)
- [MDN: @supports CSS rule](https://developer.mozilla.org/en-US/docs/Web/CSS/@supports)
- [SvelteKit Enhanced Images](https://svelte.dev/docs/kit/images)
- [Vite Image Optimization](https://vitejs.dev/guide/features.html#image-optimization)

### Project Documentation:
- `docs/avatar-superellipse-prd.md` - Product requirements document
- `.serena/memories/code_style_conventions.md` - Project code style guide
- `.serena/memories/project_architecture.md` - Application architecture
- `docs/mdsvex-core-setup-techspec.md` - Enhanced images setup reference

### FontAwesome Resources:
- Icons provided in PRD requirements section
- License: Free Font Awesome v7.1.0 by @fontawesome
- Copyright: 2025 Fonticons, Inc.
