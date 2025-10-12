<!-- src/lib/components/PageMenu.svelte -->
<script lang="ts">
    import { clickoutside } from '$lib/actions/clickoutside';

    let { onnavigate = () => {} }: { onnavigate?: () => void } = $props();
    let open = $state(false);

    const links = [
        { href: '/', name: 'Home' },
        { href: '/blog', name: 'Blog' },
        { href: '/about', name: 'About' }
    ];

    function handle_click_link() {
        open = false;
        onnavigate();
    }
</script>

<nav class="relative w-fit" use:clickoutside onclickoutside={() => (open = false)}>
    <label
        class="flex cursor-pointer items-center gap-2 p-2 transition-colors hover:text-[var(--link-hover-color)]"
    >
        <input class="peer sr-only" type="checkbox" name="page-menu" bind:checked={open} />
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-6 w-6"
        >
            <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span class="sr-only">Open Menu</span>
    </label>

    {#if open}
        <div
            class="absolute top-full right-0 z-10 mt-1.5 w-max overflow-hidden rounded-md border border-[var(--menu-border)] bg-[var(--menu-bg)] shadow-lg"
        >
            <ul>
                {#each links as link}
                    <li>
                        <a
                            class="block w-full px-4 py-2 text-left text-sm hover:bg-[var(--menu-item-hover-bg)]"
                            href={link.href}
                            onclick={handle_click_link}
                        >
                            {link.name}
                        </a>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</nav>
