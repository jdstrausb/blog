import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
    // This function takes the `shared_settings` from event.locals
    // (which was set by the app's server hook) and returns it.
    // This ensures it's available for the `data` prop in every page.
    return {
        shared_settings: locals.shared_settings
    };
}
