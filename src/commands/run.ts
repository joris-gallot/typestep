#!/usr/bin/env node

import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { defineCommand } from 'citty'

import { consola } from 'consola'
import type { TypestepConfig } from '../types.js'
import { tryImport, tscDiagnosticToTscError } from '../utils.js'
import { getTscErrors, parseTscOutput } from '../index.js'
import { CONFIG_FILE_NAME } from '../constants.js'

async function readConfigFile() {
  const configFile = resolve(process.cwd(), CONFIG_FILE_NAME)

  if (!existsSync(configFile)) {
    consola.info('Running without a config file')
    return
  }

  const configModule = await tryImport(configFile)

  if (!configModule?.default) {
    consola.warn('No default export found in config file')
    return
  }

  return configModule.default as TypestepConfig
}

async function run(tscOutputFile: string) {
  const tscOutput = await readFile(tscOutputFile, 'utf8')
  const configFile = await readConfigFile()
  const parsedTscOutput = parseTscOutput(tscOutput)

  const { tscErrors, ignoredFilesWithoutErrors } = getTscErrors(parsedTscOutput, configFile)

  const ignoredFilesHasErrors = ignoredFilesWithoutErrors.length > 0
  const tscHasErrors = tscErrors.length > 0
  const outputHasErrors = tscHasErrors || ignoredFilesHasErrors

  if (ignoredFilesHasErrors)
    consola.error(`The following files were ignored in the config but had no errors in the tsc output: ${ignoredFilesWithoutErrors.join(', ')}`)

  if (tscHasErrors) {
    const errorFiles = [...new Set(tscErrors.map(({ path }) => path))]

    consola.error(`Found ${tscErrors.length} tsc errors in ${errorFiles.length} files:`)
    consola.box(errorFiles.join('\n'))

    if (configFile?.fullOutput)
      consola.log(tscErrors.map(tscDiagnosticToTscError).join('\n'))
  }

  if (outputHasErrors)
    process.exit(1)

  consola.success('No tsc errors found')
}

export default defineCommand({
  meta: {
    name: 'run',
    description: 'Run the Typestep CLI tool with the tsc output file as input',
  },
  args: {
    tsc_output_file: {
      type: 'positional',
      description: 'The tsc output file path to be processed',
      required: true,
    },
  },
  run({ args }) {
    if (!existsSync(args.tsc_output_file))
      throw new Error('Tsc output file not found')

    run(resolve(process.cwd(), args.tsc_output_file))
  },
})
