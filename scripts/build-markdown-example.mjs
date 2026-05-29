#!/usr/bin/env node
// Regenerate the rendered-output block in examples/markdown.html from
// examples/markdown-source.md, so the side-by-side demo can't drift.
//
//   node scripts/build-markdown-example.mjs
//
// The left pane (escaped Markdown source) is maintained by hand; only the
// region between the BEGIN/END GENERATED markers is rewritten.

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcPath = join(root, 'examples', 'markdown-source.md')
const pagePath = join(root, 'examples', 'markdown.html')

const { mdToTdr } = await import(join(root, 'dist', 'markdown.mjs'))

const markdown = await readFile(srcPath, 'utf8')
const { html: fragment, warnings } = await mdToTdr(markdown, { document: false })
for (const w of warnings) console.warn('warning:', w)

const page = await readFile(pagePath, 'utf8')
const BEGIN = '<!-- BEGIN GENERATED: `node scripts/tdr.mjs format examples/markdown-source.md --fragment` -->'
const END = '<!-- END GENERATED -->'

const start = page.indexOf(BEGIN)
const end = page.indexOf(END)
if (start === -1 || end === -1) {
  console.error('Could not find BEGIN/END GENERATED markers in markdown.html')
  process.exit(1)
}

const next =
  page.slice(0, start) +
  BEGIN + '\n' + fragment.trimEnd() + '\n' +
  page.slice(end)

await writeFile(pagePath, next)
console.log('Regenerated rendered-output block in examples/markdown.html')
