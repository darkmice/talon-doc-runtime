// Smoke test: render a fixture that exercises every component, mount the
// runtime, and verify each renderer produced its target class and that no
// raw DSL tags survived.

import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '../src/index'

// Inline fixture (intentionally not pulled from examples/, which is a local
// preview folder excluded from version control).
const FIXTURE = `
<main class="tdr-doc">
  <h1>Smoke fixture</h1>

  <ms>
    <m v="3" t="components"></m>
    <m v="100%" t="coverage"></m>
  </ms>

  <call k="info" t="Note">Body.</call>

  <d s="bad" v="P0" t="Decision title"><p>Reason.</p></d>

  <c t="Collapse"><p>Body.</p></c>

  <src id="ref1" p="src/a.ts:1-2" l="ts">
    <pre><code>const x = 1</code></pre>
    <note>Inline note.</note>
  </src>

  <p><ref to="ref1" x="see"></ref> and <x s="ok">badge</x>.</p>

  <btn a="open" to="ref1">Open</btn>

  <flow>
    <n s="ok" t="A"></n>
    <arr t="ok"></arr>
    <n s="bad" t="B"></n>
  </flow>

  <steps p="50">
    <step s="done" t="One"></step>
    <step s="active" t="Two" f="now" fl="P1"></step>
  </steps>

  <cmp t="Compare">
    <pro t="Pro"><ul><li>a</li></ul></pro>
    <con t="Con"><ul><li>b</li></ul></con>
  </cmp>

  <bars>
    <bar t="x" v="3" p="60" s="ok"></bar>
  </bars>

  <sb>
    <seg p="50" s="ok"></seg>
    <seg p="50" s="bad"></seg>
    <lg t="ok" s="ok"></lg>
    <lg t="bad" s="bad"></lg>
  </sb>

  <kv>
    <row k="env" v="prod"></row>
    <row k="status" v="APPROVED" vk="enum"></row>
  </kv>

  <tabs>
    <tab t="One"><p>1</p></tab>
    <tab t="Two"><p>2</p></tab>
  </tabs>

  <chk>
    <ck k="true">done</ck>
    <ck>todo</ck>
  </chk>

  <grid c="2">
    <card t="Card"><p>Body.</p><foot>Foot.</foot></card>
  </grid>

  <files>
    <fg m="auth"><f p="src/auth.ts" s="mod" why="patch"></f></fg>
  </files>
</main>
`

beforeEach(() => {
  document.head.innerHTML = ''
  document.body.innerHTML = ''
  document.documentElement.removeAttribute('data-tdr-theme')
  document.documentElement.removeAttribute('data-mode')
  document.documentElement.removeAttribute('data-archetype')
})

describe('smoke', () => {
  it('renders every component without leaking DSL tags', () => {
    document.body.innerHTML = FIXTURE
    document.documentElement.setAttribute('data-archetype', 'business-document')
    mount(document.body, { injectStyles: false })

    const expectedClasses = [
      '.tdr-metrics',
      '.tdr-metric',
      '.tdr-callout',
      '.tdr-decision',
      '.tdr-collapse',
      '.tdr-source',
      '.tdr-source-note',
      '.tdr-ref',
      '.tdr-badge',
      '.tdr-flow',
      '.tdr-node',
      '.tdr-arrow',
      '.tdr-compare',
      '.tdr-compare-col',
      '.tdr-bars',
      '.tdr-bar',
      '.tdr-steps',
      '.tdr-step',
      '.tdr-step-flag',
      '.tdr-files',
      '.tdr-filegroup',
      '.tdr-file',
      '.tdr-grid',
      '.tdr-card',
      '.tdr-stacked-track',
      '.tdr-stacked-legend',
      '.tdr-tabs',
      '.tdr-tab-btn',
      '.tdr-tab-panel',
      '.tdr-checklist',
      '.tdr-check',
      '.tdr-kv',
      '.tdr-kv-row',
      '.tdr-action',
    ]
    for (const sel of expectedClasses) {
      const found = document.querySelectorAll(sel).length
      expect(found, `expected at least one ${sel}`).toBeGreaterThan(0)
    }

    const dslTags = ['ms', 'd', 'call', 'c', 'src', 'ref', 'btn', 'x',
      'flow', 'n', 'arr', 'steps', 'step', 'cmp', 'bars', 'bar',
      'sb', 'kv', 'tabs', 'tab', 'chk', 'ck', 'grid', 'card',
      'files', 'fg', 'cb', 'pro', 'con', 'seg', 'lg', 'row', 'foot', 'note']
    for (const tag of dslTags) {
      const unmounted = Array.from(document.querySelectorAll(tag))
        .filter((el) => (el as HTMLElement).dataset.tdrMounted !== 'true')
      expect(unmounted.length, `unmounted <${tag}>`).toBe(0)
    }
  })
})
