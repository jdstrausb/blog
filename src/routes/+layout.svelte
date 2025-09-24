<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import type { PageData } from './$types';
  import { ColorSchemeContext } from '$lib/theme.svelte';
  import Header from '$lib/components/Header.svelte';

  let { data, children }: { data: PageData; children: Snippet } = $props();

  // Initialize and provide the ColorSchemeContext to the entire app.
  // The initial value comes from the server hook via `data.shared_settings`.
  ColorSchemeContext.set({ user: data.shared_settings.colorScheme })
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Header />

<div class="pt-[var(--header-height)]">
    {@render children?.()}
</div>
