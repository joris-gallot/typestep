import { existsSync } from 'fs';
import { parseTscOutput, getFinalOutput} from './index.js'
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { TypestepConfig } from './types.js';
import { tryImport } from './utils.js';

function getTscOutputPath() {
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

  return tscOutputPath
}

async function readConfigFile() {
  const configFile = resolve(process.cwd(), 'typestep.config.ts')

  if (!existsSync(configFile)) {
    console.log('No config file found');
    return
  }

  const configModule = await tryImport(configFile);

  if (!configModule?.default) {
    console.log('No default export found in config file');
    return
  }

  return configModule.default as TypestepConfig
}

async function run() {
  const tscOutput = await readFile(getTscOutputPath(), 'utf8');
  const configFile = await readConfigFile();
  const parsedTscOutput = parseTscOutput(tscOutput);
  
  const errors = getFinalOutput(parsedTscOutput, configFile).map(({ error }) => error);

  if (errors.length === 0) {
    console.log('No tsc errors found');
    return;
  }

  console.error(errors.length); 
  // process.exit(0);
}

run();