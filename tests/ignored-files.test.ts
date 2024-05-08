import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { assert, test } from 'vitest'
import { getTscErrors, parseTscOutput } from '../src/index.js'

const tscOutputPath = resolve(__dirname, 'fixtures', 'tsc-output.log')
const tscOutput = await readFile(tscOutputPath, 'utf8')
const parsedTscOutput = parseTscOutput(tscOutput)

test('without ignored files', async () => {
  const { tscErrors } = getTscErrors(parsedTscOutput, {
    ignoredFiles: [],
  })

  assert.lengthOf(tscErrors, 138)
})

test('with one ignored files', async () => {
  const { tscErrors } = getTscErrors(parsedTscOutput, {
    ignoredFiles: ['src/App.vue'],
  })

  assert.lengthOf(tscErrors, 123)
})

test('with multiple ignored files', async () => {
  const { tscErrors } = getTscErrors(parsedTscOutput, {
    ignoredFiles: ['src/App.vue', 'src/components/Comp1.vue', 'src/components/Comp2.vue'],
  })

  assert.lengthOf(tscErrors, 113)
})
