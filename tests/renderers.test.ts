import { beforeEach, describe, expect, it } from 'vitest'
import { mount, setArchetype } from '../src/index'

beforeEach(() => {
  document.head.innerHTML = ''
  document.body.innerHTML = ''
  document.documentElement.removeAttribute('data-tdr-theme')
  document.documentElement.removeAttribute('data-mode')
  document.documentElement.removeAttribute('data-archetype')
})

describe('v2 renderers', () => {
  it('mounts <ms> metric row with multiple <m> children', () => {
    document.body.innerHTML = `
      <ms>
        <m v="47" t="files"></m>
        <m v="~4h" t="effort"></m>
      </ms>
    `
    mount(document.body, { injectStyles: false })
    const row = document.querySelector('.tdr-metrics')!
    expect(row.querySelectorAll('.tdr-metric').length).toBe(2)
    expect(row.querySelector('.tdr-metric-value')?.textContent).toBe('47')
    expect(row.querySelector('.tdr-metric-label')?.textContent).toBe('files')
  })

  it('mounts <flow> with mixed node states and meta/sub attrs', () => {
    document.body.innerHTML = `
      <flow>
        <n>Client</n>
        <arr t="Bearer"></arr>
        <n s="accent" meta="0.3ms">Auth</n>
        <arr></arr>
        <n s="success" sub="POST /login">Route</n>
      </flow>
    `
    mount(document.body, { injectStyles: false })
    const nodes = document.querySelectorAll('.tdr-node')
    expect(nodes.length).toBe(3)
    expect((nodes[1] as HTMLElement).dataset.s).toBe('accent')
    expect(nodes[1].querySelector('.tdr-node-meta')?.textContent).toBe('0.3ms')
    expect(nodes[2].querySelector('.tdr-node-sub')?.textContent).toBe('POST /login')
  })

  it('mounts vertical flow', () => {
    document.body.innerHTML = `<flow v><n>A</n><arr></arr><n>B</n></flow>`
    mount(document.body, { injectStyles: false })
    const flow = document.querySelector('.tdr-flow') as HTMLElement
    expect(flow.dataset.v).toBe('true')
  })

  it('renders <steps> with progress bar and flag', () => {
    document.body.innerHTML = `
      <steps p="50">
        <step s="done" t="A"></step>
        <step s="active" t="B" f="danger" fl="BUG"></step>
      </steps>
    `
    mount(document.body, { injectStyles: false })
    const steps = document.querySelector('.tdr-steps')!
    expect(steps.querySelector('.tdr-steps-progress-fill') as HTMLElement).toBeTruthy()
    expect((steps.querySelector('.tdr-steps-progress-fill') as HTMLElement).style.width).toBe('50%')
    const items = steps.querySelectorAll('.tdr-step')
    // 'done' normalizes to 'ok' (both share completed-step styling)
    expect((items[0] as HTMLElement).dataset.s).toBe('ok')
    expect((items[1] as HTMLElement).dataset.s).toBe('active')
    expect(items[1].querySelector('.tdr-step-flag')?.textContent).toBe('BUG')
  })

  it('renders <cmp> with pro/con columns', () => {
    document.body.innerHTML = `
      <cmp>
        <pro t="优势"><ul><li>fast</li></ul></pro>
        <con t="风险"><ul><li>slow</li></ul></con>
      </cmp>
    `
    mount(document.body, { injectStyles: false })
    const cols = document.querySelectorAll('.tdr-compare-col')
    expect(cols.length).toBe(2)
    expect((cols[0] as HTMLElement).dataset.k).toBe('pro')
    expect((cols[1] as HTMLElement).dataset.k).toBe('con')
    expect(cols[0].querySelector('.tdr-compare-col-title')?.textContent).toBe('优势')
  })

  it('renders <bars> with percentages applied to fill widths', () => {
    document.body.innerHTML = `
      <bars>
        <bar t="A" v="1ms" p="20" s="ok"></bar>
        <bar t="B" v="5ms" p="80" s="warn"></bar>
      </bars>
    `
    mount(document.body, { injectStyles: false })
    const bars = document.querySelectorAll('.tdr-bar')
    expect(bars.length).toBe(2)
    expect(((bars[0] as HTMLElement).querySelector('.tdr-bar-fill') as HTMLElement).style.width).toBe('20%')
    expect((bars[1] as HTMLElement).dataset.s).toBe('warn')
  })

  it('renders <sb> stacked bar with segments and legend', () => {
    document.body.innerHTML = `
      <sb>
        <seg p="60" s="accent"></seg>
        <seg p="40" s="ok"></seg>
        <lg t="A (60%)" s="accent"></lg>
        <lg t="B (40%)" s="ok"></lg>
      </sb>
    `
    mount(document.body, { injectStyles: false })
    const segs = document.querySelectorAll('.tdr-stacked-seg')
    expect(segs.length).toBe(2)
    expect((segs[0] as HTMLElement).style.width).toBe('60%')
    expect(document.querySelectorAll('.tdr-stacked-legend-item').length).toBe(2)
  })

  it('renders <kv> with <row k v> children', () => {
    document.body.innerHTML = `
      <kv>
        <row k="latency" v="0.3ms"></row>
        <row k="dependency" v="none"></row>
      </kv>
    `
    mount(document.body, { injectStyles: false })
    const rows = document.querySelectorAll('.tdr-kv-row')
    expect(rows.length).toBe(2)
    expect(rows[0].querySelector('.tdr-kv-key')?.textContent).toBe('latency')
    expect(rows[0].querySelector('.tdr-kv-val')?.textContent).toBe('0.3ms')
  })

  it('renders <tabs> with first tab active and switches on click', () => {
    document.body.innerHTML = `
      <tabs>
        <tab t="A"><p>Apple</p></tab>
        <tab t="B"><p>Banana</p></tab>
      </tabs>
    `
    mount(document.body, { injectStyles: false })
    const btns = document.querySelectorAll('.tdr-tab-btn')
    const panels = document.querySelectorAll('.tdr-tab-panel')
    expect(btns.length).toBe(2)
    expect(btns[0].getAttribute('aria-selected')).toBe('true')
    expect((panels[0] as HTMLElement).dataset.active).toBe('true')
    expect((panels[1] as HTMLElement).dataset.active).toBe('false')

    ;(btns[1] as HTMLButtonElement).click()
    expect(btns[0].getAttribute('aria-selected')).toBe('false')
    expect(btns[1].getAttribute('aria-selected')).toBe('true')
    expect((panels[0] as HTMLElement).dataset.active).toBe('false')
    expect((panels[1] as HTMLElement).dataset.active).toBe('true')
  })

  it('renders <chk> with checked/unchecked items', () => {
    document.body.innerHTML = `
      <chk>
        <ck k>done</ck>
        <ck>todo</ck>
      </chk>
    `
    mount(document.body, { injectStyles: false })
    const items = document.querySelectorAll('.tdr-check')
    expect(items.length).toBe(2)
    expect((items[0] as HTMLElement).dataset.k).toBe('true')
    expect((items[1] as HTMLElement).dataset.k).toBe('false')
  })

  it('renders <grid> with col count and <card> with title + foot', () => {
    document.body.innerHTML = `
      <grid c="3">
        <card t="One"><p>body</p><foot>foot</foot></card>
      </grid>
    `
    mount(document.body, { injectStyles: false })
    const grid = document.querySelector('.tdr-grid') as HTMLElement
    expect(grid.style.getPropertyValue('--tdr-grid-cols')).toBe('3')
    const card = document.querySelector('.tdr-card')!
    expect(card.querySelector('.tdr-card-title')?.textContent).toBe('One')
    expect(card.querySelector('.tdr-card-foot')?.textContent).toBe('foot')
  })

  it('renders <files> with file-group + file rows showing status', () => {
    document.body.innerHTML = `
      <files>
        <fg m="src/lib">
          <f p="a.ts" s="added" why="new"></f>
          <f p="b.ts" s="modified"></f>
        </fg>
      </files>
    `
    mount(document.body, { injectStyles: false })
    const filegroup = document.querySelector('.tdr-filegroup')!
    expect(filegroup.querySelector('.tdr-filegroup-head')?.textContent).toBe('src/lib')
    const rows = filegroup.querySelectorAll('.tdr-file')
    expect(rows.length).toBe(2)
    expect((rows[0].querySelector('.tdr-file-status') as HTMLElement).dataset.s).toBe('added')
    expect(rows[0].querySelector('.tdr-file-path')?.textContent).toBe('a.ts')
    expect(rows[0].querySelector('.tdr-file-why')?.textContent).toBe('new')
  })

  it('renders <cb> simple code block with file label', () => {
    document.body.innerHTML = `<cb f="POST /api/login"><pre><code>const a = 1</code></pre></cb>`
    mount(document.body, { injectStyles: false })
    const code = document.querySelector('.tdr-code')!
    expect(code.querySelector('.tdr-code-head')?.textContent).toBe('POST /api/login')
    expect(code.querySelector('code')?.textContent).toBe('const a = 1')
  })

  it('renders <src> with <note> child element', () => {
    document.body.innerHTML = `
      <src id="x" p="a.ts:1-2" l="ts">
        <pre><code>const a = 1
const b = 2</code></pre>
        <note>important context</note>
      </src>
    `
    mount(document.body, { injectStyles: false })
    const src = document.getElementById('x')!
    expect(src.querySelector('.tdr-source-note')?.textContent).toBe('important context')
  })

  it('renders <x> as inline badge with normalized state', () => {
    document.body.innerHTML = `
      <p><x s="danger">P0</x> <x s="success">新增</x></p>
    `
    mount(document.body, { injectStyles: false })
    const badges = document.querySelectorAll('.tdr-badge')
    expect(badges.length).toBe(2)
    expect((badges[0] as HTMLElement).dataset.s).toBe('bad')
    expect((badges[1] as HTMLElement).dataset.s).toBe('ok')
  })

  it('renders nested DSL inside <c> and <tabs> via multi-pass enhance', () => {
    document.body.innerHTML = `
      <c t="Outer">
        <tabs>
          <tab t="One"><bars><bar t="x" v="1" p="50"></bar></bars></tab>
          <tab t="Two"><p>plain</p></tab>
        </tabs>
      </c>
    `
    mount(document.body, { injectStyles: false })
    // Inner bar should still be rendered even though it lives inside a tab panel
    expect(document.querySelectorAll('.tdr-bar').length).toBe(1)
    expect(document.querySelectorAll('.tdr-tab-btn').length).toBe(2)
  })
})

describe('batch-2 semantic renderers', () => {
  it('renders <contrast> with two labelled columns', () => {
    document.body.innerHTML = `
      <contrast w="session" d="diff">
        <l c="old">A meaning</l>
        <r c="new">B meaning</r>
      </contrast>
    `
    mount(document.body, { injectStyles: false })
    const wrap = document.querySelector('.tdr-contrast')!
    expect(wrap.querySelector('.tdr-contrast-word')?.textContent).toBe('session')
    const cols = wrap.querySelectorAll('.tdr-contrast-col')
    expect(cols.length).toBe(2)
    expect((cols[0] as HTMLElement).dataset.k).toBe('left')
    expect((cols[1] as HTMLElement).dataset.k).toBe('right')
    expect(cols[0].querySelector('.tdr-contrast-ctx')?.textContent).toBe('old')
    expect(cols[0].querySelector('.tdr-contrast-meaning')?.textContent?.trim()).toBe('A meaning')
  })

  it('renders <analogy> with source ≈ target + because line', () => {
    document.body.innerHTML = `<analogy s="A" sd="a-desc" t="B" td="b-desc" why="reason"></analogy>`
    mount(document.body, { injectStyles: false })
    const wrap = document.querySelector('.tdr-analogy')!
    const sides = wrap.querySelectorAll('.tdr-analogy-side')
    expect(sides.length).toBe(2)
    expect((sides[0] as HTMLElement).dataset.k).toBe('source')
    expect(sides[0].querySelector('.tdr-analogy-term')?.textContent).toBe('A')
    expect(sides[1].querySelector('.tdr-analogy-term')?.textContent).toBe('B')
    expect(wrap.querySelector('.tdr-analogy-link')?.textContent).toBe('≈')
    expect(wrap.querySelector('.tdr-analogy-because')?.textContent).toBe('reason')
  })

  it('renders <myth> with wrong + right rows', () => {
    document.body.innerHTML = `<myth><wrong>nope</wrong><right>actually</right></myth>`
    mount(document.body, { injectStyles: false })
    const rows = document.querySelectorAll('.tdr-myth-row')
    expect(rows.length).toBe(2)
    expect((rows[0] as HTMLElement).dataset.k).toBe('wrong')
    expect((rows[1] as HTMLElement).dataset.k).toBe('right')
    expect(rows[0].querySelector('.tdr-myth-body')?.textContent).toBe('nope')
  })

  it('renders <branch> with nested <bi> kids', () => {
    document.body.innerHTML = `
      <branch r="root q">
        <bi c="A" s="bad" out="o1">desc-a</bi>
        <bi c="B" out="o2">desc-b
          <kids>
            <bi c="B1" s="ok" out="o3">desc-b1</bi>
          </kids>
        </bi>
      </branch>
    `
    mount(document.body, { injectStyles: false })
    const branch = document.querySelector('.tdr-branch')!
    expect(branch.querySelector('.tdr-branch-root')?.textContent).toBe('root q')
    const cases = branch.querySelector('.tdr-branch-cases')!
    const topCases = Array.from(cases.children).filter((el) => el.classList.contains('tdr-bcase'))
    expect(topCases.length).toBe(2)
    const kids = topCases[1].querySelector('.tdr-bcase-kids')
    expect(kids).toBeTruthy()
    expect(kids!.querySelectorAll('.tdr-bcase').length).toBe(1)
    expect((branch.querySelector('.tdr-bcase[data-s="ok"]') as HTMLElement)?.dataset.s).toBe('ok')
  })

  it('renders <tks> with multiple <tk> cards and a <finding>', () => {
    document.body.innerHTML = `
      <tks>
        <tk t="A" f="passed">summary</tk>
        <tk t="B" f="blocked">
          <finding t="ft">summary inline<detail><p>more</p></detail></finding>
        </tk>
      </tracks>
    `
    mount(document.body, { injectStyles: false })
    const cards = document.querySelectorAll('.tdr-track')
    expect(cards.length).toBe(2)
    expect((cards[0] as HTMLElement).dataset.s).toBe('ok')
    expect((cards[1] as HTMLElement).dataset.s).toBe('bad')
    expect(cards[0].querySelector('.tdr-track-title')?.textContent).toBe('A')
    const finding = cards[1].querySelector('.tdr-finding')
    expect(finding).toBeTruthy()
    expect(finding!.querySelector('.tdr-finding-title')?.textContent).toBe('ft')
    expect(finding!.querySelector('.tdr-finding-detail')?.textContent?.trim()).toBe('more')
  })
})

describe('archetype API', () => {
  it('sets data-archetype on the document element', () => {
    document.body.innerHTML = `<d t="x">body</d>`
    mount(document.body, { injectStyles: false, archetype: 'business-document' })
    expect(document.documentElement.getAttribute('data-archetype')).toBe('business-document')
  })

  it('respects pre-set data-archetype on root', () => {
    document.documentElement.setAttribute('data-archetype', 'business-document')
    document.body.innerHTML = `<p>hi</p>`
    mount(document.body, { injectStyles: false })
    expect(document.documentElement.getAttribute('data-archetype')).toBe('business-document')
  })

  it('setArchetype updates the attribute at runtime', () => {
    document.body.innerHTML = `<p>x</p>`
    mount(document.body, { injectStyles: false })
    setArchetype('business-document')
    expect(document.documentElement.getAttribute('data-archetype')).toBe('business-document')
  })
})

describe('batch-3 renderers', () => {
  it('renders <divider> with and without label', () => {
    document.body.innerHTML = `
      <divider></divider>
      <divider t="2024"></divider>
    `
    mount(document.body, { injectStyles: false })
    const dividers = document.querySelectorAll('.tdr-divider')
    expect(dividers.length).toBe(2)
    expect((dividers[0] as HTMLElement).dataset.labeled).toBeUndefined()
    expect((dividers[1] as HTMLElement).dataset.labeled).toBe('true')
    expect(dividers[1].querySelector('.tdr-divider-label')?.textContent).toBe('2024')
  })

  it('renders <evidence> with conclusion + supporting items', () => {
    document.body.innerHTML = `
      <evidence t="JWT 是最优选择">
        <ei>无状态校验，0.3ms 比 session 快 88%。</ei>
        <ei>不引入新依赖。</ei>
        <ei>标准库支持。</ei>
      </evidence>
    `
    mount(document.body, { injectStyles: false })
    const ev = document.querySelector('.tdr-evidence') as HTMLElement
    expect(ev).toBeTruthy()
    expect(ev.dataset.s).toBe('ok')
    expect(ev.querySelector('.tdr-evidence-concl')?.textContent).toBe('JWT 是最优选择')
    expect(ev.querySelectorAll('.tdr-ei').length).toBe(3)
  })

  it('renders <term> as inline element with tooltip content', () => {
    document.body.innerHTML = `
      <p>数据库通过 <term w="WAL" d="Write-Ahead Log。" first>WAL</term> 保证持久性。</p>
    `
    mount(document.body, { injectStyles: false })
    const t = document.querySelector('.tdr-term') as HTMLElement
    expect(t).toBeTruthy()
    expect(t.dataset.first).toBe('true')
    expect(t.querySelector('.tdr-term-label')?.textContent).toBe('WAL')
    expect(t.querySelector('.tdr-term-tip-word')?.textContent).toBe('WAL')
    expect(t.querySelector('.tdr-term-tip-def')?.textContent).toBe('Write-Ahead Log。')
  })

  it('renders <timeline> with multiple <ev> entries', () => {
    document.body.innerHTML = `
      <timeline>
        <ev d="2025-03-14" t="Auth v1" s="ok">launched</ev>
        <ev d="2025-09-02" t="JWT migration" s="active"></ev>
      </timeline>
    `
    mount(document.body, { injectStyles: false })
    const tl = document.querySelector('.tdr-timeline')!
    const events = tl.querySelectorAll('.tdr-ev')
    expect(events.length).toBe(2)
    expect((events[0] as HTMLElement).dataset.s).toBe('ok')
    expect((events[1] as HTMLElement).dataset.s).toBe('active')
    expect(events[0].querySelector('.tdr-ev-date')?.textContent).toBe('2025-03-14')
    expect(events[0].querySelector('.tdr-ev-title')?.textContent).toBe('Auth v1')
  })

  it('renders <risk> matrix with severity/likelihood pills', () => {
    document.body.innerHTML = `
      <risk>
        <r t="Token leak" sev="high" lik="low" mit="HttpOnly cookie"></r>
        <r t="Refresh storm" sev="med" lik="med" mit="Stagger + jitter"></r>
      </risk>
    `
    mount(document.body, { injectStyles: false })
    const wrap = document.querySelector('.tdr-risk')!
    const rows = wrap.querySelectorAll('.tdr-risk-row')
    expect(rows.length).toBe(2)
    expect(rows[0].querySelector('.tdr-risk-title')?.textContent).toBe('Token leak')
    const pills = rows[0].querySelectorAll('.tdr-risk-pill')
    expect((pills[0] as HTMLElement).dataset.s).toBe('bad')
    expect((pills[1] as HTMLElement).dataset.s).toBe('ok')
    expect(rows[0].querySelector('.tdr-risk-mit')?.textContent).toBe('HttpOnly cookie')
  })
})

describe('renderer upgrades', () => {
  it('<decision> with <because>/<so> produces premise/conclusion columns', () => {
    document.body.innerHTML = `
      <d t="Use JWT" v="已采纳" s="approved">
        <because>session store 增加运维负担</because>
        <so>短 TTL JWT + refresh token</so>
      </d>
    `
    mount(document.body, { injectStyles: false })
    const d = document.querySelector('.tdr-decision')!
    const reason = d.querySelector('.tdr-decision-reason')
    expect(reason).toBeTruthy()
    const cols = reason!.querySelectorAll('.tdr-decision-col')
    expect(cols.length).toBe(2)
    expect((cols[0] as HTMLElement).dataset.k).toBe('because')
    expect((cols[1] as HTMLElement).dataset.k).toBe('so')
  })

  it('<kv> auto-classifies value type by content', () => {
    document.body.innerHTML = `
      <kv>
        <row k="latency" v="42ms"></row>
        <row k="status" v="APPROVED"></row>
        <row k="docs" v="https://example.com/auth"></row>
        <row k="handler" v="auth.verify()"></row>
      </kv>
    `
    mount(document.body, { injectStyles: false })
    const rows = document.querySelectorAll('.tdr-kv-row')
    const v = (i: number) => (rows[i].querySelector('.tdr-kv-val') as HTMLElement).dataset.vk
    expect(v(0)).toBe('num')
    expect(v(1)).toBe('enum')
    expect(v(2)).toBe('url')
    expect(v(3)).toBe('code')
    expect(rows[2].querySelector('.tdr-kv-val a')).toBeTruthy()
  })

  it('<cmp> with <dim> children produces dimension-table mode', () => {
    document.body.innerHTML = `
      <cmp a="JWT" b="Session">
        <dim t="latency" a="0.3ms" b="2.8ms" w="a"></dim>
        <dim t="复杂度" a="低" b="高" w="a"></dim>
        <dim t="可吊销" a="弱" b="强" w="b"></dim>
      </cmp>
    `
    mount(document.body, { injectStyles: false })
    const wrap = document.querySelector('.tdr-compare')!
    expect(wrap.classList.contains('tdr-compare-dim')).toBe(true)
    const rows = wrap.querySelectorAll('.tdr-compare-dim-row')
    expect(rows.length).toBe(3)
    const wins = wrap.querySelectorAll('.tdr-compare-dim-val[data-win="true"]')
    expect(wins.length).toBe(3)
  })
})
