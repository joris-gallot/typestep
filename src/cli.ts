import { existsSync } from 'fs';
import { parseTscOutput, getFinalOutput} from './index.js'
import { readFile } from 'fs/promises';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('No tsc output file provided');
  process.exit(1);
}

const tscOutputPath = args[0];

if (!existsSync(tscOutputPath)) {
  console.log(`File ${tscOutputPath} does not exist`);
  process.exit(1);
}

async function main() {
  const tscOutput = await readFile(tscOutputPath, 'utf8');
  const parsedTscOutput = parseTscOutput(tscOutput);
  
  const errors = getFinalOutput(parsedTscOutput).map(({ error }) => error);
  console.error(errors.join('\n')); 
}

main();