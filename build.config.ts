import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig([
  {
    declaration: true,
    entries: ['src/types.ts'],
    // Without failOnWarn to false the build will fail with the following error:
    // "Potential missing package.json files: dist/cli.mjs"
    // Because the cli.ts build is done after the types.ts one
    failOnWarn: false,
  },
  {
    entries: ['src/cli.ts'],
    rollup: {
      output: {
        entryFileNames: 'cli.mjs',
        chunkFileNames: 'chunks/[name].mjs',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
])
