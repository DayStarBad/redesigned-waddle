module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 2022, // Align with target ES2022
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true, // For Jest global variables if we add tests later
  },
  ignorePatterns: ['.eslintrc.cjs', 'dist/**/*', 'coverage/**/*'], // Ignore self and build outputs
  rules: {
    'prettier/prettier': 'error',
    // Add any project-specific overrides here
  },
};
