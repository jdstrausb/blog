<script lang="ts">
    import type { Picture } from 'vite-imagetools';
    import { getEnhancedImage } from '$lib/utils/enhanced-images.client';

    interface Props {
        src: string;
        alt: string;
        class?: string;
        loading?: 'lazy' | 'eager';
    }

    let { src, alt, class: className = '', loading = 'lazy' }: Props = $props();

    // Resolve enhanced image on client-side, same logic as BlogLayout.svelte
    const resolvedImage = $derived.by((): Picture | string => {
        const enhanced = getEnhancedImage(src);

        if (enhanced) {
            return enhanced;
        } else {
            return src;
        }
    });
</script>

{#if typeof resolvedImage === 'string'}
    <img {src} {alt} class={className} {loading} />
{:else}
    <enhanced:img src={resolvedImage} {alt} class={className} />
{/if}
