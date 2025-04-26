#!/usr/bin/env node
import type { TypestepArgsCli, TypestepConfig } from '../types.js'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { defineCommand } from 'citty'

import { CONFIG_FILE_NAME } from '../constants.js'
import { parseTscOutput } from '../index.js'
import { consola, uniqArray, writeTypestepConfig } from '../utils.js'

export async function generateInitialConfig({ tscOutputFile, ignoreFiles, ignoreTsErrorCodes }: TypestepArgsCli): Promise<TypestepConfig> {
  const tscOutput = await readFile(tscOutputFile, 'utf8')
  const parsedTscOutput = parseTscOutput(tscOutput)

  const shouldIgnoreFiles = ignoreFiles || (!ignoreFiles && !ignoreTsErrorCodes)

  const ignoredFiles = shouldIgnoreFiles ? uniqArray(parsedTscOutput.map(({ path }) => path)) : undefined
  const ignoredTsErrorCodes = ignoreTsErrorCodes ? uniqArray(parsedTscOutput.map(({ tsCode }) => tsCode)) : undefined

  return { ignoredFiles, ignoredTsErrorCodes }
}

/* v8 ignore next 11 - ignore coverage for writeFile */
async function initConfig(configCli: TypestepArgsCli) {
  const config = await generateInitialConfig(configCli)

  try {
    await writeFile(CONFIG_FILE_NAME, writeTypestepConfig(config))
    consola.success('Typestep config file created')
  }
  catch (error) {
    consola.error('Error creating Typestep config file', error)
  }
}

export default defineCommand({
  meta: {
    name: 'init',
    description: 'Initialize the Typestep configuration file with all files from the tsc output marked as ignored',
  },
  args: {
    tsc_output_file: {
      type: 'positional',
      description: 'The tsc output file path to be processed',
      required: true,
    },
    ignoreFiles: {
      default: false,
      type: 'boolean',
      description: 'Initialize the Typestep configuration file with all files from the tsc output marked as ignored',
    },
    ignoreTsErrorCodes: {
      default: false,
      type: 'boolean',
      description: 'Initialize the Typestep configuration file with all ts error codes from the tsc output marked as ignored',
    },
  },
  /* v8 ignore next 13 - ignore coverage as it should be run from CLI */
  run({ args }) {
    if (!existsSync(args.tsc_output_file))
      throw new Error('Tsc output file not found')

    if (existsSync(CONFIG_FILE_NAME))
      throw new Error('Typestep config file already exists')

    initConfig({
      tscOutputFile: resolve(process.cwd(), args.tsc_output_file),
      ignoreFiles: args.ignoreFiles,
      ignoreTsErrorCodes: args.ignoreTsErrorCodes,
    })
  },
})
