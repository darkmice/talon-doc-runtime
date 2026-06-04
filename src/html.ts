// HTML → TDR fragment.
//
// Parse arbitrary HTML, pull out the main content (article > main > body), and
// run the SHARED L2 uplift on the hast tree: admonition/plain blockquote →
// <call>, two-column table → <kv>, <pre> code block → <cb> (so it gets the
// runtime's framed/highlighted/copyable treatment, same as the Markdown path),
// details/summary → <c>. Other standard block elements (h1-h6 / p / ul / table
// / a / img …) pass through and get skinned by the archetype CSS. Path/line
// <src> uplift for HTML is intentionally out of v1 (no fence-info channel), so
// code blocks land as plain <cb>, never <src>.

import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import { toString as hastToString } from 'hast-util-to-string'

import type { Root, Element, RootContent, ElementContent } from 'hast'

import {
  matchAdmonition,
  tableToKv,
  detailsSummaryToC,
} from './uplift-shared'
import type { Frontmatter, TransformOptions } from './markdown'

export interface HtmlFragmentResult {
  fragment: string
  frontmatter: Frontmatter
  warnings: string[]
}

/** Parse HTML, extract main content, apply hast uplift, return a TDR fragment. */
export function htmlToTdrFragment(
  html: string,
  _opts: TransformOptions = {},
): HtmlFragmentResult {
  const warnings: string[] = []
  const frontmatter: Frontmatter = {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processor: any = unified().use(rehypeParse, { fragment: false })
  const tree = processor.parse(html) as Root

  const main = extractMain(tree)
  upliftBlockquotes(main)
  upliftTables(main)
  upliftCodeBlocks(main)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stringifier: any = unified().use(rehypeStringify, { allowDangerousHtml: true })
  let fragment = stringifier.stringify(main) as string

  // details/summary → <c> via the proven shared string-regex.
  fragment = detailsSummaryToC(fragment).trim()

  return { fragment, frontmatter, warnings }
}

// ─── Main-content extraction ────────────────────────────────────────────────
// First match in priority order: <article> → <main> → <body> → whole tree.
// Title is NOT derived here — wrapDocument falls back to extractFirstHeading
// over the serialized <h1>, so html relies on that single mechanism.

function extractMain(tree: Root): Root {
  for (const tag of ['article', 'main', 'body'] as const) {
    const found = findFirstElement(tree, tag)
    if (found) {
      return { type: 'root', children: found.children as RootContent[] }
    }
  }
  return tree
}

function findFirstElement(node: Root | Element, tag: string): Element | null {
  const kids = (node as { children?: ElementContent[] }).children ?? []
  for (const child of kids) {
    if (child.type === 'element') {
      if (child.tagName === tag) return child
      const deeper = findFirstElement(child, tag)
      if (deeper) return deeper
    }
  }
  return null
}

// ─── blockquote → <call> ────────────────────────────────────────────────────
// Rewrite in place: change tagName to "call" and set the k property; strip the
// admonition marker prefix from the first text node. A plain blockquote (no
// marker) becomes <call k="note">. Skip empty blockquotes.

function upliftBlockquotes(tree: Root): void {
  visit(tree, 'element', (node: Element) => {
    if (node.tagName !== 'blockquote') return
    const text = hastToString(node).trim()
    if (!text) return

    const m = matchAdmonition(text)
    const kind = m.kind ?? 'note'

    if (m.kind && m.prefix) {
      if (m.markerOnly) dropFirstParagraph(node)
      else stripPrefix(node, m.prefix)
    }

    node.tagName = 'call'
    node.properties = { ...(node.properties ?? {}), k: kind }
  })
}

/** Remove the first <p> child entirely (marker-only first paragraph). */
function dropFirstParagraph(node: Element): void {
  const idx = node.children.findIndex(
    (c) => c.type === 'element' && c.tagName === 'p',
  )
  if (idx >= 0) node.children.splice(idx, 1)
}

/** Strip a marker prefix from the first text node found in the subtree. */
function stripPrefix(node: Element, prefix: string): void {
  let done = false
  visit(node, 'text', (t: { value: string }) => {
    if (done) return
    const trimmed = t.value.replace(/^\s+/, '')
    if (trimmed.length === 0) return
    t.value = t.value.replace(prefix, '')
    done = true
  })
}

// ─── two-column table → <kv> ────────────────────────────────────────────────
// Extract plain cell text, hand it to the shared tableToKv guard. On a hit,
// replace the <table> element's tagName/children with a parsed <kv> subtree.

function upliftTables(tree: Root): void {
  visit(tree, 'element', (node: Element) => {
    if (node.tagName !== 'table') return
    const rows = collectRows(node)
    if (rows.length === 0) return
    const header = rows[0]
    const body = rows.slice(1)

    const kv = tableToKv(header, body)
    if (!kv) return // keep the native <table>

    // Parse the produced <kv> string back into hast and graft it in place.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub: any = unified().use(rehypeParse, { fragment: true }).parse(kv) as Root
    const kvEl = findFirstElement(sub, 'kv')
    if (!kvEl) return
    node.tagName = kvEl.tagName
    node.properties = kvEl.properties
    node.children = kvEl.children
  })
}

// ─── <pre> code block → <cb> ────────────────────────────────────────────────
// Wrap a top-level <pre> in a <cb> so the runtime applies the framed/highlight/
// copy treatment, matching the Markdown pipeline's promotePlainCodeBlocks. The
// language (from a child <code class="language-…">) is carried onto <cb l>. No
// path/line <src> uplift — HTML has no fence-info channel (v1).

function upliftCodeBlocks(tree: Root): void {
  visit(tree, 'element', (node: Element, _idx, parent) => {
    if (node.tagName !== 'pre') return
    // Skip the inner <pre> we just created (its parent is the new <cb>) so the
    // visitor doesn't double-wrap as it descends into rewritten children.
    if (parent && (parent as Element).tagName === 'cb') return

    const lang = codeLang(node)
    const inner: Element = {
      type: 'element',
      tagName: 'pre',
      properties: { ...(node.properties ?? {}) },
      children: node.children,
    }
    node.tagName = 'cb'
    node.properties = lang ? { l: lang } : {}
    node.children = [inner]
  })
}

/** Read `language-xxx` off a <pre>'s child <code>, if present. */
function codeLang(pre: Element): string {
  const code = pre.children.find(
    (c): c is Element => c.type === 'element' && c.tagName === 'code',
  )
  const cls = code?.properties?.className
  const list = Array.isArray(cls) ? cls.map(String) : typeof cls === 'string' ? [cls] : []
  for (const c of list) {
    const m = c.match(/^language-(.+)$/)
    if (m) return m[1]
  }
  return ''
}

/** Collect every row's cell text from a <table> (across thead/tbody). */
function collectRows(table: Element): string[][] {
  const rows: string[][] = []
  visit(table, 'element', (el: Element) => {
    if (el.tagName !== 'tr') return
    const cells: string[] = []
    for (const c of el.children) {
      if (c.type === 'element' && (c.tagName === 'td' || c.tagName === 'th')) {
        cells.push(hastToString(c).trim())
      }
    }
    if (cells.length) rows.push(cells)
  })
  return rows
}
