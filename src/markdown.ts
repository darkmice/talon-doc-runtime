// TDR-flavored Markdown → TDR HTML.
//
// Three layers of conversion:
//
//   L1 Atomic mapping     remark → rehype 默认管道。# 标题 / 列表 / 强调 / 代码块
//                         / 链接 / 表格直接映射到 TDR 主题接管的原生 HTML。
//
//   L2 Semantic uplift    在 mdast 阶段识别"人写 Markdown 时已经形成的约定俗成"
//                         转成 TDR 组件：
//                           · GFM admonition  `> [!NOTE]`   → <call k="note">
//                           · 中文 / 英文约定  `> NOTE:` `> 注意：` → <call>
//                           · Fenced 代码块的 info 携带 `file:path:Ls-Le` 路径
//                             → <src p l>
//                           · `<details><summary>…</summary>…</details>` → <c>
//                           · GFM task list                  → <chk> / <ck>
//
//   L3 Frontmatter        --- archetype / title / theme / lang ---  控制根
//                         元素 attribute；--enrich 时透传给可选的语义增强器。
//
// The transformer is Node-only. It is NOT bundled into the browser IIFE.

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import { toString as mdastToString } from 'mdast-util-to-string'
import { parse as parseYaml } from 'yaml'

import type { Plugin } from 'unified'
import type {
  Root, RootContent, Code, Blockquote, Paragraph, Html, List, ListItem, Nodes,
  Table, TableRow, TableCell, Heading, ThematicBreak,
} from 'mdast'

import {
  matchAdmonition,
  parseSrcMeta,
  makeId,
  escapeText,
  escapeAttr,
  stripParagraphWrap,
  extractFirstHeading,
  detailsSummaryToC,
  STD_HTML_TAGS,
  tableToKv,
  dividerFromHeading,
} from './uplift-shared'

// Re-exported so CLI / browser callers reach the unified dispatcher and the
// document wrapper through the same module the build entry already bundles.
// markdown.ts ↔ convert.ts is an intentional, function-only ESM cycle.
export { convert } from './convert'
export type { ConvertOptions, SourceExt } from './convert'
export { wrapDocument, extractFirstHeading }

// ─── Public API ─────────────────────────────────────────────────────────────

export type Archetype = 'business-document' | 'editorial-longform' | (string & {})
export type Theme = 'light' | 'dark' | 'auto'

export interface Frontmatter {
  archetype?: Archetype
  title?: string
  theme?: Theme
  lang?: string
  // Free-form, surfaced to enrichers and HTML <meta>.
  [k: string]: unknown
}

export interface TransformOptions {
  /** Wrap the produced fragment in a complete <html>…</html>. Default true. */
  document?: boolean
  /** Default archetype if frontmatter doesn't set one. */
  defaultArchetype?: Archetype
  /** Default lang attribute. */
  defaultLang?: string
  /**
   * Optional async semantic uplift step. Called after the deterministic
   * transformation with the fragment HTML; should return enriched HTML.
   * Typical implementation: forward to Claude / GPT to rewrite paragraphs
   * into <d> / <myth> / <evidence> etc. where appropriate.
   */
  enrich?: (
    fragmentHtml: string,
    context: { frontmatter: Frontmatter; markdown: string }
  ) => Promise<string>
  /**
   * URL or path of the runtime script for standalone documents.
   * Default: relative '../dist/talon-doc-runtime.iife.js' (works from the repo).
   * For npm consumers, pass 'https://unpkg.com/@talon-ui/doc-runtime/dist/talon-doc-runtime.iife.js'.
   */
  runtimeScript?: string
}

export interface TransformResult {
  html: string
  frontmatter: Frontmatter
  warnings: string[]
}

/** TDR-flavored Markdown → TDR HTML. Top-level entry. */
export async function mdToTdr(
  markdown: string,
  opts: TransformOptions = {}
): Promise<TransformResult> {
  const warnings: string[] = []
  const frontmatter: Frontmatter = {}

  // Build the pipeline. unified()'s chained generic inference doesn't
  // converge across our custom plugins; the runtime semantics are correct,
  // so we type the proc as `any` and rely on each plugin's own typing.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pipeline: any = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter, ['yaml'])
    .use(extractFrontmatter, { sink: frontmatter, warnings })
    .use(promoteAdmonitions, { warnings })
    .use(promoteSourceCodeBlocks, { warnings })
    .use(promotePlainCodeBlocks)
    .use(promoteTaskLists, { warnings })
    .use(promoteTables)
    .use(promoteHeadingDividers)
    .use(promoteDetailsSummary)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })

  const file = await pipeline.process(markdown)
  let fragment = String(file)

  if (opts.enrich) {
    fragment = await opts.enrich(fragment, { frontmatter, markdown })
  }

  const wantDocument = opts.document !== false
  const html = wantDocument
    ? wrapDocument(fragment, frontmatter, opts)
    : fragment

  return { html, frontmatter, warnings }
}

// ─── L3: frontmatter extraction ─────────────────────────────────────────────

const extractFrontmatter: Plugin<[{ sink: Frontmatter; warnings: string[] }], Root> = ({
  sink,
  warnings,
}) => (tree) => {
  // remark-frontmatter leaves the YAML node in the tree; we strip it and
  // parse its value into `sink`.
  let consumed = false
  tree.children = tree.children.filter((node) => {
    if (consumed || node.type !== 'yaml') return true
    consumed = true
    try {
      const value = parseYaml((node as { value: string }).value)
      if (value && typeof value === 'object') Object.assign(sink, value)
    } catch (e) {
      warnings.push(`Failed to parse frontmatter YAML: ${(e as Error).message}`)
    }
    return false
  })
}

// ─── L2: GFM admonitions + textual conventions → <call> ────────────────────
// Recognised forms (whichever appears first wins):
//
//   > [!NOTE]                       (GitHub flavored)
//   > Some body text.
//
//   > NOTE: Some body.              (single-paragraph English convention)
//   > Warning: Watch out.
//
//   > 注意：内容。                   (中文 convention)
//   > 警告：…
//
// Anything else is left as a normal <blockquote>.

// A blockquote that opens with an admonition marker becomes a kind-specific
// <call>; a plain blockquote (no marker) becomes a neutral <call k="note">.
// Both branches live in one visitor so a blockquote is processed exactly once.
// Skipped: blockquotes with no paragraph/text body (e.g. nested-only) — those
// stay a native <blockquote>.

const promoteAdmonitions: Plugin<[{ warnings: string[] }], Root> = () => (tree) => {
  visit(tree, 'blockquote', (node: Blockquote, idx, parent) => {
    if (!parent || typeof idx !== 'number') return
    if (node.children.length === 0) return

    const first = node.children[0]
    if (first.type !== 'paragraph') return

    const firstText = mdastToString(first)
    const m = matchAdmonition(firstText)

    let kind: string
    let bodyStart = 0

    if (m.kind) {
      kind = m.kind
      if (m.markerOnly) {
        bodyStart = 1 // first paragraph was just the marker — drop it
      } else if (m.prefix) {
        stripPrefixFromParagraph(first as Paragraph, m.prefix)
      }
    } else {
      // Plain blockquote, no marker → neutral note callout.
      kind = 'note'
    }

    // Render an HTML <call> with the remaining paragraphs as inner HTML.
    // We can't recursively re-emit mdast inside a custom HTML node without
    // re-running rehype on a sub-tree, so we forward the bodies as a single
    // <call> HTML node and let rehype output them verbatim.
    const bodyNodes = node.children.slice(bodyStart)
    const bodyHtml = bodyNodes.map(mdastInlineToHtml).join('\n')
    const replacement: Html = {
      type: 'html',
      value: `<call k="${kind}">${bodyHtml}</call>`,
    }
    parent.children.splice(idx, 1, replacement)
  })
}

function stripPrefixFromParagraph(p: Paragraph, prefix: string) {
  const first = p.children[0]
  if (first?.type === 'text') {
    first.value = first.value.replace(prefix, '')
  }
}

// Minimal mdast-paragraph → HTML serialiser. Not a full mdast→hast — covers
// the subset we actually emit inside admonitions (paragraphs, lists, code).
function mdastInlineToHtml(node: Nodes): string {
  switch (node.type) {
    case 'paragraph':
      return `<p>${inlineChildrenToHtml(node)}</p>`
    case 'code': {
      const lang = (node as Code).lang
      const langAttr = lang ? ` class="language-${escapeAttr(lang)}"` : ''
      return `<pre><code${langAttr}>${escapeText((node as Code).value)}</code></pre>`
    }
    default:
      // Fall back to plain text — admonitions with exotic block content (tables,
      // nested blockquotes) are rare; if they show up we surface as <p>.
      return `<p>${escapeText(mdastToString(node))}</p>`
  }
}

function inlineChildrenToHtml(p: Paragraph): string {
  return p.children
    .map((c): string => {
      switch (c.type) {
        case 'text':     return escapeText(c.value)
        case 'strong':   return `<strong>${escapeText(mdastToString(c))}</strong>`
        case 'emphasis': return `<em>${escapeText(mdastToString(c))}</em>`
        case 'inlineCode': return `<code>${escapeText(c.value)}</code>`
        case 'link':     return `<a href="${escapeAttr(c.url)}">${escapeText(mdastToString(c))}</a>`
        case 'break':    return '<br>'
        default:         return escapeText(mdastToString(c))
      }
    })
    .join('')
}

// ─── L2: code fences with `file:...` info → <src> ──────────────────────────
//
// Conventions accepted on the fence info string:
//
//   ```ts file:src/auth.ts:8-16
//   ```ts src/auth.ts:8-16
//   ```ts path=src/auth.ts:8-16
//
// All three become:
//   <src p="src/auth.ts:8-16" l="ts">
//     <pre><code>...</code></pre>
//   </src>

const promoteSourceCodeBlocks: Plugin<[{ warnings: string[] }], Root> = () => (tree) => {
  visit(tree, 'code', (node: Code, idx, parent) => {
    if (!parent || typeof idx !== 'number') return
    const { path } = parseSrcMeta(node.meta ?? '')
    if (!path) return

    const lang = node.lang ?? ''
    const codeHtml = `<pre><code class="language-${escapeAttr(lang)}">${escapeText(node.value)}</code></pre>`
    const id = makeId(path)
    const replacement: Html = {
      type: 'html',
      value: `<src id="${id}" p="${escapeAttr(path)}"${lang ? ` l="${escapeAttr(lang)}"` : ''}>${codeHtml}</src>`,
    }
    parent.children.splice(idx, 1, replacement)
  })
}

// ─── L2: plain code fences → <cb> ──────────────────────────────────────────
//
// A fence with only a language (no file:path — those already became <src>) is
// wrapped in <cb> so the runtime gives it the full code-block treatment:
// syntax highlighting + copy button + themed frame. Without this it would stay
// a bare <pre><code>, which the TDR theme renders as unstyled monospace text.
//
// Runs AFTER promoteSourceCodeBlocks — by then <src> fences are already html
// nodes, so the only `code` nodes left here are plain ones.
const promotePlainCodeBlocks: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'code', (node: Code, idx, parent) => {
    if (!parent || typeof idx !== 'number') return
    const lang = node.lang ?? ''
    const langClass = lang ? ` class="language-${escapeAttr(lang)}"` : ''
    const codeHtml = `<pre><code${langClass}>${escapeText(node.value)}</code></pre>`
    const replacement: Html = {
      type: 'html',
      value: `<cb${lang ? ` l="${escapeAttr(lang)}"` : ''}>${codeHtml}</cb>`,
    }
    parent.children.splice(idx, 1, replacement)
  })
}

// ─── L2: GFM task lists → <chk>/<ck> ───────────────────────────────────────

const promoteTaskLists: Plugin<[{ warnings: string[] }], Root> = () => (tree) => {
  visit(tree, 'list', (node: List, idx, parent) => {
    if (!parent || typeof idx !== 'number') return
    // A list is a task list when every direct item has `checked` set.
    const items = node.children.filter((c): c is ListItem => c.type === 'listItem')
    if (items.length === 0) return
    if (!items.every((it) => typeof it.checked === 'boolean')) return

    const itemsHtml = items
      .map((it: ListItem) => {
        const body = it.children.map((c) => mdastInlineToHtml(c as Nodes)).join('')
        const k = it.checked ? ' k="true"' : ''
        return `<ck${k}>${stripParagraphWrap(body)}</ck>`
      })
      .join('\n')

    const replacement: Html = {
      type: 'html',
      value: `<chk>\n${itemsHtml}\n</chk>`,
    }
    parent.children.splice(idx, 1, replacement)
  })
}

// ─── L2: two-column GFM table → <kv> ───────────────────────────────────────
// A 2-column table reads as a key/value list under the conservative guards in
// tableToKv (≤ KV_MAX_ROWS rows, key-ish header, simple cells). Anything else
// stays a native <table> — the archetype CSS styles those. Runs BEFORE
// remark-rehype so we can replace the mdast `table` node wholesale.

const promoteTables: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'table', (node: Table, idx, parent) => {
    if (!parent || typeof idx !== 'number') return
    // mdast: a Table's children ARE TableRow nodes; the first is the header.
    const allRows = node.children as TableRow[]
    if (allRows.length === 0) return
    const cellText = (cell: TableCell) => mdastToString(cell).trim()
    const header = (allRows[0]?.children ?? []).map(cellText)
    const bodyRows = allRows.slice(1).map((r) => r.children.map(cellText))

    const kv = tableToKv(header, bodyRows)
    if (!kv) return // keep the native <table>
    parent.children.splice(idx, 1, { type: 'html', value: kv } as Html)
  })
}

// ─── L2: `---` immediately above a heading → labeled <divider> ─────────────
// A thematicBreak directly followed by a heading is a visual section separator
// whose label is that heading. H1 is exempt (it feeds the document title) and
// a standalone `---` stays a native <hr>. Frontmatter `---` is already consumed
// by extractFrontmatter, so it is never seen here.

const promoteHeadingDividers: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'thematicBreak', (_node: ThematicBreak, idx, parent) => {
    if (!parent || typeof idx !== 'number') return
    const next = parent.children[idx + 1]
    if (!next || next.type !== 'heading') return
    const heading = next as Heading
    if (heading.depth === 1) return // never consume the title H1

    const label = mdastToString(heading)
    // Replace BOTH the thematicBreak and the heading with one <divider>.
    parent.children.splice(idx, 2, { type: 'html', value: dividerFromHeading(label) } as Html)
  })
}

// ─── L2: <details><summary>…</summary>…</details> → <c t="…"> ─────────────
// remark parses raw HTML as `html` nodes. We post-process the eventual
// rehype stringification by recognising the simple inline pattern. Keeping
// it simple: only the well-formed single-line summary is rewritten.

const promoteDetailsSummary: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'html', (node: Html) => {
    node.value = detailsSummaryToC(node.value)
  })
}

// ─── Document wrapping ─────────────────────────────────────────────────────

function wrapDocument(
  fragment: string,
  fm: Frontmatter,
  opts: TransformOptions,
): string {
  const archetype = fm.archetype ?? opts.defaultArchetype ?? 'business-document'
  const lang = fm.lang ?? opts.defaultLang ?? 'zh-CN'
  const theme = fm.theme
  const title = fm.title ?? extractFirstHeading(fragment) ?? 'Untitled'
  const runtimeScript =
    opts.runtimeScript ??
    'https://unpkg.com/@talon-ui/doc-runtime/dist/talon-doc-runtime.iife.js'

  const themeAttr = theme ? ` data-tdr-theme="${escapeAttr(theme)}"` : ''
  // Note: fragment is intentionally NOT indented — adding padding to every
  // line would corrupt code inside <pre>/<code> blocks where whitespace is
  // significant.
  return `<!doctype html>
<html lang="${escapeAttr(lang)}" data-archetype="${escapeAttr(archetype)}"${themeAttr}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeText(title)}</title>
  </head>
  <body>
    <main class="tdr-doc">
${fragment}
    </main>
    <script src="${escapeAttr(runtimeScript)}"></script>
  </body>
</html>
`
}

// ─── Plain Markdown render (NO TDR uplift) ─────────────────────────────────
//
// A vanilla remark→rehype pass with none of the L2 plugins, used to show what
// the SAME markdown looks like in a generic viewer (GitHub README): admonitions
// stay blockquotes, task lists stay bare checkboxes, code fences stay <pre>.
//
// Unknown TDR custom tags (<d>/<because>/<src>/<call>…) are DROPPED, mirroring
// GitHub's HTML sanitiser — so a decision block simply doesn't appear. Standard
// HTML (e.g. <details>) is left native. Frontmatter is stripped, not rendered.

// Standard tags a real markdown viewer renders natively (STD_HTML_TAGS, from
// uplift-shared). Anything else is a TDR custom tag and gets dropped.
const dropCustomTags: Plugin<[], Root> = () => (tree) => {
  const walk = (node: { children?: RootContent[] }) => {
    if (!node.children) return
    node.children = node.children.filter((child) => {
      if (child.type === 'html') {
        const tag = (child as Html).value
          .match(/^<\/?\s*([a-zA-Z][\w-]*)/)?.[1]
          ?.toLowerCase()
        if (tag && !STD_HTML_TAGS.has(tag)) return false
      }
      walk(child as { children?: RootContent[] })
      return true
    })
  }
  walk(tree)
}

/** SAME markdown, rendered by a generic viewer (no TDR uplift). */
export async function mdToPlainHtml(markdown: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pipeline: any = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter, ['yaml'])
    .use(stripFrontmatterNode)
    .use(dropCustomTags)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
  const file = await pipeline.process(markdown)
  return String(file)
}

// Drop the frontmatter yaml node (without parsing it into anything) so the
// plain render doesn't print the --- block as a paragraph.
const stripFrontmatterNode: Plugin<[], Root> = () => (tree) => {
  tree.children = tree.children.filter((n) => n.type !== 'yaml')
}
