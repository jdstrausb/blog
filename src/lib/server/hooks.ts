import type { Handle } from '@sveltejs/kit';
import type { ColorScheme } from '$lib/constants';
import { COLOR_SCHEMES, PUBLIC_COOKIE_CONFIG } from '$lib/constants';

interface ColorSchemeServerHookOptions {
    cookie_name: string;
    building: boolean;
    transform?: boolean | string;
}

/**
 * Creates a referer tracking hook for internal navigation tracking
 */
export const create_referer_tracking_hook = function (): Handle {
    return async function ({ event, resolve }) {
        const { locals, request, url } = event;

        const referer = request.headers.get('Referer');
        if (referer) {
            const url_referer = new URL(referer);
            if (url_referer.origin === url.origin) {
                locals.internal_referer = url_referer;
            }
        }

        return resolve(event);
    };
};

/**
 * Type guard to check if a value is a valid ColorScheme
 */
function is_valid_color_scheme(value: string | null | undefined): value is ColorScheme {
    return COLOR_SCHEMES.includes(value as ColorScheme);
}

/**
 * Validates and returns a valid ColorScheme value
 */
function validate_color_scheme(value: string | null | undefined): ColorScheme {
    return is_valid_color_scheme(value) ? value : 'system';
}

/**
 * Creates a color scheme server hook for handling theme preferences
 */
export const create_color_scheme_server_hook = function (
    options: ColorSchemeServerHookOptions
): Handle {
    return async function ({ event, resolve }) {
        const { locals, cookies, url, route } = event;
        const { cookie_name, building, transform } = options;

        // Get the raw value and validate it
        const raw_color_scheme = 
            (!building && url.searchParams.get('color-scheme')) ||
            cookies.get(cookie_name) ||
            'system';

        const color_scheme = validate_color_scheme(raw_color_scheme);

        locals.shared_settings = {
            colorScheme: color_scheme,
        };

        // setting cookies  
        cookies.set(cookie_name, color_scheme, PUBLIC_COOKIE_CONFIG);

        // return early if fetching api routes
        if (route.id?.includes('(api)')) {
            return resolve(event);
        }

        if (transform === false) return resolve(event);
        const placeholder = typeof transform === 'string' ? transform : '%color-scheme%';

        // Resolve the class for SSR. 'system' defaults to 'light'.
        // The client will adjust if the system preference is dark.
        const theme_class = color_scheme === 'dark' ? 'dark' : 'light';
        
        return await resolve(event, {
            transformPageChunk: ({ html }) => html.replaceAll(placeholder, theme_class),
        });
    };
};
