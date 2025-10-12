<script lang="ts">
    interface Props {
        articleContainer?: HTMLElement | null;
        levels?: number[];
    }

    let { articleContainer = $bindable(null), levels = [2, 3] }: Props = $props();

    type TocEntry = {
        id: string;
        text: string;
        level: number;
    };

    let entries = $state<TocEntry[]>([]);
    let observer: MutationObserver | null = null;

    const collectEntries = () => {
        if (!articleContainer || typeof window === 'undefined') {
            entries = [];
            return;
        }

        const selector = levels.map((level) => `h${level}`).join(',');
        const nodes = Array.from(articleContainer.querySelectorAll<HTMLElement>(selector));

        entries = nodes
            .filter((heading) => heading.id)
            .map((heading) => ({
                id: heading.id,
                text: heading.textContent?.trim() ?? '',
                level: Number.parseInt(heading.tagName.replace('H', ''), 10)
            }));
    };

    const startObserver = () => {
        if (!articleContainer || typeof window === 'undefined') {
            return;
        }

        observer?.disconnect();

        observer = new MutationObserver(() => {
            collectEntries();
        });

        observer.observe(articleContainer, {
            subtree: true,
            childList: true,
            characterData: true
        });
    };

    $effect(() => {
        if (articleContainer && typeof window !== 'undefined') {
            collectEntries();
            startObserver();
        }

        return () => {
            observer?.disconnect();
        };
    });
</script>

<nav
    class="rounded-lg border border-[var(--blog-toc-border)] bg-[var(--blog-toc-bg)] p-4 shadow-sm"
>
    <h2 class="text-sm font-semibold tracking-wide text-[var(--blog-toc-heading)] uppercase">
        On this page
    </h2>

    {#if entries.length}
        <ol class="mt-3 space-y-2 text-sm">
            {#each entries as entry}
                <li
                    class={`leading-snug ${entry.level > 2 ? 'ml-4 border-l border-[var(--blog-toc-border)] pl-3' : ''}`}
                >
                    <a
                        class="text-[var(--blog-toc-link)] hover:text-[var(--blog-toc-link-hover)]"
                        href={`#${entry.id}`}
                    >
                        {entry.text}
                    </a>
                </li>
            {/each}
        </ol>
    {:else}
        <p class="mt-3 text-sm text-[var(--blog-toc-heading)]">
            Sections appear here once headings are available.
        </p>
    {/if}
</nav>
