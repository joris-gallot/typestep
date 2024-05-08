import type { TscError, TypestepConfig } from './types.js'

function parseTsError(tscError: string): TscError {
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
  const finalErrors = [] as Array<TscError>
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

export function getTscErrors(parsedTscOutput: Array<TscError>, config?: TypestepConfig) {
  const { ignoredFiles = [] } = config || {}
  let tscErrors = parsedTscOutput
  let ignoredFilesWithoutErrors

  if (ignoredFiles.length > 0) {
    ignoredFilesWithoutErrors = ignoredFiles.filter(ignoredFile => !parsedTscOutput.some(({ path }) => path === ignoredFile))
    tscErrors = tscErrors.filter(({ path }) => !ignoredFiles.includes(path))
  }

  return {
    tscErrors,
    ignoredFilesWithoutErrors: [...new Set(ignoredFilesWithoutErrors)],
  }
}
