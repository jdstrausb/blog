<script lang="ts">
    import { ScrollToTopManager } from '$lib/utils/scroll-toggler.svelte';
    import { cubicOut } from 'svelte/easing';

    const scrollManager = new ScrollToTopManager();

    const handleClick = () => {
        scrollManager.scrollToTop();
    };

    let containerDiv: HTMLDivElement;

    // Custom transition that slides from/to bottom with opacity
    function slideVertical(node: HTMLElement, { duration = 300, delay = 0 } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;

        return {
            delay,
            duration,
            easing: cubicOut,
            css: (t: number) => {
                const eased = cubicOut(t);
                // Keep horizontal centering (-50%) while animating vertical position
                // t=0: button below viewport (100px down), t=1: button at final position (0)
                const translateY = (1 - eased) * 100;
                return `
                    transform: translate(-50%, ${translateY}px);
                    opacity: ${eased * opacity};
                `;
            }
        };
    }
</script>

<!-- Hidden container that's always in the DOM to attach scroll listeners -->
<div bind:this={containerDiv} use:scrollManager.attachment style="display: none;"></div>

{#if scrollManager.visible}
    <button
        class="fixed bottom-6 left-1/2 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--scroll-button-bg)] shadow-lg transition-opacity hover:cursor-pointer hover:shadow-xl"
        style="transform: translateX(-50%); opacity: {scrollManager.faded ? 0 : 1};"
        in:slideVertical={{ duration: 300 }}
        out:slideVertical={{ duration: 300 }}
        onclick={handleClick}
        aria-label="Scroll to top"
    >
        <!-- Chevron Up Icon -->
        <svg
            class="h-5 w-5 text-[var(--scroll-button-icon)] transition-colors hover:text-[var(--scroll-button-icon-hover)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 15l7-7 7 7"
            />
        </svg>
    </button>
{/if}
