import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { assert, describe, it } from 'vitest'
import { getTscErrors, parseTscOutput } from '../src/index.js'

const tscOutputPath = resolve(__dirname, 'fixtures', 'tsc-output.log')
const tscOutput = await readFile(tscOutputPath, 'utf8')
const parsedTscOutput = parseTscOutput(tscOutput)

describe('ignored files', () => {
  it('without ignored files', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: undefined,
    })

    assert.lengthOf(tscErrors, 138)
  })

  it('with one ignored files', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': true,
      },
    })

    assert.lengthOf(tscErrors, 123)
  })

  it('with multiple ignored files', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': true,
        'src/components/Comp1.vue': true,
        'src/components/Comp2.vue': true,
      },
    })

    assert.lengthOf(tscErrors, 113)
  })
})
