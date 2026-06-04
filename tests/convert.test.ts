// The unified convert() dispatcher.

import { describe, expect, it } from 'vitest'
import { convert } from '../src/convert'
import { mdToTdr } from '../src/markdown'

describe('convert() dispatch', () => {
  it('md routes identically to mdToTdr', async () => {
    const md = '# Hi\n\ntext'
    const viaConvert = await convert(md, { ext: 'md', document: false })
    const direct = await mdToTdr(md, { document: false })
    expect(viaConvert.html).toBe(direct.html)
  })

  it('infers ext from filename', async () => {
    const a = await convert('# H', { filename: 'doc.markdown', document: false })
    expect(a.html).toContain('<h1>H</h1>')

    const b = await convert('<body><p>x</p></body>', {
      filename: 'page.htm',
      document: false,
    })
    expect(b.html).toContain('x')
    expect(b.html).not.toContain('<body>')
  })

  it('warns and treats unknown extensions as markdown', async () => {
    const { html, warnings } = await convert('# Hi', {
      ext: 'rst',
      document: false,
    })
    expect(html).toContain('<h1>Hi</h1>')
    expect(warnings.some((w) => w.includes("unknown extension 'rst'"))).toBe(true)
  })

  it('defaults to markdown when neither ext nor filename is given', async () => {
    const { html } = await convert('# Default', { document: false })
    expect(html).toContain('<h1>Default</h1>')
  })

  it('returns a fragment for every format when document=false', async () => {
    for (const [content, ext] of [
      ['# md', 'md'],
      ['plain text', 'txt'],
      ['<body><p>h</p></body>', 'html'],
    ] as const) {
      const { html } = await convert(content, { ext, document: false })
      expect(html).not.toContain('<!doctype')
    }
  })
})
