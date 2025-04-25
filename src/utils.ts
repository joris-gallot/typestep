import type { TscError, TypestepConfig } from './types.js'
import process from 'node:process'
import jiti from 'jiti'

export function tryImport(file: string, rootDir: string = process.cwd()) {
  // @ts-expect-error "This expression is not callable." but works fine
  const _import = jiti(rootDir, { interopDefault: true, esmResolve: true })

  try {
    return _import(file)
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
