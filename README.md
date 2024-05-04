# Typestep

Typestep aims to simplify the migration process from JavaScript to TypeScript in existing projects by offering a gradual transition strategy. It allows developers to introduce TypeScript incrementally by leveraging the parsing of TypeScript compiler output (tsc)

## Usage

```bash
npm install -g typestep
```

```bash
tsc > tsc-output.log
```

```bash
typestep tsc-output.log
```
