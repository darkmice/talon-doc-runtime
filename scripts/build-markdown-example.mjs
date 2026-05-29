#!/usr/bin/env node
// Regenerate the two rendered blocks in examples/markdown.html from
// examples/markdown-source.md, so the side-by-side demo can't drift.
//
//   node scripts/build-markdown-example.mjs
//
// Two blocks are generated:
//   TDR    — examples/markdown-source.md run through `mdToTdr` (our L2 uplift).
//   PLAIN  — the SAME markdown rendered by a vanilla remark→rehype pipeline,
//            with NO TDR uplift, so the demo can contrast "naked markdown"
//            against the structured TDR output.
// The escaped source pane on the left is maintained by hand.

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcPath = join(root, 'examples', 'markdown-source.md')
const pagePath = join(root, 'examples', 'markdown.html')

const markdown = await readFile(srcPath, 'utf8')

// ── TDR uplift (our pipeline) ────────────────────────────────────────────
const { mdToTdr } = await import(join(root, 'dist', 'markdown.mjs'))
const { html: tdrHtml, warnings } = await mdToTdr(markdown, { document: false })
for (const w of warnings) console.warn('warning:', w)

// ── Plain markdown render (vanilla remark, no uplift) ─────────────────────
// remark-frontmatter recognises the --- block; without an extractor plugin it
// is simply dropped from the output.
//
// IMPORTANT: we do NOT pass raw HTML through here. Two reasons:
//   1. The TDR runtime auto-mounts on document.body and would *enhance* any raw
//      <d>/<src> tags in this pane — turning the "naked markdown" preview into a
//      second TDR render, defeating the contrast.
//   2. A real markdown viewer (GitHub) sanitises unknown tags anyway.
// So `escapeRawHtml` rewrites each raw-HTML mdast node into visible escaped
// text, which honestly shows "this tag produced nothing structural here".
// Standard HTML tags a real markdown viewer (GitHub) renders natively — e.g.
// <details> is a built-in collapsible. Anything NOT on this list is a TDR custom
// tag. GitHub's sanitiser DROPS unknown tags entirely (they render to nothing),
// so the "naked markdown" pane must do the same: the whole <d>…</d> decision
// block simply vanishes — which is exactly the point of the contrast. (It also
// stops the TDR runtime, which auto-mounts on document.body, from enhancing
// stray custom tags in this pane.)
const STD_TAGS = new Set([
  'details', 'summary', 'a', 'b', 'i', 'em', 'strong', 'code', 'pre', 'br',
  'hr', 'img', 'ul', 'ol', 'li', 'p', 'div', 'span', 'blockquote', 'table',
  'thead', 'tbody', 'tr', 'th', 'td', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'kbd', 'sup', 'sub', 'mark', 'del', 'ins',
])

const plainFile = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkFrontmatter, ['yaml'])
  .use(dropCustomTags)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true })
  .process(markdown)
const plainHtml = String(plainFile)

function dropCustomTags() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return
      node.children = node.children.filter((child) => {
        if (child.type === 'html') {
          const tag = child.value.match(/^<\/?\s*([a-zA-Z][\w-]*)/)?.[1]?.toLowerCase()
          // Drop any raw-HTML node that opens/closes a non-standard (TDR) tag —
          // the entire block (incl. its <because>/<so> text, which lives in the
          // same multiline html node) disappears, mirroring GitHub.
          if (tag && !STD_TAGS.has(tag)) return false
        }
        walk(child)
        return true
      })
    }
    walk(tree)
  }
}

// ── Splice both blocks back into the page ────────────────────────────────
let page = await readFile(pagePath, 'utf8')

page = replaceBlock(
  page,
  '<!-- BEGIN PLAIN: vanilla remark render of markdown-source.md (no TDR uplift) -->',
  '<!-- END PLAIN -->',
  plainHtml,
)
page = replaceBlock(
  page,
  '<!-- BEGIN GENERATED: `node scripts/tdr.mjs format examples/markdown-source.md --fragment` -->',
  '<!-- END GENERATED -->',
  tdrHtml,
)

await writeFile(pagePath, page)
console.log('Regenerated PLAIN + TDR blocks in examples/markdown.html')

function replaceBlock(page, begin, end, body) {
  const start = page.indexOf(begin)
  const stop = page.indexOf(end)
  if (start === -1 || stop === -1) {
    console.error(`Could not find markers:\n  ${begin}\n  ${end}`)
    process.exit(1)
  }
  return page.slice(0, start) + begin + '\n' + body.trimEnd() + '\n' + page.slice(stop)
}
