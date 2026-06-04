// Pure, tree-agnostic semantic-uplift logic shared by the Markdown (mdast) and
// HTML (hast) pipelines. NOTHING here imports unified / mdast / hast — every
// export operates on plain strings or pre-extracted text so both pipelines can
// feed it without their tree shapes leaking in. This is the single source of
// truth for the L2 decisions; the two pipelines must never re-derive them.

// ─── Admonition recognition ─────────────────────────────────────────────────
//
//   > [!NOTE]                       (GitHub flavored)
//   > NOTE: …  /  > Warning: …      (English convention)
//   > 注意：…  /  > 警告：…          (Chinese convention)

export const ADMONITION_GFM = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][\s\n]*/i
export const ADMONITION_INLINE_EN = /^(NOTE|TIP|IMPORTANT|WARNING|CAUTION|DANGER|INFO)\s*[:：]\s*/i
export const ADMONITION_INLINE_ZH = /^(注意|警告|提示|重要|危险|信息|风险)\s*[:：]\s*/

export const KIND_MAP: Record<string, string> = {
  NOTE: 'note', TIP: 'ok', IMPORTANT: 'warn', WARNING: 'warn',
  CAUTION: 'bad', DANGER: 'bad', INFO: 'info',
  注意: 'note', 提示: 'note', 警告: 'warn', 重要: 'warn',
  风险: 'warn', 危险: 'bad', 信息: 'info',
}

/** Resolve a raw admonition marker (e.g. "NOTE", "警告") to a <call k> value. */
export function kindToCallK(rawKind: string): string {
  return KIND_MAP[rawKind] ?? KIND_MAP[rawKind.toUpperCase()] ?? 'info'
}

export interface AdmonitionMatch {
  /** Resolved <call k> kind, or null when the text carries no marker. */
  kind: string | null
  /** The exact marker prefix to strip from the body, or null. */
  prefix: string | null
  /** True when the whole first line was just the marker (drop it entirely). */
  markerOnly: boolean
}

/**
 * Inspect the leading text of a blockquote's first paragraph and decide whether
 * it is an admonition. Returns the resolved kind + the prefix to strip. The
 * caller owns the tree mutation; this function never touches a node.
 */
export function matchAdmonition(text: string): AdmonitionMatch {
  const gfm = text.match(ADMONITION_GFM)
  if (gfm) {
    return {
      kind: kindToCallK(gfm[1].toUpperCase()),
      prefix: gfm[0],
      markerOnly: text.trim() === gfm[0].trim(),
    }
  }
  const en = text.match(ADMONITION_INLINE_EN)
  if (en) {
    return { kind: kindToCallK(en[1].toUpperCase()), prefix: en[0], markerOnly: false }
  }
  const zh = text.match(ADMONITION_INLINE_ZH)
  if (zh) {
    return { kind: kindToCallK(zh[1]), prefix: zh[0], markerOnly: false }
  }
  return { kind: null, prefix: null, markerOnly: false }
}

// ─── Code-fence path metadata → <src> ───────────────────────────────────────
//
//   ```ts file:src/auth.ts:8-16   /   ```ts src/auth.ts:8-16   /   ```ts path=…

export const SRC_META_RE = /(?:^|\s)(?:file:|path=)?([^\s:]+\.[a-z]{1,8})(?::(\d+(?:-\d+)?))?/i

/** Extract a `path:lines` from a fence info string. null path = not a <src>. */
export function parseSrcMeta(meta: string): { path: string | null } {
  const m = meta.match(SRC_META_RE)
  if (!m) return { path: null }
  return { path: m[2] ? `${m[1]}:${m[2]}` : m[1] }
}

// ─── id generation ──────────────────────────────────────────────────────────

export function makeId(seed: string): string {
  return seed.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48)
}

// ─── escaping ───────────────────────────────────────────────────────────────

export const escapeText = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
export const escapeAttr = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// ─── HTML string helpers ────────────────────────────────────────────────────

/** Drop a single wrapping <p>…</p> so flat containers (<ck>) render inline. */
export function stripParagraphWrap(html: string): string {
  const m = html.match(/^<p>([\s\S]*)<\/p>$/)
  return m ? m[1] : html
}

/** First <h1> text content of a serialized fragment, used as a doc title. */
export function extractFirstHeading(fragment: string): string | null {
  const m = fragment.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (!m) return null
  return m[1].replace(/<[^>]+>/g, '').trim() || null
}

/**
 * Rewrite `<details><summary>T</summary>…</details>` → `<c t="T">…</c>` on a
 * serialized HTML string. Used by both the md pipeline (post-stringify) and the
 * html pipeline. Only the well-formed single-summary pattern is handled.
 */
export function detailsSummaryToC(html: string): string {
  return html
    .replace(
      /<details(\s[^>]*)?>\s*<summary>([\s\S]*?)<\/summary>/g,
      (_m: string, attrs: string | undefined, summary: string) => {
        const title = summary.replace(/<[^>]+>/g, '').trim()
        const open = attrs && /\bopen\b/i.test(attrs) ? ' o="true"' : ''
        return `<c t="${escapeAttr(title)}"${open}>`
      },
    )
    .replace(/<\/details>/g, '</c>')
}

// ─── Standard HTML tags (for the plain-render drop pass) ─────────────────────

export const STD_HTML_TAGS = new Set([
  'details', 'summary', 'a', 'b', 'i', 'em', 'strong', 'code', 'pre', 'br',
  'hr', 'img', 'ul', 'ol', 'li', 'p', 'div', 'span', 'blockquote', 'table',
  'thead', 'tbody', 'tr', 'th', 'td', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'kbd', 'sup', 'sub', 'mark', 'del', 'ins',
])

// ─── Two-column table → <kv> ────────────────────────────────────────────────
//
// A 2-column table reads as a key/value list ONLY under conservative guards, so
// data-shaped tables stay native <table>. Both pipelines pre-extract plain cell
// text and call tableToKv; ambiguity → null (caller keeps the <table>).

export const KV_MAX_ROWS = 8

/** Header cell-0 looks like a short key label, not a sentence. */
export function looksKeyish(text: string): boolean {
  const t = text.trim()
  if (!t || t.length > 24) return false
  if (/[.。?？!！,，:：;；]$/.test(t)) return false
  // The class itself already excludes ':' ',' '(' ')' etc.
  return /^[\w一-龥 .\-_/]{1,24}$/.test(t)
}

/** True when no cell carries rich content kv can't render (list/code/img/…). */
function cellsAreSimple(rows: string[][]): boolean {
  return rows.every((row) => row.every((cell) => !/[<\n]/.test(cell)))
}

/**
 * Build a `<kv>` block from a 2-column table, or null when any guard fails.
 * `header` is the header row's cell text (may be empty); `rows` are body rows.
 */
export function tableToKv(header: string[], rows: string[][]): string | null {
  if (header.length !== 2) return null
  if (rows.length === 0 || rows.length > KV_MAX_ROWS) return null
  if (!rows.every((r) => r.length === 2)) return null
  if (!looksKeyish(header[0] ?? '')) return null
  if (!cellsAreSimple(rows)) return null

  const body = rows
    .map(([k, v]) => `<row k="${escapeAttr(k.trim())}" v="${escapeAttr(v.trim())}"></row>`)
    .join('\n')
  return `<kv>\n${body}\n</kv>`
}

// ─── Section divider from an adjacent heading ───────────────────────────────

/** `---` immediately above a (non-H1) heading → a labeled <divider>. */
export function dividerFromHeading(headingText: string): string {
  return `<divider t="${escapeAttr(headingText.trim())}"></divider>`
}
