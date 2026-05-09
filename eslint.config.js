// Root ESLint 9 flat config — minimal baseline.
// Per-app configs (apps/lexio-web/eslint.config.js) extend this.
// Phase 03 adds eslint-plugin-boundaries rules.

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**', '**/coverage/**'],
  },
];
