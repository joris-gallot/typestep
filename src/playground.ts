import { readFile } from 'fs/promises';
import { parseTscOutput } from './parser.js';
import { resolve } from 'path';

let tscOutput
try {
  tscOutput = await readFile(resolve(__dirname, '..', 'tsc-output.log'), 'utf8');
} catch (error) {
  throw new Error('Could not read tsc-output.log');
}

const parsedTscOutput = parseTscOutput(tscOutput)

console.log(parsedTscOutput)
