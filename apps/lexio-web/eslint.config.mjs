import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * Emoji unicode ranges targeted by the no-restricted-syntax rule (best-effort).
 * Covers U+2600–U+27BF (Misc Symbols, Dingbats).
 * Limitation: ZWJ sequences, variation selectors, flag sequences, skin-tone
 * modifiers are NOT reliably caught by static regex on AST Literal nodes.
 * Code review remains the authoritative enforcement gate. See shared/design-rules.md.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default ignores of eslint-config-next.
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),

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
