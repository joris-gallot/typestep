import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { assert, describe, it } from 'vitest'
import { getTscErrors, parseTscOutput } from '../src/index.js'

const tscOutputPath = resolve(__dirname, 'fixtures', 'tsc-output.log')
const tscOutput = await readFile(tscOutputPath, 'utf8')
const parsedTscOutput = parseTscOutput(tscOutput)

describe('ignored ts error codes', () => {
  it('without ignored error codes', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput, {
      ignoredTsErrorCodes: [],
    })

    assert.lengthOf(tscErrors, 40)
  })

  it('with one ignored error code (TS2339)', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput, {
      ignoredTsErrorCodes: ['TS2339'],
    })

    assert.lengthOf(tscErrors, 21)
  })

  it('with multiple ignored error codes (TS2339, TS2464)', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput, {
      ignoredTsErrorCodes: ['TS2339', 'TS2464'],
    })

    assert.lengthOf(tscErrors, 11)
  })

  it('with non-existent ignored error codes', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput, {
      ignoredTsErrorCodes: ['TS9999'],
    })

    assert.lengthOf(tscErrors, 40)
  })

  it('with mixed existing and non-existent ignored error codes', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput, {
      ignoredTsErrorCodes: ['TS2339', 'TS9999'],
    })

    assert.lengthOf(tscErrors, 21)
  })

  it('with ignored error codes and ignored files', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput, {
      ignoredTsErrorCodes: ['TS2339'],
      ignoredFiles: {
        'src/App.vue': true,
      },
    })

    assert.lengthOf(tscErrors, 19)
  })

  it('with specific error codes ignored for specific files', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': {
          ignoredTsErrorCodes: ['TS2339', 'TS2571'],
        },
      },
    })

    assert.lengthOf(tscErrors, 37)
  })

  it('with multiple files having different ignored error codes', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': {
          ignoredTsErrorCodes: ['TS2339', 'TS2571'],
        },
        'src/components/Button.test.tsx': {
          ignoredTsErrorCodes: ['TS2464'],
        },
      },
    })

    assert.lengthOf(tscErrors, 35)
  })

  it('with mixed file ignore configurations', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': true,
        'src/components/Button.test.tsx': {
          ignoredTsErrorCodes: ['TS2464'],
        },
      },
    })

    assert.lengthOf(tscErrors, 34)
  })
})
