import { sequence } from '@sveltejs/kit/hooks';
import { 
    create_auth_server_hook, 
    create_referer_tracking_hook,
    create_color_scheme_server_hook 
} from '$lib/server/hooks';

import { building } from '$app/environment';
import { PUBLIC_COOKIE_NAME_COLOR_SCHEME } from '$env/static/public';

export const handle = sequence(
    create_auth_server_hook(),
    create_referer_tracking_hook(),
    create_color_scheme_server_hook({ 
        cookie_name: PUBLIC_COOKIE_NAME_COLOR_SCHEME, 
        building 
    }),
);
