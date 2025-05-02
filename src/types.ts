export interface TscError {
  path: string
  cursor: { line: number, column: number }
  tsCode: string
  error: string
}

export type NonEmptyArray<T> = [T, ...T[]]

/**
 * Configuration options for ignored files
 * @interface ConfigIgnoredFilesOptions
 */
interface ConfigIgnoredFilesOptions {
  /** Array of TypeScript error codes to ignore for this specific file */
  ignoredTsErrorCodes: NonEmptyArray<string>
}

type CustomFilter = (error: Omit<TscError, 'path'>) => boolean

/**
 * Typestep configuration
 * @interface TypestepConfig
 */
export interface TypestepConfig {
  /**
   * Record of files to ignore, either completely or with specific error codes
   * - `true`: ignore all errors in the file
   * - `ConfigIgnoredFilesOptions`: ignore only specific error codes
   * - `CustomFilter`: ignore errors based on a custom filter function
   */
  ignoredFiles?: Record<string, true | ConfigIgnoredFilesOptions | CustomFilter>

  /** Global TypeScript error codes to ignore across all files */
  ignoredTsErrorCodes?: Array<string>

  /** Whether to show full output errors (default: false) */
  fullOutputErrors?: boolean
}
