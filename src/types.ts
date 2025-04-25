export interface TscError {
  path: string
  cursor: { line: number, column: number }
  tsCode: string
  error: string
}

export interface TypestepConfig {
  ignoredFiles?: string[]
  ignoredTsErrorCodes?: string[]
  fullOutput?: boolean
}

export interface TypestepConfigCli {
  tscOutputFile: string
  ignoreFiles?: boolean
  ignoreTsErrorCodes?: boolean
}
