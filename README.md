# Typestep

Typestep aims to simplify the migration process from JavaScript to TypeScript in existing projects by offering a gradual transition strategy. It allows developers to introduce TypeScript incrementally by leveraging the parsing of TypeScript compiler output (tsc)

**⚠️ Work in Progress ⚠️**

This project is currently under active development and is not yet considered stable

## Usage

```bash
npm install -g typestep
```

### Config file

```ts
// typestep.config.ts
export default {
  ignoredFiles: ['src/main.ts']
}
```

```bash
tsc > tsc-output.log
```

```bash
typestep tsc-output.log
```
