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

    assert.lengthOf(tscErrors, 138)
  })

  it('with one ignored error code (TS2345)', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput, {
      ignoredTsErrorCodes: ['TS2345'], // There are 9 TS2345 errors
    })

    assert.lengthOf(tscErrors, 129) // 138 - 9 = 129
  })

  it('with multiple ignored error codes (TS2345, TS7006)', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput, {
      ignoredTsErrorCodes: ['TS2345', 'TS7006'], // There are 9 TS2345 and 12 TS7006 errors
    })

    assert.lengthOf(tscErrors, 117) // 138 - 9 - 12 = 117
  })

  it('with non-existent ignored error codes', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput, {
      ignoredTsErrorCodes: ['TS9999'], // This code doesn't exist in the output
    })

    assert.lengthOf(tscErrors, 138)
  })

  it('with mixed existing and non-existent ignored error codes', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput, {
      ignoredTsErrorCodes: ['TS2345', 'TS9999'], // Ignore existing TS2345 and non-existent TS9999
    })

    assert.lengthOf(tscErrors, 129) // 138 - 9 = 129
  })

  it('with ignored error codes and ignored files', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput, {
      ignoredTsErrorCodes: ['TS2322'], // Ignore TS2322 (24 occurrences)
      ignoredFiles: ['src/App.vue'], // Ignore src/App.vue (15 errors, 1 of which is TS2322)
    })

    // if code error is in ignored file, it should be ignored
    // 138 total - 15 (App.vue) - 24 (other TS2322) + 1 (TS2322 in App.vue) = 100
    assert.lengthOf(tscErrors, 100)
  })
})
