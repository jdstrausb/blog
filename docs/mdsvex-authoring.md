# Authoring Posts with MDSvex

## Create a Post

- Add a new `.svx` file under `src/posts/<year>/`.
- Include the required frontmatter fields:
    - `title`, `summary`, `author`, `published_at`, `tags`, `reading_time`, `published`.
    - Optional: `updated_at`, `featured_image`.
- Reference local assets from `src/lib/assets/images/posts/` or colocated subfolders.

## Frontmatter Template

```yaml
---
title: 'Post Title'
summary: 'One sentence summary.'
author: 'Author Name'
published_at: '2025-03-01'
updated_at: '2025-03-05'
tags:
    - tag-one
    - tag-two
reading_time: 7
published: true
featured_image: './images/example.jpg'
---
```

## Content Tips

- Mix Markdown and Svelte freely; import components at the top of the file.
- Use code blocks for automatic Shiki highlighting.
- Embed `<enhanced:img>` for optimized images.
- Headings (`##`, `###`) automatically appear in the table of contents.

## Preview Locally

- Run `bun run dev` to launch the dev server.
- Visit `/blog` for the listing and `/blog/<path>` for the new post.
- Run `bun run check` before committing to catch type or MDsveX issues.
