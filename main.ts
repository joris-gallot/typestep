import { parse } from '@aivenio/tsc-output-parser';
import { readFile } from 'fs/promises';

let tscOutput
try {
  tscOutput = await readFile('tsc-output.log', 'utf8');
} catch (error) {
  throw new Error('Could not read tsc-output.log');
}

const tscErrors  = tscOutput.split('\n');

const diagnostics = parse(tscErrors[0]);

console.dir(diagnostics, { depth: null })