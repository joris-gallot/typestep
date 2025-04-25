#!/usr/bin/env node

import type { TypestepConfig } from '../types.js'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'

import { defineCommand } from 'citty'

import { CONFIG_FILE_NAME } from '../constants.js'
import { checkConfig, getOutput, getTscErrors, parseTscOutput } from '../index.js'
import { consola, tryImport } from '../utils.js'

export async function readConfigFile() {
  const configFile = resolve(process.cwd(), CONFIG_FILE_NAME)

  if (!existsSync(configFile)) {
    consola.info('Running without a config file')
    return
  }

  const configModule = await tryImport(configFile)

  if (!configModule) {
    consola.warn('No default export found in config file')
    return
  }

  return configModule as TypestepConfig
}

/* v8 ignore next 20 - ignore coverage as it should be run from CLI */
async function run(tscOutputFile: string) {
  const tscOutput = await readFile(tscOutputFile, 'utf8')
  const config = await readConfigFile()

  if (config)
    checkConfig(config)

  consola.start('Processing tsc output file')
  const parsedTscOutput = parseTscOutput(tscOutput)

  const errors = getTscErrors(parsedTscOutput, config)
  consola.info(`${parsedTscOutput.length - errors.tscErrors.length} errors ignored`)

  const exit = getOutput(errors, config)

  if (exit)
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
  /* v8 ignore next 6 - ignore coverage as it should be run from CLI */
  run({ args }) {
    if (!existsSync(args.tsc_output_file))
      throw new Error('Tsc output file not found')

    run(resolve(process.cwd(), args.tsc_output_file))
  },
})
