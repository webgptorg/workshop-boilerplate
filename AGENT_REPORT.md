# Server 500 report

## Root cause

The root layout imported Inter and Outfit through `next/font/google`. Next.js downloads Google Fonts while producing the build and packages the resulting font files into the application. A deployment build without access to Google Fonts can fail during compilation. When a stale or partially updated deployment is then served, font asset requests can return errors and make the application appear broken.

This dependency was unnecessary for rendering the application: the styles only used those font families as visual choices. I removed the build-time Google Fonts imports and use local system sans-serif stacks instead. The server no longer needs Google Fonts connectivity to build or render the page.

## Checks added

`scripts/check-offline-build.mjs` runs the production build with Next.js's Google Fonts mock enabled. This makes any future `next/font/google` import fail the check instead of silently relying on network access. Run it with `npm run check:offline-build`.
