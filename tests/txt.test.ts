// Plain-text heuristic preprocessor + the .txt path through convert().

import { describe, expect, it } from 'vitest'
import { txtToMarkdown } from '../src/txt'
import { convert } from '../src/convert'

describe('txtToMarkdown', () => {
  it('separates blank-line blocks into paragraphs', () => {
    const md = txtToMarkdown('First block.\n\nSecond block.')
    expect(md).toContain('First block.')
    expect(md).toContain('Second block.')
    expect(md.split('\n\n').length).toBeGreaterThanOrEqual(2)
  })

  it('detects bullet blocks and normalizes glyphs', () => {
    const md = txtToMarkdown('• one\n• two\n• three')
    expect(md).toContain('- one')
    expect(md).toContain('- two')
  })

  it('detects numbered lists', () => {
    const md = txtToMarkdown('1. first\n2. second')
    expect(md).toContain('1. first')
    expect(md).toContain('2. second')
  })

  it('preserves a 4-space indented code block verbatim', () => {
    const md = txtToMarkdown('    const x = 1\n    const y = 2')
    expect(md).toContain('    const x = 1')
  })

  it('autolinks bare URLs', () => {
    const md = txtToMarkdown('see https://example.com here')
    expect(md).toContain('<https://example.com>')
  })

  it('keeps a mixed bullet/non-bullet block as one paragraph', () => {
    const md = txtToMarkdown('- a real bullet\nnot a bullet line')
    expect(md).not.toMatch(/^- a real bullet$/m)
  })
})

describe('convert() — txt pipeline', () => {
  it('renders paragraphs as <p>', async () => {
    const { html } = await convert('Hello world.\n\nSecond para.', {
      ext: 'txt',
      document: false,
    })
    expect(html).toContain('<p>Hello world.</p>')
    expect(html).toContain('<p>Second para.</p>')
  })

  it('renders a bullet block as a <ul>', async () => {
    const { html } = await convert('• a\n• b', { ext: 'txt', document: false })
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>a</li>')
  })

  it('renders a bare URL as an <a>', async () => {
    const { html } = await convert('visit https://example.com', {
      ext: 'txt',
      document: false,
    })
    expect(html).toContain('href="https://example.com"')
  })
})
