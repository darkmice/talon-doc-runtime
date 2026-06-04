// Unified file → TDR converter.
//
// One entry, `convert(content, { ext })`, routes by source format to three
// pipelines that share the L2 uplift rules and a single document-wrapping tail:
//
//   md / markdown → mdToTdr                       (existing)
//   txt           → txtToMarkdown → mdToTdr       (inherits every md rule)
//   html / htm    → htmlToTdrFragment → wrap       (rehype + shared hast uplift)
//
// Callers (CLI, browser bundle) treat all formats uniformly via TransformResult.

import { mdToTdr, wrapDocument } from './markdown'
import type { Frontmatter, TransformOptions, TransformResult } from './markdown'
import { txtToMarkdown } from './txt'
import { htmlToTdrFragment } from './html'

export type SourceExt = 'md' | 'markdown' | 'txt' | 'html' | 'htm'

export interface ConvertOptions extends TransformOptions {
  /** Explicit format override; else inferred from `filename`. */
  ext?: SourceExt | string
  /** Source filename, used to infer ext when `ext` is omitted. */
  filename?: string
}

const KNOWN: ReadonlySet<string> = new Set(['md', 'markdown', 'txt', 'html', 'htm'])

/** Lowercased extension (no dot) from a filename, or '' if none. */
function extFromFilename(filename?: string): string {
  if (!filename) return ''
  const m = filename.toLowerCase().match(/\.([a-z0-9]+)$/)
  return m ? m[1] : ''
}

/** Convert any supported file content into a TDR document (or fragment). */
export async function convert(
  content: string,
  opts: ConvertOptions = {},
): Promise<TransformResult> {
  const resolved = (opts.ext || extFromFilename(opts.filename) || 'md').toLowerCase()

  const warnings: string[] = []
  let ext = resolved
  if (!KNOWN.has(ext)) {
    warnings.push(`unknown extension '${resolved}', treated as markdown`)
    ext = 'md'
  }

  switch (ext) {
    case 'md':
    case 'markdown':
      return withWarnings(await mdToTdr(content, opts), warnings)

    case 'txt':
      return withWarnings(await mdToTdr(txtToMarkdown(content), opts), warnings)

    case 'html':
    case 'htm':
      return convertHtml(content, opts, warnings)

    default:
      // Unreachable — unknown exts were remapped to 'md' above.
      return withWarnings(await mdToTdr(content, opts), warnings)
  }
}

async function convertHtml(
  html: string,
  opts: ConvertOptions,
  warnings: string[],
): Promise<TransformResult> {
  const { fragment: rawFragment, frontmatter, warnings: htmlWarnings } =
    htmlToTdrFragment(html, opts)

  let fragment = rawFragment
  if (opts.enrich) {
    fragment = await opts.enrich(fragment, { frontmatter, markdown: html })
  }

  const html_ =
    opts.document !== false ? wrapDocument(fragment, frontmatter, opts) : fragment

  return {
    html: html_,
    frontmatter,
    warnings: [...warnings, ...htmlWarnings],
  }
}

function withWarnings(result: TransformResult, extra: string[]): TransformResult {
  if (extra.length === 0) return result
  return { ...result, warnings: [...extra, ...result.warnings] }
}

export type { Frontmatter }
