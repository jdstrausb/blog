# PRD: Social Sharing Widget with Analytics

**Status:** Ready for Development
**Author:** Gemini (Product Manager)
**Date:** September 25, 2025

---

### 1. Overview & Business Goal

To increase blog post reach, traffic, and user engagement by enabling readers to easily share content on popular social media platforms. This feature includes analytics to track sharing activity, providing insight into which content and platforms are most effective for audience growth.

### 2. Success Metrics

- **Primary:** Number of clicks on any share button, tracked via Umami custom events.
- **Secondary:** Increase in referral traffic originating from the specified social platforms, as measured in the Umami dashboard.

### 3. User Stories

- **As a blog reader, I want to** easily share an article I find interesting on my social media profiles **so that** my followers and friends can discover and read it.
- **As the blog owner, I want to** track which articles are being shared and on which platforms **so that** I can understand what content resonates most with my audience and where my most engaged readers are.

### 4. Requirements & Scope

#### 4.1. Core Component: `ShareWidget.svelte`

- A new, self-contained Svelte component will be created at `src/lib/components/ShareWidget.svelte`.
- **Props:** The component must accept the following properties:
    - `postTitle` (type: `string`): The title of the blog post.
    - `postSlug` (type: `string`): The unique slug of the post.
- **UI/UX:**
    - The widget will render a set of buttons arranged in a flex layout.
    - Each button will contain the corresponding platform's **icon** and **name** (e.g., "X", "LinkedIn").
- **Platforms (MVP):** The widget will include dedicated sharing buttons for the following platforms:
    - X (Twitter)
    - BlueSky
    - LinkedIn
    - Hacker News
    - Reddit

#### 4.2. Functional Requirements

- **URL Construction:** The component will construct a full, absolute shareable URL for the post using a public environment variable (e.g., `PUBLIC_BASE_URL` + `postSlug`).
- **UTM Parameters:** All share URLs must be appended with UTM parameters for tracking purposes. The structure should be: `?utm_source=social&utm_medium=share_button&utm_campaign=[platform_name]`, where `[platform_name]` is the lower-case name of the platform (e.g., `hackernews`).
- **External Links:** All sharing links must open in a new browser tab (`target="_blank"`).

#### 4.3. Analytics Integration

- **Provider:** Umami will be used for all analytics.
- **Global Script:** The Umami tracking script will be added to the `<svelte:head>` section of the root layout (`src/routes/+layout.svelte`) to ensure it is present on all pages.
- **Event Tracking:** On clicking any share button, a custom Umami event must be triggered using the following structure: `umami.track('Share', { platform: '[PlatformName]', post: postTitle })`.

#### 4.4. Application Integration

- **Placement:** The `<ShareWidget />` component will be rendered at the end of the article content on individual blog post pages. This will likely be implemented in `src/routes/[slug]/+page.svelte` or a new layout file dedicated to posts.
- **Configuration:** The feature will be configured using public environment variables in `.env` and `.env.example`:
    - `PUBLIC_BASE_URL`: The root URL of the blog (e.g., `https://my-blog.com`).
    - `PUBLIC_ANALYTICS_SITE_ID`: The site ID provided by Umami for tracking.

---

### 5. Acceptance Criteria

- **Component:**
    - [ ] The file `src/lib/components/ShareWidget.svelte` has been created.
    - [ ] The widget correctly accepts `postTitle` and `postSlug` props.
- **UI/UX:**
    - [ ] The widget is displayed at the bottom of every published blog post.
    - [ ] The widget displays buttons for X, BlueSky, LinkedIn, Hacker News, and Reddit.
    - [ ] Each button correctly displays the platform's icon and text name.
- **Functionality:**
    - [ ] Clicking a share button opens the correct sharing URL for that platform in a new browser tab.
    - [ ] The generated share URL is an absolute URL (e.g., starts with `https://...`).
    - [ ] The share URL correctly includes the `utm_source`, `utm_medium`, and `utm_campaign` parameters.
- **Analytics:**
    - [ ] The Umami tracking script is present in the `<head>` of the site.
    - [ ] Clicking a share button fires an Umami `track` event with the event name `'Share'`.
    - [ ] The Umami event payload correctly identifies the `platform` and `post` title.
- **Configuration:**
    - [ ] The feature uses `PUBLIC_BASE_URL` and `PUBLIC_ANALYTICS_SITE_ID` from environment variables.
    - [ ] The `.env.example` file has been updated with the new variables.
