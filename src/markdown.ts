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
import type { Root, RootContent, Code, Blockquote, Paragraph, Html, List, ListItem, Nodes } from 'mdast'

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
    .use(promoteTaskLists, { warnings })
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

// Matches `[!KIND]` either as the whole first line of the paragraph (canonical
// GitHub form: a marker line + body lines underneath) OR as a prefix when the
// blockquote got serialised into one paragraph.
const ADMONITION_GFM = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][\s\n]*/i
const ADMONITION_INLINE_EN = /^(NOTE|TIP|IMPORTANT|WARNING|CAUTION|DANGER|INFO)\s*[:：]\s*/i
const ADMONITION_INLINE_ZH = /^(注意|警告|提示|重要|危险|信息|风险)\s*[:：]\s*/

const KIND_MAP: Record<string, string> = {
  NOTE: 'note', TIP: 'ok', IMPORTANT: 'warn', WARNING: 'warn',
  CAUTION: 'bad', DANGER: 'bad', INFO: 'info',
  注意: 'note', 提示: 'note', 警告: 'warn', 重要: 'warn',
  风险: 'warn', 危险: 'bad', 信息: 'info',
}

const promoteAdmonitions: Plugin<[{ warnings: string[] }], Root> = () => (tree) => {
  visit(tree, 'blockquote', (node: Blockquote, idx, parent) => {
    if (!parent || typeof idx !== 'number') return
    if (node.children.length === 0) return

    const first = node.children[0]
    if (first.type !== 'paragraph') return

    const firstText = mdastToString(first)

    // GFM-style: first line / first paragraph starts with `[!KIND]`.
    let m = firstText.match(ADMONITION_GFM)
    let kind: string | null = null
    let bodyStart = 0

    if (m) {
      kind = KIND_MAP[m[1].toUpperCase()] ?? 'info'
      // If the entire first paragraph is JUST the marker, drop it; otherwise
      // strip the marker prefix from the first paragraph's first text node.
      if (firstText.trim() === m[0].trim()) {
        bodyStart = 1
      } else {
        stripPrefixFromParagraph(first as Paragraph, m[0])
      }
    } else {
      // Inline-style: first paragraph starts with `KIND:` / `KIND：`.
      const enMatch = firstText.match(ADMONITION_INLINE_EN)
      const zhMatch = firstText.match(ADMONITION_INLINE_ZH)
      if (enMatch) {
        kind = KIND_MAP[enMatch[1].toUpperCase()] ?? 'info'
        // Drop the prefix from the first paragraph's first text node.
        stripPrefixFromParagraph(first as Paragraph, enMatch[0])
        bodyStart = 0
      } else if (zhMatch) {
        kind = KIND_MAP[zhMatch[1]] ?? 'info'
        stripPrefixFromParagraph(first as Paragraph, zhMatch[0])
        bodyStart = 0
      }
    }

    if (!kind) return

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

const escapeText = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escapeAttr = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

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

const SRC_META_RE = /(?:^|\s)(?:file:|path=)?([^\s:]+\.[a-z]{1,8})(?::(\d+(?:-\d+)?))?/i

const promoteSourceCodeBlocks: Plugin<[{ warnings: string[] }], Root> = () => (tree) => {
  visit(tree, 'code', (node: Code, idx, parent) => {
    if (!parent || typeof idx !== 'number') return
    const meta = node.meta ?? ''
    const m = meta.match(SRC_META_RE)
    if (!m) return

    const path = m[2] ? `${m[1]}:${m[2]}` : m[1]
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

function makeId(seed: string): string {
  return seed.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48)
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

function stripParagraphWrap(html: string): string {
  // If body is a single <p>…</p>, drop the wrapper so <ck> renders flat.
  const m = html.match(/^<p>([\s\S]*)<\/p>$/)
  return m ? m[1] : html
}

// ─── L2: <details><summary>…</summary>…</details> → <c t="…"> ─────────────
// remark parses raw HTML as `html` nodes. We post-process the eventual
// rehype stringification by recognising the simple inline pattern. Keeping
// it simple: only the well-formed single-line summary is rewritten.

const promoteDetailsSummary: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'html', (node: Html) => {
    node.value = node.value.replace(
      /<details(\s[^>]*)?>\s*<summary>([\s\S]*?)<\/summary>/g,
      (_m: string, attrs: string | undefined, summary: string) => {
        const title = summary.replace(/<[^>]+>/g, '').trim()
        const open = attrs && /\bopen\b/i.test(attrs) ? ' o="true"' : ''
        return `<c t="${escapeAttr(title)}"${open}>`
      },
    ).replace(/<\/details>/g, '</c>')
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

function extractFirstHeading(fragment: string): string | null {
  const m = fragment.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (!m) return null
  return m[1].replace(/<[^>]+>/g, '').trim() || null
}
