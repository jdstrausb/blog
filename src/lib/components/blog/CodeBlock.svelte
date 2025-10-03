<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import { createHighlighter } from 'shiki';
    import { ColorSchemeContext } from '$lib/theme.svelte';

    interface Props {
        code?: string;
        language?: string;
        children?: import('svelte').Snippet;
    }

    let { code = '', language = 'text', children }: Props = $props();

    let copySuccess = $state(false);
    let copyTimeout: ReturnType<typeof setTimeout> | null = null;
    let highlightedHtml = $state('');
    let highlighter: any = null;

    // Get theme context
    const colorScheme = ColorSchemeContext.get();

    const copyToClipboard = async () => {
        if (!browser || !code) return;

        try {
            await navigator.clipboard.writeText(code);
            copySuccess = true;

            if (copyTimeout) clearTimeout(copyTimeout);
            copyTimeout = setTimeout(() => {
                copySuccess = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    // dark themes
    /* 
      - github-dark
      - vitesse-black
      - vitesse-dark
    */

    // light themes
    /* 
      - github-light
      - vitesse-light
    */


    const highlightCode = async () => {
        if (!highlighter || !code || !language) return;


        try {
            const theme = colorScheme.resolved === 'dark' ? 'vitesse-dark' : 'vitesse-light';
            const html = highlighter.codeToHtml(code, {
                lang: language,
                theme
            });

            highlightedHtml = html;
        } catch (err) {
            console.error('Failed to highlight code:', err);
            highlightedHtml = `<pre><code>${code}</code></pre>`;
        }
    };

    async function highlightHelper() {
        if (browser && code && language) {
            try {
                highlighter = await createHighlighter({
                    themes: ['vitesse-dark', 'vitesse-light'],
                    langs: [
                        'javascript',
                        'typescript',
                        'svelte',
                        'python',
                        'ruby',
                        'go',
                        'bash',
                        'sql',
                        'json',
                        'yaml',
                        'css',
                        'html',
                        'text'
                    ]
                });

                await highlightCode();
            } catch (err) {
                console.error('Failed to create highlighter:', err);
                highlightedHtml = `<pre><code>${code}</code></pre>`;
            }
        }
    }

    onMount(async () => {
        await highlightHelper();
    });

    // Re-highlight when theme changes
    $effect(() => {
        const currentTheme = colorScheme.resolved;
        if (highlighter && currentTheme) {
            highlightCode();
        }
    });
</script>

<div
    class="relative overflow-hidden rounded-lg border border-[var(--blog-code-border)] bg-[var(--blog-code-bg)] shadow-sm"
>
    {#if code}
        <div
            class="flex items-center justify-between border-b border-[var(--blog-code-border)] bg-[var(--muted-color)]/5 px-4 py-2"
        >
            <span class="font-mono text-xs tracking-wide text-[var(--muted-color)] uppercase">
                {language}
            </span>
            <button
                class="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-[var(--muted-color)] transition-colors hover:text-[var(--text-color)]"
                onclick={copyToClipboard}
                aria-label="Copy code to clipboard"
            >
                {#if copySuccess}
                    <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                        ></path>
                    </svg>
                    Copied!
                {:else}
                    <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        ></path>
                    </svg>
                    Copy
                {/if}
            </button>
        </div>
    {/if}

    <div class="overflow-x-auto">
        {#if children}
            {@render children()}
        {:else if highlightedHtml}
            {@html highlightedHtml}
        {:else if code}
            <pre class="text-sm"><code>{code}</code></pre>
        {/if}
    </div>
</div>
