import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { assert, test } from 'vitest'
import { getTscErrors, parseTscOutput } from '../src/index.js'

const tscOutputPath = resolve(__dirname, 'fixtures', 'tsc-output.log')
const tscOutput = await readFile(tscOutputPath, 'utf8')
const parsedTscOutput = parseTscOutput(tscOutput)

test('with 1 extra line', async () => {
  const { tscErrors } = getTscErrors(parsedTscOutput)

  const { error } = tscErrors[0]

  assert.lengthOf(error.split('\n'), 2)
  assert.equal(error, `Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.`)
})

test('with 4 extra lines', async () => {
  const { tscErrors } = getTscErrors(parsedTscOutput)

  const { error } = tscErrors[3]

  assert.lengthOf(error.split('\n'), 5)
  assert.equal(error, `No overload matches this call.
  Overload 1 of 2, '(intervalId: string | number | Timeout | undefined): void', gave the following error.
    Argument of type 'null' is not assignable to parameter of type 'string | number | Timeout | undefined'.
  Overload 2 of 2, '(id: number | undefined): void', gave the following error.
    Argument of type 'null' is not assignable to parameter of type 'number | undefined'.`)
})

test('with 8 extra lines', async () => {
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
