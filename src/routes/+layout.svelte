<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { PageData } from './$types';
    import { ColorSchemeContext } from '$lib/theme.svelte';
    import Header from '$lib/components/Header.svelte';
    import '../app.css';
    import favicon from '$lib/assets/favicon.svg';
    import { env } from '$env/dynamic/public';

    let { data, children }: { data: PageData; children: Snippet } = $props();

    // Initialize and provide the ColorSchemeContext to the entire app.
    // The initial value comes from the server hook via `data.shared_settings`.
    ColorSchemeContext.set({ user: data.shared_settings.colorScheme });

    const analyticsSiteId = env.PUBLIC_ANALYTICS_SITE_ID;

    if (!analyticsSiteId && typeof console !== 'undefined') {
        console.warn('Umami analytics disabled: PUBLIC_ANALYTICS_SITE_ID not provided.');
    }
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    {#if analyticsSiteId}
        <script
            async
            defer
            src="https://analytics.umami.is/script.js"
            data-website-id={analyticsSiteId}
        ></script>
    {/if}
</svelte:head>

<Header />

<div class="pt-[var(--header-height)]">
    {@render children?.()}
</div>
