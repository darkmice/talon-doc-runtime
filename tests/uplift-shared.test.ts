// Pure shared-uplift helpers.

import { describe, expect, it } from 'vitest'
import {
  matchAdmonition,
  parseSrcMeta,
  makeId,
  stripParagraphWrap,
  detailsSummaryToC,
  kindToCallK,
  looksKeyish,
  tableToKv,
  dividerFromHeading,
} from '../src/uplift-shared'

describe('matchAdmonition', () => {
  it('matches GFM markers and resolves the kind', () => {
    expect(matchAdmonition('[!NOTE] x').kind).toBe('note')
    expect(matchAdmonition('[!WARNING]').kind).toBe('warn')
    expect(matchAdmonition('[!CAUTION]').kind).toBe('bad')
  })

  it('flags a marker-only first line', () => {
    expect(matchAdmonition('[!NOTE]').markerOnly).toBe(true)
    expect(matchAdmonition('[!NOTE] body').markerOnly).toBe(false)
  })

  it('matches English and Chinese inline conventions', () => {
    expect(matchAdmonition('NOTE: hi').kind).toBe('note')
    expect(matchAdmonition('警告：小心').kind).toBe('warn')
  })

  it('returns kind=null for plain text', () => {
    expect(matchAdmonition('just a quote').kind).toBeNull()
  })
})

describe('parseSrcMeta', () => {
  it('parses file:/path=/bare conventions', () => {
    expect(parseSrcMeta('file:src/a.ts:8-16').path).toBe('src/a.ts:8-16')
    expect(parseSrcMeta('path=src/b.ts:5').path).toBe('src/b.ts:5')
    expect(parseSrcMeta('src/c.ts').path).toBe('src/c.ts')
  })

  it('returns null path when nothing path-like is present', () => {
    expect(parseSrcMeta('').path).toBeNull()
  })
})

describe('makeId / kindToCallK', () => {
  it('slugs a seed', () => {
    expect(makeId('src/Payment/idempotency.ts:42')).toBe('src-payment-idempotency-ts-42')
  })
  it('maps kinds with an info fallback', () => {
    expect(kindToCallK('NOTE')).toBe('note')
    expect(kindToCallK('注意')).toBe('note')
    expect(kindToCallK('whatever')).toBe('info')
  })
})

describe('stripParagraphWrap / detailsSummaryToC', () => {
  it('drops a single wrapping <p>', () => {
    expect(stripParagraphWrap('<p>x</p>')).toBe('x')
    expect(stripParagraphWrap('<div>x</div>')).toBe('<div>x</div>')
  })
  it('rewrites details/summary with and without open', () => {
    expect(detailsSummaryToC('<details><summary>T</summary>body</details>'))
      .toBe('<c t="T">body</c>')
    expect(detailsSummaryToC('<details open><summary>T</summary>b</details>'))
      .toContain('<c t="T" o="true">')
  })
})

describe('looksKeyish', () => {
  it('accepts short key-like labels', () => {
    expect(looksKeyish('status')).toBe(true)
    expect(looksKeyish('状态')).toBe(true)
    expect(looksKeyish('API_KEY')).toBe(true)
  })
  it('rejects sentences and terminal punctuation', () => {
    expect(looksKeyish('Done.')).toBe(false)
    expect(looksKeyish('this is a long descriptive header label here')).toBe(false)
    expect(looksKeyish('就绪？')).toBe(false)
  })
})

describe('tableToKv', () => {
  it('builds <kv> for a small key-ish 2-col table', () => {
    const out = tableToKv(['Key', 'Value'], [['owner', 'dark'], ['env', 'prod']])
    expect(out).toContain('<kv>')
    expect(out).toContain('<row k="owner" v="dark">')
  })
  it('returns null for 3 columns / >8 rows / sentence header', () => {
    expect(tableToKv(['a', 'b', 'c'], [['1', '2', '3']])).toBeNull()
    const many = Array.from({ length: 9 }, (_, i) => [`k${i}`, `v${i}`])
    expect(tableToKv(['Key', 'Value'], many)).toBeNull()
    expect(tableToKv(['A whole sentence here.', 'v'], [['a', 'b']])).toBeNull()
  })
})

describe('dividerFromHeading', () => {
  it('emits a labeled divider', () => {
    expect(dividerFromHeading('Part Two')).toBe('<divider t="Part Two"></divider>')
  })
})
