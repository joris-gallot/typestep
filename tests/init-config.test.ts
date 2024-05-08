import { resolve } from 'node:path'
import { expect, test } from 'vitest'
import { generateInitialConfig } from '../src/commands/init.js'

const tscOutputPath = resolve(__dirname, 'fixtures', 'tsc-output.log')

test('init config with ignoredFiles', async () => {
  const config = await generateInitialConfig(tscOutputPath)

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
  })
})
