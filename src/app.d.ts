// See https://svelte.dev/docs/kit/types#app.d.ts


// for information about these interfaces
declare global {
  namespace App {

      declare type ColorScheme = import('$lib/constants').ColorScheme;
      declare type SharedSettings = {
          colorScheme: ColorScheme;
      };
      interface Locals {
          user: import('$lib/server/auth').SessionValidationResult['user'];
          session: import('$lib/server/auth').SessionValidationResult['session'];
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
}

// interface PageState {}
// interface Platform {}

export {};
