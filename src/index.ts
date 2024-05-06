import type { TscDiagnostic, TypestepConfig } from './types.js'

function parseTsError(tscError: string): TscDiagnostic {
  const regex = /([^()\n]+)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.*)/
  const [_, file, line, column, tsCode, error] = regex.exec(tscError) || []

  if (!file || !line || !column || !tsCode || !error)
    throw new Error('Invalid error format')

  return {
    path: file,
    cursor: {
      line: Number.parseInt(line),
      column: Number.parseInt(column),
    },
    error,
    tsCode,
  }
}

export function parseTscOutput(tscOutput: string) {
  const finalErrors = [] as Array<TscDiagnostic>
  const tscErrors = tscOutput.split('\n')

  for (let i = 0; i < tscErrors.length; i++) {
    const tscError = tscErrors[i]

    const lastError = finalErrors[finalErrors.length - 1]
    // If the error starts with a space, we suppose it's a continuation of the previous error
    if (tscError.startsWith(' ') && lastError) {
      lastError.error += `\n${tscError}`
      continue
    }

    try {
      finalErrors.push(parseTsError(tscError))
    }
    catch (error) {
      // Ignore error for now
    }
  }

  return finalErrors
}

export function getFinalOutput(parsedTscOutput: Array<TscDiagnostic>, config?: TypestepConfig) {
  const { ignoredFiles = [] } = config || {}
  let finalOutput = parsedTscOutput

  if (ignoredFiles.length > 0)
    finalOutput = finalOutput.filter(({ path }) => !ignoredFiles.includes(path))

  return finalOutput
}
