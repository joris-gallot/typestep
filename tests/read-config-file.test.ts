import { resolve } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readConfigFile } from '../src/commands/run.js'
import { CONFIG_FILE_NAME } from '../src/constants.js'
import { consola } from '../src/utils.js'

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}))

vi.mock('../src/utils.js', async (importOriginal) => {
  const original = await importOriginal() as typeof import('../src/utils.js')
  return {
    ...original,
    consola: {
      info: vi.fn(),
      warn: vi.fn(),
    },
    tryImport: vi.fn(),
  }
})

describe('readConfigFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return undefined and log info when config file does not exist', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(false)

    const result = await readConfigFile()

    expect(result).toBeUndefined()
    expect(consola.info).toHaveBeenCalledWith('Running without a config file')
    expect(existsSync).toHaveBeenCalledWith(resolve(process.cwd(), CONFIG_FILE_NAME))
  })

  it('should return undefined and log warning when config file has no default export', async () => {
    const { existsSync } = await import('node:fs')
    const { tryImport } = await import('../src/utils.js')

    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(tryImport).mockResolvedValue(undefined)

    const result = await readConfigFile()

    expect(result).toBeUndefined()
    expect(consola.warn).toHaveBeenCalledWith('No default export found in config file')
    expect(tryImport).toHaveBeenCalledWith(resolve(process.cwd(), CONFIG_FILE_NAME))
  })

  it('should return config when file exists and has valid default export', async () => {
    const { existsSync } = await import('node:fs')
    const { tryImport } = await import('../src/utils.js')

    const mockConfig = {
      ignoredFiles: ['file1.ts'],
      ignoredTsErrorCodes: ['TS1234'],
    }

    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(tryImport).mockResolvedValue(mockConfig)

    const result = await readConfigFile()

    expect(result).toEqual(mockConfig)
    expect(consola.info).not.toHaveBeenCalled()
    expect(consola.warn).not.toHaveBeenCalled()
    expect(tryImport).toHaveBeenCalledWith(resolve(process.cwd(), CONFIG_FILE_NAME))
  })
})
