/* eslint-disable no-console */
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import type { TypestepConfig } from './types.js'
import { tryImport, tscDiagnosticToTscError } from './utils.js'
import { getFinalOutput, parseTscOutput } from './index.js'

function getTscOutputPath() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('No tsc output file provided')
    process.exit(1)
  }

  const tscOutputPath = args[0]

  if (!existsSync(tscOutputPath)) {
    console.log(`File ${tscOutputPath} does not exist`)
    process.exit(1)
  }

  return tscOutputPath
}

async function readConfigFile() {
  const configFile = resolve(process.cwd(), 'typestep.config.ts')

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

async function run() {
  const tscOutput = await readFile(getTscOutputPath(), 'utf8')
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

run()
