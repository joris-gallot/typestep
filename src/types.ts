export interface TscError {
  path: string
  cursor: { line: number, column: number }
  tsCode: string
  error: string
}

export interface TypestepConfig {
  ignoredFiles?: string[]
  fullOutput?: boolean
}
