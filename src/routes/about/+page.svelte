<script lang="ts">
	import Header from '$lib/components/Header.svelte';
</script>

<div class="max-w-2xl mx-auto py-8 px-4">
  <Header />

  <!-- Main Content Section -->
  <div class="flex flex-col md:flex-row gap-8">
    <!-- Left Side: Avatar -->
    <div class="w-full md:w-1/3 flex justify-center md:justify-start">
      <div
        class="bg-gray-200 rounded-full w-48 h-48 flex items-center justify-center text-gray-500"
      >
        <!-- Placeholder for avatar image -->
        Avatar
      </div>
    </div>

    <!-- Right Side: Profile and Social Links -->
    <div class="w-full md:w-2/3">
      <div class="prose lg:prose-xl">
        <p>
          Welcome to my corner of the internet! This is where you can write a brief profile about
          yourself for visitors to read.
        </p>
        <p>
          You can share your interests, professional background, or anything else you'd like your
          readers to know.
        </p>
      </div>

      <!-- Social Media Links -->
      <div class="flex gap-1 mt-6 items-center">
        <a
          href="#"
          aria-label="LinkedIn Profile"
          class="p-2 text-gray-500 transition hover:text-indigo-600"
        >
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
            class="w-6 h-6"
            ><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect
              x="2"
              y="9"
              width="4"
              height="12"
            /><circle cx="4" cy="4" r="2" /></svg
          >
        </a>
        <a
          href="#"
          aria-label="GitHub Profile"
          class="p-2 text-gray-500 transition hover:text-indigo-600"
        >
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
            class="w-6 h-6"
            ><path
              d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
            /></svg
          >
        </a>
        <a
          href="#"
          aria-label="BlueSky Profile"
          class="p-2 text-gray-500 transition hover:text-indigo-600"
        >
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
            class="w-6 h-6"
            ><path
              d="M12 4c-2.5 2.5-5 4-8 5.5s-4.5 3-4.5 5.5c0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5c0-2.5-2-4-4.5-4.5s-4.5 2-4.5 4.5"
            /><path
              d="M12 4c2.5 2.5 5 4 8 5.5s4.5 3 4.5 5.5c0 2.5-2 4.5-4.5 4.5s-4.5-2-4.5-4.5c0-2.5 2-4 4.5-4.5s4.5 2 4.5 4.5"
            /></svg
          >
        </a>
      </div>
    </div>
  </div>
</div>

