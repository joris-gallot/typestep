export interface TscError {
  path: string
  cursor: { line: number, column: number }
  tsCode: string
  error: string
}

export type NonEmptyArray<T> = [T, ...T[]]

interface ConfigIgnoredFilesOptions {
  ignoredTsErrorCodes: NonEmptyArray<string>
}

export interface TypestepConfig {
  ignoredFiles?: Record<string, true | ConfigIgnoredFilesOptions>
  ignoredTsErrorCodes?: Array<string>
  fullOutputErrors?: boolean
}
