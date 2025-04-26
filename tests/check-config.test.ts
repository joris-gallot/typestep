import { beforeEach, describe, expect, it, vi } from 'vitest'
import { checkConfig } from '../src/index.js'
import { consola } from '../src/utils.js'

vi.mock('../src/utils.js', async (importOriginal) => {
  const original = await importOriginal() as typeof import('../src/utils.js')
  return {
    ...original,
    consola: {
      warn: vi.fn(),
      box: vi.fn(),
    },
  }
})

describe('checkConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not log anything when there are no duplicates', () => {
    checkConfig({
      ignoredFiles: {
        'file1.ts': true,
        'file2.ts': true,
      },
      ignoredTsErrorCodes: ['TS1234', 'TS5678'],
    })

    expect(consola.warn).not.toHaveBeenCalled()
    expect(consola.box).not.toHaveBeenCalled()
  })

  it('should log duplicate ignored TS error codes', () => {
    checkConfig({
      ignoredFiles: {
        'file1.ts': true,
        'file2.ts': true,
      },
      ignoredTsErrorCodes: ['TS1234', 'TS5678', 'TS1234'],
    })

    expect(consola.warn).toHaveBeenCalledTimes(1)
    expect(consola.warn).toHaveBeenCalledWith('The following tsc error codes were ignored more than once in the `ignoredTsErrorCodes` config:')
    expect(consola.box).toHaveBeenCalledTimes(1)
    expect(consola.box).toHaveBeenCalledWith('TS1234')
  })

  it('should handle multiple duplicates in ignored TS error codes', () => {
    checkConfig({
      ignoredFiles: {
        'file1.ts': true,
        'file2.ts': true,
      },
      ignoredTsErrorCodes: ['TS1234', 'TS5678', 'TS1234', 'TS5678'],
    })

    expect(consola.warn).toHaveBeenCalledTimes(1)
    expect(consola.warn).toHaveBeenCalledWith('The following tsc error codes were ignored more than once in the `ignoredTsErrorCodes` config:')
    expect(consola.box).toHaveBeenCalledTimes(1)
    expect(consola.box).toHaveBeenCalledWith('TS1234\nTS5678')
  })

  it('should handle empty values', () => {
    checkConfig({
      ignoredFiles: {},
      ignoredTsErrorCodes: [],
    })

    expect(consola.warn).not.toHaveBeenCalled()
    expect(consola.box).not.toHaveBeenCalled()
  })

  it('should handle undefined values', () => {
    checkConfig({
      ignoredFiles: undefined,
      ignoredTsErrorCodes: undefined,
    })

    expect(consola.warn).not.toHaveBeenCalled()
    expect(consola.box).not.toHaveBeenCalled()
  })
})
