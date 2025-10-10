<script lang="ts">
  import { enhance } from '$app/forms';

  interface Props {
    postTitle: string;
    postSlug: string;
  }

  let { postTitle, postSlug }: Props = $props();

  type ViewState = 'initial' | 'positive-form' | 'negative-form' | 'success' | 'error';
  type FeedbackType = 'positive' | 'negative';

  let currentView = $state<ViewState>('initial');
  let formData = $state({
    name: '',
    email: '',
    message: ''
  });
  let isSubmitting = $state(false);
  let errorMessage = $state<string | null>(null);
  let selectedFeedbackType = $state<FeedbackType | null>(null);

  // Analytics tracking function
  function trackEvent(eventName: string, properties?: Record<string, string | boolean>) {
    if (typeof window !== 'undefined' && window.umami) {
      const stringProps: Record<string, string> = {};
      if (properties) {
        for (const [key, value] of Object.entries(properties)) {
          stringProps[key] = String(value);
        }
      }
      window.umami.track(eventName, stringProps);
    }
  }

  // Handle thumbs up click
  function handlePositiveClick() {
    currentView = 'positive-form';
    selectedFeedbackType = 'positive';
    trackEvent('Feedback - Positive Button Clicked', {
      post: postTitle,
      slug: postSlug
    });
    clearFormData();
  }

  // Handle thumbs down click
  function handleNegativeClick() {
    currentView = 'negative-form';
    selectedFeedbackType = 'negative';
    trackEvent('Feedback - Negative Button Clicked', {
      post: postTitle,
      slug: postSlug
    });
    clearFormData();
  }

  // Handle cancel
  function handleCancel() {
    currentView = 'initial';
    selectedFeedbackType = null;
    clearFormData();
    errorMessage = null;
  }

  // Clear form data
  function clearFormData() {
    formData = {
      name: '',
      email: '',
      message: ''
    };
  }

  // Auto-reset success message after timeout
  $effect(() => {
    if (currentView === 'success') {
      const timeoutId = setTimeout(() => {
        currentView = 'initial';
        selectedFeedbackType = null;
        clearFormData();
      }, 4000);

      return () => clearTimeout(timeoutId);
    }
  });

  // SVG icons
  const thumbsUpIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3v11z"></path></svg>`;
  const thumbsDownIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="rotate-180"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3v11z"></path></svg>`;
</script>

{#if currentView === 'initial'}
  <!-- Initial View -->
  <div class="mt-12 border-t p-8 text-center text-[var(--text-color)]">
    <h3 class="mb-4 text-xl text-[var(--text-color)]">Was this helpful?</h3>
    <div class="flex items-center justify-center gap-4">
      <button
        type="button"
        class="feedback-button positive"
        onclick={handlePositiveClick}
        aria-label="Mark as helpful"
      >
        <span aria-hidden="true">{@html thumbsUpIcon}</span>
      </button>
      <button
        type="button"
        class="feedback-button negative"
        onclick={handleNegativeClick}
        aria-label="Mark as not helpful"
      >
        <span aria-hidden="true">{@html thumbsDownIcon}</span>
      </button>
    </div>
    <p class="mt-4 text-sm text-[var(--muted-color)]">Click to share your feedback</p>
  </div>
{:else if currentView === 'positive-form' || currentView === 'negative-form'}
  <!-- Feedback Form -->
  <div class="mt-12 border-t p-8" style="border-color: var(--muted-color);">
    <h3
      class="mb-4 flex items-center justify-center gap-2 text-center text-xl"
      style="color: var(--text-color);"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        class={currentView === 'negative-form' ? 'rotate-180' : ''}
      >
        <path
          d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3v11z"
        ></path>
      </svg>
      {currentView === 'positive-form' ? 'Glad you enjoyed it!' : 'Help me improve'}
    </h3>
    <form
      method="POST"
      action="?/submitFeedback"
      class="mx-auto max-w-md"
      use:enhance={() => {
        isSubmitting = true;
        return async ({ result }) => {
          isSubmitting = false;
          if (result.type === 'success') {
            currentView = 'success';
            trackEvent(
              `Feedback - ${selectedFeedbackType === 'positive' ? 'Positive' : 'Negative'} Submitted`,
              {
                post: postTitle,
                slug: postSlug,
                hasName: !!formData.name,
                hasEmail: !!formData.email
              }
            );
          } else if (result.type === 'failure') {
            currentView = 'error';
            errorMessage =
              (result.data?.error as string) ||
              'Your message failed to send due to an application error.';
          } else {
            currentView = 'error';
            errorMessage = 'Your message failed to send due to an application error.';
          }
        };
      }}
    >
      <input type="hidden" name="feedbackType" value={selectedFeedbackType} />
      <input type="hidden" name="postTitle" value={postTitle} />
      <input type="hidden" name="postSlug" value={postSlug} />

      <div class="mb-4">
        <label for="name" class="mb-1 block text-sm text-[var(--text-color)]"
          >Your name (optional)</label
        >
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Your name"
          bind:value={formData.name}
          class="feedback-input"
        />
      </div>

      <div class="mb-4">
        <label for="email" class="mb-1 block text-sm text-[var(--text-color)]"
          >Your email (optional)</label
        >
        <input
          id="email"
          name="email"
          type="email"
          placeholder="your.email@example.com"
          bind:value={formData.email}
          class="feedback-input"
        />
      </div>

      <div class="mb-6">
        <label for="message" class="mb-1 block text-sm text-[var(--text-color)]"
          >Your message</label
        >
        <textarea
          id="message"
          name="message"
          required
          rows="4"
          placeholder={currentView === 'positive-form'
            ? 'What did you like about this post?'
            : 'What could be improved? Any suggestions?'}
          bind:value={formData.message}
          class="feedback-input resize-y"
        ></textarea>
      </div>

      <div class="flex justify-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          class="feedback-submit-button"
          aria-busy={isSubmitting}
        >
          Send Feedback
        </button>
        <button type="button" onclick={handleCancel} class="feedback-cancel-button">
          Cancel
        </button>
      </div>
    </form>
  </div>
{:else if currentView === 'success'}
  <!-- Success View -->
  <div class="mt-12 border-t p-8 text-center border-[var(--muted-color)]" role="status" aria-live="polite">
    <p class="text-lg" style="color: var(--text-color);">
      ✅ Thanks for the feedback. Your message has been sent.
    </p>
  </div>
{:else if currentView === 'error'}
  <!-- Error View -->
  <div class="mt-12 border-t p-8 text-center border-[var(--muted-color)]" role="alert" aria-live="assertive">
    <p class="mb-4 text-lg" style="color: var(--feedback-negative-color);">
      ❌ {errorMessage || 'Your message failed to send due to an application error.'}
    </p>
    <button
      type="button"
      onclick={() => {
        currentView = selectedFeedbackType === 'positive' ? 'positive-form' : 'negative-form';
        errorMessage = null;
      }}
      class="feedback-retry-button"
    >
      Try Again
    </button>
  </div>
{/if}

<style>
  .feedback-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 1px solid var(--muted-color);
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-color);
  }

  .feedback-button:hover {
    transform: scale(1.05);
  }

  .feedback-button.positive:hover {
    border-color: var(--feedback-positive-color);
    background-color: var(--feedback-positive-bg);
    color: var(--feedback-positive-color);
  }

  .feedback-button.negative:hover {
    border-color: var(--feedback-negative-color);
    background-color: var(--feedback-negative-bg);
    color: var(--feedback-negative-color);
  }

  .feedback-button:focus-visible {
    outline: 2px solid var(--v-primary);
    outline-offset: 2px;
  }

  .feedback-input {
    width: 100%;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--muted-color);
    background-color: var(--background);
    color: var(--text-color);
    font-size: 0.9rem;
    font-family: inherit;
  }

  .feedback-input:focus {
    outline: 2px solid var(--v-primary);
    outline-offset: 2px;
    border-color: var(--v-primary);
  }

  .feedback-submit-button {
    background-color: var(--text-color);
    color: var(--feedback-submit-button-text);
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .feedback-submit-button:hover:not(:disabled) {
    opacity: 0.9;
  }

  .feedback-submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .feedback-submit-button:focus-visible {
    outline: 2px solid var(--v-primary);
    outline-offset: 2px;
  }

  .feedback-cancel-button {
    background-color: transparent;
    color: var(--muted-color);
    border: 1px solid var(--muted-color);
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .feedback-cancel-button:hover {
    opacity: 0.8;
  }

  .feedback-cancel-button:focus-visible {
    outline: 2px solid var(--v-primary);
    outline-offset: 2px;
  }

  .feedback-retry-button {
    background-color: var(--text-color);
    color: var(--background);
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .feedback-retry-button:hover {
    opacity: 0.9;
  }

  .feedback-retry-button:focus-visible {
    outline: 2px solid var(--v-primary);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .feedback-button,
    .feedback-submit-button,
    .feedback-cancel-button,
    .feedback-retry-button {
      transition: none;
    }
  }
</style>
