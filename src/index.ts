import type { TscError, TypestepConfig } from './types.js'

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
  tsError,
}: {
  file: string
  ignoredFile: string
  ignoredFileOptions: NonNullable<TypestepConfig['ignoredFiles']>[string]
  tsError: Omit<TscError, 'path'>
}): boolean {
  if (file !== ignoredFile)
    return false

  if (ignoredFileOptions === true)
    return true

  if (typeof ignoredFileOptions === 'function')
    return ignoredFileOptions(tsError)

  return ignoredFileOptions.ignoredTsErrorCodes.includes(tsError.tsCode)
}

export function getTscErrors(parsedTscOutput: Array<TscError>, config?: TypestepConfig) {
  const { ignoredFiles = {}, ignoredTsErrorCodes = [] } = config || {}
  let tscErrors = parsedTscOutput
  let ignoredFilesWithoutErrors: Array<{
    file: string
    type: 'all' | 'codes'
    missingCodes?: string[]
  }> = []
  let ignoredTsErrorCodesWithoutErrors

  if (Object.keys(ignoredFiles).length > 0) {
    ignoredFilesWithoutErrors = Object.keys(ignoredFiles).map((ignoredFile) => {
      const fileErrors = parsedTscOutput.filter(({ path }) => path === ignoredFile)
      const fileConfig = ignoredFiles[ignoredFile]

      if (fileConfig === true) {
        // File is completely ignored
        return {
          file: ignoredFile,
          type: 'all' as const,
          missingCodes: fileErrors.length === 0 ? [] : undefined,
        }
      }
      else if (typeof fileConfig === 'function') {
        const missingCodes = fileErrors.filter(error => !fileConfig(error)).map(error => error.tsCode)
        const isAll = missingCodes.length === 0
        return {
          file: ignoredFile,
          type: isAll ? 'all' as const : 'codes' as const,
          missingCodes: isAll ? [] : missingCodes,
        }
      }
      else {
        // File has specific error codes ignored
        const missingCodes = fileConfig.ignoredTsErrorCodes.filter(code =>
          !fileErrors.some(error => error.tsCode === code),
        )
        return {
          file: ignoredFile,
          type: 'codes' as const,
          missingCodes: missingCodes.length > 0 ? missingCodes : undefined,
        }
      }
    }).filter(result => result.missingCodes !== undefined)

    tscErrors = tscErrors.filter(({ path, tsCode, cursor, error }) => !Object.keys(ignoredFiles).some((ignoredFile) => {
      return shouldIgnoreFile({
        file: path,
        ignoredFile,
        ignoredFileOptions: ignoredFiles[ignoredFile],
        tsError: { tsCode, cursor, error },
      })
    }))
  }

  if (ignoredTsErrorCodes.length > 0) {
    ignoredTsErrorCodesWithoutErrors = ignoredTsErrorCodes.filter(ignoredTsErrorCode => !parsedTscOutput.some(({ tsCode }) => tsCode === ignoredTsErrorCode))
    tscErrors = tscErrors.filter(({ tsCode }) => !ignoredTsErrorCodes.includes(tsCode))
  }

  return {
    tscErrors,
    ignoredFilesWithoutErrors,
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
    const output = ignoredFilesWithoutErrors.map(({ file, type, missingCodes }) => {
      if (type === 'all') {
        return `${file} (no errors found)`
      }

      return `${file} (no errors for codes: ${missingCodes?.join(', ')})`
    })

    consola.box(output.join('\n'))
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
