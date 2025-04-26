export interface TscError {
  path: string
  cursor: { line: number, column: number }
  tsCode: string
  error: string
}

export interface ConfigIgnoredFilesOptions {
  ignoredTsErrorCodes: Array<string>
}

export interface TypestepConfig {
  ignoredFiles?: Record<string, true | ConfigIgnoredFilesOptions>
  ignoredTsErrorCodes?: Array<string>
  fullOutputErrors?: boolean
}
