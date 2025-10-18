<script lang="ts">
    import { env } from '$env/dynamic/public';

    type PlatformId = 'x' | 'bluesky' | 'linkedin' | 'hackernews' | 'reddit';

    const utmSource = 'social';
    const utmMedium = 'share_button';

    let { postTitle, postSlug }: { postTitle: string; postSlug: string } = $props();

    const publicBaseUrl = env.PUBLIC_BASE_URL ?? '';
    const normalizedBaseUrl = publicBaseUrl ? publicBaseUrl.replace(/\/$/, '') : '';
    const canonicalPath = postSlug.startsWith('/') ? postSlug : `/${postSlug}`;
    const canonicalUrl = normalizedBaseUrl ? `${normalizedBaseUrl}${canonicalPath}` : '';

    if (!canonicalUrl && typeof console !== 'undefined') {
        console.warn(
            'ShareWidget: PUBLIC_BASE_URL is not configured; widget rendering is skipped.'
        );
    }

    const platforms: Array<{
        id: PlatformId;
        label: string;
        icon: string;
        buildShareUrl: (url: string, title: string) => string;
    }> = [
        {
            id: 'x',
            label: 'Twitter',
            icon: `<svg role="img" viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true" width="20" height="20"><title>X</title>!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM457.1 180L353.3 298.6L475.4 460L379.8 460L305 362.1L219.3 460L171.8 460L282.8 333.1L165.7 180L263.7 180L331.4 269.5L409.6 180L457.1 180zM419.3 431.6L249.4 206.9L221.1 206.9L392.9 431.6L419.3 431.6z"/></svg>`,
            buildShareUrl: (url, title) => {
                const shareUrl = new URL('https://twitter.com/intent/tweet');
                shareUrl.searchParams.set('url', url);
                shareUrl.searchParams.set('text', title);
                return shareUrl.toString();
            }
        },
        {
            id: 'bluesky',
            label: 'BlueSky',
            icon: `<svg role="img" viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true" width="20" height="20"><title>Bluesky</title><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM320 311.4C334.5 281.4 374 225.6 410.7 198.1C437.2 178.2 480 162.9 480 211.8C480 221.6 474.4 293.9 471.1 305.6C459.7 346.4 418.1 356.8 381.1 350.5C445.8 361.5 462.3 398 426.7 434.5C359.2 503.8 329.7 417.1 322.1 394.9L321.8 394C320.9 391.4 320.4 389.9 320 389.9C319.6 389.9 319.1 391.4 318.2 394C318.1 394.3 318 394.6 317.9 394.9C310.3 417.1 280.8 503.7 213.3 434.5C177.8 398 194.2 361.5 258.9 350.5C221.9 356.8 180.3 346.4 168.9 305.6C165.6 293.9 160 221.6 160 211.8C160 162.9 202.9 178.3 229.3 198.1C266 225.6 305.5 281.5 320 311.4z"/></svg>`,
            buildShareUrl: (url, title) => {
                const shareUrl = new URL('https://bsky.app/intent/compose');
                shareUrl.searchParams.set('text', `${title}\n${url}`);
                return shareUrl.toString();
            }
        },
        {
            id: 'linkedin',
            label: 'LinkedIn',
            icon: `<svg role="img" viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true" width="20" height="20"><title>LinkedIn</title><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M512 96L127.9 96C110.3 96 96 110.5 96 128.3L96 511.7C96 529.5 110.3 544 127.9 544L512 544C529.6 544 544 529.5 544 511.7L544 128.3C544 110.5 529.6 96 512 96zM231.4 480L165 480L165 266.2L231.5 266.2L231.5 480L231.4 480zM198.2 160C219.5 160 236.7 177.2 236.7 198.5C236.7 219.8 219.5 237 198.2 237C176.9 237 159.7 219.8 159.7 198.5C159.7 177.2 176.9 160 198.2 160zM480.3 480L413.9 480L413.9 376C413.9 351.2 413.4 319.3 379.4 319.3C344.8 319.3 339.5 346.3 339.5 374.2L339.5 480L273.1 480L273.1 266.2L336.8 266.2L336.8 295.4L337.7 295.4C346.6 278.6 368.3 260.9 400.6 260.9C467.8 260.9 480.3 305.2 480.3 362.8L480.3 480z"/></svg>`,
            buildShareUrl: (url, title) => {
                const shareUrl = new URL('https://www.linkedin.com/shareArticle');
                shareUrl.searchParams.set('mini', 'true');
                shareUrl.searchParams.set('url', url);
                shareUrl.searchParams.set('title', title);
                return shareUrl.toString();
            }
        },
        {
            id: 'hackernews',
            label: 'Hacker News',
            icon: `<svg role="img" viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true" width="20" height="20"><title>Hacker News</title><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M544 160C544 124.7 515.3 96 480 96L160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160zM117 293.2C117 293.2 117.1 293.1 117.1 293C117.1 292.9 117.2 292.8 117.3 292.8C117.3 292.9 117.3 293.1 117.2 293.2L117 293.2zM335.2 448L303.8 448L303.8 345.3L224 192L261.3 192C302.8 269.7 309.4 287.8 315.4 304C317 308.3 318.5 312.5 320.6 317.6C323.8 310.6 325.7 305.7 327.7 300.3C333.6 285 340.5 267.1 381.2 192L416 192L335.2 347.1L335.2 448z"/></svg>`,
            buildShareUrl: (url, title) => {
                const shareUrl = new URL('https://news.ycombinator.com/submitlink');
                shareUrl.searchParams.set('u', url);
                shareUrl.searchParams.set('t', title);
                return shareUrl.toString();
            }
        },
        {
            id: 'reddit',
            label: 'Reddit',
            icon: `<svg role="img" viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true" width="20" height="20"><title>Reddit</title><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M160 96L480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160C96 124.7 124.7 96 160 96zM401.9 230.4C422.5 230.4 439.2 213.7 439.2 193.1C439.2 172.5 422.5 155.8 401.9 155.8C383.9 155.8 368.8 168.6 365.3 185.6C335.1 188.8 311.5 214.4 311.5 245.5L311.5 245.7C278.7 247.1 248.7 256.4 224.9 271.2C216.1 264.4 205 260.3 192.9 260.3C164 260.3 140.6 283.7 140.6 312.6C140.6 333.6 152.9 351.6 170.7 360C172.4 420.7 238.6 469.6 320 469.6C401.4 469.6 467.6 420.7 469.3 359.9C487 351.5 499.2 333.5 499.2 312.6C499.2 283.7 475.8 260.3 446.9 260.3C434.9 260.3 423.9 264.3 415 271.1C391 256.2 360.7 246.9 327.5 245.7L327.5 245.6C327.5 223.4 344 204.9 365.4 201.9C369.3 218.4 384.1 230.6 401.7 230.6L401.9 230.4zM251 312.1C265.6 312.1 276.8 327.5 276 346.5C275.2 365.5 264.2 372.4 249.5 372.4C234.8 372.4 222 364.7 222.9 345.7C223.8 326.7 236.4 312.2 251 312.2L251 312.1zM417.4 345.6C418.3 364.6 405.4 372.3 390.8 372.3C376.2 372.3 365.2 365.4 364.3 346.4C363.4 327.4 374.6 312 389.3 312C404 312 416.6 326.6 417.4 345.5L417.4 345.6zM375.3 395.2C366.3 416.7 345 431.9 320.2 431.9C295.4 431.9 274.1 416.8 265.1 395.2C264 392.6 265.8 389.8 268.5 389.5C284.6 387.9 302 387 320.2 387C338.4 387 355.8 387.9 371.9 389.5C374.6 389.8 376.4 392.6 375.3 395.2z"/></svg>`,
            buildShareUrl: (url, title) => {
                const shareUrl = new URL('https://www.reddit.com/submit');
                shareUrl.searchParams.set('url', url);
                shareUrl.searchParams.set('title', title);
                return shareUrl.toString();
            }
        }
    ];

    function withTracking(platformLabel: string) {
        return (event: MouseEvent) => {
            window.umami?.track('Share', {
                platform: platformLabel,
                post: postTitle
            });

            if (!event.defaultPrevented) {
                // allow native navigation behaviour
            }
        };
    }

    function createTrackedUrl(platformId: PlatformId, url: string) {
        const shareTarget = new URL(url);
        shareTarget.searchParams.set('utm_source', utmSource);
        shareTarget.searchParams.set('utm_medium', utmMedium);
        shareTarget.searchParams.set('utm_campaign', platformId);
        return shareTarget.toString();
    }

    const renderedPlatforms = canonicalUrl
        ? platforms.map((platform) => ({
              ...platform,
              href: platform.buildShareUrl(createTrackedUrl(platform.id, canonicalUrl), postTitle)
          }))
        : [];

    // Copy button state
    let copied = $state(false);
    let copyTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const linkIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" aria-hidden="true" width="20" height="20"><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg>`;
    const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" width="20" height="20"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>`;

    async function handleCopy() {
        if (!canonicalUrl) return;

        try {
            await navigator.clipboard.writeText(canonicalUrl);
            copied = true;

            // Track copy event
            window.umami?.track('Share', {
                platform: 'Copy Link',
                post: postTitle
            });

            // Clear existing timeout if any
            if (copyTimeoutId) {
                clearTimeout(copyTimeoutId);
            }

            // Reset after 3 seconds
            copyTimeoutId = setTimeout(() => {
                copied = false;
                copyTimeoutId = null;
            }, 3000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }
</script>

{#if renderedPlatforms.length}
    <div
        class="mx-4 my-6 mb-12 max-w-4xl rounded-xl border border-[var(--share-section-border)] bg-gradient-to-br from-[var(--share-section-bg-start)] to-[var(--share-section-bg-end)] px-6 py-8 text-center sm:mx-auto"
    >
        <h2 class="mb-4 text-xl font-semibold tracking-wide text-[var(--text-color)]">
            Share this post
        </h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {#each renderedPlatforms as platform}
                <a
                    class="flex items-center justify-center gap-2 rounded-md border border-[var(--menu-border)] bg-[var(--share-button-bg)] px-4 py-2 text-sm font-medium text-[var(--share-button-text)] transition hover:bg-[var(--share-button-hover-bg)] hover:text-[var(--text-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 dark:focus-visible:outline-gray-500"
                    href={platform.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Share on ${platform.label}`}
                    onclick={withTracking(platform.label)}
                >
                    <span class="h-5 w-5 flex-shrink-0" aria-hidden="true"
                        >{@html platform.icon}</span
                    >
                    <span class="text-xs sm:text-sm">{platform.label}</span>
                </a>
            {/each}
            <button
                type="button"
                class="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--menu-border)] bg-[var(--share-button-bg)] px-4 py-2 text-sm font-medium text-[var(--share-button-text)] transition hover:bg-[var(--share-button-hover-bg)] hover:text-[var(--text-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 dark:focus-visible:outline-gray-500"
                onclick={handleCopy}
                aria-label={copied ? 'Link copied!' : 'Copy link to clipboard'}
            >
                <span class="h-5 w-5 flex-shrink-0" aria-hidden="true"
                    >{@html copied ? checkIcon : linkIcon}</span
                >
                <span class="text-xs sm:text-sm">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
        </div>
    </div>
{/if}
