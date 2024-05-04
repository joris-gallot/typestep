import { readFile } from 'fs/promises';
import { parseTscOutput } from './parser';

let tscOutput
try {
  tscOutput = await readFile('tsc-output.log', 'utf8');
} catch (error) {
  throw new Error('Could not read tsc-output.log');
}

const parsedTscOutput = parseTscOutput(tscOutput)

console.log(parsedTscOutput)

