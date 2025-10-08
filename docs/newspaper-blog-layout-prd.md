# PRD: Newspaper-Style Blog Layout Refactor

**Status:** Ready for Development
**Author:** Claude (Product Manager)
**Date:** October 6, 2025

---

## 1. Overview & Business Goal

Refactor the `BlogLayout.svelte` component to present blog articles with a professional, newspaper-inspired "above the fold" layout that improves visual hierarchy, eliminates redundancy, and creates a more engaging reading experience. The new layout will feature a single, prominent title display, strategic placement of the featured image, and reorganized metadata that follows established editorial design patterns.

## 2. Problem Statement

### Current Issues:
- **Duplicate Title Display**: Article titles appear twice—once in the header and again after the featured image, creating visual redundancy and confusion
- **Metadata Organization**: Article metadata (author, dates, tags, reading time) lacks clear visual hierarchy and doesn't follow newspaper editorial conventions
- **Visual Hierarchy**: Current layout doesn't create the "above the fold" impact that draws readers into the content
- **Layout Flow**: The sequence of elements doesn't guide the reader's eye naturally from title → context → content

### Desired Outcome:
A newspaper-style article layout where all key information (title, subtitle, featured image, and metadata) appears "above the fold" in a visually compelling arrangement that mimics the front page of a quality newspaper.

## 3. Success Metrics

- **Primary**: Improved content presentation with single H1 title display and clear visual hierarchy
- **Secondary**: Enhanced reader engagement through better "above the fold" layout
- **Tertiary**: Consistent newspaper-style branding across all blog articles

## 4. User Stories

### Story 1: Clear Article Presentation
**As a blog reader**, I want to see the article title displayed once prominently at the top of the page, **so that** I can immediately understand what the article is about without visual confusion.

**Acceptance Criteria:**
- [ ] Article H1 title appears only once on the page
- [ ] Title is positioned at the top of the article layout, after the breadcrumb navigation
- [ ] Title uses appropriate typography (large, bold, attention-grabbing)
- [ ] No duplicate title elements exist in the DOM

### Story 2: Newspaper-Style Layout
**As a blog reader**, I want to see article content laid out like a newspaper front page, **so that** I get all essential information (title, summary, image, metadata) in a single viewport without scrolling.

**Acceptance Criteria:**
- [ ] Breadcrumb navigation appears at the very top
- [ ] Article title (H1) appears immediately after breadcrumb
- [ ] Article summary/subtitle appears below title
- [ ] Featured image appears below the title/summary section
- [ ] All metadata appears below the featured image in newspaper style
- [ ] Layout is optimized to fit "above the fold" on standard desktop viewports (1920×1080)
- [ ] The layout needs to reflow for an equivalent experience on standard table and mobile viewports

### Story 3: Enhanced Metadata Display
**As a blog reader**, I want to see article metadata (author, tags, publication date, reading stats) organized clearly below the featured image, **so that** I can quickly understand the article's context and decide whether to read it.

**Acceptance Criteria:**
- [ ] Tags displayed as pills/badges on the right side
- [ ] Author information includes avatar (use placeholder) and details
- [ ] Bottom border separates author details from reading stats
- [ ] Reading time and word count appear on the left
- [ ] Publication date (Month Year format) appears on the right
- [ ] All metadata uses appropriate typography and spacing

### Story 4: Responsive Design
**As a mobile blog reader**, I want the newspaper-style layout to adapt gracefully to smaller screens, **so that** I have an optimal reading experience on any device.

**Acceptance Criteria:**
- [ ] Layout stacks vertically on mobile devices
- [ ] Featured image scales appropriately
- [ ] Metadata sections remain readable and well-organized
- [ ] Typography adjusts for mobile readability
- [ ] All interactive elements (links, buttons) are touch-friendly
- [ ] Table of Contents widget (in `src/lib/components/blog/TableOfContents.svelte`) is moved from its sidebar position to underneath top section when the responsive layout shifts for accommodating smaller screens.

## 5. Requirements & Scope

### 5.1. Layout Structure

The new layout will follow this top-to-bottom sequence:

```
┌─────────────────────────────────────┐
│ 1. Breadcrumb Navigation            │
├─────────────────────────────────────┤
│ 2. Article Title (H1) - Single      │
├─────────────────────────────────────┤
│ 3. Article Summary/Subtitle         │
├─────────────────────────────────────┤
│ 4. Featured Image                   │
├─────────────────────────────────────┤
│ 5. Metadata Section:                │
│    ┌─────────────────────────────┐  │
│    │ Tags (pills, right-aligned) │  │
│    ├─────────────────────────────┤  │
│    │ Author Info (with avatar)   │  │
│    ├─────────────────────────────┤  │
│    │ [border]                    │  │
│    ├─────────────────────────────┤  │
│    │ Reading Stats │ Pub Date    │  │
│    │ (left)        │ (right)     │  │
│    └─────────────────────────────┘  │
├─────────────────────────────────────┤
│ 6. Article Content (prose)          │
└─────────────────────────────────────┘
```

### 5.2. Component Refactoring: `BlogLayout.svelte`

#### Current Props (Keep):
- `title: string` - Article title
- `summary: string` - Article summary/subtitle
- `author: string` - Author name
- `publishedAt: string` - Publication date
- `updatedAt: string | undefined` - Last updated date
- `tags: string[]` - Article tags/categories
- `readingTime: number` - Estimated reading time in minutes
- `featuredImage: string | undefined` - Featured image URL
- `slug: string` - Article slug
- `children: Snippet` - Article content

#### New Props (Add):
- `wordCount?: number` - Approximate word count for display
- `authorAvatar?: string` - URL to author's avatar image

### 5.3. Styling Requirements

#### CSS Variables to Add:
Based on the inspiration site's design system, add the following CSS variables to `app.css`:

```css
/* Newspaper-style article layout */
--article-intro-pad-top: calc(var(--spacing, 0.25rem) * 36);
--article-max-width: 1440px;
--article-padding-x: max(160px, calc((100vw - var(--article-max-width)) / 2));

/* Metadata section */
--metadata-border-color: var(--v-border);
--metadata-text-subtle: var(--v-text-muted);
--metadata-spacing: 1rem;

/* Tag pills */
--tag-pill-bg: var(--blog-tag-bg);
--tag-pill-text: var(--blog-tag-text);
--tag-pill-border: var(--blog-tag-border);
--tag-pill-radius: 9999px; /* Full rounded */

/* Author section */
--author-avatar-size: 3rem;
--author-name-weight: 700;
--author-title-color: var(--v-text-muted);
```

#### Typography:
- **Title (H1)**: Use existing blog title styles, ensure font-family includes serif option
- **Summary**: Slightly larger than body text, muted color
- **Metadata**: Smaller text size (0.875rem), muted colors for secondary info
- **Publication Date**: Capitalize month, display as "Month YYYY" format

### 5.4. Featured Image Handling

- Continue using existing enhanced image system (`getEnhancedImage` utility)
- Support both enhanced images (`Picture` type) and standard image URLs
- Position image **after** title and summary, **before** metadata
- Maintain responsive image sizing with `w-full h-auto`
- Consider adding subtle border or shadow for visual separation

### 5.5. Metadata Section Layout

#### Tags (Top Right):
- Display as pill/badge elements
- Right-aligned using flexbox or grid
- Each tag links to category/tag page (if applicable)
- Use existing tag color variables

#### Author Information:
- Display author avatar (if available) as circular image (3rem diameter)
- Show author name in bold
- Show author title/role in muted text below name
- Consider making author name clickable to author profile (future enhancement)

#### Horizontal Separator:
- Use border div
- Full width of metadata container
- Use `--metadata-border-color` variable
- Subtle, 1px thickness

#### Reading Stats & Publication Date:
- Two-column layout using flexbox
- **Left column**: Reading time and word count (e.g., "10 min read, ~1000 words")
- **Right column**: Publication date in "Month YYYY" format (e.g., "July 2025")
- Both use muted text color

### 5.6. Gradient Background (Optional Enhancement)

Based on the inspiration site, consider adding a subtle gradient background to the intro section:

```css
--background-gradient-intro: linear-gradient(
  to bottom,
  var(--v-bg-soft) 32%,
  var(--v-bg) 100%
);
```

Apply to the article header section to create depth.

### 5.7. Breadcrumb Updates

- Ensure breadcrumb uses icon-based home link (already implemented)
- Verify proper separator styling (chevron or slash)
- Maintain current breadcrumb functionality

### 5.8. Accessibility Considerations

- [ ] Ensure single H1 per page (SEO and a11y requirement)
- [ ] Alt text for featured image uses article title
- [ ] Author avatar has appropriate alt text or aria-label
- [ ] Semantic HTML structure (`<article>`, `<header>`, `<section>`)
- [ ] Sufficient color contrast for all text elements
- [ ] Keyboard navigation works for all interactive elements

## 6. Technical Implementation Notes

### 6.1. Remove Duplicate Title
- Remove the H1 title that currently appears after the featured image
- Keep only the H1 in the header section (before featured image)

### 6.2. Reorder Elements
Current order:
```
Header → Tags → Title → Meta → FeaturedImage → Content
```

New order:
```
Breadcrumb → Title → Summary → FeaturedImage → Metadata (Tags + Author + Stats) → Content
```

### 6.3. Word Count Calculation
- Add `wordCount` calculation in the MDsveX preprocessing or page load
- Can be calculated from markdown content length
- Display format: "~1000 words" (rounded to nearest 50 or 100)

### 6.4. Date Formatting
Update date formatting function to support "Month YYYY" format:
```typescript
const publishedDateFormatted = publishedDate?.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long'
});
```

### 6.5. Table of Contents Integration
- Maintain existing TOC sidebar functionality
- Ensure TOC still works with new layout structure
- TOC should display on larger screens (tablet+) in the sidebar. On smaller screens, the TOC should shift from its sidebar position to underneath the top section element.

## 7. Out of Scope (Future Enhancements)

- Author profile pages with biographical information
- Tag/category archive pages
- Related articles section
- Article schema markup (structured data)
- Print-specific styles
- "Not by AI" badge integration (as shown in inspiration site)

## 8. Acceptance Criteria Summary

### Visual Layout:
- [ ] Article title (H1) appears exactly once on the page
- [ ] Layout follows newspaper-style "above the fold" pattern
- [ ] Breadcrumb → Title → Summary → Image → Metadata → Content sequence
- [ ] All key information visible in initial viewport on desktop (1920×1080)

### Metadata Section:
- [ ] Tags displayed as pills/badges, right-aligned
- [ ] Author information includes avatar (if provided) and details
- [ ] Horizontal rule separates author from reading statistics
- [ ] Reading time and word count on left, publication date on right
- [ ] Date formatted as "Month YYYY"

### Responsive Design:
- [ ] Layout adapts gracefully to tablet viewports (768px - 1024px)
- [ ] Layout stacks vertically on mobile viewports (<768px)
- [ ] Images scale proportionally across all screen sizes
- [ ] Text remains readable at all viewport sizes

### Functionality:
- [ ] Enhanced images load correctly using existing utility
- [ ] All interactive elements (tags, author links) work as expected
- [ ] Table of contents sidebar remains functional
- [ ] Breadcrumb navigation functions correctly

### Code Quality:
- [ ] No duplicate DOM elements (especially H1 title)
- [ ] Semantic HTML structure maintained
- [ ] CSS variables follow existing naming conventions
- [ ] All styling in BlogLayout uses TailwindCSS with CSS variable and styling integrations from app.css file wherever possible
- [ ] Component props properly typed (TypeScript)
- [ ] Code follows existing project style guidelines

### Accessibility:
- [ ] Single H1 per page for SEO/a11y
- [ ] All images have appropriate alt text
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation fully functional
- [ ] Screen reader friendly markup

### Browser Compatibility:
- [ ] Layout renders correctly in Chrome, Firefox, Safari, Edge (latest versions)
- [ ] Responsive breakpoints work across browsers
- [ ] CSS variables supported (modern browsers only is acceptable)

## 9. Design Reference

The visual design should closely match the inspiration site's layout pattern:

1. **Vertical Flow**: Breadcrumb → Title → Subtitle → Image → Metadata
2. **"Above the Fold"**: Optimize for initial viewport visibility
3. **Visual Hierarchy**: Large title, medium subtitle, prominent image, subtle metadata
4. **Metadata Organization**: Clear grouping and separation of information
5. **Typography**: Serif for titles, sans-serif for UI elements
6. **Spacing**: Generous whitespace between major sections

## 10. Testing Checklist

- [ ] Test with articles that have all metadata (tags, author, dates, reading time)
- [ ] Test with articles missing optional metadata (tags, author avatar, updated date)
- [ ] Test with various image aspect ratios (landscape, portrait, square)
- [ ] Test with very long titles and summaries
- [ ] Test responsive behavior at common breakpoints (375px, 768px, 1024px, 1440px, 1920px)
- [ ] Test dark mode appearance
- [ ] Test with browser dev tools throttling (CPU, network)
- [ ] Validate HTML semantics with validator
- [ ] Check accessibility with screen reader (VoiceOver/NVDA)

---

## Additional Questions for Clarification

Before implementation begins, please confirm:

1. **Word Count**: Should we calculate word count from the markdown content automatically, or will it be provided as front matter in articles?
  A: We need to come up with a means for calculating word count from the `.svx` files saved in `src/posts/[year]/[slug].svx`

2. **Author Avatar**: Do you have author avatar images available? If so, where should they be stored (e.g., `/static/authors/` directory)?
  A: I do not have an author avatar image available, but yes, we should plan for this to be in `/static/authors/`.

3. **Tag Links**: Should tag pills link to tag/category archive pages? If yes, what should the URL structure be (e.g., `/blog/tags/[tag-name]`)?
  A: Yes. Tag pills need to link to category archive pages. The url structure should be `/blog/categories/[category-name]`.

4. **Gradient Background**: Would you like the subtle gradient background on the intro section, or prefer a solid background color?
  A: Let's use the current solid, page background color initially

5. **Updated Date**: Should the "Updated" date be displayed alongside the publication date in the metadata section, or hidden if recent?
  A: Yes, display an "updated" date alongside the publication date in the metadata section. It can be hidden if the updated date is recent.

6. **Translation Badge**: The inspiration site shows a "Manual translation" indicator. Do you need multi-language support or can we omit this?
  A: Not at this time. Omit this.

7. **"Not by AI" Badge**: Would you like to include a "Written by Human, not AI" badge similar to the inspiration site?
  A: Not at this time.
