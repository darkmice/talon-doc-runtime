// Plain-text → Markdown heuristic preprocessor.
//
// `.txt` has no markup, only layout cues: blank lines, indentation, bullet
// glyphs, bare URLs. We turn those into the *minimal* Markdown that the existing
// mdToTdr pipeline then upgrades — so txt inherits every L2 rule for free. The
// rules are deliberately conservative: ordinary prose must survive untouched.
//
// Pure (no unified import) so it is unit-testable on its own.

const BULLET_RE = /^\s*([-*•·]|\d+[.)])\s+/
const URL_RE = /\bhttps?:\/\/[^\s<>]+/g

/** Convert plain text into Markdown source. */
export function txtToMarkdown(text: string): string {
  // 1. Normalize newlines + strip a leading BOM.
  const normalized = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n')

  // 2. Segment into blocks on blank-line runs.
  const blocks = normalized.split(/\n[ \t]*\n/)

  const out = blocks
    .map((block) => transformBlock(block))
    .filter((b) => b.length > 0)

  return out.join('\n\n') + '\n'
}

function transformBlock(block: string): string {
  const lines = block.split('\n')
  const nonBlank = lines.filter((l) => l.trim().length > 0)
  if (nonBlank.length === 0) return ''

  // 3. Indented code block: every non-blank line starts with ≥4 spaces or a tab.
  //    Emitted verbatim (4-space indent = Markdown indented code). No autolink,
  //    no escaping — its content is final.
  if (nonBlank.every((l) => /^(?: {4}|\t)/.test(l))) {
    return lines.join('\n')
  }

  // 4. Bullet block: EVERY non-blank line is a bullet → a list. A mixed block
  //    (some bullets, some not) falls through to a paragraph.
  if (nonBlank.every((l) => BULLET_RE.test(l))) {
    return nonBlank.map((l) => normalizeBullet(l)).join('\n')
  }

  // 6. Paragraph (default): collapse soft-wrapped lines into one, then escape +
  //    autolink. Escaping runs on the joined text so only the true leading
  //    char of the paragraph is considered (rule 7).
  const joined = nonBlank.map((l) => l.trim()).join(' ')
  return autolink(escapeLeading(joined))
}

/** Normalize a bullet line's leading glyph to Markdown, then autolink its text. */
function normalizeBullet(line: string): string {
  const m = line.match(BULLET_RE)!
  const glyph = m[1]
  const rest = line.slice(m[0].length)
  const marker = /^\d/.test(glyph)
    ? `${glyph.replace(/[.)]$/, '')}. ` // N. / N) → "N. "
    : '- '                              // - / * / • / · → "- "
  return marker + autolink(rest)
}

/** Wrap bare http(s) URLs as <url> autolinks so remark-gfm renders <a>. */
function autolink(s: string): string {
  return s.replace(URL_RE, (u) => `<${u}>`)
}

/** Minimal escaping: only a block-leading `#`/`>` that would be misread. */
function escapeLeading(s: string): string {
  return s.replace(/^(\s*)([#>])/, '$1\\$2')
}
