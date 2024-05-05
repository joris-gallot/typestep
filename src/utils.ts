import jiti from "jiti";

export function tryImport(file: string, rootDir: string = process.cwd()) {
  // @ts-expect-error "This expression is not callable." but works fine 
  const _import = jiti(rootDir, { interopDefault: true, esmResolve: true });

  try {
    return _import(file);
  } catch (error: any) {
    if (error.code !== "MODULE_NOT_FOUND") {
      console.error(`Error trying import ${file} from ${rootDir}`, error);
    };
  }
}