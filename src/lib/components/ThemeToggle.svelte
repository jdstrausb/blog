<script lang="ts">
    import { ColorSchemeContext } from "$lib/theme.svelte";
    import type { ColorScheme } from "$lib/constants";

    const color_scheme = ColorSchemeContext.get();

    const schemes: { value: ColorScheme; label: string; icon: string }[] = [
        { value: 'light', label: 'Light', icon: '☀️' },
        { value: 'dark', label: 'Dark', icon: '🌙' },
        { value: 'system', label: 'System', icon: '💻' },
    ];

    function toggle_theme(scheme: ColorScheme) {
        // If the View Transitions API isn't available, just change the theme directly.

        if (!document.startViewTransition) {
            color_scheme.user = scheme;
            return;
        }

        // Use the ViewTransitions API for a smooth animation.
        const transition = document.startViewTransition(() => {
            color_scheme.user = scheme;
            document.documentElement.classList.add('in-theme-transition');
        });

        transition.finished.then(() => {
            document.documentElement.classList.remove('in-theme-transition');
        });
    }
</script>

<div class="flex items-center rounded-full border border-gray-300 dark:border-gray-700 p-1">
  {#each schemes as scheme}
    <button
      onclick={() => toggle_theme(scheme.value)}
      class="flex-1 rounded-full px-3 py-1 text-sm transition-colors"
      class:bg-gray-200={color_scheme.user === scheme.value}
      class:dark:bg-gray-600={color_scheme.user === scheme.value}
      class:hover:bg-gray-100={color_scheme.user !== scheme.value}
      class:dark:hover:bg-gray-800={color_scheme.user !== scheme.value}
      aria-label={`Switch to ${scheme.label} theme`}
      aria-pressed={color_scheme.user === scheme.value}
    >
      <span class="flex items-center justify-center gap-2">
        <span>{scheme.icon}</span>
        <span class="hidden sm:inline">{scheme.label}</span>
      </span>
    </button>
  {/each}
</div>
