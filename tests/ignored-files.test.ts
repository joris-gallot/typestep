import { assert, test } from 'vitest'
import { getFinalOutput, parseTscOutput } from '../src/parser.js'
import { readFile } from 'fs/promises'
import { resolve } from 'path'

const tscOutputPath = resolve(__dirname, 'fixtures', 'tsc-output.log')
const tscOutput = await readFile(tscOutputPath, 'utf8')
const parsedTscOutput = parseTscOutput(tscOutput)

test('without ignored files', async () => {
  const finalOutput = getFinalOutput(parsedTscOutput, {
    ignoredFiles: []
  })

  assert.lengthOf(finalOutput, 139)
})

test('with one ignored files', async () => {
  const finalOutput = getFinalOutput(parsedTscOutput, {
    ignoredFiles: ['src/App.vue']
  })

  assert.lengthOf(finalOutput, 123)
})

test('with multiple ignored files', async () => {
  const finalOutput = getFinalOutput(parsedTscOutput, {
    ignoredFiles: ['src/App.vue', 'src/components/Comp1.vue', 'src/components/Comp2.vue'] 
  })

  assert.lengthOf(finalOutput, 113)
})