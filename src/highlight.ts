// Minimal in-runtime syntax highlighter — produces <span class="tdr-tok-*"> spans.
// Supports the languages that show up in Agent-authored docs: ts/js/tsx/jsx/sql/json/sh/yaml.
// Goal: visually meaningful, not a full lexer. Falls back to plain text on unknown langs.

type Rule = { re: RegExp; tok: string }

const COMMON = {
  comment_line: { re: /\/\/[^\n]*/y, tok: 'c' },
  comment_block: { re: /\/\*[\s\S]*?\*\//y, tok: 'c' },
  string_dq: { re: /"(?:[^"\\\n]|\\.)*"/y, tok: 's' },
  string_sq: { re: /'(?:[^'\\\n]|\\.)*'/y, tok: 's' },
  string_bt: { re: /`(?:[^`\\]|\\.)*`/y, tok: 's' },
  number: { re: /\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/y, tok: 'n' },
  punct: { re: /[{}()\[\];,.]/y, tok: 'p' },
  op: { re: /[+\-*/<>=!&|?:%~^]+/y, tok: 'o' },
  ws: { re: /\s+/y, tok: '' },
} satisfies Record<string, Rule>

const KW_TSJS = new Set([
  'const','let','var','function','return','if','else','for','while','do','switch','case','break','continue','default',
  'try','catch','finally','throw','new','class','extends','implements','interface','type','enum','export','import','from','as',
  'async','await','yield','this','super','typeof','instanceof','in','of','void','delete','null','undefined','true','false',
  'public','private','protected','readonly','static','abstract','override','declare','namespace','module','any','unknown','never','keyof'
])
const BUILTINS_TSJS = new Set(['console','Math','JSON','Object','Array','String','Number','Boolean','Date','Promise','Set','Map','Symbol','Error','RegExp'])

const KW_SQL = new Set([
  'select','from','where','and','or','not','in','is','null','as','join','left','right','inner','outer','full','on',
  'group','order','by','having','limit','offset','distinct','union','all','insert','into','values','update','set',
  'delete','create','table','index','drop','alter','add','column','primary','foreign','key','references','constraint',
  'check','default','unique','explain','analyze','case','when','then','else','end','exists','between'
])
const FN_SQL = new Set(['count','sum','avg','min','max','coalesce','nullif','cast','convert','now','date','time','timestamp'])

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function tok(s: string, cls: string): string {
  return cls ? `<span class="tdr-tok-${cls}">${escape(s)}</span>` : escape(s)
}

function highlightTsLike(src: string): string {
  let out = ''
  let i = 0
  const len = src.length
  const idRe = /[A-Za-z_$][A-Za-z0-9_$]*/y
  const tryRule = (rule: Rule): string | null => {
    rule.re.lastIndex = i
    const m = rule.re.exec(src)
    if (m && m.index === i) {
      i = rule.re.lastIndex
      return m[0]
    }
    return null
  }
  while (i < len) {
    const ch = src[i]
    // comments first
    if (ch === '/' && src[i + 1] === '/') { const m = tryRule(COMMON.comment_line)!; out += tok(m, 'c'); continue }
    if (ch === '/' && src[i + 1] === '*') { const m = tryRule(COMMON.comment_block)!; out += tok(m, 'c'); continue }
    if (ch === '"') { const m = tryRule(COMMON.string_dq); if (m !== null) { out += tok(m, 's'); continue } }
    if (ch === "'") { const m = tryRule(COMMON.string_sq); if (m !== null) { out += tok(m, 's'); continue } }
    if (ch === '`') { const m = tryRule(COMMON.string_bt); if (m !== null) { out += tok(m, 's'); continue } }
    // identifier / keyword / fn-call
    idRe.lastIndex = i
    const idm = idRe.exec(src)
    if (idm && idm.index === i) {
      const word = idm[0]
      i = idRe.lastIndex
      if (KW_TSJS.has(word)) { out += tok(word, 'k'); continue }
      if (BUILTINS_TSJS.has(word)) { out += tok(word, 'b'); continue }
      // type hint: PascalCase after `:` or `<` or `as`
      if (/^[A-Z]/.test(word) && /[:<,(]\s*$/.test(out.replace(/<[^>]*>/g, ''))) { out += tok(word, 't'); continue }
      // function call: identifier followed by (
      if (src[i] === '(') { out += tok(word, 'f'); continue }
      out += escape(word)
      continue
    }
    // number
    if (/[0-9]/.test(ch)) { const m = tryRule(COMMON.number); if (m !== null) { out += tok(m, 'n'); continue } }
    // punct / op
    const p = tryRule(COMMON.punct); if (p !== null) { out += tok(p, 'p'); continue }
    const o = tryRule(COMMON.op); if (o !== null) { out += tok(o, 'o'); continue }
    // fallback char (whitespace, etc)
    out += escape(ch)
    i++
  }
  return out
}

function highlightSql(src: string): string {
  let out = ''
  let i = 0
  const len = src.length
  const idRe = /[A-Za-z_][A-Za-z0-9_]*/y
  const tryRule = (rule: Rule): string | null => {
    rule.re.lastIndex = i
    const m = rule.re.exec(src)
    if (m && m.index === i) { i = rule.re.lastIndex; return m[0] }
    return null
  }
  while (i < len) {
    const ch = src[i]
    if (ch === '-' && src[i + 1] === '-') {
      const eol = src.indexOf('\n', i); const end = eol < 0 ? len : eol
      out += tok(src.slice(i, end), 'c'); i = end; continue
    }
    if (ch === '/' && src[i + 1] === '*') { const m = tryRule(COMMON.comment_block); if (m !== null) { out += tok(m, 'c'); continue } }
    if (ch === "'") { const m = tryRule(COMMON.string_sq); if (m !== null) { out += tok(m, 's'); continue } }
    if (ch === '"') { const m = tryRule(COMMON.string_dq); if (m !== null) { out += tok(m, 's'); continue } }
    idRe.lastIndex = i
    const idm = idRe.exec(src)
    if (idm && idm.index === i) {
      const word = idm[0]
      i = idRe.lastIndex
      const lw = word.toLowerCase()
      if (KW_SQL.has(lw)) { out += tok(word, 'k'); continue }
      if (FN_SQL.has(lw)) { out += tok(word, 'f'); continue }
      out += escape(word); continue
    }
    if (/[0-9]/.test(ch)) { const m = tryRule(COMMON.number); if (m !== null) { out += tok(m, 'n'); continue } }
    const p = tryRule(COMMON.punct); if (p !== null) { out += tok(p, 'p'); continue }
    const o = tryRule(COMMON.op); if (o !== null) { out += tok(o, 'o'); continue }
    out += escape(ch); i++
  }
  return out
}

function highlightJson(src: string): string {
  // Strings: keys (followed by `:`) and values; numbers; booleans/null
  let out = ''
  let i = 0
  const len = src.length
  while (i < len) {
    const ch = src[i]
    if (ch === '"') {
      const start = i
      i++
      while (i < len && src[i] !== '"') {
        if (src[i] === '\\' && i + 1 < len) i += 2
        else i++
      }
      i++ // closing "
      const literal = src.slice(start, i)
      // detect key vs value
      let j = i
      while (j < len && /\s/.test(src[j])) j++
      const isKey = src[j] === ':'
      out += tok(literal, isKey ? 'f' : 's')
      continue
    }
    if (/[0-9-]/.test(ch) && /[\d-]/.test(ch)) {
      const m = /-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/y
      m.lastIndex = i
      const mm = m.exec(src)
      if (mm && mm.index === i) { out += tok(mm[0], 'n'); i = m.lastIndex; continue }
    }
    if (src.startsWith('true', i)) { out += tok('true', 'k'); i += 4; continue }
    if (src.startsWith('false', i)) { out += tok('false', 'k'); i += 5; continue }
    if (src.startsWith('null', i)) { out += tok('null', 'k'); i += 4; continue }
    if ('{}[],'.includes(ch)) { out += tok(ch, 'p'); i++; continue }
    if (ch === ':') { out += tok(ch, 'o'); i++; continue }
    out += escape(ch); i++
  }
  return out
}

export function highlightCode(text: string, lang: string): string {
  const l = (lang || '').toLowerCase()
  if (['ts','typescript','tsx','js','javascript','jsx','mjs'].includes(l)) return highlightTsLike(text)
  if (['sql','postgresql','psql','mysql'].includes(l)) return highlightSql(text)
  if (['json','jsonc'].includes(l)) return highlightJson(text)
  return escape(text)
}
