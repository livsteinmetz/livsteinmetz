/* .eslintrc.cjs */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: true,
  },
  parser: 'espree', // change to "@typescript-eslint/parser" if using TS
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'prettier',
    // add "@typescript-eslint" if using TS
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    // If using TS, also add:
    // "plugin:@typescript-eslint/recommended",
    'plugin:prettier/recommended', // keeps Prettier last
  ],
  rules: {
    // Prettier
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],

    // Reasonable React defaults
    'react/prop-types': 'off', // turn on if you use PropTypes
    'react/react-in-jsx-scope': 'off', // CRA/Next don’t need React in scope

    // Hooks safety
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Imports hygiene
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'object',
          'type',
        ],
      },
    ],
    'import/no-unresolved': 'off', // CRA aliasing often confuses this; enable if you want stricter checks

    // Optional: nudge toward const/let correctness
    'no-unused-vars': 'warn',
    'no-undef': 'error',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      },
    },
    {
      files: ['**/*.test.*', '**/*.spec.*', '**/__tests__/**'],
      env: { jest: true },
    },
  ],
};
