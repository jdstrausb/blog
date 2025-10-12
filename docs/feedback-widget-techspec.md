# FeedbackWidget - Technical Specification

## Overview

This document provides implementation details for the FeedbackWidget feature, a user feedback collection system for blog posts. The widget enables readers to provide positive or negative feedback with optional contact information, which is delivered to the blog administrator via email.

## Architecture Overview

### Component Hierarchy
```
BlogLayout.svelte
  └── FeedbackWidget.svelte
```

### Data Flow
1. User interacts with FeedbackWidget buttons/forms
2. Component manages local state transitions
3. On form submission, component calls SvelteKit form action
4. Form action sends email via Postmark API
5. Success/error state returned to component
6. Component displays feedback message and resets after timeout

## Integration Points

### 1. BlogLayout Component Integration

**File:** `src/lib/components/blog/BlogLayout.svelte`

**Current State:**
- Lines 150-156 contain share and feedback section containers
- FeedbackWidget needs to be imported and rendered in the feedback section

**Changes Required:**

1. **Import Statement (Add after line 4):**
   - Import FeedbackWidget component
   - Place after ShareWidget import

2. **Horizontal Rule (Add after line 152):**
   - Insert `<hr>` element between share-section and feedback-section
   - Apply margin: `my-8` or `my-6` (consistent with ShareWidget spacing)
   - Style with border color using CSS variable `--muted-color`

3. **Widget Rendering (Replace line 155):**
   - Render FeedbackWidget component
   - Pass props: `postTitle={title}`, `postSlug={slug}`
   - Remove empty section content

### 2. CSS Variable System

**File:** `src/app.css`

**Existing Variables to Use:**
- `--muted-color`: Border and text muting (line 32)
- `--foreground`: Equivalent to `--text-color` (use for text)
- `--background`: Equivalent to `--bg-color` (use for backgrounds)
- `--v-border`: Border color (line 36)
- `--v-bg-soft`: Soft background for inputs (line 20, 139)

**New Variables to Add (in `:root` block after line 133):**

```css
/* Feedback widget variables */
--feedback-positive-color: #22c55e;
--feedback-positive-bg: rgba(34, 197, 94, 0.1);
--feedback-negative-color: #ef4444;
--feedback-negative-bg: rgba(239, 68, 68, 0.1);
```

**New Variables to Add (in `.dark` block after line 208):**

```css
/* Feedback widget variables */
--feedback-positive-color: #4ade80;
--feedback-positive-bg: rgba(74, 222, 128, 0.15);
--feedback-negative-color: #f87171;
--feedback-negative-bg: rgba(248, 113, 113, 0.15);
```

### 3. Environment Configuration

**File:** `.env` (and `.env.example`)

**New Variables to Add:**

```env
# Postmark email configuration
POSTMARK_API_TOKEN=your_postmark_token_here
ADMIN_EMAIL=jstrausb86@gmail.com
ADMIN_NAME=Jamie

# Public variables (accessible in browser)
PUBLIC_BASE_URL=http://localhost:5173
```

**Notes:**
- `POSTMARK_API_TOKEN`: Server-side only (no PUBLIC_ prefix)
- `PUBLIC_BASE_URL`: Already exists, ensure it's set
- `ADMIN_EMAIL` and `ADMIN_NAME`: Server-side only

### 4. TypeScript Type Definitions

**File:** `src/app.d.ts`

**New Type to Add:**

```typescript
export type FeedbackType = 'positive' | 'negative';

export interface FeedbackSubmission {
  postTitle: string;
  postSlug: string;
  feedbackType: FeedbackType;
  name?: string;
  email?: string;
  message: string;
}
```

### 5. Analytics Integration

**Existing Pattern:** `src/lib/components/blog/ShareWidget.svelte` (lines 84-95)

**Implementation Pattern:**
- Use `window.umami?.track()` method
- Check for existence before calling
- Include post metadata in event properties

**Event Names:**
- `'Feedback - Positive Button Clicked'`
- `'Feedback - Negative Button Clicked'`
- `'Feedback - Positive Submitted'`
- `'Feedback - Negative Submitted'`

**Event Properties:**
```typescript
{
  post: string,        // Post title
  slug: string,        // Post slug
  hasName: boolean,    // Whether name was provided
  hasEmail: boolean    // Whether email was provided
}
```

## Component Implementation: FeedbackWidget.svelte

### File Location
`src/lib/components/blog/FeedbackWidget.svelte`

### Component Props

```typescript
interface Props {
  postTitle: string;
  postSlug: string;
}
```

### State Management

**State Variables (using Svelte 5 runes):**

```typescript
type ViewState = 'initial' | 'positive-form' | 'negative-form' | 'success' | 'error';

let currentView = $state<ViewState>('initial');
let formData = $state({
  name: '',
  email: '',
  message: ''
});
let isSubmitting = $state(false);
let errorMessage = $state<string | null>(null);
let selectedFeedbackType = $state<'positive' | 'negative' | null>(null);
```

### State Transitions

**Initial View → Positive Form:**
- Triggered by: Thumbs up button click
- Actions:
  - Set `currentView = 'positive-form'`
  - Set `selectedFeedbackType = 'positive'`
  - Track analytics event: `'Feedback - Positive Button Clicked'`
  - Clear form data

**Initial View → Negative Form:**
- Triggered by: Thumbs down button click
- Actions:
  - Set `currentView = 'negative-form'`
  - Set `selectedFeedbackType = 'negative'`
  - Track analytics event: `'Feedback - Negative Button Clicked'`
  - Clear form data

**Form View → Initial View:**
- Triggered by: Cancel button click
- Actions:
  - Set `currentView = 'initial'`
  - Set `selectedFeedbackType = null`
  - Clear form data
  - Reset error message

**Form View → Success View:**
- Triggered by: Successful form submission
- Actions:
  - Set `currentView = 'success'`
  - Set `isSubmitting = false`
  - Track analytics event: `'Feedback - Positive/Negative Submitted'`
  - Start 4-second timeout

**Form View → Error View:**
- Triggered by: Failed form submission
- Actions:
  - Set `currentView = 'error'`
  - Set `isSubmitting = false`
  - Set `errorMessage` with error details
  - Keep form data intact

**Success View → Initial View:**
- Triggered by: 4-second timeout
- Actions:
  - Set `currentView = 'initial'`
  - Set `selectedFeedbackType = null`
  - Clear form data

### UI Components

#### 1. Initial View Structure

**Container:**
- Style attributes matching PRD container styling
- `margin-top: 3rem`
- `padding: 2rem`
- `border-top: 1px solid var(--muted-color)`
- `text-align: center`

**Heading:**
- Tag: `<h3>`
- Text: "Was this helpful?"
- Style: `font-size: 1.25rem`, `margin-bottom: 1rem`, `color: var(--foreground)`

**Button Container:**
- Tag: `<div>`
- Style: `display: flex`, `gap: 1rem`, `justify-content: center`, `align-items: center`

**Thumbs Up Button:**
- Tag: `<button>`
- Type: `button`
- Dimensions: `width: 60px`, `height: 60px`
- Shape: `border-radius: 50%`
- Border: `1px solid var(--muted-color)`
- Background: `transparent` (default)
- Cursor: `pointer`
- Transition: `0.2s`
- Display: `flex`, `align-items: center`, `justify-content: center`
- ARIA label: "Mark as helpful"
- Hover state:
  - Border color: `var(--feedback-positive-color)`
  - Background: `var(--feedback-positive-bg)`
  - SVG fill: `var(--feedback-positive-color)`
- Contains: Thumbs up SVG icon (24x24, path provided in PRD)

**Thumbs Down Button:**
- Same structure as thumbs up
- ARIA label: "Mark as not helpful"
- Hover state uses negative color variables
- SVG has `transform: rotate(180deg)` inline style

**Helper Text:**
- Tag: `<p>`
- Text: "Click to share your feedback"
- Style: `color: var(--muted-color)`, `margin-top: 1rem`, `font-size: 0.9rem`

#### 2. Positive Feedback Form Structure

**Container:**
- Same base styling as initial view
- Remove `text-align: center` for form

**Heading Container:**
- Tag: `<h3>`
- Style: `display: flex`, `align-items: center`, `justify-content: center`, `gap: 0.5rem`
- Contains:
  - Thumbs up SVG (20x20, no transform)
  - Text: "Glad you enjoyed it!"

**Form Element:**
- Tag: `<form>`
- Method: `POST`
- Action: `?/submitFeedback`
- Style: `max-width: 400px`, `margin: 0 auto`
- On submit: Handle via SvelteKit form action with enhance

**Form Fields (in order):**

1. **Name Field Container:**
   - Tag: `<div>`
   - Style: `margin-bottom: 1rem`
   - Contains:
     - Label: `for="name"`, text "Your name (optional)", styles from PRD
     - Input: `id="name"`, `name="name"`, `type="text"`, `placeholder="Your name"`, styles from PRD, bind to `formData.name`

2. **Email Field Container:**
   - Tag: `<div>`
   - Style: `margin-bottom: 1rem`
   - Contains:
     - Label: `for="email"`, text "Your email (optional)", styles from PRD
     - Input: `id="email"`, `name="email"`, `type="email"`, `placeholder="your.email@example.com"`, styles from PRD, bind to `formData.email`

3. **Message Field Container:**
   - Tag: `<div>`
   - Style: `margin-bottom: 1.5rem`
   - Contains:
     - Label: `for="message"`, text "Your message", styles from PRD
     - Textarea: `id="message"`, `name="message"`, `required`, `rows="4"`, `placeholder="What did you like about this post?"`, styles from PRD, bind to `formData.message`

4. **Button Container:**
   - Tag: `<div>`
   - Style: `display: flex`, `gap: 0.75rem`, `justify-content: center`
   - Contains:
     - Submit button: `type="submit"`, text "Send Feedback", styles from PRD, disabled when `isSubmitting`
     - Cancel button: `type="button"`, text "Cancel", styles from PRD, onClick handler to return to initial view

**Hidden Inputs:**
- `<input type="hidden" name="feedbackType" value="positive" />`
- `<input type="hidden" name="postTitle" value={postTitle} />`
- `<input type="hidden" name="postSlug" value={postSlug} />`

#### 3. Negative Feedback Form Structure

**Identical to positive form with these differences:**

**Heading:**
- Text: "Help me improve"
- SVG has `transform: rotate(180deg)`

**Message Placeholder:**
- Text: "What could be improved? Any suggestions?"

**Hidden Input:**
- `feedbackType` value is "negative"

#### 4. Success View Structure

**Container:**
- Same base styling as initial view

**Message:**
- Tag: `<p>`
- Text: "✅ Thanks for the feedback. Your message has been sent."
- Style: `font-size: 1.1rem`, `color: var(--foreground)`, `text-align: center`

**Auto-transition:**
- Use `setTimeout` in `$effect` when view changes to 'success'
- Duration: 4000ms (4 seconds)
- Cleanup: `clearTimeout` on component unmount or state change

#### 5. Error View Structure

**Container:**
- Same base styling as initial view

**Message:**
- Tag: `<p>`
- Text: "❌ Your message couldn't be sent at this time"
- Style: `font-size: 1.1rem`, `color: var(--feedback-negative-color)`, `text-align: center`, `margin-bottom: 1rem`

**Retry Button:**
- Tag: `<button>`
- Type: `button`
- Text: "Try Again"
- Style: Primary button styles from PRD
- onClick: Return to form view (maintain `selectedFeedbackType`)

### Form Submission Logic

**Implementation Pattern:**
- Use SvelteKit progressive enhancement with `use:enhance`
- Form action handles server-side processing
- Success/error handled via `enhance` callbacks

**Submit Handler Steps:**

1. **Pre-submission:**
   - Set `isSubmitting = true`
   - Disable submit button

2. **During submission:**
   - Form data automatically sent to action
   - Show loading state (optional spinner on button)

3. **On success response:**
   - Set `currentView = 'success'`
   - Set `isSubmitting = false`
   - Track analytics event
   - Start timeout for auto-reset

4. **On error response:**
   - Set `currentView = 'error'`
   - Set `isSubmitting = false`
   - Set `errorMessage` from response
   - Preserve form data

5. **On network error:**
   - Set `currentView = 'error'`
   - Set `isSubmitting = false`
   - Set generic error message
   - Preserve form data

### Conditional Rendering Logic

**Implementation:**
Use Svelte `{#if}` blocks based on `currentView` state:

```svelte
{#if currentView === 'initial'}
  <!-- Initial view JSX -->
{:else if currentView === 'positive-form'}
  <!-- Positive form JSX -->
{:else if currentView === 'negative-form'}
  <!-- Negative form JSX -->
{:else if currentView === 'success'}
  <!-- Success message JSX -->
{:else if currentView === 'error'}
  <!-- Error message JSX -->
{/if}
```

### Analytics Tracking Implementation

**Function Structure:**

```typescript
function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(eventName, properties);
  }
}
```

**Tracking Points:**

1. **Thumbs Up Click:**
   ```typescript
   trackEvent('Feedback - Positive Button Clicked', {
     post: postTitle,
     slug: postSlug
   });
   ```

2. **Thumbs Down Click:**
   ```typescript
   trackEvent('Feedback - Negative Button Clicked', {
     post: postTitle,
     slug: postSlug
   });
   ```

3. **Successful Submission:**
   ```typescript
   trackEvent(`Feedback - ${selectedFeedbackType === 'positive' ? 'Positive' : 'Negative'} Submitted`, {
     post: postTitle,
     slug: postSlug,
     hasName: !!formData.name,
     hasEmail: !!formData.email
   });
   ```

## Server-Side Implementation

### Form Action Implementation

**File:** `src/routes/blog/[...slug]/+page.server.ts`

**Location:** Add after existing `load` function export

**Action Export:**

```typescript
export const actions = {
  submitFeedback: async ({ request }) => {
    // Implementation details below
  }
};
```

**Action Implementation Steps:**

1. **Extract Form Data:**
   - Use `await request.formData()`
   - Extract: `feedbackType`, `postTitle`, `postSlug`, `name`, `email`, `message`
   - Validate required fields: `feedbackType`, `postTitle`, `postSlug`, `message`

2. **Validate Input:**
   - Ensure `message` is not empty (trim whitespace)
   - Validate `email` format if provided (regex or library)
   - Ensure `feedbackType` is either 'positive' or 'negative'
   - Return error response if validation fails

3. **Construct Email Data:**
   - Import environment variables: `POSTMARK_API_TOKEN`, `ADMIN_EMAIL`, `ADMIN_NAME`, `PUBLIC_BASE_URL`
   - Build email subject: `"New ${feedbackType} feedback on: ${postTitle}"`
   - Build email body using template (see Email Template section)
   - Build post URL: `${PUBLIC_BASE_URL}/blog/${postSlug}`

4. **Send Email via Postmark:**
   - Use fetch API to call Postmark API
   - Endpoint: `https://api.postmarkapp.com/email`
   - Method: POST
   - Headers:
     - `Accept: application/json`
     - `Content-Type: application/json`
     - `X-Postmark-Server-Token: ${POSTMARK_API_TOKEN}`
   - Body: JSON stringified email data

5. **Handle Response:**
   - If successful (status 200): Return `{ success: true }`
   - If failed: Log error, return `{ success: false, error: 'Your email couldn't be sent at this time' }`
   - On network error: Catch exception, return error response

6. **Error Logging:**
   - Log all errors to console with context
   - Include: feedbackType, postSlug, error message
   - Do NOT log user email/name for privacy

### Email Template

**Postmark API Request Body:**

```json
{
  "From": "notifications@yourdomain.com",
  "To": "${ADMIN_EMAIL}",
  "Subject": "New ${feedbackType} feedback on: ${postTitle}",
  "TextBody": "${emailBodyText}",
  "HtmlBody": "${emailBodyHtml}",
  "MessageStream": "outbound"
}
```

**Text Body Template:**

```
Hello ${ADMIN_NAME},

Reader ${name || 'Anonymous'} (email: ${email || 'Not provided'}) sent the following ${feedbackType} feedback about your post, "${postTitle}":

${message}

View post: ${postUrl}

---
This message was sent via the FeedbackWidget on your blog.
```

**HTML Body Template:**

```html
<p>Hello ${ADMIN_NAME},</p>

<p>Reader <strong>${name || 'Anonymous'}</strong> (email: ${email || 'Not provided'}) sent the following <strong>${feedbackType}</strong> feedback about your post, <a href="${postUrl}">${postTitle}</a>:</p>

<blockquote style="border-left: 3px solid #ccc; padding-left: 1rem; margin: 1rem 0; color: #333;">
  ${message}
</blockquote>

<p><a href="${postUrl}">View post</a></p>

<hr style="margin: 2rem 0; border: none; border-top: 1px solid #eee;" />

<p style="font-size: 0.9rem; color: #666;">This message was sent via the FeedbackWidget on your blog.</p>
```

**Template Variable Substitution:**
- Replace `${ADMIN_NAME}` with value from `ADMIN_NAME` env var
- Replace `${name}` with form data or 'Anonymous'
- Replace `${email}` with form data or 'Not provided'
- Replace `${feedbackType}` with 'positive' or 'negative'
- Replace `${postTitle}` with post title
- Replace `${postUrl}` with constructed URL
- Replace `${message}` with user message (escape HTML for HTML body)

### Email HTML Escaping

**For HTML Body:**
- Escape user-provided content: `name`, `message`
- Do NOT escape: `postTitle`, `postUrl`, `ADMIN_NAME` (trusted sources)
- Use HTML entity encoding:
  - `&` → `&amp;`
  - `<` → `&lt;`
  - `>` → `&gt;`
  - `"` → `&quot;`
  - `'` → `&#39;`

**Implementation:**
Create utility function:

```typescript
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
```

### Error Notification to Admin

**When Email Fails:**
- Log error with full context to server console
- Error log format: `[FeedbackWidget Error] Failed to send ${feedbackType} feedback for "${postTitle}": ${error.message}`
- Include stack trace in development mode
- Future enhancement: Send alert email via separate error notification system

### Environment Variable Validation

**On Server Startup:**
- Check for required environment variables
- Variables: `POSTMARK_API_TOKEN`, `ADMIN_EMAIL`, `ADMIN_NAME`, `PUBLIC_BASE_URL`
- Warn if any are missing (log to console)
- Form action should fail gracefully if variables are undefined

## Accessibility Implementation

### WCAG Compliance Requirements

#### 1. Keyboard Navigation

**Tab Order:**
- Initial view: Thumbs up button → Thumbs down button
- Form view: Name input → Email input → Message textarea → Submit button → Cancel button
- All interactive elements must be keyboard accessible

**Focus Indicators:**
- All buttons and inputs must show visible focus outline
- Use CSS `focus-visible` pseudo-class
- Minimum contrast ratio: 3:1 against adjacent colors
- Outline style: `2px solid currentColor` with `2px offset`

#### 2. Screen Reader Support

**Button Labels:**
- Thumbs up: `aria-label="Mark as helpful"`
- Thumbs down: `aria-label="Mark as not helpful"`
- Submit: Text content "Send Feedback" (sufficient)
- Cancel: Text content "Cancel" (sufficient)

**Form Labels:**
- All inputs must have associated `<label>` elements
- Use `for` attribute matching input `id`
- Labels must be visible (not hidden)

**SVG Icons:**
- Add `aria-hidden="true"` to decorative SVGs
- Use `role="img"` for meaningful SVGs
- Include `<title>` element in meaningful SVGs

**Live Regions:**
- Success message: `role="status"` and `aria-live="polite"`
- Error message: `role="alert"` and `aria-live="assertive"`
- Loading state: `aria-busy="true"` on form during submission

#### 3. Color Contrast

**Text Elements:**
- Normal text: Minimum 4.5:1 contrast ratio
- Large text (18pt+): Minimum 3:1 contrast ratio
- Check all text against background colors

**Interactive Elements:**
- Button borders: Minimum 3:1 contrast ratio
- Focus indicators: Minimum 3:1 contrast ratio
- Form input borders: Minimum 3:1 contrast ratio

**Color Variables Verification:**
- `--feedback-positive-color` on white/black backgrounds
- `--feedback-negative-color` on white/black backgrounds
- `--muted-color` for text usage
- Test both light and dark themes

#### 4. Form Validation

**Required Field Indication:**
- Message field marked with `required` attribute
- Visual indicator in label (not just color): "(required)" text or asterisk

**Error Messages:**
- Display inline below invalid fields
- Associate with field using `aria-describedby`
- Include error icon and text (not just color)
- Clear, specific error messages:
  - Empty message: "Please enter your feedback message"
  - Invalid email: "Please enter a valid email address"

**Validation Timing:**
- Validate on submit (server-side and client-side)
- Show errors immediately after submit attempt
- Clear errors when user corrects input

#### 5. Semantic HTML

**Structure:**
- Use semantic elements: `<form>`, `<label>`, `<input>`, `<textarea>`, `<button>`
- Heading hierarchy: `<h3>` for widget headings (appropriate level within BlogLayout)
- Avoid `<div>` buttons; use `<button>` elements
- Use appropriate input types: `type="email"` for email field

#### 6. Reduced Motion Support

**Respect User Preferences:**
- Check `prefers-reduced-motion` media query
- Disable success message auto-transition if reduced motion preferred
- Provide manual "Dismiss" button when auto-transition disabled
- Reduce or eliminate CSS transitions

**Implementation:**
```css
@media (prefers-reduced-motion: reduce) {
  .feedback-widget * {
    transition: none !important;
    animation: none !important;
  }
}
```

## Styling Implementation

### CSS Organization

**Approach:** Use Tailwind CSS classes where possible, inline styles for dynamic values

**Component Styling:**
- Container: Tailwind utility classes for margins, padding, borders
- Buttons: Combination of Tailwind and CSS variables for theming
- Form inputs: Tailwind form plugin classes + custom CSS variables
- Responsive: Tailwind responsive prefixes

### Button Hover States

**Implementation Strategy:**
Use Svelte's class directive for hover states:

```svelte
<button
  class="feedback-button"
  class:positive-hover={isHoveringPositive}
  onmouseenter={() => isHoveringPositive = true}
  onmouseleave={() => isHoveringPositive = false}
>
```

**CSS Classes:**

```css
.feedback-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1px solid var(--muted-color);
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.feedback-button.positive-hover {
  border-color: var(--feedback-positive-color);
  background-color: var(--feedback-positive-bg);
}

.feedback-button.positive-hover svg {
  fill: var(--feedback-positive-color);
}

.feedback-button.negative-hover {
  border-color: var(--feedback-negative-color);
  background-color: var(--feedback-negative-bg);
}

.feedback-button.negative-hover svg {
  fill: var(--feedback-negative-color);
}
```

**Alternative:** Use CSS `:hover` pseudo-class if dynamic classes not needed

### Form Input Styling

**Base Classes:**
- Use Tailwind forms plugin: `@tailwindcss/forms`
- Override with custom CSS variables for theming

**Input Styles:**
```css
.feedback-input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--muted-color);
  background-color: var(--background);
  color: var(--foreground);
  font-size: 0.9rem;
  font-family: inherit;
}

.feedback-input:focus {
  outline: 2px solid var(--v-primary);
  outline-offset: 2px;
  border-color: var(--v-primary);
}
```

### Responsive Design

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Responsive Adjustments:**
- Container padding: Reduce on mobile (`px-4` on mobile, `px-6` on desktop)
- Form max-width: Full width on mobile, 400px on desktop
- Button gap: Reduce on mobile if needed
- Font sizes: Scale down slightly on mobile

**Implementation:**
Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`

### Dark Mode Support

**Automatic Theming:**
- All CSS variables are theme-aware (defined in `:root` and `.dark`)
- Component uses CSS variables exclusively (no hard-coded colors)
- Test both light and dark modes

**Theme Variables Used:**
- `--foreground`: Text color
- `--background`: Background color
- `--muted-color`: Borders and muted text
- `--v-primary`: Primary accent color
- `--feedback-positive-color`: Positive feedback color
- `--feedback-negative-color`: Negative feedback color
- `--feedback-positive-bg`: Positive feedback background
- `--feedback-negative-bg`: Negative feedback background

## Testing Checklist

### Component Testing

**State Transitions:**
- [ ] Initial → Positive Form: Verify transition on thumbs up click
- [ ] Initial → Negative Form: Verify transition on thumbs down click
- [ ] Form → Initial: Verify transition on cancel click
- [ ] Form → Success: Verify transition on successful submission
- [ ] Form → Error: Verify transition on failed submission
- [ ] Success → Initial: Verify auto-transition after 4 seconds
- [ ] Error → Form: Verify retry button returns to correct form

**Form Validation:**
- [ ] Submit with empty message: Shows validation error
- [ ] Submit with invalid email: Shows validation error
- [ ] Submit with valid data: Passes validation
- [ ] Optional fields: Can submit without name/email

**Analytics Tracking:**
- [ ] Thumbs up click: Event tracked
- [ ] Thumbs down click: Event tracked
- [ ] Successful submission: Event tracked with correct type
- [ ] Event properties: Verify all properties included

**UI States:**
- [ ] Buttons disabled during submission
- [ ] Loading indicator shown (if implemented)
- [ ] Success message displays correctly
- [ ] Error message displays correctly
- [ ] Form data persists on error
- [ ] Form data clears on success/cancel

### Server-Side Testing

**Form Action:**
- [ ] Receives form data correctly
- [ ] Validates required fields
- [ ] Validates email format
- [ ] Constructs email correctly
- [ ] Sends email via Postmark
- [ ] Handles Postmark success response
- [ ] Handles Postmark error response
- [ ] Handles network errors
- [ ] Logs errors appropriately

**Email Delivery:**
- [ ] Email received at admin address
- [ ] Subject line correct
- [ ] Text body formatted correctly
- [ ] HTML body formatted correctly
- [ ] User data displayed correctly
- [ ] Post link functional
- [ ] Anonymous handling works (no name/email)

### Accessibility Testing

**Keyboard Navigation:**
- [ ] All interactive elements reachable via Tab
- [ ] Tab order logical
- [ ] Enter/Space activates buttons
- [ ] Escape closes forms (optional enhancement)

**Screen Reader:**
- [ ] Button labels announced correctly
- [ ] Form labels announced correctly
- [ ] Success message announced
- [ ] Error message announced
- [ ] Loading state announced

**Visual:**
- [ ] Focus indicators visible on all elements
- [ ] Color contrast meets WCAG AA standards
- [ ] Text readable in both themes
- [ ] UI understandable without color

**Validation:**
- [ ] Required fields indicated visually
- [ ] Error messages associated with fields
- [ ] Errors announced to screen readers

### Cross-Browser Testing

**Browsers:**
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

**Features:**
- [ ] CSS Grid/Flexbox layout
- [ ] CSS variables
- [ ] Form submission
- [ ] Fetch API
- [ ] SVG rendering

### Responsive Testing

**Breakpoints:**
- [ ] Mobile (375px - 639px)
- [ ] Tablet (640px - 1023px)
- [ ] Desktop (1024px+)

**Elements:**
- [ ] Container padding appropriate
- [ ] Buttons touchable on mobile (min 44x44px)
- [ ] Form inputs comfortable size
- [ ] Text readable at all sizes

### Integration Testing

**BlogLayout Integration:**
- [ ] FeedbackWidget renders correctly
- [ ] Props passed correctly (postTitle, postSlug)
- [ ] Horizontal rule displays correctly
- [ ] Spacing consistent with ShareWidget

**Theme Integration:**
- [ ] Colors match theme in light mode
- [ ] Colors match theme in dark mode
- [ ] Transitions smooth during theme change

**Analytics Integration:**
- [ ] Umami script loaded
- [ ] Events tracked in Umami dashboard
- [ ] Event properties captured correctly

## Deployment Checklist

### Environment Setup

**Production Environment Variables:**
- [ ] `POSTMARK_API_TOKEN` set in production environment
- [ ] `ADMIN_EMAIL` set correctly
- [ ] `ADMIN_NAME` set correctly
- [ ] `PUBLIC_BASE_URL` set to production domain
- [ ] `PUBLIC_ANALYTICS_SITE_ID` configured (for Umami)

**Postmark Configuration:**
- [ ] Postmark account created
- [ ] Sender signature verified for "From" address
- [ ] API token generated and secured
- [ ] Message stream configured (use "outbound")
- [ ] Test email sent successfully

### Pre-Deployment Testing

**Staging Environment:**
- [ ] Deploy to staging environment first
- [ ] Test all functionality end-to-end
- [ ] Verify email delivery
- [ ] Check analytics tracking
- [ ] Test with real user flows

**Performance:**
- [ ] Component loads quickly
- [ ] No layout shift on mount
- [ ] Form submission responsive
- [ ] Email delivery time acceptable (< 5 seconds)

### Post-Deployment Verification

**Functionality:**
- [ ] Submit test feedback (positive and negative)
- [ ] Verify email received
- [ ] Check analytics events in Umami
- [ ] Test on production domain
- [ ] Test with actual blog posts

**Monitoring:**
- [ ] Set up error monitoring for email failures
- [ ] Monitor analytics for engagement rates
- [ ] Watch for spam submissions
- [ ] Track email delivery success rate

## Future Enhancements

### Phase 2: Database Integration

**Schema:**
- Table: `feedback`
- Fields: `id`, `post_id`, `post_slug`, `post_title`, `feedback_type`, `name`, `email`, `message`, `created_at`, `ip_address`, `user_agent`
- Indexes: `post_id`, `feedback_type`, `created_at`

**Changes Required:**
- Update form action to save to database before sending email
- Email can be triggered async (after response sent)
- Add database error handling

### Phase 3: Admin Dashboard

**Features:**
- View all feedback entries
- Filter by post, type, date
- Mark as read/unread
- Respond to feedback (optional)
- Export feedback data

### Phase 4: Advanced Features

**Possible Additions:**
- Rate limiting per IP address
- Spam detection (Akismet integration)
- Feedback statistics on posts
- Public feedback display (optional, with moderation)
- Email verification for contact info

## Assumptions

1. **Postmark Account:** Assumes Postmark account is created and "From" email address is verified
2. **Email Sending:** Assumes email sending is synchronous and response includes delivery status
3. **SvelteKit Version:** Assumes SvelteKit 2.x with Svelte 5 runes
4. **Browser Support:** Assumes modern browsers with ES6+ support (last 2 versions)
5. **Umami Analytics:** Assumes Umami is already configured and `window.umami` is available
6. **No Spam Protection:** Initial version has no CAPTCHA or spam protection (relies on single-submission pattern)
7. **Styling Approach:** Assumes Tailwind CSS v4 with CSS variables for theming
8. **Server Rendering:** Assumes component will be client-rendered (analytics and form submission require browser)
9. **Email Template:** Assumes plain text and HTML email bodies are acceptable (no fancy design needed)
10. **Error Recovery:** Assumes users will manually retry on error (no automatic retry mechanism)

## Questions for Product Owner

Before implementation, clarify the following:

1. **Admin Name:** What value should be used for `ADMIN_NAME` in emails? (Suggested: "Jamie")
2. **Blog Domain:** Confirm production domain for `PUBLIC_BASE_URL`
3. **Postmark From Address:** What email address should be used as the "From" address in Postmark?
4. **Timeout Duration:** Confirm 4-second timeout for success message is acceptable
5. **Reduced Motion:** Should users with reduced motion preferences have a manual dismiss button instead of auto-timeout?
6. **Email Delivery Monitoring:** How should failed email deliveries be monitored/alerted?
7. **Spam Concerns:** Are there concerns about spam submissions? Should CAPTCHA be added in Phase 1?
8. **Multiple Submissions:** Should users be allowed to submit multiple feedbacks on the same post (current spec allows it)?
9. **Post ID:** Is post ID needed, or is slug sufficient for identifying posts?
10. **Analytics Events:** Confirm event naming convention matches existing analytics setup

## Implementation Order

Recommended implementation sequence:

1. **Environment Setup**
   - Add environment variables to `.env` and `.env.example`
   - Configure Postmark account and verify sender

2. **CSS Variables**
   - Add feedback color variables to `src/app.css`
   - Test in both light and dark themes

3. **Type Definitions**
   - Add types to `src/app.d.ts`

4. **Server-Side Implementation**
   - Create email sending function
   - Add form action to `+page.server.ts`
   - Test email delivery

5. **Component Implementation**
   - Create `FeedbackWidget.svelte` component
   - Implement state management
   - Build UI views (initial, forms, success, error)
   - Add form submission logic
   - Integrate analytics tracking

6. **BlogLayout Integration**
   - Import and render FeedbackWidget
   - Add horizontal rule separator
   - Test integration

7. **Accessibility Implementation**
   - Add ARIA labels and roles
   - Implement keyboard navigation
   - Test with screen readers
   - Verify color contrast

8. **Testing**
   - Unit test component states
   - Integration test with BlogLayout
   - End-to-end test email delivery
   - Accessibility audit
   - Cross-browser testing

9. **Deployment**
   - Deploy to staging
   - Test in production-like environment
   - Deploy to production
   - Monitor for issues

## Conclusion

This technical specification provides comprehensive implementation details for the FeedbackWidget feature. It covers all aspects from component architecture to server-side email delivery, ensuring WCAG accessibility compliance and seamless integration with the existing blog infrastructure.

The implementation prioritizes user experience, accessibility, and maintainability while providing a foundation for future enhancements like database persistence and admin dashboards.
