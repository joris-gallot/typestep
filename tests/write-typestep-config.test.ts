import type { TypestepConfig } from '../src/types.js'
import { describe, expect, it } from 'vitest'
import { writeTypestepConfig } from '../src/utils.js'

describe('writeTypestepConfig', () => {
  it('should generate config with only ignoredFiles', () => {
    const config: TypestepConfig = {
      ignoredFiles: ['src/file1.ts', 'src/file2.ts'],
    }

    const expected = `import type { TypestepConfig } from 'typestep'
  
export default {
  "ignoredFiles": [
    "src/file1.ts",
    "src/file2.ts"
  ]
} satisfies TypestepConfig`

    expect(writeTypestepConfig(config)).toBe(expected)
  })

  it('should generate config with only ignoredTsErrorCodes', () => {
    const config: TypestepConfig = {
      ignoredTsErrorCodes: ['TS1234', 'TS5678'],
    }

    const expected = `import type { TypestepConfig } from 'typestep'
  
export default {
  "ignoredTsErrorCodes": [
    "TS1234",
    "TS5678"
  ]
} satisfies TypestepConfig`

    expect(writeTypestepConfig(config)).toBe(expected)
  })

  it('should generate config with both ignoredFiles and ignoredTsErrorCodes', () => {
    const config: TypestepConfig = {
      ignoredFiles: ['src/file1.ts', 'src/file2.ts'],
      ignoredTsErrorCodes: ['TS1234', 'TS5678'],
    }

    const expected = `import type { TypestepConfig } from 'typestep'
  
export default {
  "ignoredFiles": [
    "src/file1.ts",
    "src/file2.ts"
  ],
  "ignoredTsErrorCodes": [
    "TS1234",
    "TS5678"
  ]
} satisfies TypestepConfig`

    expect(writeTypestepConfig(config)).toBe(expected)
  })

  it('should generate config with empty arrays', () => {
    const config: TypestepConfig = {
      ignoredFiles: [],
      ignoredTsErrorCodes: [],
    }

    const expected = `import type { TypestepConfig } from 'typestep'
  
export default {
  "ignoredFiles": [],
  "ignoredTsErrorCodes": []
} satisfies TypestepConfig`

    expect(writeTypestepConfig(config)).toBe(expected)
  })

  it('should generate config with undefined values', () => {
    const config: TypestepConfig = {
      ignoredFiles: undefined,
      ignoredTsErrorCodes: undefined,
    }

    const expected = `import type { TypestepConfig } from 'typestep'
  
export default {} satisfies TypestepConfig`

    expect(writeTypestepConfig(config)).toBe(expected)
  })

  it('should generate config with mixed undefined and defined values', () => {
    const config: TypestepConfig = {
      ignoredFiles: ['src/file1.ts'],
      ignoredTsErrorCodes: undefined,
    }

    const expected = `import type { TypestepConfig } from 'typestep'
  
export default {
  "ignoredFiles": [
    "src/file1.ts"
  ]
} satisfies TypestepConfig`

    expect(writeTypestepConfig(config)).toBe(expected)
  })
})
