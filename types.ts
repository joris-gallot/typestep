export type TscDiagnosticItem = {
  type: 'Item',
  value: {
    path: {
      type: 'Path',
      value: string
    },
    cursor: { type: 'Cursor', value: { line: number, col: number } },
    tsError: {
      type: 'TsError',
      value: { type: 'error', errorString: string }
    },
    message: {
      type: 'Message',
      value: string
    }
  }
}

export type TscDiagnosticFormatted = { 
  initialError: string,
  diagnostics: Array<TscDiagnosticItem>
}

export type TscOutputConfig = { 
  ignoredFiles?: string[]
}