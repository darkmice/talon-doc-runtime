import { highlightCode } from './highlight'
import { ANIMATED_ARCHETYPES, ARCHETYPE_FONT_URLS, ARCHETYPES, BASE_CSS, DEFAULT_ARCHETYPE, FONT_LINK_ID, STYLE_ID } from './styles'

export type Theme = 'light' | 'dark' | 'auto'
export type Archetype = string

export interface MountOptions {
  root?: ParentNode
  archetype?: Archetype
  injectStyles?: boolean
  autoClass?: boolean
}

export interface ActionContext {
  action: string
  source: HTMLElement
  target: HTMLElement | null
  runtime: RuntimeApi
}

export type ActionHandler = (ctx: ActionContext) => void | Promise<void>
export type Renderer = (source: HTMLElement, runtime: RuntimeApi) => HTMLElement

export interface RuntimeApi {
  mount: (root?: ParentNode, options?: MountOptions) => void
  setTheme: (theme: Theme) => void
  setArchetype: (archetype: Archetype) => void
  registerArchetype: (name: string, css: string) => void
  registerAction: (name: string, handler: ActionHandler) => void
  registerRenderer: (tag: string, renderer: Renderer) => void
  actions: Map<string, ActionHandler>
  renderers: Map<string, Renderer>
}

const mountedRoots = new WeakSet<ParentNode>()
const actions = new Map<string, ActionHandler>()
const renderers = new Map<string, Renderer>()
const archetypeCss = new Map<string, string>(Object.entries(ARCHETYPES))
let activeArchetype: string = DEFAULT_ARCHETYPE

// ─── helpers ────────────────────────────────────────────────────────────────

function attr(el: Element, name: string, fallback = ''): string {
  return el.getAttribute(name) ?? fallback
}

function firstAttr(el: Element, names: string[], fallback = ''): string {
  for (const name of names) {
    const value = el.getAttribute(name)
    if (value !== null && value !== '') return value
  }
  return fallback
}

function hasAnyAttr(el: Element, names: string[]): boolean {
  for (const name of names) if (el.hasAttribute(name)) return true
  return false
}

function state(value: string): string {
  const v = (value || '').toLowerCase().trim()
  if (!v) return 'info'
  if (['approved', 'success', 'pass', 'passed', 'done', 'ok', 'good'].includes(v)) return 'ok'
  if (['rejected', 'danger', 'error', 'fail', 'failed', 'bad', 'p0', 'blocked'].includes(v)) return 'bad'
  if (['warning', 'warn', 'risk', 'caution', 'p1', 'at-risk', 'polish'].includes(v)) return 'warn'
  if (['exploring', 'review', 'purple', 'note', 'pending', 'p2'].includes(v)) return 'note'
  if (['active', 'in-progress', 'wip'].includes(v)) return 'active'
  if (['accent'].includes(v)) return 'accent'
  return v
}

function moveChildren(from: HTMLElement, to: HTMLElement) {
  while (from.firstChild) to.appendChild(from.firstChild)
}

function copyAttributes(from: HTMLElement, to: HTMLElement, skip: string[] = []) {
  const skipped = new Set(skip)
  for (const sourceAttr of Array.from(from.attributes)) {
    if (skipped.has(sourceAttr.name)) continue
    if (sourceAttr.name === 'class') {
      to.className = `${to.className} ${sourceAttr.value}`.trim()
    } else if (!to.hasAttribute(sourceAttr.name)) {
      to.setAttribute(sourceAttr.name, sourceAttr.value)
    }
  }
}

function replace(source: HTMLElement, target: HTMLElement) {
  target.dataset.tdrMounted = 'true'
  source.replaceWith(target)
}

function badge(text: string, s = 'info'): HTMLElement {
  const el = document.createElement('span')
  el.className = 'tdr-badge'
  el.dataset.s = state(s)
  el.textContent = text
  return el
}

// ─── inline SVG icon set ────────────────────────────────────────────────────
// Compact monoline 16x16 / currentColor icons. Kept in code so renderers can
// emit them without external sprite or font dependency.
const ICON: Record<string, string> = {
  info: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 7.5v4"/><circle cx="8" cy="5" r="0.6" fill="currentColor" stroke="none"/></svg>',
  warn: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 1.5L1.5 13.5h13z"/><path d="M8 6v3.5"/><circle cx="8" cy="11.5" r="0.6" fill="currentColor" stroke="none"/></svg>',
  bad: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5"/></svg>',
  ok: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M5 8.2l2.3 2.3L11 6"/></svg>',
  note: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M5.5 7l2.5 3 2.5-5"/></svg>',
  check: '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3 3 7-7"/></svg>',
  caret: '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>',
  link: '<svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 10l4-4M6 3.5h6.5V10"/></svg>',
  arrow: '<svg viewBox="0 0 24 16" width="22" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h17"/><path d="M16 4l4 4-4 4"/></svg>',
  arrowDown: '<svg viewBox="0 0 16 24" width="14" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v17"/><path d="M4 16l4 4 4-4"/></svg>',
  copy: '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="5" width="8.5" height="8.5" rx="1.4"/><path d="M10 5V3.5A1 1 0 009 2.5H3.5a1 1 0 00-1 1V9a1 1 0 001 1H5"/></svg>',
  stepActive: '<svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true"><circle cx="8" cy="8" r="4" fill="currentColor"/></svg>',
  stepTodo: '<svg viewBox="0 0 16 16" width="6" height="6" aria-hidden="true"><circle cx="8" cy="8" r="3" fill="currentColor"/></svg>',
}

function svg(html: string): HTMLElement {
  const wrap = document.createElement('span')
  wrap.className = 'tdr-icon'
  wrap.innerHTML = html
  return wrap
}

function parseStartLine(path: string): number {
  const match = path.match(/:(\d+)/)
  return match ? Number.parseInt(match[1], 10) : 1
}

function takeChild(source: HTMLElement, selector: string): HTMLElement | null {
  const found = source.querySelector(selector) as HTMLElement | null
  if (found && found.parentElement === source) found.remove()
  return found
}

function takeChildren(source: HTMLElement, selector: string): HTMLElement[] {
  const items: HTMLElement[] = []
  for (const child of Array.from(source.children)) {
    if (child.matches(selector)) {
      items.push(child as HTMLElement)
      child.remove()
    }
  }
  return items
}

// ─── core renderers (preserved from v1) ─────────────────────────────────────

function renderDecision(source: HTMLElement): HTMLElement {
  // Upgraded: optional <because>/<so> children produce a structured premise→conclusion
  // visual. If neither is present, falls back to flat body (backwards compatible).
  const title = firstAttr(source, ['t', 'title'])
  const verdict = firstAttr(source, ['v', 'verdict'])
  const s = state(firstAttr(source, ['s', 'status'], 'info'))
  const becauseSrc = takeChild(source, 'because, premise, prem')
  const soSrc = takeChild(source, 'so, conclusion, concl')

  const card = document.createElement('section')
  card.className = 'tdr-decision'
  card.dataset.s = s
  copyAttributes(source, card, ['t', 'title', 'v', 'verdict', 's', 'status'])

  if (title || verdict) {
    const head = document.createElement('div')
    head.className = 'tdr-decision-head'
    const titleEl = document.createElement('div')
    titleEl.className = 'tdr-decision-title'
    titleEl.textContent = title
    head.appendChild(titleEl)
    if (verdict) head.appendChild(badge(verdict, s))
    card.appendChild(head)
  }

  if (becauseSrc || soSrc) {
    const reason = document.createElement('div')
    reason.className = 'tdr-decision-reason'
    const buildCol = (src: HTMLElement | null, kind: 'because' | 'so', label: string) => {
      const col = document.createElement('div')
      col.className = 'tdr-decision-col'
      col.dataset.k = kind
      const lbl = document.createElement('div')
      lbl.className = 'tdr-decision-label'
      lbl.textContent = label
      col.appendChild(lbl)
      const body = document.createElement('div')
      body.className = 'tdr-decision-col-body'
      if (src) moveChildren(src, body)
      col.appendChild(body)
      return col
    }
    reason.appendChild(buildCol(becauseSrc, 'because', '前提'))
    reason.appendChild(buildCol(soSrc, 'so', '结论'))
    card.appendChild(reason)
  }

  const body = document.createElement('div')
  body.className = 'tdr-decision-body'
  moveChildren(source, body)
  if (body.childNodes.length > 0) card.appendChild(body)
  return card
}

function renderCallout(source: HTMLElement): HTMLElement {
  const title = firstAttr(source, ['t', 'title'])
  const kind = state(firstAttr(source, ['k', 's', 'type'], 'info'))

  const card = document.createElement('aside')
  card.className = 'tdr-callout'
  card.dataset.k = kind
  copyAttributes(source, card, ['t', 'title', 'k', 's', 'type', 'icon', 'ico'])

  const ico = document.createElement('span')
  ico.className = 'tdr-callout-icon'
  const iconKey = kind === 'bad' ? 'bad' : kind === 'warn' ? 'warn' : kind === 'ok' ? 'ok' : kind === 'note' ? 'note' : 'info'
  ico.innerHTML = ICON[iconKey]
  card.appendChild(ico)

  const body = document.createElement('div')
  body.className = 'tdr-callout-body'
  if (title) {
    const titleEl = document.createElement('div')
    titleEl.className = 'tdr-callout-title'
    titleEl.textContent = title
    body.appendChild(titleEl)
  }
  moveChildren(source, body)
  card.appendChild(body)
  return card
}

function renderCollapse(source: HTMLElement): HTMLElement {
  const title = firstAttr(source, ['t', 'title'], 'Details')
  const details = document.createElement('details')
  details.className = 'tdr-collapse'
  copyAttributes(source, details, ['t', 'title', 'o', 'open', 'flat', 'borderless'])

  if (hasAnyAttr(source, ['open', 'o'])) details.open = true
  if (hasAnyAttr(source, ['flat', 'borderless'])) details.dataset.flat = 'true'

  const summary = document.createElement('summary')
  const titleEl = document.createElement('span')
  titleEl.className = 'tdr-collapse-title'
  titleEl.textContent = title
  summary.appendChild(titleEl)
  details.appendChild(summary)

  const body = document.createElement('div')
  body.className = 'tdr-collapse-body'
  moveChildren(source, body)
  details.appendChild(body)
  return details
}

function ensureCodeBlock(body: HTMLElement) {
  if (body.querySelector('pre code')) return
  const text = body.textContent ?? ''
  body.textContent = ''
  const pre = document.createElement('pre')
  const code = document.createElement('code')
  code.textContent = text.trim()
  pre.appendChild(code)
  body.appendChild(pre)
}

function highlightInPlace(body: HTMLElement, lang: string) {
  body.querySelectorAll('pre code').forEach((code) => {
    const codeEl = code as HTMLElement
    if (codeEl.dataset.tdrHl === 'true') return
    const raw = codeEl.textContent ?? ''
    codeEl.innerHTML = highlightCode(raw, lang)
    codeEl.dataset.tdrHl = 'true'
  })
}

function addLineNumbers(body: HTMLElement, start: number) {
  body.querySelectorAll('pre code').forEach((code) => {
    const codeEl = code as HTMLElement
    if (codeEl.dataset.tdrLines === 'true') return
    // Split highlighted innerHTML by \n inside text nodes — we cannot just split
    // textContent because that would drop token wrappers. Instead, work on the
    // serialized inner HTML, splitting on real \n characters between tokens.
    const html = codeEl.innerHTML
    const parts = html.split('\n')
    if (parts.length && parts[parts.length - 1].trim() === '') parts.pop()
    codeEl.innerHTML = ''
    parts.forEach((lineHtml, index) => {
      const span = document.createElement('span')
      span.className = 'tdr-line'
      span.dataset.line = String(start + index)
      span.innerHTML = lineHtml || '&nbsp;'
      codeEl.appendChild(span)
    })
    codeEl.dataset.tdrLines = 'true'
  })
}

function addCopyButtons(body: HTMLElement) {
  body.querySelectorAll('pre').forEach((pre) => {
    if (pre.querySelector('.tdr-copy')) return
    const button = document.createElement('button')
    button.className = 'tdr-copy'
    button.type = 'button'
    button.dataset.a = 'copy'
    button.setAttribute('aria-label', 'copy')
    button.innerHTML = ICON.copy
    pre.appendChild(button)
  })
}

function openDetailsChain(target: HTMLElement | null) {
  if (!target) return
  const details = target instanceof HTMLDetailsElement ? target : target.closest('details')
  if (details) details.open = true
  let parent = target.parentElement
  while (parent) {
    if (parent instanceof HTMLDetailsElement) parent.open = true
    parent = parent.parentElement
  }
}

function renderSource(source: HTMLElement): HTMLElement {
  const path = firstAttr(source, ['p', 'path'])
  const lang = firstAttr(source, ['l', 'lang'])

  // Extract note before moving children
  const noteEl = takeChild(source, 'note, .tdr-source-note-source')
  const noteText = noteEl?.textContent?.trim() ?? firstAttr(source, ['note', 'n'])

  const details = document.createElement('details')
  details.className = 'tdr-source'
  copyAttributes(source, details, ['p', 'path', 'l', 'lang', 'o', 'open', 'note', 'n'])
  if (hasAnyAttr(source, ['open', 'o'])) details.open = true

  const summary = document.createElement('summary')
  summary.className = 'tdr-source-head'
  const pathEl = document.createElement('span')
  pathEl.className = 'tdr-source-path'
  pathEl.textContent = path || 'source'
  summary.appendChild(pathEl)
  if (lang) {
    const langEl = document.createElement('span')
    langEl.className = 'tdr-source-lang'
    langEl.textContent = lang
    summary.appendChild(langEl)
  }
  details.appendChild(summary)

  const body = document.createElement('div')
  body.className = 'tdr-source-body'
  moveChildren(source, body)
  ensureCodeBlock(body)
  highlightInPlace(body, lang)
  addLineNumbers(body, parseStartLine(path))
  addCopyButtons(body)
  details.appendChild(body)

  if (noteText) {
    const note = document.createElement('div')
    note.className = 'tdr-source-note'
    if (noteEl && noteEl.children.length > 0) {
      // Preserve inline markup (e.g. <code>)
      Array.from(noteEl.childNodes).forEach((n) => note.appendChild(n))
    } else {
      note.textContent = noteText
    }
    details.appendChild(note)
  }

  return details
}

function renderRef(source: HTMLElement): HTMLElement {
  const to = firstAttr(source, ['to', 'href']).replace(/^#/, '')
  const label = firstAttr(source, ['x', 'label'], source.textContent?.trim() || to)
  const link = document.createElement('a')
  link.className = 'tdr-ref'
  link.href = `#${to}`
  link.dataset.a = 'jump'
  link.dataset.to = to
  copyAttributes(source, link, ['to', 'href', 'x', 'label'])
  const icon = document.createElement('span')
  icon.className = 'tdr-ref-icon'
  icon.innerHTML = ICON.link
  const labelEl = document.createElement('span')
  labelEl.className = 'tdr-ref-label'
  labelEl.textContent = label
  link.append(icon, labelEl)
  return link
}

function renderButton(source: HTMLElement): HTMLElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'tdr-action'
  copyAttributes(source, button)
  button.textContent = source.textContent?.trim() || firstAttr(source, ['x', 'label'], attr(source, 'a', 'action'))
  return button
}

function renderInlineBadge(source: HTMLElement): HTMLElement {
  // <x s="bad">已排除</x>
  const s = state(firstAttr(source, ['s', 'k', 'color', 'type'], 'info'))
  const el = document.createElement('span')
  el.className = 'tdr-badge'
  el.dataset.s = s
  copyAttributes(source, el, ['s', 'k', 'color', 'type'])
  el.textContent = source.textContent?.trim() ?? ''
  return el
}

// ─── new renderers ──────────────────────────────────────────────────────────

function renderMetric(source: HTMLElement): HTMLElement {
  const label = firstAttr(source, ['t', 'label'])
  const value = firstAttr(source, ['v', 'value'], source.textContent?.trim() ?? '')
  const card = document.createElement('section')
  card.className = 'tdr-metric'
  copyAttributes(source, card, ['t', 'label', 'v', 'value'])
  const valueEl = document.createElement('div')
  valueEl.className = 'tdr-metric-value'
  valueEl.textContent = value
  const labelEl = document.createElement('div')
  labelEl.className = 'tdr-metric-label'
  labelEl.textContent = label
  card.append(valueEl, labelEl)
  return card
}

function renderMetrics(source: HTMLElement): HTMLElement {
  const wrap = document.createElement('section')
  wrap.className = 'tdr-metrics'
  copyAttributes(source, wrap)
  moveChildren(source, wrap)
  return wrap
}

function renderFlow(source: HTMLElement): HTMLElement {
  const v = hasAnyAttr(source, ['v', 'vertical'])
  const card = document.createElement('section')
  card.className = 'tdr-flow'
  if (v) card.dataset.v = 'true'
  copyAttributes(source, card, ['v', 'vertical'])
  const body = document.createElement('div')
  body.className = 'tdr-flow-body'
  moveChildren(source, body)
  card.appendChild(body)
  return card
}

function renderNode(source: HTMLElement): HTMLElement {
  const s = state(firstAttr(source, ['s', 'color', 'type'], 'info'))
  const meta = firstAttr(source, ['meta', 'm'])
  const sub = firstAttr(source, ['sub', 'subtitle'])
  const text = source.textContent?.trim() || firstAttr(source, ['t', 'title'])

  const node = document.createElement('span')
  node.className = 'tdr-node'
  if (s !== 'info') node.dataset.s = s
  copyAttributes(source, node, ['s', 'color', 'type', 'meta', 'm', 'sub', 'subtitle', 't', 'title'])

  const label = document.createElement('span')
  label.textContent = text
  node.appendChild(label)
  if (meta) {
    const metaEl = document.createElement('span')
    metaEl.className = 'tdr-node-meta'
    metaEl.textContent = meta
    node.appendChild(metaEl)
  }
  if (sub) {
    const subEl = document.createElement('span')
    subEl.className = 'tdr-node-sub'
    subEl.textContent = sub
    node.appendChild(subEl)
  }
  return node
}

function renderArrow(source: HTMLElement): HTMLElement {
  const label = firstAttr(source, ['t', 'label'], source.textContent?.trim() ?? '')
  const verticalParent = source.parentElement?.tagName.toLowerCase() === 'flow'
    && (source.parentElement.hasAttribute('v') || source.parentElement.hasAttribute('vertical'))
  const arrow = document.createElement('span')
  arrow.className = 'tdr-arrow'
  copyAttributes(source, arrow, ['t', 'label'])
  const icon = document.createElement('span')
  icon.className = 'tdr-arrow-icon'
  icon.innerHTML = verticalParent ? ICON.arrowDown : ICON.arrow
  arrow.appendChild(icon)
  if (label) {
    const labelEl = document.createElement('span')
    labelEl.className = 'tdr-arrow-label'
    labelEl.textContent = label
    arrow.appendChild(labelEl)
  }
  return arrow
}

function renderSteps(source: HTMLElement): HTMLElement {
  const progress = firstAttr(source, ['p', 'progress'])
  const card = document.createElement('section')
  card.className = 'tdr-steps'
  copyAttributes(source, card, ['p', 'progress'])

  if (progress) {
    const pVal = Math.max(0, Math.min(100, Number.parseFloat(progress) || 0))
    const bar = document.createElement('div')
    bar.className = 'tdr-steps-progress'
    const fill = document.createElement('div')
    fill.className = 'tdr-steps-progress-fill'
    fill.style.width = `${pVal}%`
    bar.appendChild(fill)
    card.appendChild(bar)
  }

  const body = document.createElement('div')
  body.className = 'tdr-steps-body'
  moveChildren(source, body)
  card.appendChild(body)
  return card
}

function renderStep(source: HTMLElement): HTMLElement {
  const rawProgress = firstAttr(source, ['s', 'status', 'progress'], '')
  const s = state(rawProgress || 'info')
  const title = firstAttr(source, ['t', 'title'])
  const desc = firstAttr(source, ['d', 'desc'])
  const flag = firstAttr(source, ['f', 'flag'])
  const flagLabel = firstAttr(source, ['fl', 'flag-label'], flag.toUpperCase())

  const item = document.createElement('div')
  item.className = 'tdr-step'
  item.dataset.s = s
  copyAttributes(source, item, ['s', 'status', 'progress', 't', 'title', 'd', 'desc', 'f', 'flag', 'fl', 'flag-label'])

  const mark = document.createElement('span')
  mark.className = 'tdr-step-mark'
  if (s === 'done' || s === 'ok') mark.innerHTML = ICON.check
  else if (s === 'bad') mark.innerHTML = ICON.bad
  else if (s === 'warn') mark.innerHTML = ICON.warn
  else if (s === 'active') mark.innerHTML = ICON.stepActive
  else mark.innerHTML = ICON.stepTodo

  const body = document.createElement('div')
  body.className = 'tdr-step-body'
  const titleEl = document.createElement('div')
  titleEl.className = 'tdr-step-title'
  titleEl.textContent = title || source.textContent?.trim() || ''
  body.appendChild(titleEl)
  if (desc) {
    const descEl = document.createElement('div')
    descEl.className = 'tdr-step-desc'
    descEl.textContent = desc
    body.appendChild(descEl)
  }

  item.append(mark, body)

  if (flag) {
    const flagEl = document.createElement('span')
    flagEl.className = 'tdr-step-flag'
    flagEl.dataset.f = state(flag)
    flagEl.textContent = flagLabel || flag.toUpperCase()
    item.appendChild(flagEl)
  }

  return item
}

function renderCompare(source: HTMLElement): HTMLElement {
  // Two modes:
  //  1. classic pro/con — <cmp><pro>…</pro><con>…</con></cmp>
  //  2. dimension table — <cmp a="Plan A" b="Plan B">
  //       <dim t="latency" a="30ms" b="120ms" w="a"/>
  //       <dim t="cost" a="$$" b="$" w="b"/>
  //     </cmp>
  //  Mode is detected automatically by the presence of <dim> children.
  const wrap = document.createElement('section')
  wrap.className = 'tdr-compare'
  copyAttributes(source, wrap)

  const dims = takeChildren(source, 'dim, dimension')
  if (dims.length > 0) {
    wrap.classList.add('tdr-compare-dim')
    const aLabel = firstAttr(source, ['a', 'left']) || 'A'
    const bLabel = firstAttr(source, ['b', 'right']) || 'B'

    const head = document.createElement('div')
    head.className = 'tdr-compare-dim-head'
    const headDim = document.createElement('div'); headDim.className = 'tdr-compare-dim-col tdr-compare-dim-th'; headDim.textContent = ''
    const headA = document.createElement('div'); headA.className = 'tdr-compare-dim-col tdr-compare-dim-th'; headA.textContent = aLabel
    const headB = document.createElement('div'); headB.className = 'tdr-compare-dim-col tdr-compare-dim-th'; headB.textContent = bLabel
    head.append(headDim, headA, headB)
    wrap.appendChild(head)

    dims.forEach((d) => {
      const t = d.getAttribute('t') ?? d.getAttribute('title') ?? ''
      const av = d.getAttribute('a') ?? d.getAttribute('av') ?? ''
      const bv = d.getAttribute('b') ?? d.getAttribute('bv') ?? ''
      const winner = (d.getAttribute('w') ?? d.getAttribute('win') ?? '').toLowerCase()
      const row = document.createElement('div')
      row.className = 'tdr-compare-dim-row'
      const tEl = document.createElement('div'); tEl.className = 'tdr-compare-dim-col tdr-compare-dim-label'; tEl.textContent = t
      const aEl = document.createElement('div'); aEl.className = 'tdr-compare-dim-col tdr-compare-dim-val'; aEl.textContent = av
      const bEl = document.createElement('div'); bEl.className = 'tdr-compare-dim-col tdr-compare-dim-val'; bEl.textContent = bv
      if (winner === 'a') aEl.dataset.win = 'true'
      else if (winner === 'b') bEl.dataset.win = 'true'
      else if (winner === 'tie' || winner === '=') { aEl.dataset.win = 'tie'; bEl.dataset.win = 'tie' }
      row.append(tEl, aEl, bEl)
      wrap.appendChild(row)
    })
    return wrap
  }

  const proSrc = takeChild(source, 'pro')
  const conSrc = takeChild(source, 'con')

  const buildCol = (kind: 'pro' | 'con', src: HTMLElement | null, fallbackTitle: string) => {
    const col = document.createElement('div')
    col.className = 'tdr-compare-col'
    col.dataset.k = kind
    const title = src?.getAttribute('t') ?? src?.getAttribute('title') ?? fallbackTitle
    const titleEl = document.createElement('div')
    titleEl.className = 'tdr-compare-col-title'
    titleEl.textContent = title
    col.appendChild(titleEl)
    if (src) moveChildren(src, col)
    return col
  }

  wrap.appendChild(buildCol('pro', proSrc, '优势'))
  wrap.appendChild(buildCol('con', conSrc, '风险'))
  return wrap
}

function renderBars(source: HTMLElement): HTMLElement {
  const wrap = document.createElement('section')
  wrap.className = 'tdr-bars'
  copyAttributes(source, wrap)
  moveChildren(source, wrap)
  return wrap
}

function renderBar(source: HTMLElement): HTMLElement {
  const label = firstAttr(source, ['t', 'label'])
  const value = firstAttr(source, ['v', 'value'])
  const percent = Number.parseFloat(firstAttr(source, ['p', 'percent'], '0')) || 0
  const s = state(firstAttr(source, ['s', 'color'], 'info'))

  const row = document.createElement('div')
  row.className = 'tdr-bar'
  if (s !== 'info') row.dataset.s = s
  copyAttributes(source, row, ['t', 'label', 'v', 'value', 'p', 'percent', 's', 'color'])

  const labelEl = document.createElement('div')
  labelEl.className = 'tdr-bar-label'
  labelEl.textContent = label

  const track = document.createElement('div')
  track.className = 'tdr-bar-track'
  const fill = document.createElement('div')
  fill.className = 'tdr-bar-fill'
  fill.style.width = `${Math.max(0, Math.min(100, percent))}%`
  track.appendChild(fill)

  const valueEl = document.createElement('div')
  valueEl.className = 'tdr-bar-value'
  valueEl.textContent = value

  row.append(labelEl, track, valueEl)
  return row
}

function renderStackedBar(source: HTMLElement): HTMLElement {
  const wrap = document.createElement('section')
  wrap.className = 'tdr-stacked'
  copyAttributes(source, wrap)

  const track = document.createElement('div')
  track.className = 'tdr-stacked-track'

  const legend = document.createElement('div')
  legend.className = 'tdr-stacked-legend'

  const segs = takeChildren(source, 'seg, .tdr-stacked-seg-src')
  const legendItems = takeChildren(source, 'lg, legend-item, .tdr-stacked-legend-src')

  segs.forEach((seg) => {
    const p = Number.parseFloat(seg.getAttribute('p') || seg.getAttribute('percent') || '0') || 0
    const s = state(seg.getAttribute('s') || seg.getAttribute('color') || 'info')
    const segEl = document.createElement('div')
    segEl.className = 'tdr-stacked-seg'
    segEl.dataset.s = s
    segEl.style.width = `${Math.max(0, Math.min(100, p))}%`
    track.appendChild(segEl)
  })

  legendItems.forEach((item) => {
    const t = item.getAttribute('t') ?? item.getAttribute('label') ?? item.textContent?.trim() ?? ''
    const s = state(item.getAttribute('s') ?? item.getAttribute('color') ?? 'info')
    const li = document.createElement('div')
    li.className = 'tdr-stacked-legend-item'
    const dot = document.createElement('span')
    dot.className = 'tdr-stacked-legend-dot'
    if (s === 'ok') dot.style.background = 'var(--tdr-ok)'
    else if (s === 'warn') dot.style.background = 'var(--tdr-warn)'
    else if (s === 'bad') dot.style.background = 'var(--tdr-bad)'
    else if (s === 'note') dot.style.background = 'var(--tdr-note)'
    else if (s === 'muted') dot.style.background = 'var(--tdr-border)'
    else dot.style.background = 'var(--tdr-accent)'
    const labelEl = document.createElement('span')
    labelEl.textContent = t
    li.append(dot, labelEl)
    legend.appendChild(li)
  })

  wrap.appendChild(track)
  if (legendItems.length > 0) wrap.appendChild(legend)
  // Anything else inside is also appended after legend
  moveChildren(source, wrap)
  return wrap
}

function renderCode(source: HTMLElement): HTMLElement {
  const file = firstAttr(source, ['f', 'file'])
  const lang = firstAttr(source, ['l', 'lang'])
  const wrap = document.createElement('section')
  wrap.className = 'tdr-code'
  copyAttributes(source, wrap, ['f', 'file', 'l', 'lang'])
  if (file) {
    const head = document.createElement('div')
    head.className = 'tdr-code-head'
    head.textContent = file
    wrap.appendChild(head)
  }
  const body = document.createElement('div')
  moveChildren(source, body)
  ensureCodeBlock(body)
  // Infer lang from `file` header when not given (e.g. "package.json")
  const inferred = lang || (file.endsWith('.json') ? 'json' : file.endsWith('.ts') || file.endsWith('.tsx') ? 'ts' : file.endsWith('.js') ? 'js' : file.endsWith('.sql') ? 'sql' : '')
  if (inferred) highlightInPlace(body, inferred)
  addCopyButtons(body)
  Array.from(body.children).forEach((c) => wrap.appendChild(c))
  return wrap
}

function inferKvType(text: string): string {
  const t = text.trim()
  if (!t) return ''
  if (/^https?:\/\//.test(t)) return 'url'
  if (/^[A-Z_]{2,}$/.test(t) && t.length <= 24) return 'enum'
  if (/^[\d.,+\-%/× ]+(ms|s|m|h|d|kb|mb|gb|MB|KB|GB|%)?$/i.test(t) && /\d/.test(t)) return 'num'
  if (/^[a-z][\w.\-/]*\([^)]*\)$/.test(t) || /^[/.@#][\w./\-]+$/.test(t)) return 'code'
  return ''
}

function renderKv(source: HTMLElement): HTMLElement {
  // Upgraded: each <v> auto-classified into a type (url / num / enum / code) so the
  // CSS can give it a distinct visual treatment. Explicit `vk` attr overrides.
  const wrap = document.createElement('section')
  wrap.className = 'tdr-kv'
  copyAttributes(source, wrap)

  // Two ways to express: <kv><k>foo</k><v>bar</v><k>...</k><v>...</v></kv>
  //                or:  <kv><row k="foo" v="bar"></row><row .../></kv>
  const rows = takeChildren(source, 'row, kvrow')
  if (rows.length) {
    rows.forEach((r) => {
      const k = r.getAttribute('k') ?? r.getAttribute('key') ?? ''
      const v = r.getAttribute('v') ?? r.getAttribute('value') ?? r.textContent?.trim() ?? ''
      const kind = r.getAttribute('vk') ?? r.getAttribute('vtype') ?? inferKvType(v)
      const rowEl = document.createElement('div')
      rowEl.className = 'tdr-kv-row'
      const kEl = document.createElement('div'); kEl.className = 'tdr-kv-key'; kEl.textContent = k
      const vEl = document.createElement('div'); vEl.className = 'tdr-kv-val'
      if (kind) vEl.dataset.vk = kind
      if (kind === 'url') {
        const a = document.createElement('a')
        a.href = v
        a.target = '_blank'
        a.rel = 'noopener'
        a.textContent = v
        vEl.appendChild(a)
      } else {
        vEl.textContent = v
      }
      rowEl.append(kEl, vEl)
      wrap.appendChild(rowEl)
    })
    return wrap
  }

  // Child form: pairs of <k>/<v>
  const children = Array.from(source.children)
  for (let i = 0; i < children.length; i += 2) {
    const kEl = children[i] as HTMLElement
    const vEl = children[i + 1] as HTMLElement | undefined
    if (!kEl) break
    const row = document.createElement('div')
    row.className = 'tdr-kv-row'
    const kOut = document.createElement('div')
    kOut.className = 'tdr-kv-key'
    kOut.textContent = kEl.textContent?.trim() ?? ''
    const vOut = document.createElement('div')
    vOut.className = 'tdr-kv-val'
    if (vEl) {
      const explicit = vEl.getAttribute('vk') ?? vEl.getAttribute('vtype') ?? ''
      // Only infer when value is plain text (no inline elements)
      const onlyText = !vEl.firstElementChild
      const kind = explicit || (onlyText ? inferKvType(vEl.textContent ?? '') : '')
      if (kind) vOut.dataset.vk = kind
      while (vEl.firstChild) vOut.appendChild(vEl.firstChild)
    }
    row.append(kOut, vOut)
    wrap.appendChild(row)
  }
  source.textContent = ''
  return wrap
}

let tabCounter = 0
function renderTabs(source: HTMLElement): HTMLElement {
  const wrap = document.createElement('section')
  wrap.className = 'tdr-tabs'
  copyAttributes(source, wrap)
  const groupId = `tdr-tabs-${++tabCounter}`
  wrap.dataset.group = groupId

  const nav = document.createElement('div')
  nav.className = 'tdr-tabs-nav'
  nav.setAttribute('role', 'tablist')

  const tabs = takeChildren(source, 'tab')
  const panels: HTMLElement[] = []

  tabs.forEach((tab, i) => {
    const title = tab.getAttribute('t') ?? tab.getAttribute('title') ?? `Tab ${i + 1}`
    const id = `${groupId}-${i}`

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'tdr-tab-btn'
    btn.dataset.a = 'tab'
    btn.dataset.to = id
    btn.setAttribute('role', 'tab')
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false')
    btn.textContent = title
    nav.appendChild(btn)

    const panel = document.createElement('div')
    panel.className = 'tdr-tab-panel'
    panel.id = id
    panel.setAttribute('role', 'tabpanel')
    panel.dataset.active = i === 0 ? 'true' : 'false'
    moveChildren(tab, panel)
    panels.push(panel)
  })

  wrap.appendChild(nav)
  panels.forEach((p) => wrap.appendChild(p))
  return wrap
}

function renderChecklist(source: HTMLElement): HTMLElement {
  const wrap = document.createElement('section')
  wrap.className = 'tdr-checklist'
  copyAttributes(source, wrap)
  moveChildren(source, wrap)
  return wrap
}

function renderCheckItem(source: HTMLElement): HTMLElement {
  const checked = hasAnyAttr(source, ['k', 'checked', 'done'])
  const row = document.createElement('div')
  row.className = 'tdr-check'
  row.dataset.k = checked ? 'true' : 'false'
  copyAttributes(source, row, ['k', 'checked', 'done'])
  const mark = document.createElement('span')
  mark.className = 'tdr-check-mark'
  if (checked) mark.innerHTML = ICON.check
  const body = document.createElement('div')
  body.className = 'tdr-check-body'
  moveChildren(source, body)
  row.append(mark, body)
  return row
}

function renderGrid(source: HTMLElement): HTMLElement {
  const cols = firstAttr(source, ['c', 'cols'], '2')
  const wrap = document.createElement('section')
  wrap.className = 'tdr-grid'
  wrap.style.setProperty('--tdr-grid-cols', String(Number.parseInt(cols, 10) || 2))
  copyAttributes(source, wrap, ['c', 'cols'])
  moveChildren(source, wrap)
  return wrap
}

function renderCard(source: HTMLElement): HTMLElement {
  const title = firstAttr(source, ['t', 'title'])
  const footEl = takeChild(source, 'foot, footer')
  const wrap = document.createElement('section')
  wrap.className = 'tdr-card'
  copyAttributes(source, wrap, ['t', 'title'])

  if (title) {
    const titleEl = document.createElement('div')
    titleEl.className = 'tdr-card-title'
    titleEl.textContent = title
    wrap.appendChild(titleEl)
  }
  const body = document.createElement('div')
  body.className = 'tdr-card-body'
  moveChildren(source, body)
  wrap.appendChild(body)
  if (footEl) {
    const foot = document.createElement('div')
    foot.className = 'tdr-card-foot'
    moveChildren(footEl, foot)
    wrap.appendChild(foot)
  }
  return wrap
}

function renderFiles(source: HTMLElement): HTMLElement {
  const wrap = document.createElement('section')
  wrap.className = 'tdr-files'
  copyAttributes(source, wrap)
  moveChildren(source, wrap)
  return wrap
}

function renderFileGroup(source: HTMLElement): HTMLElement {
  const module = firstAttr(source, ['m', 'module'])
  const wrap = document.createElement('div')
  wrap.className = 'tdr-filegroup'
  copyAttributes(source, wrap, ['m', 'module'])
  if (module) {
    const head = document.createElement('div')
    head.className = 'tdr-filegroup-head'
    head.textContent = module
    wrap.appendChild(head)
  }
  moveChildren(source, wrap)
  return wrap
}

function renderFile(source: HTMLElement): HTMLElement {
  const path = firstAttr(source, ['p', 'path'])
  const status = (firstAttr(source, ['s', 'status'], '').toLowerCase()) || 'modified'
  const why = firstAttr(source, ['why', 'purpose'])
  const row = document.createElement('div')
  row.className = 'tdr-file'
  copyAttributes(source, row, ['p', 'path', 's', 'status', 'why', 'purpose'])
  const statusEl = document.createElement('span')
  statusEl.className = 'tdr-file-status'
  statusEl.dataset.s = status
  statusEl.textContent = status
  const pathEl = document.createElement('span')
  pathEl.className = 'tdr-file-path'
  pathEl.textContent = path
  const whyEl = document.createElement('span')
  whyEl.className = 'tdr-file-why'
  whyEl.textContent = why
  row.append(statusEl, pathEl, whyEl)
  return row
}

// ─── batch-2 renderers: semantic/comparison components ──────────────────────

function renderContrast(source: HTMLElement): HTMLElement {
  // <contrast w="session" d="...">
  //   <l c="ctx left">meaning left</l>
  //   <r c="ctx right">meaning right</r>
  // </contrast>
  const word = firstAttr(source, ['w', 'word'])
  const desc = firstAttr(source, ['d', 'desc'])
  const leftSrc = takeChild(source, 'l, left')
  const rightSrc = takeChild(source, 'r, right')

  const wrap = document.createElement('section')
  wrap.className = 'tdr-contrast'
  copyAttributes(source, wrap, ['w', 'word', 'd', 'desc'])

  if (word || desc) {
    const head = document.createElement('div')
    head.className = 'tdr-contrast-head'
    if (word) {
      const wEl = document.createElement('span')
      wEl.className = 'tdr-contrast-word'
      wEl.textContent = word
      head.appendChild(wEl)
    }
    if (desc) {
      const dEl = document.createElement('span')
      dEl.className = 'tdr-contrast-desc'
      dEl.textContent = desc
      head.appendChild(dEl)
    }
    wrap.appendChild(head)
  }

  const cols = document.createElement('div')
  cols.className = 'tdr-contrast-cols'
  const buildSide = (src: HTMLElement | null, side: 'left' | 'right') => {
    const col = document.createElement('div')
    col.className = 'tdr-contrast-col'
    col.dataset.k = side
    if (!src) return col
    const ctx = src.getAttribute('c') ?? src.getAttribute('context') ?? ''
    if (ctx) {
      const ctxEl = document.createElement('div')
      ctxEl.className = 'tdr-contrast-ctx'
      ctxEl.textContent = ctx
      col.appendChild(ctxEl)
    }
    const meaning = document.createElement('div')
    meaning.className = 'tdr-contrast-meaning'
    moveChildren(src, meaning)
    col.appendChild(meaning)
    return col
  }
  cols.appendChild(buildSide(leftSrc, 'left'))
  cols.appendChild(buildSide(rightSrc, 'right'))
  wrap.appendChild(cols)
  return wrap
}

function renderAnalogy(source: HTMLElement): HTMLElement {
  // <analogy s="门禁卡" sd="..." t="JWT Token" td="..." why="...">
  // Or with children: <src d="...">门禁卡</src><tgt d="...">JWT</tgt><why>...</why>
  const sourceTerm = firstAttr(source, ['s', 'source'])
  const sourceDesc = firstAttr(source, ['sd', 'source-desc'])
  const targetTerm = firstAttr(source, ['t', 'target'])
  const targetDesc = firstAttr(source, ['td', 'target-desc'])
  const because = firstAttr(source, ['why', 'because'])

  const wrap = document.createElement('section')
  wrap.className = 'tdr-analogy'
  copyAttributes(source, wrap, ['s', 'source', 'sd', 'source-desc', 't', 'target', 'td', 'target-desc', 'why', 'because'])

  const buildSide = (term: string, desc: string, side: 'source' | 'target') => {
    const col = document.createElement('div')
    col.className = 'tdr-analogy-side'
    col.dataset.k = side
    const t = document.createElement('div')
    t.className = 'tdr-analogy-term'
    t.textContent = term
    col.appendChild(t)
    if (desc) {
      const d = document.createElement('div')
      d.className = 'tdr-analogy-desc'
      d.textContent = desc
      col.appendChild(d)
    }
    return col
  }

  const cols = document.createElement('div')
  cols.className = 'tdr-analogy-cols'
  cols.appendChild(buildSide(sourceTerm, sourceDesc, 'source'))
  const link = document.createElement('div')
  link.className = 'tdr-analogy-link'
  link.textContent = '≈'
  cols.appendChild(link)
  cols.appendChild(buildSide(targetTerm, targetDesc, 'target'))
  wrap.appendChild(cols)

  if (because) {
    const reason = document.createElement('div')
    reason.className = 'tdr-analogy-because'
    reason.textContent = because
    wrap.appendChild(reason)
  }
  return wrap
}

function renderMyth(source: HTMLElement): HTMLElement {
  // <myth>
  //   <wrong>错误说法</wrong>
  //   <right>正确说法</right>
  // </myth>
  const wrongSrc = takeChild(source, 'wrong, mistake, m')
  const rightSrc = takeChild(source, 'right, truth, t')

  const wrap = document.createElement('section')
  wrap.className = 'tdr-myth'
  copyAttributes(source, wrap)

  const buildRow = (src: HTMLElement | null, kind: 'wrong' | 'right', label: string) => {
    const row = document.createElement('div')
    row.className = 'tdr-myth-row'
    row.dataset.k = kind
    const lbl = document.createElement('span')
    lbl.className = 'tdr-myth-label'
    lbl.textContent = label
    const body = document.createElement('div')
    body.className = 'tdr-myth-body'
    if (src) moveChildren(src, body)
    row.append(lbl, body)
    return row
  }

  wrap.appendChild(buildRow(wrongSrc, 'wrong', '误解'))
  wrap.appendChild(buildRow(rightSrc, 'right', '事实'))
  return wrap
}

function renderBranch(source: HTMLElement): HTMLElement {
  // <branch root="...">
  //   <bi cond="无 header" s="bad" out="返回 401 Missing Token">
  //     请求没有 Authorization header
  //   </bi>
  //   <bi cond="有 header" out="进入签名校验">
  //     Authorization: Bearer eyJ...
  //     <kids>
  //       <bi ...>...</bi>
  //     </kids>
  //   </bi>
  // </branch>
  //
  // Renders as a vertical stack of independent CASE CARDS — each is a white
  // card with a 4px status-coloured left tape, an in-card label chip, a path
  // description, and an outcome line. Cases are PARALLEL POSSIBILITIES, not
  // sequential steps; no connecting tree lines (they suggest sequence and
  // were unreadable in practice). Nested children indent + render the same
  // shape, so the cause→effect chain reads bottom-down.
  const root = firstAttr(source, ['r', 'root'])
  const wrap = document.createElement('section')
  wrap.className = 'tdr-branch'
  copyAttributes(source, wrap, ['r', 'root'])

  if (root) {
    const head = document.createElement('div')
    head.className = 'tdr-branch-root'
    head.textContent = root
    wrap.appendChild(head)
  }
  const cases = document.createElement('div')
  cases.className = 'tdr-branch-cases'
  moveChildren(source, cases)
  wrap.appendChild(cases)
  return wrap
}

function renderBranchItem(source: HTMLElement): HTMLElement {
  const cond = firstAttr(source, ['c', 'cond'])
  const out = firstAttr(source, ['out', 'outcome'])
  const s = state(firstAttr(source, ['s', 'status'], 'info'))
  const kidsSrc = takeChild(source, 'kids, children')

  const item = document.createElement('div')
  item.className = 'tdr-bcase'
  item.dataset.s = s
  copyAttributes(source, item, ['c', 'cond', 'out', 'outcome', 's', 'status'])

  if (cond) {
    const head = document.createElement('div')
    head.className = 'tdr-bcase-head'
    const condEl = document.createElement('span')
    condEl.className = 'tdr-bcase-cond'
    condEl.textContent = cond
    head.appendChild(condEl)
    item.appendChild(head)
  }

  const desc = document.createElement('div')
  desc.className = 'tdr-bcase-desc'
  // Move non-element text children into desc
  const remaining: Node[] = []
  for (const n of Array.from(source.childNodes)) remaining.push(n)
  remaining.forEach((n) => desc.appendChild(n))
  if (desc.childNodes.length > 0) item.appendChild(desc)

  if (out) {
    const outRow = document.createElement('div')
    outRow.className = 'tdr-bcase-out'
    const arrow = document.createElement('span')
    arrow.className = 'tdr-bcase-out-arrow'
    arrow.textContent = '→'
    const outEl = document.createElement('span')
    outEl.className = 'tdr-bcase-out-text'
    outEl.textContent = out
    outRow.append(arrow, outEl)
    item.appendChild(outRow)
  }

  if (kidsSrc) {
    const kids = document.createElement('div')
    kids.className = 'tdr-bcase-kids'
    moveChildren(kidsSrc, kids)
    item.appendChild(kids)
  }
  return item
}

function renderTracks(source: HTMLElement): HTMLElement {
  const wrap = document.createElement('section')
  wrap.className = 'tdr-tracks'
  copyAttributes(source, wrap)
  moveChildren(source, wrap)
  return wrap
}

function renderTrack(source: HTMLElement): HTMLElement {
  const title = firstAttr(source, ['t', 'title'])
  const desc = firstAttr(source, ['d', 'desc'])
  const flag = firstAttr(source, ['f', 'flag', 's', 'status'])
  const s = state(flag || 'info')

  const card = document.createElement('section')
  card.className = 'tdr-track'
  card.dataset.s = s
  copyAttributes(source, card, ['t', 'title', 'd', 'desc', 'f', 'flag', 's', 'status'])

  const head = document.createElement('div')
  head.className = 'tdr-track-head'
  const titleEl = document.createElement('span')
  titleEl.className = 'tdr-track-title'
  titleEl.textContent = title
  head.appendChild(titleEl)
  if (flag) {
    const flagEl = document.createElement('span')
    flagEl.className = 'tdr-track-flag'
    flagEl.dataset.s = s
    flagEl.textContent = flag
    head.appendChild(flagEl)
  }
  card.appendChild(head)

  const body = document.createElement('div')
  body.className = 'tdr-track-body'
  if (desc) {
    const descEl = document.createElement('p')
    descEl.className = 'tdr-track-desc'
    descEl.textContent = desc
    body.appendChild(descEl)
  }
  moveChildren(source, body)
  card.appendChild(body)
  return card
}

function renderFinding(source: HTMLElement): HTMLElement {
  // <finding t="title">summary <detail>...</detail></finding>
  const title = firstAttr(source, ['t', 'title'])
  const detailSrc = takeChild(source, 'detail, d')

  const wrap = document.createElement('div')
  wrap.className = 'tdr-finding'
  copyAttributes(source, wrap, ['t', 'title'])

  if (title) {
    const head = document.createElement('div')
    head.className = 'tdr-finding-title'
    head.textContent = title
    wrap.appendChild(head)
  }
  const summary = document.createElement('div')
  summary.className = 'tdr-finding-summary'
  moveChildren(source, summary)
  wrap.appendChild(summary)
  if (detailSrc) {
    const detail = document.createElement('div')
    detail.className = 'tdr-finding-detail'
    moveChildren(detailSrc, detail)
    wrap.appendChild(detail)
  }
  return wrap
}

// ─── batch 3: divider / evidence / term / timeline / risk / lead ──────────

function renderLead(source: HTMLElement): HTMLElement {
  // Opening paragraph with display-font drop cap. Use sparingly — typically the
  // first paragraph after H1 or after a major H2.
  const p = document.createElement('p')
  p.className = 'tdr-lead'
  copyAttributes(source, p)
  moveChildren(source, p)
  return p
}

function renderDivider(source: HTMLElement): HTMLElement {
  const label = firstAttr(source, ['t', 'label'], source.textContent?.trim() ?? '')
  const hr = document.createElement('div')
  hr.className = 'tdr-divider'
  copyAttributes(source, hr, ['t', 'label'])
  if (label) {
    hr.dataset.labeled = 'true'
    const span = document.createElement('span')
    span.className = 'tdr-divider-label'
    span.textContent = label
    hr.appendChild(span)
  }
  return hr
}

function renderEvidence(source: HTMLElement): HTMLElement {
  // <evidence t="conclusion text">
  //   <ei>reason 1</ei>
  //   <ei>reason 2</ei>
  // </evidence>
  // Or with explicit <head>/<concl> for rich markup.
  const concl = firstAttr(source, ['t', 'conclusion', 'concl'])
  const s = state(firstAttr(source, ['s', 'status'], 'ok'))
  const conclSrc = takeChild(source, 'concl, conclusion, head')

  const card = document.createElement('section')
  card.className = 'tdr-evidence'
  card.dataset.s = s
  copyAttributes(source, card, ['t', 'conclusion', 'concl', 's', 'status'])

  const head = document.createElement('div')
  head.className = 'tdr-evidence-head'
  const mark = document.createElement('span')
  mark.className = 'tdr-evidence-mark'
  mark.innerHTML = ICON.check
  head.appendChild(mark)
  const text = document.createElement('div')
  text.className = 'tdr-evidence-concl'
  if (conclSrc) moveChildren(conclSrc, text)
  else text.textContent = concl
  head.appendChild(text)
  card.appendChild(head)

  const list = document.createElement('div')
  list.className = 'tdr-evidence-list'
  moveChildren(source, list)
  card.appendChild(list)
  return card
}

function renderEvidenceItem(source: HTMLElement): HTMLElement {
  const item = document.createElement('div')
  item.className = 'tdr-ei'
  copyAttributes(source, item)
  moveChildren(source, item)
  return item
}

function renderTerm(source: HTMLElement): HTMLElement {
  // <term w="WAL" d="Write-Ahead Log。先写日志再改数据页">WAL</term>
  // first attr renders a small dot marker for first-occurrence introductions.
  const word = firstAttr(source, ['w', 'word'])
  const def = firstAttr(source, ['d', 'def', 'definition'])
  const first = hasAnyAttr(source, ['first', 'f'])
  const text = source.textContent?.trim() || word

  const el = document.createElement('span')
  el.className = 'tdr-term'
  if (first) el.dataset.first = 'true'
  copyAttributes(source, el, ['w', 'word', 'd', 'def', 'definition', 'first', 'f'])
  el.setAttribute('tabindex', '0')
  el.setAttribute('role', 'button')
  el.setAttribute('aria-label', `${word}: ${def}`)

  const label = document.createElement('span')
  label.className = 'tdr-term-label'
  label.textContent = text
  el.appendChild(label)

  // Tooltip — visible on hover or focus, positioned by CSS.
  const tip = document.createElement('span')
  tip.className = 'tdr-term-tip'
  tip.setAttribute('role', 'tooltip')
  const tipHead = document.createElement('span')
  tipHead.className = 'tdr-term-tip-word'
  tipHead.textContent = word
  const tipDef = document.createElement('span')
  tipDef.className = 'tdr-term-tip-def'
  tipDef.textContent = def
  tip.append(tipHead, tipDef)
  el.appendChild(tip)
  return el
}

function renderTimeline(source: HTMLElement): HTMLElement {
  // <timeline>
  //   <ev d="2025-03-14" t="Auth v1 launched" s="ok">…</ev>
  //   <ev d="2025-09-02" t="Mobile SDK adopts JWT" s="active">…</ev>
  // </timeline>
  const wrap = document.createElement('section')
  wrap.className = 'tdr-timeline'
  copyAttributes(source, wrap)
  const body = document.createElement('div')
  body.className = 'tdr-timeline-body'
  moveChildren(source, body)
  wrap.appendChild(body)
  return wrap
}

function renderEvent(source: HTMLElement): HTMLElement {
  const date = firstAttr(source, ['d', 'date', 'when'])
  const title = firstAttr(source, ['t', 'title'])
  const s = state(firstAttr(source, ['s', 'status'], 'info'))

  const item = document.createElement('div')
  item.className = 'tdr-ev'
  item.dataset.s = s
  copyAttributes(source, item, ['d', 'date', 'when', 't', 'title', 's', 'status'])

  const dot = document.createElement('span')
  dot.className = 'tdr-ev-dot'
  item.appendChild(dot)

  const dateEl = document.createElement('div')
  dateEl.className = 'tdr-ev-date'
  dateEl.textContent = date
  item.appendChild(dateEl)

  const body = document.createElement('div')
  body.className = 'tdr-ev-body'
  if (title) {
    const titleEl = document.createElement('div')
    titleEl.className = 'tdr-ev-title'
    titleEl.textContent = title
    body.appendChild(titleEl)
  }
  const desc = document.createElement('div')
  desc.className = 'tdr-ev-desc'
  moveChildren(source, desc)
  if (desc.childNodes.length > 0) body.appendChild(desc)
  item.appendChild(body)
  return item
}

function renderRisk(source: HTMLElement): HTMLElement {
  // <risk>
  //   <r t="Token leak" sev="high" lik="low" mit="HttpOnly cookie + short TTL"/>
  //   <r t="Refresh storm" sev="med"  lik="med" mit="Stagger + jitter"/>
  // </risk>
  const wrap = document.createElement('section')
  wrap.className = 'tdr-risk'
  copyAttributes(source, wrap)

  const head = document.createElement('div')
  head.className = 'tdr-risk-head'
  const hh = ['', '严重度', '可能性', '缓解']
  hh.forEach((h) => {
    const c = document.createElement('div')
    c.className = 'tdr-risk-col tdr-risk-th'
    c.textContent = h
    head.appendChild(c)
  })
  wrap.appendChild(head)

  const items = takeChildren(source, 'r, risk-item, ri')
  items.forEach((r) => {
    const title = r.getAttribute('t') ?? r.getAttribute('title') ?? r.textContent?.trim() ?? ''
    const sev = (r.getAttribute('sev') ?? r.getAttribute('severity') ?? 'med').toLowerCase()
    const lik = (r.getAttribute('lik') ?? r.getAttribute('likelihood') ?? 'med').toLowerCase()
    const mit = r.getAttribute('mit') ?? r.getAttribute('mitigation') ?? ''
    const sevState = sev === 'high' || sev === 'h' ? 'bad' : sev === 'low' || sev === 'l' ? 'ok' : 'warn'
    const likState = lik === 'high' || lik === 'h' ? 'bad' : lik === 'low' || lik === 'l' ? 'ok' : 'warn'
    const sevLabel = sev === 'high' || sev === 'h' ? '高' : sev === 'low' || sev === 'l' ? '低' : '中'
    const likLabel = lik === 'high' || lik === 'h' ? '高' : lik === 'low' || lik === 'l' ? '低' : '中'
    // Combined score → row priority color
    const score = (sevState === 'bad' ? 2 : sevState === 'warn' ? 1 : 0) + (likState === 'bad' ? 2 : likState === 'warn' ? 1 : 0)
    const rowState = score >= 3 ? 'bad' : score >= 2 ? 'warn' : 'ok'

    const row = document.createElement('div')
    row.className = 'tdr-risk-row'
    row.dataset.s = rowState

    const tc = document.createElement('div'); tc.className = 'tdr-risk-col tdr-risk-title'; tc.textContent = title
    const sc = document.createElement('div'); sc.className = 'tdr-risk-col'
    const sb = document.createElement('span'); sb.className = 'tdr-risk-pill'; sb.dataset.s = sevState; sb.textContent = sevLabel
    sc.appendChild(sb)
    const lc = document.createElement('div'); lc.className = 'tdr-risk-col'
    const lb = document.createElement('span'); lb.className = 'tdr-risk-pill'; lb.dataset.s = likState; lb.textContent = likLabel
    lc.appendChild(lb)
    const mc = document.createElement('div'); mc.className = 'tdr-risk-col tdr-risk-mit'; mc.textContent = mit
    row.append(tc, sc, lc, mc)
    wrap.appendChild(row)
  })
  return wrap
}

// ─── registration ───────────────────────────────────────────────────────────

function registerDefaults() {
  if (renderers.size === 0) {
    // Core (v1, preserved)
    renderers.set('d', renderDecision)
    renderers.set('decision', renderDecision)
    renderers.set('call', renderCallout)
    renderers.set('callout', renderCallout)
    renderers.set('c', renderCollapse)
    renderers.set('collapse', renderCollapse)
    renderers.set('src', renderSource)
    renderers.set('ref', renderRef)
    renderers.set('btn', renderButton)
    renderers.set('x', renderInlineBadge)

    // Metrics
    renderers.set('m', renderMetric)
    renderers.set('metric', renderMetric)
    renderers.set('ms', renderMetrics)
    renderers.set('metrics', renderMetrics)

    // Flow
    renderers.set('flow', renderFlow)
    renderers.set('n', renderNode)
    renderers.set('node', renderNode)
    renderers.set('arr', renderArrow)
    renderers.set('arrow', renderArrow)

    // Steps
    renderers.set('steps', renderSteps)
    renderers.set('step', renderStep)

    // Comparisons / charts
    renderers.set('cmp', renderCompare)
    renderers.set('compare', renderCompare)
    renderers.set('bars', renderBars)
    renderers.set('bar', renderBar)
    renderers.set('sb', renderStackedBar)
    renderers.set('stacked', renderStackedBar)

    // Code & data
    renderers.set('cb', renderCode)
    renderers.set('kv', renderKv)
    renderers.set('tabs', renderTabs)
    renderers.set('chk', renderChecklist)
    renderers.set('checklist', renderChecklist)
    renderers.set('ck', renderCheckItem)

    // Grid / cards / files
    renderers.set('grid', renderGrid)
    renderers.set('card', renderCard)
    renderers.set('files', renderFiles)
    renderers.set('fg', renderFileGroup)
    renderers.set('f', renderFile)

    // Semantic compare/explanation/decision-tree/multi-track-review
    renderers.set('contrast', renderContrast)
    renderers.set('analogy', renderAnalogy)
    renderers.set('myth', renderMyth)
    renderers.set('branch', renderBranch)
    renderers.set('bi', renderBranchItem)
    renderers.set('tracks', renderTracks)
    // Note: cannot use <track> as a tag name — HTML treats it as a void element
    // (used by <video>) and will auto-close it, kicking children out.
    renderers.set('tk', renderTrack)
    renderers.set('finding', renderFinding)

    // Batch 3: divider / evidence / term / timeline / risk / lead
    renderers.set('lead', renderLead)
    renderers.set('divider', renderDivider)
    renderers.set('hr2', renderDivider)
    renderers.set('evidence', renderEvidence)
    renderers.set('ei', renderEvidenceItem)
    renderers.set('term', renderTerm)
    renderers.set('timeline', renderTimeline)
    renderers.set('ev', renderEvent)
    renderers.set('event', renderEvent)
    renderers.set('risk', renderRisk)
  }

  if (actions.size === 0) {
    actions.set('jump', ({ target }) => {
      if (!target) return
      openDetailsChain(target)
      target.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
      target.classList.add('tdr-focus')
      window.setTimeout(() => target.classList.remove('tdr-focus'), 1200)
    })
    actions.set('open', ({ target }) => {
      openDetailsChain(target)
    })
    actions.set('close', ({ target }) => {
      if (target instanceof HTMLDetailsElement) target.open = false
    })
    actions.set('toggle', ({ target }) => {
      if (target instanceof HTMLDetailsElement) target.open = !target.open
    })
    actions.set('copy', async ({ source, target }) => {
      const base = target ?? source.closest('pre') ?? source
      const text = base.querySelector('code')?.textContent ?? base.textContent ?? ''
      try { await navigator.clipboard?.writeText(text.trim()) } catch { /* ignore */ }
      if (source.classList.contains('tdr-copy')) {
        const originalHtml = source.innerHTML
        source.innerHTML = ICON.check
        source.classList.add('tdr-copy-done')
        window.setTimeout(() => {
          source.innerHTML = originalHtml
          source.classList.remove('tdr-copy-done')
        }, 1200)
      } else {
        const original = source.textContent
        source.textContent = 'copied'
        window.setTimeout(() => { source.textContent = original }, 1200)
      }
    })
    actions.set('theme', ({ source }) => {
      const next = firstAttr(source, ['to', 'v', 'theme'], 'auto') as Theme
      setTheme(next)
    })
    actions.set('archetype', ({ source }) => {
      const next = firstAttr(source, ['to', 'v', 'archetype'], DEFAULT_ARCHETYPE)
      setArchetype(next)
    })
    actions.set('tab', ({ source, target }) => {
      if (!target) return
      const tabs = target.closest('.tdr-tabs')
      if (!tabs) return
      tabs.querySelectorAll('.tdr-tab-btn').forEach((btn) => {
        btn.setAttribute('aria-selected', btn === source ? 'true' : 'false')
      })
      tabs.querySelectorAll('.tdr-tab-panel').forEach((panel) => {
        const el = panel as HTMLElement
        el.dataset.active = panel === target ? 'true' : 'false'
      })
    })
    actions.set('emit', ({ action, source, target }) => {
      source.dispatchEvent(new CustomEvent('talon-doc:action', {
        bubbles: true,
        detail: { action, source, target },
      }))
    })
  }
}

function injectFonts(archetype: string) {
  // Web fonts shipped as a <link rel="stylesheet"> instead of @import — when
  // the runtime CSS is injected via <style>.textContent, Chrome's @import
  // fetch is unreliable. <link> always fires the request.
  if (typeof document === 'undefined') return
  const entry = ARCHETYPE_FONT_URLS[archetype]
  if (!entry) return
  const urls = Array.isArray(entry) ? entry : [entry]
  urls.forEach((url, i) => {
    const id = `${FONT_LINK_ID}-${archetype}-${i}`
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = url
    document.head.appendChild(link)
  })
}

function injectStyles(archetype: string) {
  let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = STYLE_ID
    document.head.appendChild(styleEl)
  }
  // Inject all registered archetypes + base. Switching archetypes is a data-archetype attr swap.
  const archetypeBundle = Array.from(archetypeCss.values()).join('\n')
  styleEl.textContent = archetypeBundle + '\n' + BASE_CSS
  // Each archetype owns its web font set — load it once per archetype.
  for (const name of archetypeCss.keys()) injectFonts(name)
  injectFonts(archetype)
}
function enhance(root: ParentNode) {
  // Multiple passes — newly created nodes (e.g. inside <tabs>) may contain renderable tags.
  for (let pass = 0; pass < 3; pass++) {
    let changed = false
    for (const [tag, renderer] of renderers) {
      root.querySelectorAll(tag).forEach((node) => {
        const source = node as HTMLElement
        if (source.dataset.tdrMounted === 'true') return
        replace(source, renderer(source, runtime))
        changed = true
      })
    }
    if (!changed) break
  }
}

// ─── reveal: entrance animations for animated archetypes ──────────────────
//
// For archetypes that opt into entrance animations (currently just
// editorial-longform), we mark a curated set of top-level elements with
// data-tdr-reveal="" and flip them to data-tdr-reveal="in" the first time they
// intersect the viewport. The CSS owns the actual animation; the runtime only
// handles state. We fire once, then unobserve.

const REVEAL_SELECTORS = [
  '.tdr-doc > h1',
  '.tdr-doc > h2',
  '.tdr-doc > h3',
  '.tdr-doc > h4',
  '.tdr-doc > p',
  '.tdr-doc > .tdr-subtitle',
  '.tdr-doc > .tdr-lead',
  '.tdr-doc > .tdr-decision',
  '.tdr-doc > .tdr-callout',
  '.tdr-doc > .tdr-evidence',
  '.tdr-doc > .tdr-source',
  '.tdr-doc > .tdr-code',
  '.tdr-doc > .tdr-metrics',
  '.tdr-doc > .tdr-flow',
  '.tdr-doc > .tdr-steps',
  '.tdr-doc > .tdr-compare',
  '.tdr-doc > .tdr-bars',
  '.tdr-doc > .tdr-stacked',
  '.tdr-doc > .tdr-kv',
  '.tdr-doc > .tdr-tabs',
  '.tdr-doc > .tdr-checklist',
  '.tdr-doc > .tdr-grid',
  '.tdr-doc > .tdr-files',
  '.tdr-doc > .tdr-contrast',
  '.tdr-doc > .tdr-analogy',
  '.tdr-doc > .tdr-myth',
  '.tdr-doc > .tdr-branch',
  '.tdr-doc > .tdr-tracks',
  '.tdr-doc > .tdr-timeline',
  '.tdr-doc > .tdr-risk',
  '.tdr-doc > .tdr-divider',
  '.tdr-doc > hr',
].join(',')

function setupReveal(root: ParentNode) {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return
  // Respect reduced motion — mark everything 'in' up-front and skip the observer.
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

  // Index timeline events so their dots can stagger via CSS --tdr-ev-i.
  root.querySelectorAll('.tdr-timeline').forEach((tl) => {
    Array.from(tl.querySelectorAll('.tdr-ev')).forEach((ev, i) => {
      ;(ev as HTMLElement).style.setProperty('--tdr-ev-i', String(i))
    })
  })

  const targets = Array.from(root.querySelectorAll(REVEAL_SELECTORS)) as HTMLElement[]
  if (targets.length === 0) return

  if (reduced) {
    targets.forEach((el) => { el.dataset.tdrReveal = 'in' })
    return
  }

  targets.forEach((el) => {
    if (el.dataset.tdrReveal == null) el.dataset.tdrReveal = ''
  })

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          el.dataset.tdrReveal = 'in'
          observer.unobserve(el)
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
  )
  targets.forEach((el) => {
    if (el.dataset.tdrReveal !== 'in') observer.observe(el)
  })
}

function teardownReveal(root: ParentNode) {
  // For archetypes that don't animate, strip the attribute so nothing is hidden.
  ;(root.querySelectorAll?.('[data-tdr-reveal]') ?? []).forEach((el) => {
    delete (el as HTMLElement).dataset.tdrReveal
  })
}

function bindActions(root: ParentNode) {
  if (mountedRoots.has(root)) return
  root.addEventListener('click', (event) => {
    const start = event.target as Element | null
    const source = start?.closest<HTMLElement>('[data-a], [a]')
    if (!source) return

    const action = firstAttr(source, ['data-a', 'a'])
    if (!action) return

    const targetId = firstAttr(source, ['data-to', 'to']).replace(/^#/, '')
    const target = targetId ? document.getElementById(targetId) : null
    const handler = actions.get(action)
    if (!handler) return

    event.preventDefault()
    void handler({ action, source, target, runtime })
  })
  mountedRoots.add(root)
}

export function mount(root: ParentNode = document.body, options: MountOptions = {}) {
  registerDefaults()

  const rootElement = root instanceof HTMLElement ? root : document.body
  if (options.autoClass !== false) rootElement.classList.add('tdr-root')

  // Resolve archetype: option > existing data-archetype on root/html > default
  const requested = options.archetype
    ?? rootElement.getAttribute('data-archetype')
    ?? document.documentElement.getAttribute('data-archetype')
    ?? DEFAULT_ARCHETYPE
  setArchetype(requested, { skipInject: true })

  if (options.injectStyles !== false) injectStyles(activeArchetype)

  enhance(root)
  bindActions(root)

  if (ANIMATED_ARCHETYPES.has(activeArchetype)) setupReveal(root)
  else teardownReveal(root)
}

export function setTheme(theme: Theme) {
  if (theme === 'auto') {
    document.documentElement.removeAttribute('data-tdr-theme')
    document.documentElement.removeAttribute('data-mode')
  } else {
    document.documentElement.setAttribute('data-tdr-theme', theme)
    document.documentElement.setAttribute('data-mode', theme)
  }
}

export function setArchetype(archetype: Archetype, options: { skipInject?: boolean } = {}) {
  activeArchetype = archetype
  // Set archetype + theme attrs only on the documentElement so cascade is unambiguous.
  // Putting data-archetype on child .tdr-root elements would re-apply light tokens and
  // shadow the dark overrides set on <html>.
  document.documentElement.setAttribute('data-archetype', archetype)
  if (!options.skipInject) injectStyles(archetype)
  // Toggle entrance reveal for any already-mounted roots when the archetype changes.
  if (typeof document !== 'undefined') {
    const roots = document.querySelectorAll('.tdr-root')
    roots.forEach((root) => {
      if (ANIMATED_ARCHETYPES.has(archetype)) setupReveal(root as ParentNode)
      else teardownReveal(root as ParentNode)
    })
  }
}

export function registerArchetype(name: string, css: string) {
  archetypeCss.set(name, css)
  // If currently active is this archetype, re-inject
  if (activeArchetype === name && document.getElementById(STYLE_ID)) injectStyles(name)
}

export function registerAction(name: string, handler: ActionHandler) {
  registerDefaults()
  actions.set(name, handler)
}

export function registerRenderer(tag: string, renderer: Renderer) {
  registerDefaults()
  renderers.set(tag, renderer)
}

export const runtime: RuntimeApi = {
  mount,
  setTheme,
  setArchetype,
  registerArchetype,
  registerAction,
  registerRenderer,
  actions,
  renderers,
}

declare global {
  interface Window {
    TalonDocRuntime?: RuntimeApi
  }
}

if (typeof window !== 'undefined') {
  window.TalonDocRuntime = runtime
}
