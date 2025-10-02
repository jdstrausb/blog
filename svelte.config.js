import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import remarkUnwrapImages from 'remark-unwrap-images';
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mdsvexExtensions = ['.md', '.svx'];

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
    extensions: mdsvexExtensions,
    highlight: {
        highlighter: async (code, lang = 'text') => {
            // Return a Svelte component invocation instead of HTML
            const escapedCode = code.replace(/`/g, '\\`').replace(/\$/g, '\\$');
            return `<CodeBlock code={\`${escapedCode}\`} language="${lang}" />`;
        }
    },
    remarkPlugins: [remarkUnwrapImages, [remarkToc, { tight: true, ordered: true }]],
    rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
    layout: {
        _: path.join(__dirname, './src/lib/components/blog/BlogLayout.svelte')
    }
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs/kit/integrations
    // for more information about preprocessors
    preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
    kit: {
        adapter: adapter(),
        experimental: {
            remoteFunctions: true
        },
        alias: {
            $posts: './src/posts'
        }
    },
    compilerOptions: {
        experimental: {
            async: true
        }
    },
    extensions: ['.svelte', ...mdsvexExtensions]
};

export default config;
