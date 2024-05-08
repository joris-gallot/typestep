#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { defineCommand } from 'citty'
import { parseTscOutput } from '../index.js'
import { uniqArray, writeTypestepConfig } from '../utils.js'
import { CONFIG_FILE_NAME } from '../constants.js'
import type { TypestepConfig } from '../types.js'

export async function generateInitialConfig(tscOutputFile: string): Promise<TypestepConfig> {
  const tscOutput = await readFile(tscOutputFile, 'utf8')
  const parsedTscOutput = parseTscOutput(tscOutput)

  const ignoredFiles = uniqArray(parsedTscOutput.map(({ path }) => path))

  return { ignoredFiles }
}

async function initConfig(tscOutputFile: string) {
  const config = await generateInitialConfig(tscOutputFile)
  return writeFile(CONFIG_FILE_NAME, writeTypestepConfig(config))
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
  run({ args }) {
    if (!existsSync(args.tsc_output_file))
      throw new Error('Tsc output file not found')

    if (existsSync(CONFIG_FILE_NAME))
      throw new Error('Typestep config file already exists')

    initConfig(resolve(process.cwd(), args.tsc_output_file))
  },
})
