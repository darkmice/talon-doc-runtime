// HTML → TDR fragment pipeline + the .html path through convert().

import { describe, expect, it } from 'vitest'
import { htmlToTdrFragment } from '../src/html'
import { convert } from '../src/convert'

describe('htmlToTdrFragment — main-content extraction', () => {
  it('prefers <article> over <main> and <body>', () => {
    const html = `<body><main><p>main</p></main><article><p>article</p></article></body>`
    const { fragment } = htmlToTdrFragment(html)
    expect(fragment).toContain('article')
    expect(fragment).not.toContain('>main<')
  })

  it('falls back to <main> when no <article>', () => {
    const html = `<body><nav>nav</nav><main><p>kept</p></main></body>`
    const { fragment } = htmlToTdrFragment(html)
    expect(fragment).toContain('kept')
    expect(fragment).not.toContain('nav')
  })
})

describe('htmlToTdrFragment — semantic uplift', () => {
  it('promotes an admonition blockquote to <call>', () => {
    const { fragment } = htmlToTdrFragment(
      '<body><blockquote><p>[!WARNING] careful</p></blockquote></body>',
    )
    expect(fragment).toContain('<call k="warn">')
    expect(fragment).toContain('careful')
  })

  it('promotes a plain blockquote to <call k="note">', () => {
    const { fragment } = htmlToTdrFragment(
      '<body><blockquote><p>just quoted</p></blockquote></body>',
    )
    expect(fragment).toContain('<call k="note">')
  })

  it('promotes a 2-column key-ish table to <kv>', () => {
    const html = `<body><table><tr><th>Key</th><th>Value</th></tr>` +
      `<tr><td>owner</td><td>dark</td></tr></table></body>`
    const { fragment } = htmlToTdrFragment(html)
    expect(fragment).toContain('<kv>')
    expect(fragment).toContain('owner')
  })

  it('rewrites details/summary to <c>', () => {
    const html = `<body><details open><summary>More</summary><p>body</p></details></body>`
    const { fragment } = htmlToTdrFragment(html)
    expect(fragment).toContain('<c t="More" o="true">')
  })
})

describe('convert() — html pipeline', () => {
  it('wraps the extracted fragment into a full document', async () => {
    const { html } = await convert('<body><h1>Hi</h1><p>x</p></body>', { ext: 'html' })
    expect(html).toMatch(/^<!doctype html>/i)
    expect(html).toContain('<title>Hi</title>')
    expect(html).toContain('<main class="tdr-doc">')
  })

  it('returns a fragment when document=false', async () => {
    const { html } = await convert('<body><p>frag</p></body>', {
      ext: 'html',
      document: false,
    })
    expect(html).not.toContain('<!doctype')
    expect(html).toContain('frag')
  })
})
