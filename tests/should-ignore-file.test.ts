import { describe, expect, it } from 'vitest'
import { shouldIgnoreFile } from '../src/index.js'

describe('shouldIgnoreFile', () => {
  it('should return false when file does not match ignoredFile', () => {
    const result = shouldIgnoreFile({
      file: 'src/file1.ts',
      ignoredFile: 'src/file2.ts',
      ignoredFileOptions: true,
      tsError: {
        tsCode: 'TS1234',
        cursor: { line: 1, column: 1 },
        error: 'Error message',
      },
    })

    expect(result).toBe(false)
  })

  it('should return true when file matches and ignoredFileOptions is true', () => {
    const result = shouldIgnoreFile({
      file: 'src/file1.ts',
      ignoredFile: 'src/file1.ts',
      ignoredFileOptions: true,
      tsError: {
        tsCode: 'TS1234',
        cursor: { line: 1, column: 1 },
        error: 'Error message',
      },
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
      tsError: {
        tsCode: 'TS1234',
        cursor: { line: 1, column: 1 },
        error: 'Error message',
      },
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
      tsError: {
        tsCode: 'TS1234',
        cursor: { line: 1, column: 1 },
        error: 'Error message',
      },
    })

    expect(result).toBe(false)
  })

  it('should return false when file matches and ignoredTsErrorCodes is empty', () => {
    const result = shouldIgnoreFile({
      file: 'src/file1.ts',
      ignoredFile: 'src/file1.ts',
      ignoredFileOptions: {
        ignoredTsErrorCodes: ['TS54321', 'TS5678'],
      },
      tsError: {
        tsCode: 'TS1234',
        cursor: { line: 1, column: 1 },
        error: 'Error message',
      },
    })

    expect(result).toBe(false)
  })

  it('should return false when file matches and ignoredTsErrorCodes is undefined', () => {
    const result = shouldIgnoreFile({
      file: 'src/file1.ts',
      ignoredFile: 'src/file1.ts',
      ignoredFileOptions: {
        ignoredTsErrorCodes: ['TS4321', 'TS5678'],
      },
      tsError: {
        tsCode: 'TS1234',
        cursor: { line: 1, column: 1 },
        error: 'Error message',
      },
    })

    expect(result).toBe(false)
  })

  it('should return true when file matches and custom filter returns true', () => {
    const result = shouldIgnoreFile({
      file: 'src/file1.ts',
      ignoredFile: 'src/file1.ts',
      ignoredFileOptions: error => error.tsCode === 'TS1234',
      tsError: {
        tsCode: 'TS1234',
        cursor: { line: 1, column: 1 },
        error: 'Error message',
      },
    })

    expect(result).toBe(true)
  })

  it('should return false when file matches and custom filter returns false', () => {
    const result = shouldIgnoreFile({
      file: 'src/file1.ts',
      ignoredFile: 'src/file1.ts',
      ignoredFileOptions: error => error.tsCode === 'TS5678',
      tsError: {
        tsCode: 'TS1234',
        cursor: { line: 1, column: 1 },
        error: 'Error message',
      },
    })

    expect(result).toBe(false)
  })

  it('should return true when file matches and custom filter checks error message', () => {
    const result = shouldIgnoreFile({
      file: 'src/file1.ts',
      ignoredFile: 'src/file1.ts',
      ignoredFileOptions: error => error.error.includes('Error message'),
      tsError: {
        tsCode: 'TS1234',
        cursor: { line: 1, column: 1 },
        error: 'Error message',
      },
    })

    expect(result).toBe(true)
  })

  it('should return false when file matches and custom filter checks error message with no match', () => {
    const result = shouldIgnoreFile({
      file: 'src/file1.ts',
      ignoredFile: 'src/file1.ts',
      ignoredFileOptions: error => error.error.includes('Different message'),
      tsError: {
        tsCode: 'TS1234',
        cursor: { line: 1, column: 1 },
        error: 'Error message',
      },
    })

    expect(result).toBe(false)
  })

  it('should return true when file matches and custom filter uses multiple conditions', () => {
    const result = shouldIgnoreFile({
      file: 'src/file1.ts',
      ignoredFile: 'src/file1.ts',
      ignoredFileOptions: error =>
        error.tsCode === 'TS1234'
        && error.error.includes('Error message')
        && error.cursor.line === 1
        && error.cursor.column === 1,
      tsError: {
        tsCode: 'TS1234',
        cursor: { line: 1, column: 1 },
        error: 'Error message',
      },
    })

    expect(result).toBe(true)
  })
})
