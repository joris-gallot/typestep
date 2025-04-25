import { describe, expect, it } from 'vitest'
import { parseTsError } from '../src/index.js'

describe('parse ts error', () => {
  it('valid tsc error', async () => {
    let tscError = parseTsError('src/App.vue(153,11): error TS2322: Type \'Timeout\' is not assignable to type \'null\'.')

    expect(tscError).toStrictEqual({
      path: 'src/App.vue',
      cursor: {
        line: 153,
        column: 11,
      },
      error: 'Type \'Timeout\' is not assignable to type \'null\'.',
      tsCode: 'TS2322',
    })

    tscError = parseTsError('src/App.vue(203,17): error TS7006: Parameter \'e\' implicitly has an \'any\' type.')

    expect(tscError).toStrictEqual({
      path: 'src/App.vue',
      cursor: {
        line: 203,
        column: 17,
      },
      error: 'Parameter \'e\' implicitly has an \'any\' type.',
      tsCode: 'TS7006',
    })

    tscError = parseTsError('src/components/__tests__/SortingButton.spec.ts(25,24): error TS2571: Object is of type \'unknown\'.')

    expect(tscError).toStrictEqual({
      path: 'src/components/__tests__/SortingButton.spec.ts',
      cursor: {
        line: 25,
        column: 24,
      },
      error: 'Object is of type \'unknown\'.',
      tsCode: 'TS2571',
    })

    tscError = parseTsError('src/App.vue(283,7): error TS2554: Expected 7 arguments, but got 4.')

    expect(tscError).toStrictEqual({
      path: 'src/App.vue',
      cursor: {
        line: 283,
        column: 7,
      },
      error: 'Expected 7 arguments, but got 4.',
      tsCode: 'TS2554',
    })
  })

  it('invalid tsc error', async () => {
    expect(
      () => parseTsError('  Property \'filter\' does not exist on type \'string\'.'),
    ).toThrowError('Invalid error format')

    expect(
      () => parseTsError('    Argument of type \'number\' is not assignable to parameter of type \'Blob\'.'),
    ).toThrowError('Invalid error format')

    expect(
      () => parseTsError('    Type \'{ id: number }\' is missing the following properties from type \'MyParam\': name, description, and 55 more.'),
    ).toThrowError('Invalid error format')

    expect(
      () => parseTsError('        Type \'{ file: string; name: string; extension: string; }\' is not assignable to type \'never\'.'),
    ).toThrowError('Invalid error format')

    expect(
      () => parseTsError('  Property \'context\' does not exist on type \'{ userId: string | string[]; translate: string | string[]; }\'.'),
    ).toThrowError('Invalid error format')
  })
})
