import process from 'node:process'
import jiti from 'jiti'
import type { TscError, TypestepConfig } from './types.js'

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

export function tscDiagnosticToTscError(diag: TscError) {
  const { path, cursor, tsCode, error } = diag

  return `${path}(${cursor.line},${cursor.column}): error ${tsCode}: ${error}`
}

export function writeTypestepConfig(config: TypestepConfig) {
  return `export default ${JSON.stringify(config, null, 2)}`
}
