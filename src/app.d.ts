// See https://svelte.dev/docs/kit/types#app.d.ts

// for information about these interfaces
declare global {
    namespace App {
        declare type ColorScheme = import('$lib/constants').ColorScheme;
        declare type SharedSettings = {
            colorScheme: ColorScheme;
        };
        interface Locals {
            shared_settings: SharedSettings;
            internal_referer?: URL;
        }

        interface PageData {
            shared_settings: SharedSettings;
        }
    }

    namespace svelteHTML {
        interface HTMLAttributes {
            onclickoutside?: (event: CustomEvent) => void;
        }
    }

    interface Error {
        code: string;
    }

    interface Window {
        umami?: {
            track: (event: string, data?: Record<string, string>) => void;
        };
    }

    export type FeedbackType = 'positive' | 'negative';

    export interface FeedbackSubmission {
        postTitle: string;
        postSlug: string;
        feedbackType: FeedbackType;
        name?: string;
        email?: string;
        message: string;
    }
}

// interface PageState {}
// interface Platform {}

export {};
