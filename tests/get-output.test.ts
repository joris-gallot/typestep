import type { TscError } from '../src/types.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getOutput } from '../src/index.js'
import { consola, tscErrorToString } from '../src/utils.js'

vi.mock('../src/utils.js', async (importOriginal) => {
  const original = await importOriginal() as typeof import('../src/utils.js')
  return {
    ...original,
    consola: {
      error: vi.fn(),
      log: vi.fn(),
      box: vi.fn(),
    },
  }
})

const mockTscError: TscError = {
  path: 'src/file1.ts',
  cursor: { line: 1, column: 1 },
  error: 'Some TS error',
  tsCode: 'TS1234',
}

describe('getOutput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return false and log nothing when there are no errors', () => {
    const result = getOutput({
      tscErrors: [],
      ignoredFilesWithoutErrors: [],
      ignoredTsErrorCodesWithoutErrors: [],
    })

    expect(result).toBe(false)
    expect(consola.error).not.toHaveBeenCalled()
    expect(consola.box).not.toHaveBeenCalled()
    expect(consola.log).not.toHaveBeenCalled()
  })

  it('should return true and log only ts errors when only tscErrors exist', () => {
    const tscErrors = [mockTscError]
    const result = getOutput({
      tscErrors,
      ignoredFilesWithoutErrors: [],
      ignoredTsErrorCodesWithoutErrors: [],
    })

    expect(result).toBe(true)
    expect(consola.error).toHaveBeenCalledTimes(1)
    expect(consola.error).toHaveBeenCalledWith(`Found ${tscErrors.length} error in 1 file:`)
    expect(consola.box).toHaveBeenCalledTimes(1)
    expect(consola.box).toHaveBeenCalledWith('src/file1.ts')
    expect(consola.log).not.toHaveBeenCalled()
  })

  it('should return true and log only ts errors with fullOutputErrors', () => {
    const tscErrors = [mockTscError, { ...mockTscError, path: 'src/file2.ts' }]
    const result = getOutput({
      tscErrors,
      ignoredFilesWithoutErrors: [],
      ignoredTsErrorCodesWithoutErrors: [],
    }, { fullOutputErrors: true })

    expect(result).toBe(true)
    expect(consola.error).toHaveBeenCalledTimes(1)
    expect(consola.error).toHaveBeenCalledWith(`Found ${tscErrors.length} errors in 2 files:`)
    expect(consola.box).toHaveBeenCalledTimes(1)
    expect(consola.box).toHaveBeenCalledWith('src/file1.ts\nsrc/file2.ts')
    expect(consola.log).toHaveBeenCalledTimes(1)
    expect(consola.log).toHaveBeenCalledWith(tscErrors.map(tscErrorToString).join('\n'))
  })

  it('should return true and log only ignored error codes when only ignoredTsErrorCodesWithoutErrors exist', () => {
    const ignoredCodes = ['TS9999']
    const result = getOutput({
      tscErrors: [],
      ignoredFilesWithoutErrors: [],
      ignoredTsErrorCodesWithoutErrors: ignoredCodes,
    })

    expect(result).toBe(true)
    expect(consola.error).toHaveBeenCalledTimes(1)
    expect(consola.error).toHaveBeenCalledWith('The following error codes were ignored in the config but had no errors in the tsc output:')
    expect(consola.box).toHaveBeenCalledTimes(1)
    expect(consola.box).toHaveBeenCalledWith(ignoredCodes.join('\n'))
    expect(consola.log).not.toHaveBeenCalled()
  })

  it('should return true and log ignored error codes and ts errors', () => {
    const ignoredCodes = ['TS9999']
    const tscErrors = [mockTscError]
    const result = getOutput({
      tscErrors,
      ignoredFilesWithoutErrors: [],
      ignoredTsErrorCodesWithoutErrors: ignoredCodes,
    })

    expect(result).toBe(true)
    expect(consola.error).toHaveBeenCalledTimes(2)
    expect(consola.error).toHaveBeenCalledWith('The following error codes were ignored in the config but had no errors in the tsc output:')
    expect(consola.error).toHaveBeenCalledWith(`Found ${tscErrors.length} error in 1 file:`)
    expect(consola.box).toHaveBeenCalledTimes(2)
    expect(consola.box).toHaveBeenCalledWith(ignoredCodes.join('\n'))
    expect(consola.box).toHaveBeenCalledWith('src/file1.ts')
    expect(consola.log).not.toHaveBeenCalled()
  })

  it('should return true and log only ignored files when only ignoredFilesWithoutErrors exist with type all', () => {
    const ignoredFiles = [{ file: 'non-existent-file.ts', type: 'all' as const }]
    const result = getOutput({
      tscErrors: [],
      ignoredFilesWithoutErrors: ignoredFiles,
      ignoredTsErrorCodesWithoutErrors: [],
    })

    expect(result).toBe(true)
    expect(consola.error).toHaveBeenCalledTimes(1)
    expect(consola.error).toHaveBeenCalledWith('The following files were ignored in the config but had no errors in the tsc output:')
    expect(consola.box).toHaveBeenCalledTimes(1)
    expect(consola.box).toHaveBeenCalledWith('non-existent-file.ts')
    expect(consola.log).not.toHaveBeenCalled()
  })

  it('should return true and log only ignored files when only ignoredFilesWithoutErrors exist with type codes', () => {
    const ignoredFiles = [{
      file: 'non-existent-file.ts',
      type: 'codes' as const,
      missingCodes: ['TS1234', 'TS5678'],
    }]
    const result = getOutput({
      tscErrors: [],
      ignoredFilesWithoutErrors: ignoredFiles,
      ignoredTsErrorCodesWithoutErrors: [],
    })

    expect(result).toBe(true)
    expect(consola.error).toHaveBeenCalledTimes(1)
    expect(consola.error).toHaveBeenCalledWith('The following files were ignored in the config but had no errors in the tsc output:')
    expect(consola.box).toHaveBeenCalledTimes(1)
    expect(consola.box).toHaveBeenCalledWith('non-existent-file.ts (no errors for codes: TS1234, TS5678)')
    expect(consola.log).not.toHaveBeenCalled()
  })

  it('should return true and log ignored files and ts errors', () => {
    const ignoredFiles = [{ file: 'non-existent-file.ts', type: 'all' as const }]
    const tscErrors = [mockTscError]
    const result = getOutput({
      tscErrors,
      ignoredFilesWithoutErrors: ignoredFiles,
      ignoredTsErrorCodesWithoutErrors: [],
    })

    expect(result).toBe(true)
    expect(consola.error).toHaveBeenCalledTimes(2)
    expect(consola.error).toHaveBeenCalledWith('The following files were ignored in the config but had no errors in the tsc output:')
    expect(consola.error).toHaveBeenCalledWith(`Found ${tscErrors.length} error in 1 file:`)
    expect(consola.box).toHaveBeenCalledTimes(2)
    expect(consola.box).toHaveBeenCalledWith('non-existent-file.ts')
    expect(consola.box).toHaveBeenCalledWith('src/file1.ts')
    expect(consola.log).not.toHaveBeenCalled()
  })

  it('should return true and log ignored files and ignored error codes', () => {
    const ignoredFiles = [{ file: 'non-existent-file.ts', type: 'all' as const }]
    const ignoredCodes = ['TS9999']
    const result = getOutput({
      tscErrors: [],
      ignoredFilesWithoutErrors: ignoredFiles,
      ignoredTsErrorCodesWithoutErrors: ignoredCodes,
    })

    expect(result).toBe(true)
    expect(consola.error).toHaveBeenCalledTimes(2)
    expect(consola.error).toHaveBeenCalledWith('The following files were ignored in the config but had no errors in the tsc output:')
    expect(consola.error).toHaveBeenCalledWith('The following error codes were ignored in the config but had no errors in the tsc output:')
    expect(consola.box).toHaveBeenCalledTimes(2)
    expect(consola.box).toHaveBeenCalledWith('non-existent-file.ts')
    expect(consola.box).toHaveBeenCalledWith(ignoredCodes.join('\n'))
    expect(consola.log).not.toHaveBeenCalled()
  })

  it('should return true and log all three types of errors', () => {
    const ignoredFiles = [{ file: 'non-existent-file.ts', type: 'all' as const }]
    const ignoredCodes = ['TS9999']
    const tscErrors = [mockTscError]
    const result = getOutput({
      tscErrors,
      ignoredFilesWithoutErrors: ignoredFiles,
      ignoredTsErrorCodesWithoutErrors: ignoredCodes,
    })

    expect(result).toBe(true)
    expect(consola.error).toHaveBeenCalledTimes(3)
    expect(consola.error).toHaveBeenCalledWith('The following files were ignored in the config but had no errors in the tsc output:')
    expect(consola.error).toHaveBeenCalledWith('The following error codes were ignored in the config but had no errors in the tsc output:')
    expect(consola.error).toHaveBeenCalledWith(`Found ${tscErrors.length} error in 1 file:`)
    expect(consola.box).toHaveBeenCalledTimes(3)
    expect(consola.box).toHaveBeenCalledWith('non-existent-file.ts')
    expect(consola.box).toHaveBeenCalledWith(ignoredCodes.join('\n'))
    expect(consola.box).toHaveBeenCalledWith('src/file1.ts')
    expect(consola.log).not.toHaveBeenCalled()
  })

  it('should return true and log only ignored files when only ignoredFilesWithoutErrors exist with type custom', () => {
    const ignoredFiles = [{
      file: 'non-existent-file.ts',
      type: 'codes' as const,
      missingCodes: ['TS1234'],
    }]
    const result = getOutput({
      tscErrors: [],
      ignoredFilesWithoutErrors: ignoredFiles,
      ignoredTsErrorCodesWithoutErrors: [],
    })

    expect(result).toBe(true)
    expect(consola.error).toHaveBeenCalledTimes(1)
    expect(consola.error).toHaveBeenCalledWith('The following files were ignored in the config but had no errors in the tsc output:')
    expect(consola.box).toHaveBeenCalledTimes(1)
    expect(consola.box).toHaveBeenCalledWith('non-existent-file.ts (no errors for codes: TS1234)')
    expect(consola.log).not.toHaveBeenCalled()
  })

  it('should return true and log ignored files with custom filter and ts errors', () => {
    const ignoredFiles = [{
      file: 'non-existent-file.ts',
      type: 'codes' as const,
      missingCodes: ['TS1234'],
    }]
    const tscErrors = [mockTscError]
    const result = getOutput({
      tscErrors,
      ignoredFilesWithoutErrors: ignoredFiles,
      ignoredTsErrorCodesWithoutErrors: [],
    })

    expect(result).toBe(true)
    expect(consola.error).toHaveBeenCalledTimes(2)
    expect(consola.error).toHaveBeenCalledWith('The following files were ignored in the config but had no errors in the tsc output:')
    expect(consola.error).toHaveBeenCalledWith(`Found ${tscErrors.length} error in 1 file:`)
    expect(consola.box).toHaveBeenCalledTimes(2)
    expect(consola.box).toHaveBeenCalledWith('non-existent-file.ts (no errors for codes: TS1234)')
    expect(consola.box).toHaveBeenCalledWith('src/file1.ts')
    expect(consola.log).not.toHaveBeenCalled()
  })

  it('should return true and log ignored files with custom filter and ignored error codes', () => {
    const ignoredFiles = [{
      file: 'non-existent-file.ts',
      type: 'codes' as const,
      missingCodes: ['TS1234'],
    }]
    const ignoredCodes = ['TS9999']
    const result = getOutput({
      tscErrors: [],
      ignoredFilesWithoutErrors: ignoredFiles,
      ignoredTsErrorCodesWithoutErrors: ignoredCodes,
    })

    expect(result).toBe(true)
    expect(consola.error).toHaveBeenCalledTimes(2)
    expect(consola.error).toHaveBeenCalledWith('The following files were ignored in the config but had no errors in the tsc output:')
    expect(consola.error).toHaveBeenCalledWith('The following error codes were ignored in the config but had no errors in the tsc output:')
    expect(consola.box).toHaveBeenCalledTimes(2)
    expect(consola.box).toHaveBeenCalledWith('non-existent-file.ts (no errors for codes: TS1234)')
    expect(consola.box).toHaveBeenCalledWith(ignoredCodes.join('\n'))
    expect(consola.log).not.toHaveBeenCalled()
  })

  it('should return true and log all three types of errors with custom filter', () => {
    const ignoredFiles = [{
      file: 'non-existent-file.ts',
      type: 'codes' as const,
      missingCodes: ['TS1234'],
    }]
    const ignoredCodes = ['TS9999']
    const tscErrors = [mockTscError]
    const result = getOutput({
      tscErrors,
      ignoredFilesWithoutErrors: ignoredFiles,
      ignoredTsErrorCodesWithoutErrors: ignoredCodes,
    })

    expect(result).toBe(true)
    expect(consola.error).toHaveBeenCalledTimes(3)
    expect(consola.error).toHaveBeenCalledWith('The following files were ignored in the config but had no errors in the tsc output:')
    expect(consola.error).toHaveBeenCalledWith('The following error codes were ignored in the config but had no errors in the tsc output:')
    expect(consola.error).toHaveBeenCalledWith(`Found ${tscErrors.length} error in 1 file:`)
    expect(consola.box).toHaveBeenCalledTimes(3)
    expect(consola.box).toHaveBeenCalledWith('non-existent-file.ts (no errors for codes: TS1234)')
    expect(consola.box).toHaveBeenCalledWith(ignoredCodes.join('\n'))
    expect(consola.box).toHaveBeenCalledWith('src/file1.ts')
    expect(consola.log).not.toHaveBeenCalled()
  })
})
