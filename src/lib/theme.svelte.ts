import { getContext, setContext } from 'svelte';
import { MediaQuery } from 'svelte/reactivity';
import { PUBLIC_COOKIE_NAME_COLOR_SCHEME } from '$env/static/public';
import type { ColorScheme } from '$lib/constants';

interface ColorSchemeContextInit {
    // The user's preferred color scheme from SSR
    user?: ColorScheme;
}

export class ColorSchemeContext {
    static KEY = Symbol('app:color-scheme');
    
    // A reactive media query that tracks the system's preferred color scheme.
    #preferredColorScheme = new MediaQuery('(prefers-color-scheme: dark)');
    
    /** The user's explicit preference ('light', 'dark', or 'system'). This is the state we'll manage.  */
    user = $state('system' as ColorScheme);
    
    /** The system's detected color scheme ('light' or 'dark'). */
    system = $derived(this.#preferredColorScheme.current ? 'dark' : 'light');
    
    /** The final, resolved color scheme to be applied ('light' or 'dark') */
    resolved = $derived(this.user === 'system' ? this.system : this.user);
    
    /**
    * Initializes the context with the value from the server.
    * @param {ColorSchemeContextInit} init
    */
    constructor(init: ColorSchemeContextInit) {
        this.user = init.user || 'system';
        
        // This effect runs whenever `this.resolved` or `this.user` changes.
        $effect(() => {
            if (typeof window !== 'undefined') {
                // Update the class on the body to apply CSS variables.
                // This also ensures the server-set class is correctly managed on client navigation.
                document.body.className = this.resolved;
                
                // Update the data attribute on the html element for consistency and potential JS hooks.
                document.documentElement.dataset.colorScheme = this.resolved;
                
                // Update the cookie to persist the user's preference.
                document.cookie = `${PUBLIC_COOKIE_NAME_COLOR_SCHEME}=${this.user}; path=/; SameSite=Lax; Secure; max-age=604800`;
            }
        });
    }
    
    /**
    * Sets the context for the application.
    * @param {ColorSchemeContextInit} init
    */
    static set(init: ColorSchemeContextInit) {
        return setContext(this.KEY, new ColorSchemeContext(init));
    }
    
    /**
    * Retrieves the context.
    * @returns {ColorSchemeContext}
    */
    static get() {
        return getContext<ColorSchemeContext>(this.KEY);
    }
}
