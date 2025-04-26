export interface TscError {
  path: string
  cursor: { line: number, column: number }
  tsCode: string
  error: string
}

export type ConfigIgnoredFilesOptions = true | {
  ignoredTsErrorCodes: Array<string>
}

export interface TypestepConfig {
  ignoredFiles?: Record<string, ConfigIgnoredFilesOptions>
  ignoredTsErrorCodes?: Array<string>
  fullOutput?: boolean
}

export interface TypestepArgsCli {
  tscOutputFile: string
  ignoreFiles?: boolean
  ignoreTsErrorCodes?: boolean
}
