import { parse } from '@aivenio/tsc-output-parser';
import { readFile } from 'fs/promises';
import { TscDiagnosticFormatted, TscDiagnosticItem, TscOutputConfig } from './types';

let tscOutput
try {
  tscOutput = await readFile('tsc-output.log', 'utf8');
} catch (error) {
  throw new Error('Could not read tsc-output.log');
}

export function parseTscOutput(tscOutput: string) {
  const finalErrors = [] as Array<TscDiagnosticFormatted>

  for (const tscError of tscOutput.split('\n')) {
    let diagnostics = [] as Array<TscDiagnosticItem>

    try {
      diagnostics = parse(tscError) as Array<TscDiagnosticItem>

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
