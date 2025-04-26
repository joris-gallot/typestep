import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { generateInitialConfig } from '../src/commands/init.js'

const tscOutputPath = resolve(__dirname, 'fixtures', 'tsc-output.log')

describe('init config', () => {
  it('init config with ignoredFiles', async () => {
    const config = await generateInitialConfig(tscOutputPath)

    expect(config).toStrictEqual({
      ignoredFiles: {
        'node_modules/.pnpm/@splidejs+vue-splide@0.6.12/node_modules/@splidejs/vue-splide/src/js/plugin/plugin.ts': {
          ignoredTsErrorCodes: ['TS2345'],
        },
        'src/App.vue': {
          ignoredTsErrorCodes: ['TS2322', 'TS2769', 'TS7006', 'TS2339', 'TS2554', 'TS2525'],
        },
        'src/components/__tests__/SortingButton.spec.ts': {
          ignoredTsErrorCodes: ['TS2571'],
        },
        'src/components/__tests__/MyForm.spec.ts': {
          ignoredTsErrorCodes: ['TS2464', 'TS2339', 'TS2571'],
        },
        'src/components/__tests__/MyModal.spec.ts': {
          ignoredTsErrorCodes: ['TS2740', 'TS2339', 'TS2464'],
        },
        'src/components/MyActionsGroup.vue': {
          ignoredTsErrorCodes: ['TS2339', 'TS7006'],
        },
        'src/components/Comp1.vue': {
          ignoredTsErrorCodes: ['TS2769', 'TS2339', 'TS7006', 'TS7031'],
        },
        'src/components/Comp2.vue': {
          ignoredTsErrorCodes: ['TS18046', 'TS7006', 'TS7053'],
        },
        'src/components/MyNav.vue': {
          ignoredTsErrorCodes: ['TS2339'],
        },
        'src/components/MyDocumentUploader.vue': {
          ignoredTsErrorCodes: ['TS2322', 'TS2525', 'TS2769', 'TS2531', 'TS2739'],
        },
        'src/components/MyForm2.vue': {
          ignoredTsErrorCodes: ['TS2322', 'TS7053', 'TS2345', 'TS2769', 'TS2339'],
        },
        'src/components/MyModal2.vue': {
          ignoredTsErrorCodes: ['TS2322', 'TS2769', 'TS2345'],
        },
        'src/components/Comp3.vue': {
          ignoredTsErrorCodes: ['TS2322', 'TS2533', 'TS2571', 'TS7006', 'TS2345'],
        },
        'src/components/Comp4.vue': {
          ignoredTsErrorCodes: ['TS2322'],
        },
        'src/components/Comp5.vue': {
          ignoredTsErrorCodes: ['TS18046', 'TS18048', 'TS2339', 'TS7053'],
        },
        'src/components/Comp6.vue': {
          ignoredTsErrorCodes: ['TS18046', 'TS2769'],
        },
        'src/components/Comp7.vue': {
          ignoredTsErrorCodes: ['TS18049', 'TS2339', 'TS2769'],
        },
      },
    })
  })
})
