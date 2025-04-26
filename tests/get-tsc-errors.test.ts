import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { assert, describe, expect, it } from 'vitest'
import { getTscErrors, parseTscOutput } from '../src/index.js'

const tscOutputPath = resolve(__dirname, 'fixtures', 'tsc-output.log')
const tscOutput = await readFile(tscOutputPath, 'utf8')
const parsedTscOutput = parseTscOutput(tscOutput)

describe('ignored files and codes', () => {
  it('no ignored files or codes', async () => {
    const { ignoredFilesWithoutErrors, ignoredTsErrorCodesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredTsErrorCodes: [],
    })

    expect(ignoredFilesWithoutErrors).toStrictEqual([])
    expect(ignoredTsErrorCodesWithoutErrors).toStrictEqual([])
  })

  it('ignored file exists in output', async () => {
    const { ignoredFilesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': true,
      },
    })

    expect(ignoredFilesWithoutErrors).toStrictEqual([])
  })

  it('ignored file does not exist in output', async () => {
    const { ignoredFilesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'non-existent-file.ts': true,
      },
    })

    expect(ignoredFilesWithoutErrors).toStrictEqual([
      {
        file: 'non-existent-file.ts',
        missingCodes: [],
        type: 'all',
      },
    ])
  })

  it('multiple ignored files, some exist, some do not', async () => {
    const { ignoredFilesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': true,
        'non-existent-file.ts': true,
        'another-non-existent-file.ts': true,
      },
    })

    expect(ignoredFilesWithoutErrors).toStrictEqual([
      {
        file: 'non-existent-file.ts',
        missingCodes: [],
        type: 'all',
      },
      {
        file: 'another-non-existent-file.ts',
        missingCodes: [],
        type: 'all',
      },
    ])
  })

  it('ignored TS error code exists in output', async () => {
    const { ignoredTsErrorCodesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredTsErrorCodes: ['TS2322'], // Exists in output
    })

    expect(ignoredTsErrorCodesWithoutErrors).toStrictEqual([])
  })

  it('ignored TS error code does not exist in output', async () => {
    const { ignoredTsErrorCodesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredTsErrorCodes: ['TS9999'], // Does not exist in output
    })

    expect(ignoredTsErrorCodesWithoutErrors).toStrictEqual(['TS9999'])
  })

  it('multiple ignored TS error codes, some exist, some do not', async () => {
    const { ignoredTsErrorCodesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredTsErrorCodes: ['TS2322', 'TS9999', 'TS8888'],
    })

    expect(ignoredTsErrorCodesWithoutErrors).toStrictEqual(['TS9999', 'TS8888'])
  })

  it('mix of ignored files and codes, some exist, some do not', async () => {
    const { ignoredFilesWithoutErrors, ignoredTsErrorCodesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': true,
        'non-existent-file.ts': true,
      },
      ignoredTsErrorCodes: ['TS2322', 'TS9999'],
    })

    expect(ignoredFilesWithoutErrors).toStrictEqual([
      {
        file: 'non-existent-file.ts',
        missingCodes: [],
        type: 'all',
      },
    ])
    expect(ignoredTsErrorCodesWithoutErrors).toStrictEqual(['TS9999'])
  })

  it('duplicate non-existent ignored error codes', async () => {
    const { ignoredTsErrorCodesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredTsErrorCodes: ['TS9999', 'TS9999'],
    })

    expect(ignoredTsErrorCodesWithoutErrors).toStrictEqual(['TS9999'])
  })
})

describe('tsc errors', () => {
  it('with 1 extra line', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput)

    const { error } = tscErrors[0]

    assert.lengthOf(error.split('\n'), 2)
    assert.equal(error, `Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.`)
  })

  it('with 4 extra lines', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput)

    const { error } = tscErrors[3]

    assert.lengthOf(error.split('\n'), 5)
    assert.equal(error, `No overload matches this call.
  Overload 1 of 2, '(intervalId: string | number | Timeout | undefined): void', gave the following error.
    Argument of type 'null' is not assignable to parameter of type 'string | number | Timeout | undefined'.
  Overload 2 of 2, '(id: number | undefined): void', gave the following error.
    Argument of type 'null' is not assignable to parameter of type 'number | undefined'.`)
  })

  it('with 8 extra lines', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput)

    const { error } = tscErrors[40]

    assert.lengthOf(error.split('\n'), 9)
    assert.equal(error, `No overload matches this call.
  Overload 1 of 3, '(callbackfn: (previousValue: { docx: string; name: string; pptx: string; old?: boolean | undefined; }, currentValue: { docx: string; name: string; pptx: string; old?: boolean | undefined; }, currentIndex: number, array: { ...; }[]) => { ...; }, initialValue: { ...; }): { ...; }', gave the following error.
    Argument of type '(templates: never[], template: { docx: string; name: string; pptx: string; old?: boolean | undefined; }) => { file: string; name: string; extension: string; }[]' is not assignable to parameter of type '(previousValue: { docx: string; name: string; pptx: string; old?: boolean | undefined; }, currentValue: { docx: string; name: string; pptx: string; old?: boolean | undefined; }, currentIndex: number, array: { ...; }[]) => { ...; }'.
      Types of parameters 'templates' and 'previousValue' are incompatible.
        Type '{ docx: string; name: string; pptx: string; old?: boolean | undefined; }' is missing the following properties from type 'never[]': length, pop, push, concat, and 29 more.
  Overload 2 of 3, '(callbackfn: (previousValue: never[], currentValue: { docx: string; name: string; pptx: string; old?: boolean | undefined; }, currentIndex: number, array: { docx: string; name: string; pptx: string; old?: boolean | undefined; }[]) => never[], initialValue: never[]): never[]', gave the following error.
    Argument of type '(templates: never[], template: { docx: string; name: string; pptx: string; old?: boolean | undefined; }) => { file: string; name: string; extension: string; }[]' is not assignable to parameter of type '(previousValue: never[], currentValue: { docx: string; name: string; pptx: string; old?: boolean | undefined; }, currentIndex: number, array: { docx: string; name: string; pptx: string; old?: boolean | undefined; }[]) => never[]'.
      Type '{ file: string; name: string; extension: string; }[]' is not assignable to type 'never[]'.
        Type '{ file: string; name: string; extension: string; }' is not assignable to type 'never'.`)
  })
})
