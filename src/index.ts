import type { TscError, TypestepConfig } from './types.js'
import consola from 'consola'
import { tscErrorToString, uniqArray } from './utils.js'

export function parseTsError(tscError: string): TscError {
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
    // eslint-disable-next-line unused-imports/no-unused-vars
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
    ignoredFilesWithoutErrors: uniqArray(ignoredFilesWithoutErrors),
  }
}

export function getOutput({ tscErrors, ignoredFilesWithoutErrors }: ReturnType<typeof getTscErrors>, config?: TypestepConfig) {
  const ignoredFilesHasErrors = ignoredFilesWithoutErrors.length > 0
  const tscHasErrors = tscErrors.length > 0
  const outputHasErrors = tscHasErrors || ignoredFilesHasErrors

  if (ignoredFilesHasErrors) {
    consola.error('The following files were ignored in the config but had no errors in the tsc output:')
    consola.box(ignoredFilesWithoutErrors.join('\n'))
  }

  if (tscHasErrors) {
    const errorFiles = uniqArray(tscErrors.map(({ path }) => path))

    consola.error(`Found ${tscErrors.length} tsc errors in ${errorFiles.length} files:`)
    consola.box(errorFiles.join('\n'))

    if (config?.fullOutput)
      consola.log(tscErrors.map(tscErrorToString).join('\n'))
  }

  return outputHasErrors
}

export function checkConfig(config: TypestepConfig) {
  const { ignoredFiles = [] } = config
  const duplicateIgnoredFiles = uniqArray(ignoredFiles.filter((file, index, self) => self.indexOf(file) !== index))

  if (duplicateIgnoredFiles.length > 0) {
    consola.warn('The following files were ignored more than once in the `ignoredFiles` config:')
    consola.box(duplicateIgnoredFiles.join('\n'))
  }
}
