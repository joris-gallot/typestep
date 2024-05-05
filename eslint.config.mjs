import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: [
      '**/fixtures',
    ],
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'test/consistent-test-it': ['error', { fn: 'test' }],
    },
  },
)
