import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  // Browser + JSX source files
  {
    ...js.configs.recommended,
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    },
  },
  // Node.js server file
  {
    files: ['server.js', 'vite.config.js'],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
    },
    rules: js.configs.recommended.rules,
  },
  // CommonJS config files (tailwind, postcss)
  {
    files: ['tailwind.config.js', 'postcss.config.js'],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { ecmaVersion: 2020, sourceType: 'commonjs' },
    },
    rules: js.configs.recommended.rules,
  },
]
