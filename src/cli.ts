#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import { version } from '../package.json'

const main = defineCommand({
  meta: {
    name: 'typestep',
    version,
    description: 'CLI tool to filter tsc output',
  },
  subCommands: {
    run: () => import('./commands/run.js').then(mod => mod.default),
    init: () => import('./commands/init.js').then(mod => mod.default),
  },
})

runMain(main)
