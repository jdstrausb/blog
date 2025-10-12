# FeedbackWidget - Product Requirements Document

## Overview

The FeedbackWidget is an interactive component that enables blog readers to provide feedback on individual blog posts. The widget collects user sentiment (positive or negative) and optional detailed feedback, delivering this information to the blog administrator via email.

## Goals

- **User Engagement**: Enable readers to share their thoughts and feedback on blog posts
- **Quality Improvement**: Gather actionable feedback to improve content quality
- **User Connection**: Provide optional contact details for follow-up conversations
- **Analytics**: Track user engagement with feedback mechanisms

## Non-Goals

- Database persistence (deferred to future iteration)
- Admin dashboard for viewing feedback
- Reply/threading functionality
- Public display of feedback/comments

## User Stories

### Story 1: Reader Provides Positive Feedback
**As a** blog reader
**I want to** quickly indicate that I found a post helpful
**So that** I can show appreciation to the author

**Acceptance Criteria:**
- [ ] User sees "Was this helpful?" prompt with thumbs up/down buttons
- [ ] Clicking thumbs up button displays positive feedback form
- [ ] Form includes heading "Glad you enjoyed it!" with thumbs up icon
- [ ] Thumbs up button hover state shows green border and icon with light green background
- [ ] Form includes optional name field with placeholder "Your name"
- [ ] Form includes optional email field with placeholder "your.email@example.com"
- [ ] Form includes required message field with placeholder "What did you like about this post?"
- [ ] Form includes "Send Feedback" and "Cancel" buttons
- [ ] All form fields follow WCAG accessibility guidelines

### Story 2: Reader Provides Negative Feedback
**As a** blog reader
**I want to** share constructive criticism about a post
**So that** the author can improve future content

**Acceptance Criteria:**
- [ ] Clicking thumbs down button displays negative feedback form
- [ ] Form includes heading "Help me improve" with thumbs down icon
- [ ] Thumbs down button hover state shows red border and icon with light red background
- [ ] Form includes optional name field with placeholder "Your name"
- [ ] Form includes optional email field with placeholder "your.email@example.com"
- [ ] Form includes required message field with placeholder "What could be improved? Any suggestions?"
- [ ] Form includes "Send Feedback" and "Cancel" buttons
- [ ] All form fields follow WCAG accessibility guidelines

### Story 3: User Cancels Feedback Submission
**As a** blog reader
**I want to** cancel my feedback submission
**So that** I can change my mind without submitting

**Acceptance Criteria:**
- [ ] Cancel button returns widget to initial "Was this helpful?" state
- [ ] Form data is cleared when cancelled
- [ ] No tracking event is recorded for cancelled submissions

### Story 4: User Submits Feedback Successfully
**As a** blog reader
**I want to** receive confirmation that my feedback was sent
**So that** I know my input was received

**Acceptance Criteria:**
- [ ] Submit button is disabled after clicking to prevent duplicate submissions
- [ ] Success message displays: "✅ Thanks for the feedback. Your message has been sent."
- [ ] Success message persists for 3-5 seconds
- [ ] Widget automatically returns to initial state after timeout
- [ ] Umami analytics event is tracked with feedback type and post information

### Story 5: Administrator Receives Feedback Email
**As a** blog administrator
**I want to** receive email notifications of reader feedback
**So that** I can review and respond to reader input

**Acceptance Criteria:**
- [ ] Email is sent to `jstrausb86@gmail.com` via Postmark API
- [ ] Email includes reader's name (or "Anonymous" if not provided)
- [ ] Email includes reader's email address (or "Not provided" if not provided)
- [ ] Email includes feedback type (positive/negative)
- [ ] Email includes post title and clickable link to post
- [ ] Email includes post slug and ID for reference
- [ ] Email includes full message text
- [ ] Email format follows template:
  ```
  Hello ${ADMIN_NAME},

  Reader ${READER_NAME | "Anonymous"} (email: ${CAPTURED_EMAIL | "Not provided"}) sent the following ${"positive" | "negative"} feedback about your post, [${POST_TITLE}](${BLOG_DOMAIN}/${POST_SLUG}):

  ${MESSAGE}
  ```

### Story 6: Feedback Submission Fails
**As a** blog reader
**I want to** be notified if my feedback couldn't be sent
**So that** I can try again later

**Acceptance Criteria:**
- [ ] Error message displays: "Your email couldn't be sent at this time"
- [ ] Submit button is re-enabled to allow retry
- [ ] Form data is preserved so user doesn't lose their message
- [ ] Administrator is notified of email delivery failure via separate alert mechanism

### Story 7: Analytics Tracking
**As a** blog administrator
**I want to** track feedback widget interactions
**So that** I can measure engagement and identify popular content

**Acceptance Criteria:**
- [ ] Thumbs up click tracked with event: `Feedback - Positive Button Clicked`
- [ ] Thumbs down click tracked with event: `Feedback - Negative Button Clicked`
- [ ] Successful positive submission tracked with event: `Feedback - Positive Submitted`
- [ ] Successful negative submission tracked with event: `Feedback - Negative Submitted`
- [ ] All events include post title and slug as properties
- [ ] Tracking uses existing Umami integration pattern from ShareWidget

## Technical Requirements

### Component Structure

**File Location:** `src/lib/components/blog/FeedbackWidget.svelte`

**Props:**
- `postTitle: string` - Title of the blog post
- `postSlug: string` - URL slug of the blog post
- `postId?: string` - Optional post identifier

### Integration Point

The FeedbackWidget will be rendered in [BlogLayout.svelte:154-156](src/lib/components/blog/BlogLayout.svelte#L154-L156) within the `.feedback-section` container.

A horizontal rule (`<hr>`) should be added between the `.share-section` and `.feedback-section` with appropriate margin spacing.

### State Management

**Component States:**
1. `initial` - Default view showing "Was this helpful?" with thumbs up/down buttons
2. `positive-form` - Positive feedback form displayed
3. `negative-form` - Negative feedback form displayed
4. `success` - Success message displayed
5. `error` - Error message displayed

**State Variables:**
- `currentView: 'initial' | 'positive-form' | 'negative-form' | 'success' | 'error'`
- `formData: { name: string, email: string, message: string }`
- `isSubmitting: boolean`
- `errorMessage: string | null`

### Styling Requirements

**Container Styles:**
```css
line-height: 1.6;
box-sizing: border-box;
margin: 0;
margin-top: 3rem;
padding: 2rem;
border-top: 1px solid var(--muted-color, #888);
text-align: center;
```

**Button Hover States:**
- Thumbs up button:
  - Border: Green (`#22c55e` or similar)
  - Icon: Green (`#22c55e` or similar)
  - Background: Light green (`rgba(34, 197, 94, 0.1)` or similar)

- Thumbs down button:
  - Border: Red (`#ef4444` or similar)
  - Icon: Red (`#ef4444` or similar)
  - Background: Light red (`rgba(239, 68, 68, 0.1)` or similar)

**Button Dimensions:**
- Width: 60px
- Height: 60px
- Border-radius: 50% (circular)
- Gap between buttons: 1rem

### Email Integration

**Service:** Postmark API
**Endpoint:** TBD (to be configured)
**Recipient:** `jstrausb86@gmail.com`

**API Route:** `POST /api/feedback`

**Request Body:**
```typescript
{
  postTitle: string;
  postSlug: string;
  postId?: string;
  feedbackType: 'positive' | 'negative';
  name?: string;
  email?: string;
  message: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  error?: string;
}
```

### Analytics Integration

**Pattern:** Follow `withTracking` pattern from [ShareWidget.svelte:84-95](src/lib/components/blog/ShareWidget.svelte#L84-L95)

**Events to Track:**
- `Feedback - Positive Button Clicked` - When thumbs up is clicked
- `Feedback - Negative Button Clicked` - When thumbs down is clicked
- `Feedback - Positive Submitted` - When positive feedback is successfully sent
- `Feedback - Negative Submitted` - When negative feedback is successfully sent

**Event Properties:**
```typescript
{
  post: string;        // Post title
  slug: string;        // Post slug
  hasName: boolean;    // Whether name was provided
  hasEmail: boolean;   // Whether email was provided
}
```

### Accessibility Requirements

**WCAG Compliance:**
- [ ] All interactive elements have proper ARIA labels
- [ ] Form inputs have associated label elements
- [ ] Error messages are announced to screen readers
- [ ] Focus management when switching between states
- [ ] Keyboard navigation support for all interactions
- [ ] Sufficient color contrast for all text and icons (minimum 4.5:1)
- [ ] Focus indicators visible on all interactive elements
- [ ] Form validation messages are descriptive and helpful

**Semantic HTML:**
- Use `<button>` elements for interactive controls
- Use `<form>` element for input collection
- Use proper heading hierarchy (`<h3>` for widget headings)
- Use `<label>` elements properly associated with inputs
- Use `required` attribute for required fields

### Rate Limiting

**Current Implementation:**
- Submit button disabled after click until form resolves
- Widget resets after success message timeout (3-5 seconds)
- No cross-session rate limiting in initial version

**Future Consideration:**
- Session-based rate limiting (one feedback per post per session)
- Client-side localStorage tracking

## Error Handling

### Email Delivery Failure

**User Experience:**
- Display error message: "Your email couldn't be sent at this time"
- Keep form data intact
- Re-enable submit button for retry

**Admin Notification:**
- Log error to console
- Send alert email to administrator (separate from feedback email)
- Include error details and user's attempted submission

### Form Validation Errors

- Message field is required
- Email field validates email format (if provided)
- Display inline validation errors below fields
- Prevent submission until validation passes

## Future Enhancements

### Database Integration (Deferred)

**Schema Proposal:**
```sql
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id TEXT NOT NULL,
  post_slug TEXT NOT NULL,
  post_title TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK(feedback_type IN ('positive', 'negative')),
  name TEXT,
  email TEXT,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT
);
```

**Benefits of Database Storage:**
- Admin dashboard for viewing all feedback
- Aggregate analytics on post performance
- Trend analysis over time
- Export capabilities

## Open Questions

- [x] Database storage requirement - **Decision:** Defer to future iteration
- [x] Email service provider - **Decision:** Use Postmark
- [x] Admin email address - **Decision:** `jstrausb86@gmail.com`
- [x] Rate limiting approach - **Decision:** Per-submission only (button disabled)
- [ ] Admin name for email template - **Needs input**
- [ ] Blog domain for email links - **Needs input** (likely from `PUBLIC_BASE_URL` env var)
- [ ] Postmark API credentials setup - **Needs configuration**
- [ ] Timeout duration preference - **Suggested:** 4 seconds

## Success Metrics

- **Engagement Rate:** Percentage of post views that result in feedback button click
- **Submission Rate:** Percentage of opened forms that result in submission
- **Positive vs Negative Ratio:** Balance of positive to negative feedback
- **Email Delivery Success Rate:** Percentage of submissions that successfully deliver email
- **Form Completion Time:** Average time users spend filling out feedback forms

## Implementation Phases

### Phase 1: Component Structure
- [ ] Create FeedbackWidget.svelte component
- [ ] Implement state management
- [ ] Build initial view with thumbs up/down buttons
- [ ] Add button hover states and styling

### Phase 2: Form Implementation
- [ ] Build positive feedback form
- [ ] Build negative feedback form
- [ ] Implement form validation
- [ ] Add cancel functionality

### Phase 3: Email Integration
- [ ] Create `/api/feedback` endpoint
- [ ] Configure Postmark API
- [ ] Implement email template
- [ ] Add error handling for email failures

### Phase 4: Success/Error States
- [ ] Implement success message display
- [ ] Add timeout for state reset
- [ ] Implement error message display
- [ ] Add retry functionality

### Phase 5: Analytics & Polish
- [ ] Integrate Umami tracking
- [ ] Add loading states during submission
- [ ] Ensure WCAG accessibility compliance
- [ ] Add horizontal rule separator in BlogLayout

### Phase 6: Testing
- [ ] Test form validation
- [ ] Test email delivery
- [ ] Test error scenarios
- [ ] Test accessibility with screen readers
- [ ] Test analytics tracking
- [ ] Cross-browser testing

## Dependencies

- **Postmark Account:** Required for email delivery
- **Umami Analytics:** Already integrated, pattern available in ShareWidget
- **Environment Variables:**
  - `POSTMARK_API_KEY` - API key for Postmark
  - `PUBLIC_BASE_URL` - Base URL for email links
  - `ADMIN_EMAIL` - Administrator email (default: `jstrausb86@gmail.com`)
  - `ADMIN_NAME` - Administrator name for email greetings

## References

- [ShareWidget Implementation](src/lib/components/blog/ShareWidget.svelte) - Analytics tracking pattern
- [BlogLayout Integration Point](src/lib/components/blog/BlogLayout.svelte#L154-L156)
- [Postmark Documentation](https://postmarkapp.com/developer)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
