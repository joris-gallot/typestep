# Typestep

Typestep aims to simplify the migration process from JavaScript to TypeScript in existing projects by offering a gradual transition strategy. It allows developers to introduce TypeScript incrementally by leveraging the parsing of TypeScript compiler output (tsc)

## Usage

```bash
npm install typestep --save-dev
```

> [!WARNING]
> Do Not Use `--pretty` option with `tsc`
```bash
tsc > tsc-output.log
```

### Config file

#### Init config file

> [!NOTE]
> The init command creates your Typestep config file by analyzing the tsc output, for each file that has TypeScript errors, it will automatically generate a configuration that ignores the specific error codes found in that file. This allows for a granular approach to TypeScript migration, where you can selectively ignore certain types of errors while addressing others.

```bash
typestep init tsc-output.log
```

#### Or create your config file

```ts
// typestep.config.ts
import type { TypestepConfig } from 'typestep'

export default {
  ignoredFiles: {
    'src/foo.ts': true, // ignore all errors
    'src/bar.ts': {
      ignoredTsErrorCodes: ['TS2339', 'TS2345'] // ignore only ts error codes
    }
  },
  ignoredTsErrorCodes: [ // global ts error codes to ignore
    'TS2322'
  ],
  fullOutputErrors: false, // get full output errors (default: false)
} satisfies TypestepConfig
```

### Run typestep

```bash
typestep run tsc-output.log
```
