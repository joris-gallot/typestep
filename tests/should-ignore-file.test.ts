import { describe, expect, it } from 'vitest'
import { shouldIgnoreFile } from '../src/index.js'

describe('shouldIgnoreFile', () => {
  it('should return false when file does not match ignoredFile', () => {
    const result = shouldIgnoreFile({
      file: 'src/file1.ts',
      ignoredFile: 'src/file2.ts',
      ignoredFileOptions: true,
      tsCode: 'TS1234',
    })

    expect(result).toBe(false)
  })

  it('should return true when file matches and ignoredFileOptions is true', () => {
    const result = shouldIgnoreFile({
      file: 'src/file1.ts',
      ignoredFile: 'src/file1.ts',
      ignoredFileOptions: true,
      tsCode: 'TS1234',
    })

    expect(result).toBe(true)
  })

  it('should return true when file matches and tsCode is in ignoredTsErrorCodes', () => {
    const result = shouldIgnoreFile({
      file: 'src/file1.ts',
      ignoredFile: 'src/file1.ts',
      ignoredFileOptions: {
        ignoredTsErrorCodes: ['TS1234', 'TS5678'],
      },
      tsCode: 'TS1234',
    })

    expect(result).toBe(true)
  })

  it('should return false when file matches but tsCode is not in ignoredTsErrorCodes', () => {
    const result = shouldIgnoreFile({
      file: 'src/file1.ts',
      ignoredFile: 'src/file1.ts',
      ignoredFileOptions: {
        ignoredTsErrorCodes: ['TS5678', 'TS9012'],
      },
      tsCode: 'TS1234',
    })

    expect(result).toBe(false)
  })

  it('should return false when file matches and ignoredTsErrorCodes is empty', () => {
    const result = shouldIgnoreFile({
      file: 'src/file1.ts',
      ignoredFile: 'src/file1.ts',
      ignoredFileOptions: {
        ignoredTsErrorCodes: [],
      },
      tsCode: 'TS1234',
    })

    expect(result).toBe(false)
  })

  it('should return false when file matches and ignoredTsErrorCodes is undefined', () => {
    const result = shouldIgnoreFile({
      file: 'src/file1.ts',
      ignoredFile: 'src/file1.ts',
      ignoredFileOptions: {
        ignoredTsErrorCodes: [],
      },
      tsCode: 'TS1234',
    })

    expect(result).toBe(false)
  })
})
