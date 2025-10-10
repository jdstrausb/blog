import { type Cookies } from '@sveltejs/kit';

export const STATUSES = ['info', 'success', 'warning', 'error'] as const;
export type Status = (typeof STATUSES)[number];

export const COLOR_SCHEMES = ['system', 'light', 'dark'] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];

// export const SCREENS = ['mobile', 'tablet', 'desktop'] as const;
// export type Screen = (typeof SCREENS)[number];

export const DEFAULT_COLOR_SCHEME_COOKIE_NAME = 'blog-color-scheme';

export const COMMON_COOKIE_CONFIG = {
    path: '/',
    secure: true,
    httpOnly: true,
    maxAge: 604800 // 7 days
} satisfies Parameters<Cookies['set']>[2];

export const PUBLIC_COOKIE_CONFIG = {
    ...COMMON_COOKIE_CONFIG,
    httpOnly: false
} satisfies Parameters<Cookies['set']>[2];
