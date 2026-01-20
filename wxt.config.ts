import tailwindcss from '@tailwindcss/vite';
import { defineConfig, WxtViteConfig } from 'wxt';

const vite = () =>
  ({
    optimizeDeps: { exclude: ['@electric-sql/pglite'] },
    plugins: [tailwindcss()],
  }) as WxtViteConfig;

// See https://wxt.dev/api/config.html
export default defineConfig({
  // run this in the console to seed the dev profile
  // chromium --user-data-dir=$(pwd)/.chrome-dev-folder --no-first-run --headless=new about:blank
  runner: {
    chromiumProfile: './.chrome-dev-folder/',
    keepProfileChanges: true,
  },
  manifest: {
    permissions: ['storage'],
    host_permissions: ['*://*.joinhandshake.com/*'],
    //this is needed so the extension id for prod and dev are the same
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4ZumQ+iYBWd2HUHu4YCKoEfYXFfUPsKjaWaRSbzQ6b0YI8KlMMu2OE/mNYgdUesS1YzhMU9F77whMAQjhonXdLDoOZaocvu5p4c+6YBP0s7+v5tIllEZw4mNPeydoJCedCG6KBDmLfMJ8LcTLaLeBMoPpW2DCDTU6tgZNHnflrwOoymOO5VLiV3KMSyJ2P4KbYLpCnFecbWBehFBjQkdtcA671Wj2JwmKlc0vQlriPgIWHYb9UNAo2hddsD2wq4udQzfgzA1FV/50fCk/XzKqe43z0qILYpMkM6ZpqUfb/0br+C3i7jWEcTCm0+/XpGenhQTbyP1OschG08vbINj1wIDAQAB',
    content_security_policy: {
      extension_pages:
        "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
    },
    browser_specific_settings: {
      gecko: {
        id: '{9ae23dfb-cd27-4d50-8186-58806a97f84f}',
        // required as of nov 3 2025
        data_collection_permissions: {
          required: ['none'],
        },
      },
    },
  },
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  vite,
});
