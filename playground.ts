/* eslint-disable no-console */
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parseTscOutput } from './src/index.js'

async function run() {
  let tscOutput
  try {
    tscOutput = await readFile(resolve(__dirname, 'tsc-output.log'), 'utf8')
  }
  catch (error) {
    throw new Error('Could not read tsc-output.log', { cause: error })
  }

  const parsedTscOutput = parseTscOutput(tscOutput)
  console.log(parsedTscOutput)
}

run()
