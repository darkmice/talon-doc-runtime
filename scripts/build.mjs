import { build } from 'esbuild'
import { mkdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'

await mkdir('dist', { recursive: true })

// ─── Browser runtime — src/index.ts → 3 bundles ─────────────────────────────

const runtimeCommon = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  sourcemap: true,
  minify: true,
  target: ['es2020'],
  logLevel: 'info',
}

// ─── Markdown transformer — src/markdown.ts → Node-only ─────────────────────
// Built unminified, ESM only, external-izing every dependency listed in
// package.json. The CLI imports this file; remark/rehype etc. are resolved
// from node_modules at runtime by Node's loader.
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const nodeExternals = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
]

const markdownCommon = {
  entryPoints: ['src/markdown.ts'],
  bundle: true,
  sourcemap: true,
  target: ['node20'],
  platform: 'node',
  external: nodeExternals,
  logLevel: 'info',
}

await Promise.all([
  build({
    ...runtimeCommon,
    format: 'esm',
    outfile: 'dist/talon-doc-runtime.esm.js',
  }),
  build({
    ...runtimeCommon,
    format: 'cjs',
    outfile: 'dist/talon-doc-runtime.cjs',
  }),
  build({
    ...runtimeCommon,
    format: 'iife',
    globalName: 'TalonDocRuntime',
    outfile: 'dist/talon-doc-runtime.iife.js',
    footer: {
      js: 'TalonDocRuntime.mount();',
    },
  }),
  build({
    ...markdownCommon,
    format: 'esm',
    outfile: 'dist/markdown.mjs',
  }),
])
