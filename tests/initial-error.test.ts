import { assert, test } from 'vitest'
import { getFinalOutput, parseTscOutput } from '../src/index.js'
import { readFile } from 'fs/promises'
import { resolve } from 'path'

const tscOutputPath = resolve(__dirname, 'fixtures', 'tsc-output.log')
const tscOutput = await readFile(tscOutputPath, 'utf8')
const parsedTscOutput = parseTscOutput(tscOutput)

test('with 1 extra line', async () => {
  const finalOutput = getFinalOutput(parsedTscOutput)

  const tscError = finalOutput[0].error

  assert.lengthOf(tscError.split('\n'), 2)
})

test('with 4 extra lines', async () => {
  const finalOutput = getFinalOutput(parsedTscOutput)

  const tscError = finalOutput[3].error

  assert.lengthOf(tscError.split('\n'), 5)
})

test('with 8 extra lines', async () => {
  const finalOutput = getFinalOutput(parsedTscOutput)

  const tscError = finalOutput[40].error

  assert.lengthOf(tscError.split('\n'), 9)
})