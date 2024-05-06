#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { defineCommand } from 'citty'
import { parseTscOutput } from '../index.js'
import { writeTypestepConfig } from '../utils.js'
import { CONFIG_FILE_NAME } from '../constants.js'

async function init(tscOutputFile: string) {
  const tscOutput = await readFile(tscOutputFile, 'utf8')
  const parsedTscOutput = parseTscOutput(tscOutput)

  const ignoredFiles = [...new Set(parsedTscOutput.map(({ path }) => path))]
  const configFileContent = writeTypestepConfig({ ignoredFiles })

  return writeFile(CONFIG_FILE_NAME, configFileContent)
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

    init(args.tsc_output_file)
  },
})
