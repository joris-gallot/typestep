import { readFile } from 'fs/promises';
import { parseTscOutput } from './index.js';
import { resolve } from 'path';

async function run() {
  let tscOutput
  try {
    tscOutput = await readFile(resolve(__dirname, '..', 'tsc-output.log'), 'utf8');
  } catch (error) {
    throw new Error('Could not read tsc-output.log');
  }

  const parsedTscOutput = parseTscOutput(tscOutput)
  console.log(parsedTscOutput)
}

run()