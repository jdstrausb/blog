import { sequence } from '@sveltejs/kit/hooks';
import { create_referer_tracking_hook, create_color_scheme_server_hook } from '$lib/server/hooks';

import { building } from '$app/environment';
import { env } from '$env/dynamic/public';
import { DEFAULT_COLOR_SCHEME_COOKIE_NAME } from '$lib/constants';

const colorSchemeCookieName =
    env.PUBLIC_COOKIE_NAME_COLOR_SCHEME ?? DEFAULT_COLOR_SCHEME_COOKIE_NAME;

export const handle = sequence(
    create_referer_tracking_hook(),
    create_color_scheme_server_hook({
        cookie_name: colorSchemeCookieName,
        building
    })
);
