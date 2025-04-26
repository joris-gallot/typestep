import type { ConfigIgnoredFilesOptions, TscError, TypestepConfig } from './types.js'

import { consola, tscErrorToString, uniqArray } from './utils.js'

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

export function shouldIgnoreFile({
  file,
  ignoredFile,
  ignoredFileOptions,
  tsCode,
}: {
  file: string
  ignoredFile: string
  ignoredFileOptions: ConfigIgnoredFilesOptions
  tsCode: string
}): boolean {
  if (file !== ignoredFile)
    return false

  if (ignoredFileOptions === true)
    return true

  return ignoredFileOptions.ignoredTsErrorCodes.includes(tsCode)
}

export function getTscErrors(parsedTscOutput: Array<TscError>, config?: TypestepConfig) {
  const { ignoredFiles = {}, ignoredTsErrorCodes = [] } = config || {}
  let tscErrors = parsedTscOutput
  let ignoredFilesWithoutErrors
  let ignoredTsErrorCodesWithoutErrors

  if (Object.keys(ignoredFiles).length > 0) {
    ignoredFilesWithoutErrors = Object.keys(ignoredFiles).filter(ignoredFile => !parsedTscOutput.some(({ path, tsCode }) => {
      return shouldIgnoreFile({ file: path, ignoredFile, ignoredFileOptions: ignoredFiles[ignoredFile], tsCode })
    }))

    tscErrors = tscErrors.filter(({ path, tsCode }) => !Object.keys(ignoredFiles).some((ignoredFile) => {
      return shouldIgnoreFile({ file: path, ignoredFile, ignoredFileOptions: ignoredFiles[ignoredFile], tsCode })
    }))
  }

  if (ignoredTsErrorCodes.length > 0) {
    ignoredTsErrorCodesWithoutErrors = ignoredTsErrorCodes.filter(ignoredTsErrorCode => !parsedTscOutput.some(({ tsCode }) => tsCode === ignoredTsErrorCode))
    tscErrors = tscErrors.filter(({ tsCode }) => !ignoredTsErrorCodes.includes(tsCode))
  }

  return {
    tscErrors,
    ignoredFilesWithoutErrors: uniqArray(ignoredFilesWithoutErrors),
    ignoredTsErrorCodesWithoutErrors: uniqArray(ignoredTsErrorCodesWithoutErrors),
  }
}

export function getOutput({ tscErrors, ignoredFilesWithoutErrors, ignoredTsErrorCodesWithoutErrors }: ReturnType<typeof getTscErrors>, config?: TypestepConfig) {
  const ignoredFilesHasErrors = ignoredFilesWithoutErrors.length > 0
  const ignoredTsErrorCodesHasErrors = ignoredTsErrorCodesWithoutErrors.length > 0
  const tscHasErrors = tscErrors.length > 0
  const outputHasErrors = tscHasErrors || ignoredFilesHasErrors || ignoredTsErrorCodesHasErrors

  if (ignoredFilesHasErrors) {
    consola.error('The following files were ignored in the config but had no errors in the tsc output:')
    consola.box(ignoredFilesWithoutErrors.join('\n'))
  }

  if (ignoredTsErrorCodesHasErrors) {
    consola.error('The following tsc error codes were ignored in the config but had no errors in the tsc output:')
    consola.box(ignoredTsErrorCodesWithoutErrors.join('\n'))
  }

  if (tscHasErrors) {
    const errorFiles = uniqArray(tscErrors.map(({ path }) => path))

    consola.error(`Found ${tscErrors.length} tsc errors in ${errorFiles.length} files:`)
    consola.box(errorFiles.join('\n'))

    if (config?.fullOutputErrors)
      consola.log(tscErrors.map(tscErrorToString).join('\n'))
  }

  return outputHasErrors
}

export function checkConfig(config: TypestepConfig) {
  const { ignoredTsErrorCodes = [] } = config

  const duplicateIgnoredTsErrorCodes = uniqArray(ignoredTsErrorCodes.filter((code, index, self) => self.indexOf(code) !== index))

  if (duplicateIgnoredTsErrorCodes.length > 0) {
    consola.warn('The following tsc error codes were ignored more than once in the `ignoredTsErrorCodes` config:')
    consola.box(duplicateIgnoredTsErrorCodes.join('\n'))
  }
}
