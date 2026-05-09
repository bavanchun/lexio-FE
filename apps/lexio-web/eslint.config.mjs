import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import boundaries from 'eslint-plugin-boundaries';

/**
 * Emoji unicode ranges targeted by the no-restricted-syntax rule (best-effort).
 * Covers U+2600–U+27BF (Misc Symbols, Dingbats).
 * Limitation: ZWJ sequences, variation selectors, flag sequences, skin-tone
 * modifiers are NOT reliably caught by static regex on AST Literal nodes.
 * Code review remains the authoritative enforcement gate. See shared/design-rules.md.
 */

/**
 * Clean Architecture layer elements — doc §6.7.7 (updated for v6 API).
 * Using eslint-plugin-boundaries v6: rule renamed to boundaries/dependencies.
 *
 * Dependency rules:
 *   app      → features, shared
 *   features → core, shared, lib
 *   core     → (nothing — pure TS)
 *   lib      → core, shared  (shared/lib/utils is shared; lib adapters may use shared utils)
 *   shared   → lib           (ShadCN components in shared/components/ui use shared/lib/utils
 *                             which aliases resolve as lib/ after @/* expansion)
 *
 * Note: shared/lib/utils.ts lives under shared/ but the @/* alias causes the
 * boundaries resolver to classify it as lib/**. Allowing shared→lib here is
 * intentional and limited to utility imports. Features may NOT import lib directly
 * from shared — they use lib/ adapters or core ports.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default ignores of eslint-config-next.
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'coverage/**']),

  // ── Clean Architecture boundaries enforcement ──────────────────────────────
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'app/**' },
        { type: 'features', pattern: 'features/**' },
        { type: 'core', pattern: 'core/**' },
        { type: 'lib', pattern: 'lib/**' },
        { type: 'shared', pattern: 'shared/**' },
      ],
      // Resolve imports relative to the app root so patterns match correctly.
      'boundaries/root-path': import.meta.dirname,
    },
    rules: {
      /**
       * boundaries/dependencies (v6 name; was element-types in v5).
       * Violations are build errors — ESLint exits non-zero in CI.
       */
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          // checkInternals: true enables same-type import checking.
          // Without it, features→features imports are silently allowed.
          // With it, they're subject to default:'disallow' unless explicitly allowed.
          checkInternals: true,
          rules: [
            // app routes may import from features and shared, and within app/ itself
            { from: [['app']], allow: [['app'], ['features'], ['shared']] },
            // features may import from core, shared, lib — but NOT other features
            { from: [['features']], allow: [['core'], ['shared'], ['lib']] },
            // core is pure TS — internal imports between entities/ports/schemas are fine
            { from: [['core']], allow: [['core']] },
            // lib adapters may use core ports + shared utilities + within lib/
            { from: [['lib']], allow: [['core'], ['shared'], ['lib']] },
            // shared internal cross-imports are fine (e.g., components importing
            // other shared components). shared/lib/utils also resolves as lib.
            { from: [['shared']], allow: [['shared'], ['lib']] },
          ],
        },
      ],
    },
  },

  // ── General code quality rules ─────────────────────────────────────────────
  {
    rules: {
      /**
       * §12.5 rule 14: No emoji in functional UI — Lucide icons only.
       * Targets JSX text and string literals containing emoji codepoints.
       * Best-effort; see limitation note above and in shared/design-rules.md.
       */
      'no-restricted-syntax': [
        'warn',
        {
          selector: `Literal[value=/[\\u2600-\\u27BF]/u]`,
          message:
            '§12.5 rule 14: No emoji in functional UI. Use Lucide icons from @/shared/icons instead.',
        },
        {
          selector: `JSXText[value=/[\\u2600-\\u27BF]/u]`,
          message:
            '§12.5 rule 14: No emoji in JSX text. Use Lucide icons from @/shared/icons instead.',
        },
        {
          selector: `TemplateLiteral > TemplateElement[value.raw=/[\\u2600-\\u27BF]/u]`,
          message:
            '§12.5 rule 14: No emoji in template literals. Use Lucide icons from @/shared/icons instead.',
        },
      ],
    },
  },
]);

export default eslintConfig;
