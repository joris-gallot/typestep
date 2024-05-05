export interface TscDiagnostic {
  path: string
  cursor: { line: number, column: number }
  tsCode: string
  error: string
}

export interface TypestepConfig {
  ignoredFiles?: string[]
}
