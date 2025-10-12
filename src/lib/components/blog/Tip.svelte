<script lang="ts">
    interface Props {
        title?: string;
        children?: import('svelte').Snippet;
    }

    let { title = '', children }: Props = $props();
</script>

<div
    class="tip-container rounded-lg border border-[var(--blog-tip-border)] bg-[var(--blog-tip-bg)] p-4 shadow-sm"
>
    {#if title}
        <p class="mb-2 text-sm font-semibold tracking-wide uppercase">{title}</p>
    {/if}
    <div class="tip-prose prose">
        {@render children?.()}
    </div>
</div>
