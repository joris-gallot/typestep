import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { generateInitialConfig } from '../src/commands/init.js'

const tscOutputPath = resolve(__dirname, 'fixtures', 'tsc-output.log')

describe('init config', () => {
  it('init config with ignoredFiles', async () => {
    const config = await generateInitialConfig({
      tscOutputFile: tscOutputPath,
      ignoreFiles: true,
      ignoreTsErrorCodes: false,
    })

    expect(config).toStrictEqual({
      ignoredFiles: [
        'node_modules/.pnpm/@splidejs+vue-splide@0.6.12/node_modules/@splidejs/vue-splide/src/js/plugin/plugin.ts',
        'src/App.vue',
        'src/components/__tests__/SortingButton.spec.ts',
        'src/components/__tests__/MyForm.spec.ts',
        'src/components/__tests__/MyModal.spec.ts',
        'src/components/MyActionsGroup.vue',
        'src/components/Comp1.vue',
        'src/components/Comp2.vue',
        'src/components/MyNav.vue',
        'src/components/MyDocumentUploader.vue',
        'src/components/MyForm2.vue',
        'src/components/MyModal2.vue',
        'src/components/Comp3.vue',
        'src/components/Comp4.vue',
        'src/components/Comp5.vue',
        'src/components/Comp6.vue',
        'src/components/Comp7.vue',
      ],
      ignoredTsErrorCodes: undefined,
    })
  })

  it('init config with ignoredTsErrorCodes', async () => {
    const config = await generateInitialConfig({
      tscOutputFile: tscOutputPath,
      ignoreFiles: false,
      ignoreTsErrorCodes: true,
    })

    expect(config).toStrictEqual({
      ignoredTsErrorCodes: [
        'TS2345',
        'TS2322',
        'TS2769',
        'TS7006',
        'TS2339',
        'TS2554',
        'TS2525',
        'TS2571',
        'TS2464',
        'TS2740',
        'TS7031',
        'TS18046',
        'TS7053',
        'TS2531',
        'TS2739',
        'TS2533',
        'TS18048',
        'TS18049',
      ],
      ignoredFiles: undefined,
    })
  })

  it('init config with both ignoredFiles and ignoredTsErrorCodes', async () => {
    const config = await generateInitialConfig({
      tscOutputFile: tscOutputPath,
      ignoreFiles: true,
      ignoreTsErrorCodes: true,
    })

    expect(config).toStrictEqual({
      ignoredFiles: [
        'node_modules/.pnpm/@splidejs+vue-splide@0.6.12/node_modules/@splidejs/vue-splide/src/js/plugin/plugin.ts',
        'src/App.vue',
        'src/components/__tests__/SortingButton.spec.ts',
        'src/components/__tests__/MyForm.spec.ts',
        'src/components/__tests__/MyModal.spec.ts',
        'src/components/MyActionsGroup.vue',
        'src/components/Comp1.vue',
        'src/components/Comp2.vue',
        'src/components/MyNav.vue',
        'src/components/MyDocumentUploader.vue',
        'src/components/MyForm2.vue',
        'src/components/MyModal2.vue',
        'src/components/Comp3.vue',
        'src/components/Comp4.vue',
        'src/components/Comp5.vue',
        'src/components/Comp6.vue',
        'src/components/Comp7.vue',
      ],
      ignoredTsErrorCodes: [
        'TS2345',
        'TS2322',
        'TS2769',
        'TS7006',
        'TS2339',
        'TS2554',
        'TS2525',
        'TS2571',
        'TS2464',
        'TS2740',
        'TS7031',
        'TS18046',
        'TS7053',
        'TS2531',
        'TS2739',
        'TS2533',
        'TS18048',
        'TS18049',
      ],
    })
  })

  it('init config with no ignore flags', async () => {
    const config = await generateInitialConfig({
      tscOutputFile: tscOutputPath,
      ignoreFiles: false,
      ignoreTsErrorCodes: false,
    })

    expect(config).toStrictEqual({
      ignoredFiles: [
        'node_modules/.pnpm/@splidejs+vue-splide@0.6.12/node_modules/@splidejs/vue-splide/src/js/plugin/plugin.ts',
        'src/App.vue',
        'src/components/__tests__/SortingButton.spec.ts',
        'src/components/__tests__/MyForm.spec.ts',
        'src/components/__tests__/MyModal.spec.ts',
        'src/components/MyActionsGroup.vue',
        'src/components/Comp1.vue',
        'src/components/Comp2.vue',
        'src/components/MyNav.vue',
        'src/components/MyDocumentUploader.vue',
        'src/components/MyForm2.vue',
        'src/components/MyModal2.vue',
        'src/components/Comp3.vue',
        'src/components/Comp4.vue',
        'src/components/Comp5.vue',
        'src/components/Comp6.vue',
        'src/components/Comp7.vue',
      ],
      ignoredTsErrorCodes: undefined,
    })
  })
})
