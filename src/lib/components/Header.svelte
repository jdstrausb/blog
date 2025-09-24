<script lang="ts">
  import { ScrollToggler } from '$lib/utils/scroll-toggler.svelte';
  import PageMenu from './PageMenu.svelte';
  import ThemeToggle from './ThemeToggle.svelte';

  const scroll_toggler = new ScrollToggler({ minScroll: 100, minScrollDelta: 50 });

  let toolbar_backdrop_opacity = $derived(scroll_toggler.min_scroll_progress);
</script>

<header
    class="fixed top-0 z-50 w-full transition-transform duration-300 {scroll_toggler.hidden ? '-translate-y-full' : ''}"
    use:scroll_toggler.attachment
>
  <div class="mx-auto flex max-w-2xl justify-end px-4 pt-4">
    <div
      class="relative flex w-fit items-center gap-2 rounded-md border bg-[var(--header-bg)] border-[var(--header-border)] px-2 py-1 shadow-md backdrop-blur-md"
    >
      <div
        class="absolute inset-0 -z-10 rounded-md bg-white/50 opacity-0 dark:bg-gray-900/50"
        style:opacity={toolbar_backdrop_opacity}
      >
        <!-- backdrop -->
      </div>
      <ThemeToggle />
      <div class="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
      <PageMenu />
    </div>
  </div>
</header>
