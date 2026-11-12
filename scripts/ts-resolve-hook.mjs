/**
 * Resolve extensionless imports in src/*.ts when the result stills script
 * loads the editor's own modules under node --experimental-strip-types.
 */
export async function resolve(specifier, context, nextResolve) {
  if ((specifier.startsWith('.') || specifier.startsWith('/')) && !/\.(?:js|mjs|cjs|ts|json|node|wasm)$/.test(specifier)) {
    try {
      return await nextResolve(`${specifier}.ts`, context)
    } catch {
      return nextResolve(`${specifier}.js`, context)
    }
  }
  return nextResolve(specifier, context)
}
