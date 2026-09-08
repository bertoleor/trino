import { defineConfig, globalIgnores } from 'eslint/config';
import nextTs from 'eslint-config-next/typescript';
import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      'no-console': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/[\\u{1F300}-\\u{1FAFF}]/u]',
          message: 'Emojis are forbidden in code (CQ-08).',
        },
      ],
      // S0 tooling baseline: extreme cost-zero gate (paid/heavy plugin alternatives rejected — see design.md)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      // warn: per-site justification required (spec tooling-config)
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // native complexity trio (heavy external plugin rejected: extra dep, see design.md)
      complexity: ['warn', 12],
      'max-depth': ['warn', 4],
      'max-params': ['warn', 4],
      // native import order (external sort plugin rejected: +1 dep, see design.md)
      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'coverage/**',
    'src/types/database.types.generated.ts',
    'src/types/database.types.ts',
  ]),
]);

export default eslintConfig;
