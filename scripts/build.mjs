import { build } from 'esbuild'
import { mkdir } from 'node:fs/promises'

const entryPoints = ['src/index.ts']

await mkdir('dist', { recursive: true })

const common = {
  entryPoints,
  bundle: true,
  sourcemap: true,
  minify: true,
  target: ['es2020'],
  logLevel: 'info',
}

await Promise.all([
  build({
    ...common,
    format: 'esm',
    outfile: 'dist/talon-doc-runtime.esm.js',
  }),
  build({
    ...common,
    format: 'cjs',
    outfile: 'dist/talon-doc-runtime.cjs',
  }),
  build({
    ...common,
    format: 'iife',
    globalName: 'TalonDocRuntime',
    outfile: 'dist/talon-doc-runtime.iife.js',
    footer: {
      js: 'TalonDocRuntime.mount();',
    },
  }),
])
