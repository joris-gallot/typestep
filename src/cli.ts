#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import packageJson from '../package.json' with { type: 'json' }

const main = defineCommand({
  meta: {
    name: 'typestep',
    version: packageJson.version,
    description: 'CLI tool to filter tsc output',
  },
  subCommands: {
    run: () => import('./commands/run.js').then(mod => mod.default),
    init: () => import('./commands/init.js').then(mod => mod.default),
  },
})

runMain(main)
