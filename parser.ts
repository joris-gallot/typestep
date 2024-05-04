import { parse as parseTsError } from '@aivenio/tsc-output-parser';
import { TscDiagnosticFormatted, TscDiagnosticItem, TscOutputConfig } from './types';

export function parseTscOutput(tscOutput: string) {
  const finalErrors = [] as Array<TscDiagnosticFormatted>
  const tscErrors = tscOutput.split('\n')

  for (let i = 0; i < tscErrors.length; i++) {
    let diagnostics = [] as Array<TscDiagnosticItem>
    const tscError = tscErrors[i]

    // If the error starts with a space, we suppose it's a continuation of the previous error
    if (tscError.startsWith(" ")) {
      const lastError = finalErrors[finalErrors.length - 1]
      lastError.initialError += `\n${tscError}`
      continue
    }

    try {
      diagnostics = parseTsError(tscError) as Array<TscDiagnosticItem>

      finalErrors.push({
        initialError: tscError,
        diagnostics
      })
    } catch (error) {
      // Ignore error for now
    }
  }
  
  return finalErrors
}

function ignoreFiles(tscOuput: Array<TscDiagnosticFormatted>, files: NonNullable<TscOutputConfig['ignoredFiles']>) {
  return tscOuput.map(({ initialError, diagnostics }) => {
    const filteredDiagnostics = diagnostics.filter(({ value: { path: { value: path } } }) => {
      return !files.includes(path)
    })

    return {
      initialError,
      diagnostics: filteredDiagnostics
    }
  })
  .filter(({ diagnostics }) => diagnostics.length > 0)
}

export function getFinalOutput(parsedTscOutput: Array<TscDiagnosticFormatted>, config?: TscOutputConfig) {
  const { ignoredFiles = [] } = config || {}
  let finalOutput = parsedTscOutput

  if (ignoredFiles.length > 0) {
    finalOutput = ignoreFiles(finalOutput, ignoredFiles)
  }

  return finalOutput
}
