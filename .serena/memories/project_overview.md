# Project Overview

## Purpose

This is a **SvelteKit-powered blog application** with MDSvex integration for rich markdown authoring. The blog supports:

- Interactive blog posts written in Markdown/Svelte (.svx files)
- Dark/light theme switching
- Enhanced code syntax highlighting with Shiki
- Database integration using Drizzle ORM with SQLite
- Component-driven content with reusable Svelte components
- Responsive design with TailwindCSS

## Key Features

- **MDSvex Integration**: Allows writing blog posts as `.md` or `.svx` files with frontmatter metadata and embedded Svelte components
- **Theme System**: Comprehensive light/dark theme switching with CSS variables
- **Code Highlighting**: Shiki-powered syntax highlighting for code blocks
- **Enhanced Images**: Image optimization with `@sveltejs/enhanced-img`
- **Database**: SQLite database with Drizzle ORM for data persistence
- **TypeScript**: Full TypeScript support throughout the application

## Tech Stack

- **Framework**: SvelteKit 2.x with Svelte 5.x
- **Language**: TypeScript
- **Styling**: TailwindCSS 4.x with custom CSS variables
- **Content**: MDSvex for markdown processing
- **Database**: SQLite with Drizzle ORM
- **Build Tool**: Vite 7.x
- **Package Manager**: npm (primary), bun.lock present
- **Deployment**: Node.js adapter
