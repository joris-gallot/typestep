#!/usr/bin/env node
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'init',
    description: 'Initialize the Typestep configuration file with all files from the tsc output marked as ignored',
  },
  run({ args }) {
    // Run init script
  },
})
