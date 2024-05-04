export type TscDiagnostic = {
  path: string,
  cursor: { line: number, column: number },
  tsCode: string,
  error: string
}

export type TscOutputConfig = { 
  ignoredFiles?: string[]
}