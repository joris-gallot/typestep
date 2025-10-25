import type { TscError, TypestepConfig } from './types.js'
import process from 'node:process'
import { createConsola } from 'consola'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)

/* v8 ignore next 9 - ignore coverage for jiti import */
export function tryImport(file: string, rootDir: string = process.cwd()) {
  try {
    return jiti.import(file, { default: true })
  }
  catch (error: any) {
    if (error.code !== 'MODULE_NOT_FOUND')
      console.error(`Error trying import ${file} from ${rootDir}`, error)
  }
}

export function tscErrorToString(tscError: TscError) {
  const { path, cursor, tsCode, error } = tscError

  return `${path}(${cursor.line},${cursor.column}): error ${tsCode}: ${error}`
}

export function writeTypestepConfig(config: TypestepConfig) {
  return `import type { TypestepConfig } from 'typestep'

export default ${JSON.stringify(config, null, 2)} satisfies TypestepConfig`
}

export function uniqArray<T>(array?: Array<T>) {
  return [...new Set(array || [])]
}

export const consola = createConsola()
