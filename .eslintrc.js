module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
    'jest/globals': true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2017,
  },
  plugins: ['@typescript-eslint', 'prettier', 'jest'],
  rules: {
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],

    // override default options for rules from base configurations
    'no-cond-assign': ['error', 'always'],

    // disable rules from base configurations
    'no-console': 'warn',

    'prettier/prettier': 2, // 2 means error, 1 means warn and 0 means off
  },
};
