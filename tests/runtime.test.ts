import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, registerAction, setTheme } from '../src/index'

beforeEach(() => {
  document.head.innerHTML = ''
  document.body.innerHTML = ''
  document.documentElement.removeAttribute('data-tdr-theme')
  document.documentElement.removeAttribute('data-mode')
})

describe('talon doc runtime', () => {
  it('renders short decision DSL into a semantic card', () => {
    document.body.innerHTML = `
      <main>
        <d s="bad" v="P0" t="并发 refresh 误撤销 token">
          <p>第二个请求会撤销 token 家族。</p>
        </d>
      </main>
    `

    mount(document.body, { injectStyles: false })

    const decision = document.querySelector('.tdr-decision') as HTMLElement
    expect(decision).toBeTruthy()
    expect(decision.dataset.s).toBe('bad')
    expect(decision.querySelector('.tdr-decision-title')?.textContent).toBe('并发 refresh 误撤销 token')
    expect(decision.querySelector('.tdr-badge')?.textContent).toBe('P0')
  })

  it('renders collapses and sources with line numbers', () => {
    document.body.innerHTML = `
      <c t="证据">
        <src id="auth" p="src/auth.ts:42-43" l="ts">
          <pre><code>const ok = true
return ok</code></pre>
        </src>
      </c>
    `

    mount(document.body, { injectStyles: false })

    const collapse = document.querySelector('.tdr-collapse') as HTMLDetailsElement
    const source = document.getElementById('auth') as HTMLDetailsElement
    expect(collapse.tagName).toBe('DETAILS')
    expect(collapse.querySelector('summary')?.textContent).toBe('证据')
    expect(source.tagName).toBe('DETAILS')
    expect(source.querySelector('.tdr-source-path')?.textContent).toBe('src/auth.ts:42-43')
    expect([...source.querySelectorAll('.tdr-line')].map((line) => line.getAttribute('data-line'))).toEqual(['42', '43'])
  })

  it('opens a target source when a ref is clicked', () => {
    document.body.innerHTML = `
      <p>查看 <ref to="src1" x="auth.ts:7"></ref></p>
      <src id="src1" p="auth.ts:7" l="ts"><pre><code>export const x = 1</code></pre></src>
    `

    mount(document.body, { injectStyles: false })

    const source = document.getElementById('src1') as HTMLDetailsElement
    expect(source.open).toBe(false)
    document.querySelector<HTMLAnchorElement>('.tdr-ref')?.click()
    expect(source.open).toBe(true)
  })

  it('opens ancestor collapses when opening a nested source', () => {
    document.body.innerHTML = `
      <c id="chain" t="证据链">
        <src id="nested-src" p="auth.ts:7" l="ts"><pre><code>export const x = 1</code></pre></src>
      </c>
      <btn a="open" to="nested-src">展开证据</btn>
    `

    mount(document.body, { injectStyles: false })

    const collapse = document.getElementById('chain') as HTMLDetailsElement
    const source = document.getElementById('nested-src') as HTMLDetailsElement
    expect(collapse.open).toBe(false)
    expect(source.open).toBe(false)

    document.querySelector<HTMLButtonElement>('.tdr-action')?.click()

    expect(collapse.open).toBe(true)
    expect(source.open).toBe(true)
  })

  it('allows host code to register controlled actions', () => {
    const spy = vi.fn()
    document.body.innerHTML = '<btn a="accept" to="r1">验收</btn><d id="r1" t="结果">ok</d>'

    registerAction('accept', ({ action, target }) => {
      spy(action, target?.id)
    })
    mount(document.body, { injectStyles: false })

    document.querySelector<HTMLButtonElement>('.tdr-action')?.click()
    expect(spy).toHaveBeenCalledWith('accept', 'r1')
  })

  it('sets explicit themes on the document element', () => {
    setTheme('dark')
    expect(document.documentElement.getAttribute('data-tdr-theme')).toBe('dark')
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark')
    setTheme('auto')
    expect(document.documentElement.hasAttribute('data-tdr-theme')).toBe(false)
    expect(document.documentElement.hasAttribute('data-mode')).toBe(false)
  })
})
