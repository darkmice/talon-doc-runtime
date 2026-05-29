// Test the TDR-flavored Markdown → TDR HTML pipeline.

import { describe, expect, it } from 'vitest'
import { mdToTdr } from '../src/markdown'

describe('mdToTdr', () => {
  it('returns fragment-only HTML when document=false', async () => {
    const { html } = await mdToTdr('# Hi', { document: false })
    expect(html).toContain('<h1>Hi</h1>')
    expect(html).not.toContain('<!doctype')
    expect(html).not.toContain('<html')
  })

  it('wraps in a full <!doctype html> document by default', async () => {
    const { html } = await mdToTdr('# Hi')
    expect(html).toMatch(/^<!doctype html>/i)
    expect(html).toContain('<html lang="zh-CN" data-archetype="business-document">')
    expect(html).toContain('<main class="tdr-doc">')
    expect(html).toContain('<script src="https://unpkg.com/@talon-ui/doc-runtime/dist/talon-doc-runtime.iife.js"></script>')
  })

  it('extracts frontmatter into the wrapper attributes', async () => {
    const md = [
      '---',
      'archetype: editorial-longform',
      'title: My doc',
      'lang: en-US',
      'theme: dark',
      '---',
      '',
      '# Heading',
    ].join('\n')
    const { html, frontmatter } = await mdToTdr(md)
    expect(frontmatter.archetype).toBe('editorial-longform')
    expect(frontmatter.title).toBe('My doc')
    expect(html).toContain('data-archetype="editorial-longform"')
    expect(html).toContain('lang="en-US"')
    expect(html).toContain('data-tdr-theme="dark"')
    expect(html).toContain('<title>My doc</title>')
  })

  it('falls back to first <h1> for title when frontmatter omits it', async () => {
    const { html } = await mdToTdr('# Hello world')
    expect(html).toContain('<title>Hello world</title>')
  })

  it('rejects unsafe HTML by NOT escaping it (allowDangerousHtml on)', async () => {
    // We allow raw HTML so existing <d>/<call>/<src> tags pass through.
    const { html } = await mdToTdr('<d s="ok" v="✓">manual</d>', { document: false })
    expect(html).toContain('<d s="ok"')
  })

  describe('admonitions → <call>', () => {
    it('promotes GFM [!NOTE] block', async () => {
      const md = '> [!NOTE]\n> Watch out.'
      const { html } = await mdToTdr(md, { document: false })
      expect(html).toContain('<call k="note">')
      expect(html).toContain('Watch out.')
      expect(html).not.toContain('[!NOTE]')
    })

    it('promotes GFM [!WARNING] / [!CAUTION] / [!TIP] / [!IMPORTANT]', async () => {
      const cases: Array<[string, string]> = [
        ['WARNING', 'warn'],
        ['CAUTION', 'bad'],
        ['TIP', 'ok'],
        ['IMPORTANT', 'warn'],
      ]
      for (const [marker, kind] of cases) {
        const md = `> [!${marker}]\n> body.`
        const { html } = await mdToTdr(md, { document: false })
        expect(html, marker).toContain(`<call k="${kind}">`)
      }
    })

    it('promotes English "NOTE: …" convention', async () => {
      const md = '> NOTE: An English convention.'
      const { html } = await mdToTdr(md, { document: false })
      expect(html).toContain('<call k="note">')
      expect(html).toContain('An English convention.')
      expect(html).not.toMatch(/NOTE\s*:/)
    })

    it('promotes Chinese "注意：…" convention', async () => {
      const md = '> 注意：写中文也行。'
      const { html } = await mdToTdr(md, { document: false })
      expect(html).toContain('<call k="note">')
      expect(html).toContain('写中文也行。')
    })

    it('leaves a plain blockquote alone', async () => {
      const md = '> Just a normal quote.'
      const { html } = await mdToTdr(md, { document: false })
      expect(html).toContain('<blockquote>')
      expect(html).not.toContain('<call')
    })
  })

  describe('code fences → <src>', () => {
    it('promotes a fenced block whose info string carries file:path:lines', async () => {
      const md = '```ts file:src/auth.ts:8-12\nif (x) revokeFamily()\n```'
      const { html } = await mdToTdr(md, { document: false })
      expect(html).toContain('<src ')
      expect(html).toContain('p="src/auth.ts:8-12"')
      expect(html).toContain('l="ts"')
      expect(html).toContain('language-ts')
      expect(html).toContain('if (x) revokeFamily()')
    })

    it('accepts plain `path=` and bare path conventions', async () => {
      const a = await mdToTdr('```ts path=src/a.ts:1-3\nconst x = 1\n```', { document: false })
      expect(a.html).toContain('p="src/a.ts:1-3"')

      const b = await mdToTdr('```ts src/b.ts:5\nconst y = 2\n```', { document: false })
      expect(b.html).toContain('p="src/b.ts:5"')
    })

    it('leaves an ordinary fenced block as <pre><code>', async () => {
      const md = '```js\nconsole.log("hi")\n```'
      const { html } = await mdToTdr(md, { document: false })
      expect(html).toContain('<pre><code class="language-js">')
      expect(html).not.toContain('<src')
    })
  })

  describe('task lists → <chk>/<ck>', () => {
    it('converts a fully-checked task list', async () => {
      const md = '- [x] one\n- [ ] two\n- [x] three'
      const { html } = await mdToTdr(md, { document: false })
      expect(html).toContain('<chk>')
      expect(html).toContain('<ck k="true">one</ck>')
      expect(html).toContain('<ck>two</ck>')
      expect(html).toContain('<ck k="true">three</ck>')
    })

    it('leaves a mixed list (no checkboxes) as <ul>', async () => {
      const md = '- one\n- two'
      const { html } = await mdToTdr(md, { document: false })
      expect(html).toContain('<ul>')
      expect(html).not.toContain('<chk')
    })
  })

  describe('<details>/<summary> → <c>', () => {
    it('rewrites the wrapper while preserving inner content', async () => {
      const md = '<details>\n<summary>Click me</summary>\n\nHidden body.\n\n</details>'
      const { html } = await mdToTdr(md, { document: false })
      expect(html).toContain('<c t="Click me">')
      expect(html).toContain('Hidden body.')
      expect(html).toContain('</c>')
    })

    it('honours the open attribute', async () => {
      const md = '<details open>\n<summary>Title</summary>\n\nbody\n\n</details>'
      const { html } = await mdToTdr(md, { document: false })
      expect(html).toMatch(/<c t="Title" o="true">/)
    })
  })

  describe('enrich hook', () => {
    it('forwards the fragment HTML and resolves with the new HTML', async () => {
      const enrich = async (frag: string) => frag.replace('<p>old</p>', '<p>NEW</p>')
      const { html } = await mdToTdr('old', { document: false, enrich })
      expect(html).toContain('NEW')
    })

    it('receives the parsed frontmatter and original markdown in context', async () => {
      const md = '---\narchetype: editorial-longform\n---\n\nbody'
      let captured: { fm: unknown; md: string } | null = null
      await mdToTdr(md, {
        document: false,
        enrich: async (frag, ctx) => {
          captured = { fm: ctx.frontmatter, md: ctx.markdown }
          return frag
        },
      })
      expect(captured).not.toBeNull()
      expect((captured!.fm as { archetype: string }).archetype).toBe('editorial-longform')
      expect(captured!.md).toBe(md)
    })
  })

  describe('options override frontmatter defaults', () => {
    it('uses defaultArchetype when frontmatter omits one', async () => {
      const { html } = await mdToTdr('# x', { defaultArchetype: 'editorial-longform' })
      expect(html).toContain('data-archetype="editorial-longform"')
    })

    it('uses defaultLang when frontmatter omits one', async () => {
      const { html } = await mdToTdr('# x', { defaultLang: 'en' })
      expect(html).toContain('lang="en"')
    })

    it('uses runtimeScript when provided', async () => {
      const { html } = await mdToTdr('# x', { runtimeScript: '/local/runtime.js' })
      expect(html).toContain('<script src="/local/runtime.js"></script>')
    })
  })
})
