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
> Init command will create your Typestep config file. By default, it will mark all files from the tsc output as ignored, you can also choose to ignore specific TypeScript error codes.

```bash
# Initialize with all files ignored
typestep init tsc-output.log

# Initialize with all TypeScript error codes ignored
typestep init tsc-output.log --ignoreTsErrorCodes

# Initialize with both files and TypeScript error codes ignored
typestep init tsc-output.log --ignoreFiles --ignoreTsErrorCodes
```

#### Or create your config file

```ts
// typestep.config.ts
import type { TypestepConfig } from 'typestep'

export default {
  ignoredFiles: ['src/main.ts'], // files to ignore
  ignoredTsErrorCodes: [ // ts error codes to ignore
    'TS2322'
  ],
  fullOutputErrors: false, // get full output errors (default: false)
} satisfies TypestepConfig
```

### Run typestep

```bash
typestep run tsc-output.log
```
