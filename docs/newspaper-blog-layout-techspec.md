# Newspaper-Style Blog Layout - Technical Specification

## Overview

This document provides complete implementation details for refactoring the `BlogLayout.svelte` component to create a newspaper-inspired "above the fold" layout. The refactor eliminates duplicate title display, reorganizes metadata, and improves visual hierarchy to match professional editorial design patterns.

## Architecture Overview

### Component Hierarchy
```
BlogLayout.svelte (refactored)
  ├── Breadcrumb.svelte (existing, unchanged)
  ├── TableOfContents.svelte (existing, repositioned)
  ├── ShareWidget.svelte (existing, unchanged)
  ├── FeedbackWidget.svelte (existing, unchanged)
  ├── Footer.svelte (existing, unchanged)
  └── ScrollToTopButton.svelte (existing, unchanged)
```

### Data Flow
1. Blog post loaded via `+page.server.ts` using `load_post_by_slug()`
2. Post metadata enhanced with word count calculation
3. Props passed to BlogLayout component via `.svx` file layout system
4. BlogLayout renders newspaper-style header section
5. Article content rendered via children snippet
6. Table of contents adapts to viewport size

## Key Design Decisions

### Assumptions
1. **Word Count Source**: Word count will be calculated from the raw markdown content in the `.svx` files during post loading, not stored in frontmatter
2. **Author Avatar**: Will use a placeholder avatar system with path `/static/authors/[author-slug].png` (fallback to generic avatar if not found)
3. **Tag Links**: Tags will link to `/blog/categories/[lowercase-tag-name]` (note: category pages not in scope for this implementation)
4. **Date Display Logic**: "Updated" date only shown if it differs from "Published" date by more than 1 day
5. **Responsive Breakpoints**: Using Tailwind v4 default breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
6. **TOC Positioning**: Sidebar on lg+ screens, below metadata section on smaller screens

### Technical Constraints
- Must maintain existing enhanced image system (`getEnhancedImage` utility)
- Must preserve existing TOC functionality and MutationObserver pattern
- Must use Tailwind CSS v4 utilities with CSS variable integration
- Must support both light and dark modes via existing Vitesse color system
- No new dependencies required (use existing packages)

## Integration Points

### 1. BlogLayout Component Refactoring

**File:** `src/lib/components/blog/BlogLayout.svelte`

**Current State:**
- Lines 84-149: Article structure with header, tags, title, meta, featured image, content, and TOC sidebar
- Lines 85-122: Header section with breadcrumb, tags, title, and metadata
- Lines 124-149: Grid layout with featured image, content on left, TOC on right
- Lines 102-106: H1 title element (keep this, remove any duplicate)

**Changes Required:**

#### 1.1 Update Props Interface (Lines 11-22)

Add new optional props:
- `wordCount?: number` - Calculated word count for display
- `authorAvatar?: string` - Author avatar image URL

#### 1.2 Restructure Article Layout

**New Layout Order:**
1. Breadcrumb navigation (existing, keep at top)
2. H1 title (move from line 103, single display)
3. Summary/subtitle paragraph (new element)
4. Featured image section (move before metadata)
5. Metadata section (new composite section):
   - Tags row (right-aligned pills)
   - Author info row (with avatar)
   - Horizontal border
   - Stats row (reading time, word count, publication date)
6. Article content
7. Table of Contents (responsive positioning)

**Layout Container Changes:**
- Remove outer padding classes `px-4 py-10 lg:py-16` from line 84
- Add newspaper-style spacing and max-width constraints
- Use semantic `<header>` for intro section (breadcrumb through metadata)
- Use `<section>` for article content area

#### 1.3 Responsive Grid Strategy

**Desktop (lg+):**
- Single column for header section (breadcrumb → metadata)
- Two-column grid for content: main article (70%) + TOC sidebar (30%)
- TOC sticky positioned at `top-24`

**Tablet (md to lg):**
- Single column layout
- TOC moves below metadata section, before article content
- Sticky positioning disabled

**Mobile (<md):**
- Fully stacked layout
- All elements full width
- Increased vertical spacing between sections

### 2. Word Count Calculation System

**File:** `src/lib/utils/posts.server.ts`

**Current State:**
- Lines 1-121: Post loading and metadata processing system
- Line 42-72: `coerceMetadata` function that validates and returns post metadata
- Lines 26-28: Glob import with eager loading of all `.md` and `.svx` files

**Changes Required:**

#### 2.1 Add Word Count Utility Function (Insert after line 1)

Create `calculateWordCount` function:
- Accept raw markdown content string as parameter
- Strip frontmatter using regex: `/^---[\s\S]*?---/`
- Remove HTML/Svelte tags using regex: `/<[^>]*>/g`
- Remove code blocks using regex: `/```[\s\S]*?```/g`
- Remove inline code using regex: `/`[^`]*`/g`
- Remove URLs using regex: `/https?:\/\/[^\s]+/g`
- Split remaining text by whitespace
- Filter empty strings and count array length
- Return rounded word count (nearest 50 or 100)

#### 2.2 Modify Glob Import (Line 26)

Change import configuration to include raw content:
- Add `query: '?raw'` to the glob options for accessing file content
- This allows reading raw markdown for word count calculation
- Module type becomes `{ default: Component; raw: string; metadata?: ... }`

#### 2.3 Update Metadata Type (Lines 4-15)

Add `wordCount?: number` field to `BlogPostMetadata` interface

#### 2.4 Enhance coerceMetadata Function (Lines 42-72)

- Add parameter for raw content: `raw: string`
- Calculate word count using utility function
- Include `wordCount` in returned metadata object

#### 2.5 Update buildPosts Function (Lines 74-94)

- Extract raw content from module (if available from glob)
- Pass raw content to `coerceMetadata` function
- Handle case where raw content unavailable (set wordCount to undefined)

### 3. CSS Variable System

**File:** `src/app.css`

**Current State:**
- Lines 17-141: `:root` block with Vitesse light palette and component variables
- Lines 143-223: `.dark` block with Vitesse dark palette overrides
- Line 84: `--font-serif` variable already defined

**Changes Required:**

#### 3.1 Add Newspaper Layout Variables (Insert in `:root` after line 140)

Add these CSS custom properties:
```
/* Newspaper-style article layout */
--article-intro-section-spacing: 2.5rem;
--article-max-width: 1440px;
--article-padding-x-mobile: 1rem;
--article-padding-x-tablet: 2rem;
--article-padding-x-desktop: 3rem;

/* Metadata section */
--metadata-border-color: var(--v-border);
--metadata-text-subtle: var(--v-text-muted);
--metadata-spacing: 1rem;
--metadata-section-gap: 1.5rem;

/* Tag pills */
--tag-pill-bg: var(--blog-tag-bg);
--tag-pill-text: var(--blog-tag-text);
--tag-pill-border: var(--blog-tag-border);
--tag-pill-radius: 9999px;
--tag-pill-padding-x: 0.75rem;
--tag-pill-padding-y: 0.375rem;

/* Author section */
--author-avatar-size: 3rem;
--author-name-weight: 700;
--author-title-color: var(--v-text-muted);
--author-section-gap: 0.75rem;
```

#### 3.2 Typography Hierarchy

No new variables needed, use existing:
- Title: Use `--blog-title-color` with font-family from `--font-serif`
- Summary: Use `--blog-description-color` (already exists at line 91)
- Metadata: Use `--metadata-text-subtle` (new, defined above)

### 4. Author Avatar System

**File Structure:**
```
static/
  └── authors/
      ├── default-avatar.png (fallback avatar)
      └── [author-slug].png (individual avatars)
```

**Implementation in BlogLayout:**

Create derived state for author avatar URL:
- Convert author name to slug: lowercase, replace spaces with hyphens, remove special chars
- Construct path: `/authors/{author-slug}.png`
- Provide fallback path: `/authors/default-avatar.png`
- Use `onError` event handler on img element to fallback if author avatar missing

**Avatar Specifications:**
- Size: 48px × 48px (3rem as per `--author-avatar-size`)
- Format: PNG with transparency
- Border radius: Full circle (`rounded-full` in Tailwind)
- Alt text: Author's name

### 5. Date Formatting Enhancement

**File:** `src/lib/components/blog/BlogLayout.svelte`

**Current State:**
- Lines 55-65: Date formatting logic for publishedAt and updatedAt
- Line 58-65: `formatted` function creates locale-formatted date string

**Changes Required:**

#### 5.1 Add Publication Date Formatter (Insert after line 65)

Create `formatPublicationDate` function:
- Accept Date object
- Return string in "Month YYYY" format
- Use `toLocaleDateString('en-US', { year: 'numeric', month: 'long' })`
- Example output: "July 2025"

#### 5.2 Add Updated Date Display Logic (Insert after formatPublicationDate)

Create derived state `shouldShowUpdatedDate`:
- Compare updatedDate with publishedDate
- Calculate difference in days
- Return true if difference > 1 day and updatedDate exists
- Return false otherwise

#### 5.3 Word Count Display Formatter (Insert after shouldShowUpdatedDate)

Create `formatWordCount` function:
- Accept number (word count)
- Return string with tilde prefix and "words" suffix
- Example: "~1000 words"
- Handle undefined/null by returning empty string

### 6. Responsive Table of Contents

**File:** `src/lib/components/blog/BlogLayout.svelte`

**Current State:**
- Lines 146-148: TOC rendered in sidebar with `lg:sticky lg:top-24` classes
- Lines 124: Parent grid with `lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]`

**Changes Required:**

#### 6.1 Conditional TOC Rendering

Render TOC in two locations with conditional display:
1. **Desktop TOC (lg+ screens):**
   - Render inside sidebar column (existing position)
   - Add class: `hidden lg:block`
   - Maintain sticky positioning

2. **Mobile/Tablet TOC (<lg screens):**
   - Render after metadata section, before article content
   - Add class: `lg:hidden`
   - Remove sticky positioning
   - Add bottom margin for spacing

#### 6.2 Shared TOC Component State

Both TOC instances must share same `articleContainer` binding:
- Use single `articleContainer` variable
- Pass same ref to both TOC instances
- Svelte will handle display visibility via CSS

### 7. Tag Links Implementation

**File:** `src/lib/components/blog/BlogLayout.svelte`

**Current State:**
- Lines 89-99: Tags rendered as static spans with styling

**Changes Required:**

#### 7.1 Convert Tags to Links

Transform tag display:
- Change from `<span>` to `<a>` elements
- Add `href` attribute with URL pattern: `/blog/categories/{tag-lowercase}`
- Lowercase tag name and replace spaces with hyphens for URL
- Maintain existing styling classes
- Add hover state transition

**URL Transformation Logic:**
- Input: "MDSvex" → Output: `/blog/categories/mdsvex`
- Input: "Content Workflow" → Output: `/blog/categories/content-workflow`

**Styling:**
- Keep existing pill appearance
- Add `transition-colors` for smooth hover effect
- Add `hover:brightness-110` for subtle hover feedback

**Accessibility:**
- Add `aria-label` describing link purpose: "View posts in {tag} category"
- Maintain keyboard focus styles

### 8. Metadata Section Layout Structure

**File:** `src/lib/components/blog/BlogLayout.svelte`

**New Section Markup (Replace lines 89-121):**

Create composite metadata section with 4 subsections:

#### 8.1 Tags Row
- Container: `flex justify-end items-center gap-2 flex-wrap`
- Render tag pills as links (see section 7)
- Right-aligned on desktop, centered on mobile

#### 8.2 Author Info Row
- Container: `flex items-center gap-3`
- Avatar image: 3rem circular, object-cover
- Text container: `flex flex-col`
  - Author name: bold, `--text-color`
  - Author title: "Developer, administrator" in `--author-title-color`

#### 8.3 Horizontal Border
- Element: `<div>` with border styling
- Classes: `h-px w-full bg-[var(--metadata-border-color)]`
- Margin: `my-4` for vertical spacing

#### 8.4 Reading Statistics Row
- Container: `flex justify-between items-start text-sm`
- Left column: `flex flex-col gap-2`
  - Manual translation note (omitted per requirements)
  - Reading stats: "{readingTime} min read, ~{wordCount} words"
- Right column:
  - Publication date: "Month YYYY" format
  - Updated date (conditional): "Updated Month YYYY" below publication date

**Responsive Behavior:**
- Desktop: Side-by-side stats and date
- Mobile: Stack vertically, maintain left/right alignment within mobile width

### 9. Props Integration in Page Route

**File:** `src/routes/blog/[...slug]/+page.svelte`

**Current State:**
- Lines 45-55: `postProps` object constructed from `data.post` properties
- Props passed to PostComponent

**Changes Required:**

#### 9.1 Add Word Count Prop (Line 54, after featuredImage)

Add to postProps object:
- `wordCount: data.post.wordCount`

#### 9.2 Add Author Avatar Prop (Line 55, after wordCount)

Add to postProps object:
- `authorAvatar: data.post.authorAvatar`

**Note:** Ensure `+page.server.ts` returns these fields from `load_post_by_slug`

### 10. TypeScript Type Updates

**File:** `src/lib/utils/posts.server.ts`

**Changes:**
- Update `BlogPostMetadata` interface (lines 4-15) to include `wordCount?: number` and `authorAvatar?: string`
- This ensures type safety across the application

**File:** `src/routes/blog/[...slug]/$types.d.ts`

**Auto-generated:**
- SvelteKit will automatically regenerate types based on server load function return type
- No manual changes needed

## Implementation Steps

Follow these steps in order for successful implementation:

### Phase 1: Backend Data Enhancement

#### Step 1.1: Add Word Count Calculation to Post Loading
1. Open `src/lib/utils/posts.server.ts`
2. Create `calculateWordCount(content: string): number` function at top of file:
   - Strip frontmatter using regex pattern
   - Remove HTML/Svelte tags, code blocks, inline code, URLs
   - Split by whitespace and count words
   - Round to nearest 50
3. Update glob import on line 26 to include raw content (add `{ query: '?raw' }`)
4. Update `GlobModule` type to include `raw?: string` field
5. Modify `coerceMetadata` to accept raw content parameter
6. Add word count calculation call inside `coerceMetadata`
7. Update `BlogPostMetadata` interface to include `wordCount?: number`
8. Update `buildPosts` to pass raw content to `coerceMetadata`

#### Step 1.2: Add Author Avatar Field
1. Add `authorAvatar?: string` to `BlogPostMetadata` interface
2. In `coerceMetadata`, construct author avatar path from author name:
   - Convert name to lowercase slug
   - Build path: `/authors/{slug}.png`
   - Include in returned metadata

### Phase 2: CSS Variable Setup

#### Step 2.1: Add Newspaper Layout Variables
1. Open `src/app.css`
2. Locate `:root` block (around line 17)
3. After line 140, add newspaper layout CSS variables section
4. Add all variables from section 3.1 of this spec
5. Save file (no dark mode overrides needed, variables reference existing Vitesse colors)

### Phase 3: BlogLayout Component Refactoring

#### Step 3.1: Update Component Props
1. Open `src/lib/components/blog/BlogLayout.svelte`
2. Add `wordCount?: number` and `authorAvatar?: string` to Props interface (line 11-22)
3. Add these props to destructuring in `let` statement (line 24-35)

#### Step 3.2: Add Date Formatting Functions
1. After existing `formatted` function (line 65), add:
   - `formatPublicationDate(date?: Date): string` - Returns "Month YYYY"
   - `shouldShowUpdatedDate` - Derived state comparing dates
   - `formatWordCount(count?: number): string` - Returns "~{count} words"

#### Step 3.3: Add Author Avatar Logic
1. Create derived state for avatar URL:
   - Convert author name to slug
   - Construct path using template: `/authors/{slug}.png`
   - Store fallback path: `/authors/default-avatar.png`

#### Step 3.4: Restructure Article Layout
1. Remove existing article container classes from line 84
2. Create new semantic structure:
   - `<article>` wrapper with max-width and responsive padding
   - `<header>` section for breadcrumb through metadata
   - `<section>` for article content and TOC

#### Step 3.5: Build Header Section (Breadcrumb → Metadata)
1. **Breadcrumb** (keep existing from line 87)
2. **Title** (move from line 103, ensure single H1):
   - Use large heading classes
   - Apply serif font from `--font-serif`
   - Add responsive sizing (text-3xl md:text-4xl lg:text-5xl)
3. **Summary** (new element after title):
   - Render `{summary}` prop
   - Use paragraph with muted color
   - Apply responsive text sizing (text-lg md:text-xl)
   - Add margin-top spacing
4. **Featured Image** (move from lines 126-140):
   - Position after summary, before metadata
   - Keep existing enhanced image logic
   - Add margin-top spacing
5. **Metadata Section** (replace lines 89-121):
   - Build 4-part composite section per section 8 of this spec
   - Tags row (right-aligned pills as links)
   - Author row (avatar + name + title)
   - Horizontal border
   - Stats row (reading info + publication date)

#### Step 3.6: Implement Tag Links
1. In metadata tags row, convert spans to anchor elements
2. Calculate href using tag name transformation
3. Apply URL encoding and lowercase conversion
4. Add hover states and transitions
5. Include accessibility attributes

#### Step 3.7: Implement Author Info Display
1. Render author avatar image with circular styling
2. Add error handler for missing avatar (use default-avatar.png)
3. Display author name in bold
4. Display author title/role in muted text below name
5. Use flexbox for horizontal layout with gap

#### Step 3.8: Implement Reading Stats Display
1. Create flex container for stats row
2. Left side: Reading time and word count
   - Format: "{readingTime} min read, ~{wordCount} words"
   - Show word count only if available
3. Right side: Publication date
   - Format using `formatPublicationDate`
   - Show updated date conditionally below if `shouldShowUpdatedDate` is true
4. Apply responsive stacking for mobile

#### Step 3.9: Restructure Content and TOC Layout
1. Create content section wrapper after metadata
2. On desktop (lg+): Two-column grid
   - Left column (70%): Article prose content
   - Right column (30%): TOC sidebar with sticky positioning
3. On mobile/tablet (<lg): Single column
   - TOC rendered after metadata, before content
   - Content follows TOC
4. Implement dual TOC rendering:
   - Desktop TOC: `<div class="hidden lg:block"><TableOfContents /></div>`
   - Mobile TOC: `<div class="lg:hidden"><TableOfContents /></div>`
5. Share same `articleContainer` binding between both instances

#### Step 3.10: Apply Responsive Styling
1. Add responsive padding to article wrapper:
   - Mobile: px-4
   - Tablet: px-8
   - Desktop: px-12 or max-width container
2. Add responsive margins between sections:
   - Mobile: gap-6
   - Tablet: gap-8
   - Desktop: gap-10
3. Add responsive text sizing to all typography elements
4. Test at breakpoints: 375px, 768px, 1024px, 1440px, 1920px

### Phase 4: Route Integration

#### Step 4.1: Update Page Props
1. Open `src/routes/blog/[...slug]/+page.svelte`
2. Add `wordCount: data.post.wordCount` to postProps object (line 54)
3. Add `authorAvatar: data.post.authorAvatar` to postProps object (line 55)

### Phase 5: Asset Setup

#### Step 5.1: Create Author Avatar Directory
1. Create directory: `static/authors/`
2. Add default avatar placeholder: `default-avatar.png` (48×48 px, circular design)
3. Add individual author avatars as needed using naming pattern: `{author-slug}.png`

### Phase 6: Testing and Validation

#### Step 6.1: Functional Testing
1. Test with posts having all metadata (tags, author, dates, featured image, reading time, word count)
2. Test with posts missing optional metadata (verify graceful degradation)
3. Test with various featured image aspect ratios (landscape, portrait, square)
4. Test with very long titles and summaries (verify text wrapping)
5. Test with missing author avatars (verify fallback works)

#### Step 6.2: Responsive Testing
1. Test at 375px (mobile)
2. Test at 768px (tablet)
3. Test at 1024px (desktop)
4. Test at 1440px (large desktop)
5. Test at 1920px (full HD)
6. Verify TOC positioning at each breakpoint
7. Verify metadata section layout at each breakpoint

#### Step 6.3: Visual Testing
1. Verify single H1 display (no duplicates)
2. Verify proper vertical rhythm and spacing
3. Verify breadcrumb → title → summary → image → metadata → content flow
4. Verify tag pills are clickable links with proper hover states
5. Verify author avatar displays correctly
6. Verify publication date formatted as "Month YYYY"
7. Verify updated date displays when applicable

#### Step 6.4: Accessibility Testing
1. Validate HTML semantics (single H1, proper heading hierarchy)
2. Test keyboard navigation through all interactive elements
3. Verify all images have appropriate alt text
4. Test with screen reader (VoiceOver on Mac or NVDA on Windows)
5. Verify color contrast meets WCAG AA standards
6. Test focus states for all interactive elements

#### Step 6.5: Cross-Browser Testing
1. Test in Chrome (latest)
2. Test in Firefox (latest)
3. Test in Safari (latest)
4. Test in Edge (latest)
5. Verify CSS custom properties work correctly
6. Verify responsive breakpoints behave consistently

### Phase 7: Dark Mode Verification

#### Step 7.1: Dark Mode Testing
1. Toggle dark mode
2. Verify all CSS variables resolve correctly
3. Verify text contrast in dark mode
4. Verify border colors visible in dark mode
5. Verify tag pill colors work in dark mode
6. Verify author avatar border/styling in dark mode

## File Modification Checklist

- [ ] `src/lib/utils/posts.server.ts` - Add word count calculation and author avatar path generation
- [ ] `src/app.css` - Add newspaper layout CSS variables
- [ ] `src/lib/components/blog/BlogLayout.svelte` - Complete component refactor
- [ ] `src/routes/blog/[...slug]/+page.svelte` - Add new props to postProps object
- [ ] `static/authors/default-avatar.png` - Create default avatar image
- [ ] `static/authors/` - Add individual author avatars (optional)

## Validation Criteria

### Layout Requirements
- ✓ Single H1 title display (no duplicates)
- ✓ Correct element order: Breadcrumb → Title → Summary → Image → Metadata → Content
- ✓ Metadata section has 4 subsections: Tags, Author, Border, Stats
- ✓ All key information visible above fold on 1920×1080 desktop viewport

### Metadata Display
- ✓ Tags displayed as clickable pills linking to `/blog/categories/{tag}`
- ✓ Tags right-aligned on desktop
- ✓ Author info includes circular avatar (48px)
- ✓ Author name in bold, title in muted color
- ✓ Horizontal border separates author from stats
- ✓ Reading time and word count on left side
- ✓ Publication date on right side in "Month YYYY" format
- ✓ Updated date shown conditionally when different from published

### Responsive Behavior
- ✓ TOC displays in sidebar on lg+ screens
- ✓ TOC moves below metadata on <lg screens
- ✓ Layout stacks vertically on mobile (<768px)
- ✓ Images scale proportionally across viewports
- ✓ Typography adjusts for mobile readability
- ✓ Touch targets at least 44×44px on mobile

### Technical Implementation
- ✓ Word count calculated from raw markdown content
- ✓ Author avatar uses fallback system
- ✓ All styling uses Tailwind CSS with CSS variables
- ✓ Props properly typed in TypeScript
- ✓ No console errors or warnings
- ✓ Enhanced images load correctly

### Accessibility
- ✓ Semantic HTML structure maintained
- ✓ Single H1 per page
- ✓ All images have alt text
- ✓ Color contrast meets WCAG AA
- ✓ Keyboard navigation functional
- ✓ Screen reader friendly

### Browser Compatibility
- ✓ Chrome, Firefox, Safari, Edge (latest versions)
- ✓ CSS custom properties supported
- ✓ Responsive breakpoints consistent

## Notes and Considerations

### Word Count Accuracy
The word count calculation strips HTML, code blocks, and URLs to provide an accurate prose word count. This may differ slightly from raw markdown word counts but better represents actual reading content.

### Author Avatar Strategy
Using a file-based avatar system allows easy management without database dependencies. The slug-based naming convention (lowercase, hyphenated) ensures URL-safe filenames.

### Tag URL Structure
Tag links point to `/blog/categories/{tag}` which matches the URL structure confirmed in PRD answers. Category pages are out of scope but links are implemented for future functionality.

### Table of Contents Dual Rendering
Rendering TOC twice (desktop sidebar + mobile inline) with conditional display classes is the simplest implementation. Alternative would be CSS-only responsive repositioning, but dual rendering provides better control and simplifies implementation.

### Date Display Logic
The "Updated" date only displays when it differs from "Published" by more than 1 day. This prevents redundant "Updated: same date" displays when posts are published and immediately updated.

### CSS Variable Naming
All new CSS variables follow the existing Vitesse-based naming convention and reference core palette variables for automatic dark mode support.

### Performance Considerations
- Word count calculation happens once during post loading (server-side)
- Enhanced images use existing optimization pipeline
- No new dependencies or bundle size impact
- TOC MutationObserver pattern already optimized in existing implementation

### Future Enhancements
While out of scope for this implementation, the refactored layout supports these future additions:
- Author profile pages (clickable author names)
- Category archive pages (tag links ready)
- Structured data / schema markup for articles
- Reading progress indicator
- Estimated reading completion time
- Print-specific styles for article printing
