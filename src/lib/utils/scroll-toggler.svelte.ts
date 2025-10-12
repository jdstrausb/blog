// src/lib/utils/scroll-toggler.svelte.ts
import type { Action } from 'svelte/action';

/**
 * @typedef ScrollTogglerOptions
 * @property { number } minScroll - Scroll distance after which the header starts hiding
 * @property { number } minScrollDelta - The least amount of scroll movement to trigger a visibility change
 */
interface ScrollTogglerOptions {
    minScroll: number;
    minScrollDelta: number;
}

export class ScrollToggler {
    options: ScrollTogglerOptions;
    /** Whether the associated element should be hidden */
    hidden = $state(false);
    /** A number from 0 to 1 indicating scroll progress up to minScroll */
    min_scroll_progress = $state(1);

    constructor(options: Partial<ScrollTogglerOptions> = {}) {
        this.options = {
            minScroll: 200, // Show header until user scrolls 200px
            minScrollDelta: 50, // Minimum scroll change to toggle visibility
            ...options
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    attachment: Action<HTMLElement, void> = (_node) => {
        // console.log("attachment node: ", _node);
        let last_direction: 'up' | 'down' = 'down';
        let last_scroll_y = 0;
        let last_scroll_y_at_direction_change = 0;

        const handle_scroll = () => {
            const { scrollY } = window;
            const direction = scrollY > last_scroll_y ? 'down' : 'up';

            if (scrollY < this.options.minScroll) {
                this.hidden = false;
            } else if (direction !== last_direction) {
                last_scroll_y_at_direction_change = scrollY;
            } else if (
                Math.abs(scrollY - last_scroll_y_at_direction_change) > this.options.minScrollDelta
            ) {
                this.hidden = direction !== 'up';
            }

            last_scroll_y = scrollY;
            last_direction = direction;
            this.min_scroll_progress = Math.min(scrollY / this.options.minScroll, 1);
        };

        window.addEventListener('scroll', handle_scroll, { passive: true });
        handle_scroll(); // Set initial state

        return {
            destroy() {
                window.removeEventListener('scroll', handle_scroll);
            }
        };
    };
}

/**
 * @typedef ScrollToTopManagerOptions
 * @property { number } viewportThreshold - Number of viewport heights before button appears
 * @property { number } inactivityTimeout - Milliseconds of inactivity before button fades
 * @property { number } mouseProximity - Pixels from bottom edge to trigger reappearance
 */
interface ScrollToTopManagerOptions {
    viewportThreshold: number;
    inactivityTimeout: number;
    mouseProximity: number;
}

export class ScrollToTopManager {
    options: ScrollToTopManagerOptions;
    /** Whether the button should be visible */
    visible = $state(false);
    /** Whether the button is faded due to inactivity */
    faded = $state(false);

    private viewportHeight = 0;
    private lastScrollTime = 0;
    private inactivityTimer: ReturnType<typeof setTimeout> | null = null;
    private destroyFunctions: (() => void)[] = [];

    constructor(options: Partial<ScrollToTopManagerOptions> = {}) {
        this.options = {
            viewportThreshold: 2, // 2 viewport heights
            inactivityTimeout: 3000, // 3 seconds
            mouseProximity: 100, // 100 pixels from bottom
            ...options
        };

        if (typeof window !== 'undefined') {
            this.viewportHeight = window.innerHeight;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    attachment: Action<HTMLElement, void> = (_node) => {
        const updateViewportHeight = () => {
            this.viewportHeight = window.innerHeight;
        };

        const checkScrollPosition = () => {
            const { scrollY } = window;
            const threshold = this.viewportHeight * this.options.viewportThreshold;

            // Update visibility based on scroll position
            this.visible = scrollY > threshold;

            // Reset inactivity timer on scroll when in allowed range
            if (this.visible) {
                this.lastScrollTime = Date.now();
                this.faded = false;
                this.resetInactivityTimer();
            } else {
                // When leaving allowed range, clear the timer and reset faded state
                if (this.inactivityTimer) {
                    clearTimeout(this.inactivityTimer);
                    this.inactivityTimer = null;
                }
                this.faded = false;
            }
        };

        const handleMouseMove = (event: MouseEvent) => {
            const { clientY } = event;
            const distanceFromBottom = window.innerHeight - clientY;

            // If mouse is near bottom and button should be visible but is faded, unfade it
            if (this.visible && this.faded && distanceFromBottom <= this.options.mouseProximity) {
                this.faded = false;
                this.resetInactivityTimer();
            }
        };

        // Set up event listeners
        window.addEventListener('scroll', checkScrollPosition, { passive: true });
        window.addEventListener('resize', updateViewportHeight, { passive: true });
        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        // Initial check
        checkScrollPosition();

        // Store cleanup functions
        this.destroyFunctions.push(() => {
            window.removeEventListener('scroll', checkScrollPosition);
            window.removeEventListener('resize', updateViewportHeight);
            window.removeEventListener('mousemove', handleMouseMove);
            if (this.inactivityTimer) {
                clearTimeout(this.inactivityTimer);
            }
        });

        return {
            destroy: () => {
                this.destroyFunctions.forEach(fn => fn());
                this.destroyFunctions = [];
            }
        };
    };

    resetInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }

        this.inactivityTimer = setTimeout(() => {
            if (this.visible) {
                this.faded = true;
            }
        }, this.options.inactivityTimeout);
    }

    scrollToTop() {
        window.scrollTo({
          top: 0,
          // behavior: 'smooth'
        });
        // Button will automatically hide when scroll position reaches the top
    }
}
