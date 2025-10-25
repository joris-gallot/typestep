#!/usr/bin/env node
import type { NonEmptyArray, TypestepConfig } from '../types.js'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { defineCommand } from 'citty'

import { CONFIG_FILE_NAME } from '../constants.js'
import { parseTscOutput } from '../index.js'
import { consola, uniqArray, writeTypestepConfig } from '../utils.js'

export async function generateInitialConfig(tscOutputFile: string): Promise<TypestepConfig> {
  const tscOutput = await readFile(tscOutputFile, 'utf8')
  const parsedTscOutput = parseTscOutput(tscOutput)

  const ignoredFiles = Object.fromEntries(parsedTscOutput.map(({ path }) => {
    const ignoredTsErrorCodes = uniqArray(parsedTscOutput.filter(({ path: p }) => p === path).map(({ tsCode }) => tsCode)) as NonEmptyArray<string>

    return [path, {
      ignoredTsErrorCodes,
    }]
  }))

  return { ignoredFiles }
}

/* v8 ignore next -- @preserve ignore coverage for writeFile */
export async function initConfig(tscOutputFile: string) {
  const config = await generateInitialConfig(tscOutputFile)

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
  },
  /* v8 ignore next - ignore coverage as it should be run from CLI */
  run({ args }) {
    if (!existsSync(args.tsc_output_file))
      throw new Error('Tsc output file not found')

    if (existsSync(CONFIG_FILE_NAME))
      throw new Error('Typestep config file already exists')

    initConfig(resolve(process.cwd(), args.tsc_output_file))
  },
})
