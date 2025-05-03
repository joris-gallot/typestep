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
        type: 'all',
      },
      {
        file: 'another-non-existent-file.ts',
        type: 'all',
      },
    ])
  })

  it('ignored TS error code exists in output', async () => {
    const { ignoredTsErrorCodesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredTsErrorCodes: ['TS2339'], // Exists in output
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
      ignoredTsErrorCodes: ['TS2339', 'TS9999', 'TS8888'],
    })

    expect(ignoredTsErrorCodesWithoutErrors).toStrictEqual(['TS9999', 'TS8888'])
  })

  it('mix of ignored files and codes, some exist, some do not', async () => {
    const { ignoredFilesWithoutErrors, ignoredTsErrorCodesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': true,
        'non-existent-file.ts': true,
      },
      ignoredTsErrorCodes: ['TS2339', 'TS9999'],
    })

    expect(ignoredFilesWithoutErrors).toStrictEqual([
      {
        file: 'non-existent-file.ts',
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

  it('file with ignored error codes that exist in output', async () => {
    const { ignoredFilesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': {
          ignoredTsErrorCodes: ['TS2339', 'TS2571'],
        },
      },
    })

    expect(ignoredFilesWithoutErrors).toStrictEqual([])
  })

  it('file with ignored error codes that do not exist in output', async () => {
    const { ignoredFilesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': {
          ignoredTsErrorCodes: ['TS9999', 'TS8888'],
        },
      },
    })

    expect(ignoredFilesWithoutErrors).toStrictEqual([
      {
        file: 'src/App.vue',
        missingCodes: ['TS9999', 'TS8888'],
        type: 'codes',
      },
    ])
  })

  it('file with mixed existing and non-existing ignored error codes', async () => {
    const { ignoredFilesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': {
          ignoredTsErrorCodes: ['TS2339', 'TS9999'],
        },
      },
    })

    expect(ignoredFilesWithoutErrors).toStrictEqual([
      {
        file: 'src/App.vue',
        missingCodes: ['TS9999'],
        type: 'codes',
      },
    ])
  })

  it('multiple files with different ignored error code configurations', async () => {
    const { ignoredFilesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': {
          ignoredTsErrorCodes: ['TS2339', 'TS9999'],
        },
        'src/components/Button.test.tsx': {
          ignoredTsErrorCodes: ['TS2464', 'TS8888'],
        },
        'non-existent-file.ts': {
          ignoredTsErrorCodes: ['TS1234'],
        },
      },
    })

    expect(ignoredFilesWithoutErrors).toStrictEqual([
      {
        file: 'src/App.vue',
        missingCodes: ['TS9999'],
        type: 'codes',
      },
      {
        file: 'src/components/Button.test.tsx',
        missingCodes: ['TS8888'],
        type: 'codes',
      },
      {
        file: 'non-existent-file.ts',
        missingCodes: ['TS1234'],
        type: 'codes',
      },
    ])
  })

  it('mix of file-specific and global ignored error codes', async () => {
    const { ignoredFilesWithoutErrors, ignoredTsErrorCodesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': {
          ignoredTsErrorCodes: ['TS2339', 'TS9999'],
        },
        'non-existent-file.ts': true,
      },
      ignoredTsErrorCodes: ['TS2464', 'TS8888'],
    })

    expect(ignoredFilesWithoutErrors).toStrictEqual([
      {
        file: 'src/App.vue',
        missingCodes: ['TS9999'],
        type: 'codes',
      },
      {
        file: 'non-existent-file.ts',
        type: 'all',
      },
    ])
    expect(ignoredTsErrorCodesWithoutErrors).toStrictEqual(['TS8888'])
  })

  it('file with custom filter that matches all errors', async () => {
    const { ignoredFilesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': error => ['TS2339', 'TS2571'].includes(error.tsCode),
      },
    })

    expect(ignoredFilesWithoutErrors).toStrictEqual([])
  })

  it('file with custom filter that matches no errors', async () => {
    const { ignoredFilesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': error => error.tsCode === 'TS9999',
      },
    })

    expect(ignoredFilesWithoutErrors).toStrictEqual([])
  })

  it('file with custom filter that matches some errors', async () => {
    const { ignoredFilesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': error => error.tsCode === 'TS2339',
      },
    })

    expect(ignoredFilesWithoutErrors).toStrictEqual([])
  })

  it('multiple files with different custom filter configurations', async () => {
    const { ignoredFilesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': error => error.tsCode === 'TS2339',
        'src/components/Button.test.tsx': error => error.tsCode === 'TS2464',
        'non-existent-file.ts': error => error.tsCode === 'TS1234',
      },
    })

    expect(ignoredFilesWithoutErrors).toStrictEqual([
      {
        file: 'non-existent-file.ts',
        type: 'all',
      },
    ])
  })

  it('mix of custom filter and other ignored file configurations', async () => {
    const { ignoredFilesWithoutErrors, ignoredTsErrorCodesWithoutErrors } = getTscErrors(parsedTscOutput, {
      ignoredFiles: {
        'src/App.vue': error => error.tsCode === 'TS2339',
        'non-existent-file.ts': () => true,
        'src/components/Button.test.tsx': {
          ignoredTsErrorCodes: ['TS2464', 'TS8888'],
        },
      },
      ignoredTsErrorCodes: ['TS2464', 'TS8888'],
    })

    expect(ignoredFilesWithoutErrors).toStrictEqual([
      {
        file: 'non-existent-file.ts',
        type: 'all',
      },
      {
        file: 'src/components/Button.test.tsx',
        missingCodes: ['TS8888'],
        type: 'codes',
      },
    ])
    expect(ignoredTsErrorCodesWithoutErrors).toStrictEqual(['TS8888'])
  })
})

describe('tsc errors', () => {
  it('with 1 extra line', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput)

    const { error } = tscErrors[12]

    assert.lengthOf(error.split('\n'), 2)
    assert.equal(error, `Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.`)
  })

  it('with 4 extra lines', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput)

    const { error } = tscErrors[20]

    assert.lengthOf(error.split('\n'), 5)
    assert.equal(error, `No overload matches this call.
  Overload 1 of 2, '(intervalId: string | number | Timeout | undefined): void', gave the following error.
    Argument of type 'null' is not assignable to parameter of type 'string | number | Timeout | undefined'.
  Overload 2 of 2, '(id: number | undefined): void', gave the following error.
    Argument of type 'null' is not assignable to parameter of type 'number | undefined'.`)
  })

  it('with 8 extra lines', async () => {
    const { tscErrors } = getTscErrors(parsedTscOutput)

    const { error } = tscErrors[39]

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
