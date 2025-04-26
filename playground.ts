import { resolve } from 'node:path'
import { run } from './src/commands/run.js'

async function start() {
  run(resolve(__dirname, 'tsc-output.log'))
}

start()
