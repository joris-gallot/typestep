#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { defineCommand, runMain } from 'citty'

import type { TypestepConfig } from '../types.js'
import { tryImport, tscDiagnosticToTscError } from '../utils.js'
import { getFinalOutput, parseTscOutput } from '../index.js'
import { CONFIG_FILE_NAME } from '../constants.js'

async function readConfigFile() {
  const configFile = resolve(process.cwd(), CONFIG_FILE_NAME)

  if (!existsSync(configFile)) {
    console.log('No config file found')
    return
  }

  const configModule = await tryImport(configFile)

  if (!configModule?.default) {
    console.log('No default export found in config file')
    return
  }

  return configModule.default as TypestepConfig
}

async function run(tscOutputFile: string) {
  const tscOutput = await readFile(tscOutputFile, 'utf8')
  const configFile = await readConfigFile()
  const parsedTscOutput = parseTscOutput(tscOutput)

  const tscDiagnostics = getFinalOutput(parsedTscOutput, configFile)

  if (tscDiagnostics.length === 0) {
    console.log('No tsc errors found')
    return
  }

  console.error(tscDiagnostics.map(tscDiagnosticToTscError).join('\n'))
  process.exit(1)
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

    run(args.tsc_output_file)
  },
})
