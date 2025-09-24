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
