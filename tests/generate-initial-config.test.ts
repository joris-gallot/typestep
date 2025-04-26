import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { generateInitialConfig } from '../src/commands/init.js'

const tscOutputPath = resolve(__dirname, 'fixtures', 'tsc-output.log')

describe('init config', () => {
  it('init config with ignoredFiles', async () => {
    const config = await generateInitialConfig(tscOutputPath)

    expect(config).toStrictEqual({
      ignoredFiles: {
        'src/main.ts': {
          ignoredTsErrorCodes: [
            'TS2339',
            'TS2740',
            'TS2464',
          ],
        },
        'src/App.vue': {
          ignoredTsErrorCodes: [
            'TS2339',
            'TS2571',
            'TS2769',
          ],
        },
        'src/components/Button.test.tsx': {
          ignoredTsErrorCodes: [
            'TS2464',
            'TS2339',
            'TS2571',
          ],
        },
        'src/utils.ts': {
          ignoredTsErrorCodes: [
            'TS2339',
            'TS2740',
            'TS2464',
            'TS2571',
          ],
        },
        'src/index.ts': {
          ignoredTsErrorCodes: [
            'TS2339',
            'TS2740',
            'TS2464',
            'TS2571',
          ],
        },
      },
    })
  })
})
