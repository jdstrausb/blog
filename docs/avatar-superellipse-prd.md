# Avatar with Superellipse Shape - Product Requirements Document

## Overview

This PRD outlines the implementation of an enhanced avatar display system for the blog's About page, featuring the administrator's actual avatar image and an experimental CSS superellipse "squircle" shape effect. The implementation includes updated social media links with FontAwesome SVG icons and a reusable avatar component that gracefully handles browser compatibility.

## Business Context

### Problem Statement
The About page currently displays a placeholder avatar and uses generic SVG icons for social media links. The administrator now has a proper avatar image available, and we want to enhance the visual design with modern CSS features while maintaining broad browser compatibility.

### Goals
- Display the actual administrator avatar image on the About page
- Experiment with modern CSS superellipse shapes for a unique visual design
- Update social media links with proper FontAwesome icons and correct URLs
- Create a reusable avatar component for potential future use across the application
- Ensure graceful degradation for browsers that don't support superellipse

### Success Metrics
- Avatar displays correctly with enhanced images utility
- Superellipse shape renders in Chrome with proper fallback in other browsers
- Social media links are functional and accessible
- Component is reusable and follows project conventions

## User Stories

### User Story 1: View Administrator Avatar
**As a** blog visitor
**I want to** see the administrator's actual avatar on the About page
**So that** I can connect a face/identity with the blog content

**Acceptance Criteria:**
- [ ] Avatar image loads from `/static/authors/jamie-strausbaugh.png`
- [ ] Image uses SvelteKit's `enhanced:img` utility for optimized loading
- [ ] Avatar maintains the current placeholder dimensions (h-48 w-48 / 192px × 192px)
- [ ] Image is properly sized and responsive across mobile, tablet, and desktop viewports
- [ ] Image has appropriate alt text for accessibility
- [ ] Multiple image sizes are generated (small, medium, large) but don't exceed 192px dimensions

### User Story 2: Experience Modern CSS Superellipse Shape
**As a** Chrome user visiting the About page
**I want to** see the avatar displayed in a modern "squircle" shape
**So that** I can experience cutting-edge web design

**Acceptance Criteria:**
- [ ] Chrome users see avatar clipped to a superellipse shape
- [ ] Superellipse curvature parameter starts at a value higher than 4 (square with curved corners, not a circle)
- [ ] Firefox and Safari users see a fallback rounded-full circle shape
- [ ] Shape transition is seamless with no visual glitches during page load
- [ ] Component uses CSS `<corner-shape-value>` data type correctly
- [ ] Browser detection is performant and doesn't cause layout shift

### User Story 3: Access Social Media Profiles
**As a** blog visitor
**I want to** access the administrator's social media profiles
**So that** I can connect with them on other platforms

**Acceptance Criteria:**
- [ ] LinkedIn link points to `https://www.linkedin.com/in/jamiestrausbaugh`
- [ ] GitHub link points to `https://github.com/Jamoverjelly`
- [ ] BlueSky link points to `https://bsky.app/profile/jstrausb.bsky.social`
- [ ] All social media links open in a new tab (`target="_blank"`)
- [ ] Links include `rel="noopener noreferrer"` for security
- [ ] SVG icons are replaced with provided FontAwesome icons
- [ ] Icons maintain 24px × 24px dimensions (h-6 w-6)
- [ ] Icons use `currentColor` fill to inherit text color
- [ ] Hover state applies `filter: drop-shadow(0 0 0.75rem #196f82)` to each icon
- [ ] Drop shadow is visible in both Light and Dark color modes
- [ ] All links have proper aria-label attributes for screen readers

### User Story 4: Future Avatar Component Reusability
**As a** developer
**I want to** have a reusable Avatar component
**So that** I can display author avatars in blog post headers and other locations

**Acceptance Criteria:**
- [ ] Avatar component is created at `src/lib/components/ui/Avatar.svelte`
- [ ] Component accepts props for image source, alt text, and size
- [ ] Component encapsulates superellipse detection and fallback logic
- [ ] Component is documented with JSDoc comments
- [ ] Component follows project code style conventions
- [ ] Component is designed for easy integration into blog post headers (future work)

## Technical Specifications

### Component Structure
```
src/lib/components/ui/Avatar.svelte
```

### Props Interface
```typescript
interface AvatarProps {
  src: string;           // Path to avatar image or enhanced image import
  alt: string;           // Alt text for accessibility
  size?: number;         // Optional size in pixels (default: 192)
  class?: string;        // Optional additional classes
}
```

### Browser Detection Approach
Use the most performant and reliable method:
- **Preferred**: CSS `@supports` rule to detect `superellipse()` function support
- **Fallback**: JavaScript feature detection if CSS approach insufficient

### Superellipse Implementation
```css
/* Chrome/supported browsers */
@supports (clip-path: superellipse(var(--value))) {
  .avatar-squircle {
    clip-path: superellipse(5); /* Starting value, adjustable */
  }
}

/* Fallback for unsupported browsers */
@supports not (clip-path: superellipse(var(--value))) {
  .avatar-fallback {
    border-radius: 9999px; /* Tailwind rounded-full equivalent */
  }
}
```

### Social Media Icons
Replace existing SVG icons with the provided FontAwesome icons:
- GitHub: Full `<svg>` element from requirements
- BlueSky: Full `<svg>` element from requirements
- LinkedIn: Full `<svg>` element from requirements

### Hover Effect Styling
```css
.social-icon:hover {
  filter: drop-shadow(0 0 0.75rem #196f82);
}
```

## Design Considerations

### Responsive Behavior
- Maintain current responsive layout (flex column on mobile, flex row on md+ screens)
- Avatar container: `w-full md:w-1/3`
- Profile/social container: `w-full md:w-2/3`

### Performance
- Enhanced images utility handles lazy loading and multiple format generation
- Browser detection runs once on component mount
- No JavaScript-heavy libraries required

### Accessibility
- All images include descriptive alt text
- Social media links have proper aria-labels
- Links include security attributes (`rel="noopener noreferrer"`)
- Hover states are visible and meet WCAG contrast requirements

### Browser Compatibility
| Browser | Superellipse Support | Fallback |
|---------|---------------------|----------|
| Chrome  | ✅ Yes              | N/A      |
| Firefox | ❌ No               | Rounded circle |
| Safari  | ❌ No               | Rounded circle |
| Edge    | ✅ Yes (Chromium)   | N/A      |

## Implementation Phases

### Phase 1: Create Avatar Component
1. Create `src/lib/components/ui/Avatar.svelte`
2. Implement superellipse detection with fallback
3. Add enhanced image integration
4. Add JSDoc documentation

### Phase 2: Update About Page
1. Import Avatar component into `src/routes/about/+page.svelte`
2. Replace placeholder avatar div with Avatar component
3. Pass avatar image path and appropriate props

### Phase 3: Update Social Media Links
1. Replace existing SVG icons with FontAwesome versions
2. Update href attributes with correct URLs
3. Add target="_blank" and rel="noopener noreferrer"
4. Apply hover drop-shadow styling

### Phase 4: Testing & Refinement
1. Test avatar display across browsers
2. Verify superellipse rendering in Chrome
3. Verify fallback rendering in Firefox/Safari
4. Test social media links functionality
5. Validate accessibility with screen readers
6. Adjust superellipse curvature parameter as needed

## Open Questions

- [ ] Should the superellipse curvature be configurable via component prop?
- [ ] Should we add a visual indicator that shows which shape mode is active (for development)?
- [ ] Do we want to animate the transition between superellipse and fallback shapes?

## Dependencies

- SvelteKit Enhanced Images (already configured)
- Modern CSS support for `@supports` rule
- FontAwesome SVG icons (provided)

## Future Enhancements

- Integrate Avatar component into blog post headers with author bylines
- Add image optimization for different sizes (thumbnail, small, medium, large)
- Support for multiple avatar shapes (circle, square, squircle, custom)
- Animation on hover (subtle scale or glow effect)
- Support for placeholder/loading states

## References

- [MDN: CSS superellipse() function](https://developer.mozilla.org/en-US/docs/Web/CSS/superellipse)
- [MDN: corner-shape-value data type](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape-value)
- [SvelteKit Enhanced Images](https://svelte.dev/docs/kit/images)
- FontAwesome Icons (provided in requirements)
