# Project Overview

## Purpose
This is a personal blog application built with SvelteKit and MDsveX, designed to publish and display articles written in MDX/Svelte format. The blog features a newspaper-inspired layout with support for interactive tutorials, code blocks, and rich metadata.

## Tech Stack

### Core Framework
- **SvelteKit 2.27+** - Full-stack web framework (Svelte 5 with runes)
- **TypeScript 5+** - Type-safe JavaScript with strict mode enabled
- **Vite 7+** - Build tool and dev server
- **Node.js Adapter** - For production deployment (`@sveltejs/adapter-node`)

### Content & Markdown
- **MDsveX 0.12+** - Markdown + Svelte component integration
- **Gray Matter** - Front matter parsing for blog posts
- **Remark plugins**: `remark-unwrap-images`, `remark-toc` (table of contents)
- **Rehype plugins**: `rehype-slug`, `rehype-autolink-headings`
- **Shiki 3+** - Syntax highlighting for code blocks
- **Marked 16+** - Additional markdown processing

### Styling
- **TailwindCSS 4** - Utility-first CSS framework
- **@tailwindcss/typography** - Prose styling for markdown content
- **@tailwindcss/forms** - Form styling
- **@sveltejs/enhanced-img** - Enhanced image optimization

### Database & Backend
- **Drizzle ORM 0.40+** - TypeScript ORM for database interactions
- **@libsql/client** - LibSQL/SQLite database client
- **Local SQLite** - Database stored in `local.db`

### Email
- **Nodemailer 7+** - Email sending functionality
- Email templates for feedback system (positive/negative feedback)

### Code Quality Tools
- **ESLint 9+** - Linting with TypeScript and Svelte plugins
- **Prettier 3+** - Code formatting with Svelte and Tailwind plugins
- **svelte-check** - Type checking for Svelte components

## Project Structure

```
blog/
├── src/
│   ├── routes/                    # SvelteKit routes
│   │   ├── +page.svelte          # Home page
│   │   ├── about/                # About page
│   │   └── blog/                 # Blog routes
│   │       ├── +page.svelte      # Blog listing page
│   │       └── [...slug]/        # Dynamic blog post pages
│   ├── posts/                    # Blog post content (.svx files)
│   │   └── 2025/                 # Posts organized by year
│   ├── lib/
│   │   ├── components/           # Reusable Svelte components
│   │   │   ├── blog/            # Blog-specific components
│   │   │   │   ├── BlogLayout.svelte     # Main blog post layout
│   │   │   │   ├── BlogPostCard.svelte   # Post preview cards
│   │   │   │   ├── CodeBlock.svelte      # Code syntax highlighting
│   │   │   │   ├── FeedbackWidget.svelte # Feedback system
│   │   │   │   ├── ShareWidget.svelte    # Social sharing
│   │   │   │   ├── TableOfContents.svelte # TOC sidebar
│   │   │   │   └── ...                   # Other blog components
│   │   │   └── ...              # General components
│   │   ├── utils/               # Utility functions
│   │   │   └── posts.server.ts  # Post loading and processing
│   │   ├── server/              # Server-side code
│   │   │   ├── db/              # Database schema and client
│   │   │   ├── email/           # Email templates and mailer
│   │   │   └── hooks.ts         # Server hooks
│   │   └── assets/              # Static assets (images, favicon)
│   ├── app.html                 # HTML template
│   ├── app.css                  # Global styles
│   └── hooks.server.ts          # SvelteKit server hooks
├── static/                      # Static files (served as-is)
│   └── authors/                 # Author avatar images
├── docs/                        # Project documentation (PRDs, tech specs)
├── drizzle/                     # Database migrations
├── package.json                 # Dependencies and scripts
├── svelte.config.js            # SvelteKit + MDsveX configuration
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── drizzle.config.ts           # Drizzle ORM configuration
└── .env                        # Environment variables (DATABASE_URL, etc.)
```

## Key Features

1. **MDsveX Blog Posts** - Write posts in `.svx` files with front matter metadata
2. **Newspaper Layout** - Professional article presentation with newspaper-inspired design
3. **Interactive Components** - Embed Svelte components directly in markdown
4. **Code Highlighting** - Syntax highlighting via Shiki with custom CodeBlock component
5. **Feedback System** - Reader feedback widgets with email notifications
6. **Share Widgets** - Social sharing functionality
7. **Table of Contents** - Auto-generated TOC from headings
8. **Enhanced Images** - Optimized image loading and responsive images
9. **Dark Mode** - Theme toggling support
10. **Responsive Design** - Mobile-first responsive layouts

## Environment Variables

Required environment variables (see `.env.example`):
- `DATABASE_URL` - SQLite database connection string
- Email configuration (if using email features)

## Browser Target
Modern browsers with CSS variables support (Chrome, Firefox, Safari, Edge latest versions)