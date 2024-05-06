# Typestep

Typestep aims to simplify the migration process from JavaScript to TypeScript in existing projects by offering a gradual transition strategy. It allows developers to introduce TypeScript incrementally by leveraging the parsing of TypeScript compiler output (tsc)

**⚠️ Work in Progress ⚠️**

> [!WARNING]
> This project is currently under active development and is not yet considered stable

## Usage

```bash
npm install -g typestep
```

> [!WARNING]
> Do Not Use `--pretty` option with `tsc`
```bash
tsc > tsc-output.log
```

### Init config file

> [!NOTE]
> Initialize the Typestep configuration file with all files from the tsc output marked as ignored

```bash
typestep init tsc-output.log
```

### Or create your config file

```ts
// typestep.config.ts
export default {
  ignoredFiles: ['src/main.ts']
}
```

### Run typestep

```bash
typestep run tsc-output.log
```
