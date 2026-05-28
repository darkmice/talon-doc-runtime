---
name: talon-doc-runtime
description: "Use when creating Agent-facing structured document artifacts with Talon Doc Runtime: short HTML DSL tags rendered into archetype-themed documents (business-document, editorial-longform, ...). Prefer this skill over Markdown or raw HTML when the output is a human-readable, component-rich Talon artifact."
---

# Talon Doc Runtime

This skill is the Agent-facing entrypoint for `talon-doc-runtime` (TDR). The runtime takes short DSL tags and renders them into a styled document. The document's *visual archetype* (办公文档 / 长文 / 杂志 ...) is selected by one attribute on the root element — the DSL itself does not change between archetypes.

## First-time setup

On first use, read `references/canvas.md` for the full writing principles — they govern layout rhythm, when to use which component, semantic color use, code-reference patterns, and the "complete on first delivery" expectation. The summary below in this file is intentionally short; the reference file is the contract.

Before delivering a non-trivial document, run the two checkers:

```bash
node scripts/critique.mjs   path/to/your.html   # structural & style lint
node scripts/balance.mjs path/to/your.html # visual budget (heavy components vs <h2>)
```

If a checker reports errors, fix them before handing the document to the user. Warnings are advisory but worth reviewing.

## Output Mode

Choose one of two modes:

1. **Embedded fragment**: output only DSL body content when the host page already loads `talon-doc-runtime`.
2. **Standalone HTML**: write a complete `.html` file that loads `dist/talon-doc-runtime.iife.js`.

Default to standalone HTML when creating a local artifact for review. Default to an embedded fragment when integrating with an existing Talon product surface.

## Core Rules

- Write structure with short DSL tags, never inline JS or large CSS.
- Express events as action intent: `<btn a="open" to="src1">展开证据</btn>`.
- Keep evidence concrete: code references go in `<src id="..." p="file:line-line" l="ts">`.
- Use semantic state values only: `ok / bad / warn / note / info / done / active / accent`. Common aliases (`approved`/`rejected`/`success`/`danger`/`exploring`/`pending`/`p0`/`p1`/`p2`/`blocked`/`at-risk`/`polish` ...) all normalize into these.
- Pick **one** archetype on `<html data-archetype="...">` or the root element. The DSL stays the same; only the archetype changes the look.
- Prefer Chinese prose when the user is working in Chinese; keep code identifiers and technical names unchanged.

## DSL Vocabulary

### Document & semantic blocks

| Tag | Purpose | Common attrs |
|---|---|---|
| `<d>` | Decision / verdict card | `s` 状态, `v` verdict, `t` title |
| `<call>` | Callout / aside box | `k` 类型, `t` title, `icon` |
| `<c>` | Collapse / details | `t` title, `o` open, `flat` borderless |
| `<src>` | Code source with line numbers + optional `<note>` child | `id`, `p` path:line-line, `l` lang |
| `<cb>` | Simple code block (no line numbers) | `f` file label |
| `<ref>` | Inline jump link | `to` target id, `x` label |
| `<btn>` | Action button | `a` action, `to` target |
| `<x>` | Inline badge / pill | `s` state |
| `<lead>` | Opening paragraph (display-font lede) | — |
| `<divider>` | Section divider, optional label | `t` label |

### Metrics & charts

| Tag | Purpose | Attrs |
|---|---|---|
| `<ms>` | Metric row container | — |
| `<m>` | Single metric | `v` value, `t` label |
| `<bars>` / `<bar>` | Horizontal bars | `<bar t v p s>` |
| `<sb>` / `<seg>` / `<lg>` | Stacked bar + legend | `<seg p s>`, `<lg t s>` |

### Flow & process

| Tag | Purpose | Attrs |
|---|---|---|
| `<flow>` | Flow container | `v` vertical |
| `<n>` | Flow node | `s` color, `meta`, `sub` subtitle |
| `<arr>` | Flow arrow | `t` label |
| `<steps>` / `<step>` | Step list | `p` progress %; step: `s`, `t`, `d`, `f` flag, `fl` flag label |
| `<branch>` / `<bi>` | Parallel-branch case cards (each `<bi>` is one path) | branch: `r` root question; bi: `c` cond, `s`, `out`, child `<kids>` |
| `<tracks>` / `<tk>` | Multi-track evaluation lanes | `<tk t d f>` |

### Comparison & data

| Tag | Purpose | Attrs |
|---|---|---|
| `<cmp>` / `<pro>` / `<con>` | Pro/con comparison | `t` title |
| `<contrast>` / `<l>` / `<r>` | Same-word-two-contexts disambiguation | `w` word, `d` desc; side: `c` context |
| `<analogy>` | "A ≈ B" explainer | `s`/`sd` source+desc, `t`/`td` target+desc, `why` |
| `<myth>` / `<wrong>` / `<right>` | Misconception / truth pair | — |
| `<kv>` / `<row>` | Key-value list | `<row k v>` (`vk="enum"` for chip-shaped value) |
| `<tabs>` / `<tab>` | Tabs | `<tab t>` |
| `<chk>` / `<ck>` | Checklist | `<ck k>` for checked |

### Evidence / explanation / status

| Tag | Purpose | Attrs |
|---|---|---|
| `<evidence>` / `<ei>` | Conclusion + supporting bullets | `t` conclusion text, `s` |
| `<finding>` | Single finding with summary + optional `<detail>` | `t` title |
| `<term>` | Inline term with hover-tooltip definition | `w` word, `d` def, `first` (drop dot marker) |
| `<timeline>` / `<ev>` | Vertical event timeline | event: `d` date, `t` title, `s` |
| `<risk>` / `<r>` | Risk register (severity × likelihood × mitigation) | `<r t sev lik mit>` |

### Structure & assets

| Tag | Purpose | Attrs |
|---|---|---|
| `<grid>` / `<card>` | Card grid | `c` cols; card: `t` title, child `<foot>` |
| `<files>` / `<fg>` / `<f>` | File-change list | `<fg m>` module; `<f p s why>` |
| `<table>`, `<ul>`, `<ol>`, `<pre>`, `<h1>-<h6>`, `<code>` | Native HTML — re-skinned by archetype CSS | — |

## State Values

`s` and `k` accept these (and many aliases all normalize in):

| Value | Meaning |
|---|---|
| `ok` | success / pass / approved / done |
| `bad` | failure / danger / rejected / P0 / blocked |
| `warn` | risk / warning / P1 / at-risk |
| `note` | exploring / review / pending / P2 |
| `info` | neutral (default) |
| `done` | completed step |
| `active` | current step / in progress |
| `accent` | brand accent |

## Action Protocol

Agents write action intent, not code:

```html
<btn a="open" to="src1">展开证据</btn>
<btn a="jump" to="src1">定位证据</btn>
<btn a="theme" to="dark">深色</btn>
<btn a="archetype" to="business-document">办公风</btn>
```

Built-in actions:

| Action | Behavior |
|---|---|
| `jump` | Open + scroll to + highlight target |
| `open` / `close` / `toggle` | `<details>` state |
| `copy` | Copy the nearest `<pre>` content |
| `tab` | Switch tab panel (used internally by `<tabs>`) |
| `theme` | Switch `light` / `dark` / `auto` |
| `archetype` | Switch active archetype |
| `emit` | Dispatch `talon-doc:action` CustomEvent |

Hosts can register custom actions:

```ts
import { registerAction } from '@talon/doc-runtime'
registerAction('accept', ({ target }) => { /* ... */ })
```

## Archetypes

A document picks one archetype on the root:

```html
<html lang="zh-CN" data-archetype="business-document">
```

Built-in archetypes:

| Archetype | Visual lineage | Best for |
|---|---|---|
| `business-document` | Stripe Atlas / Linear changelog / Vercel docs article pages | 办公 / 工程报告 / 决策记录 / 交付文档 |
| `editorial-longform` | Literary magazine / serif longform | 长文 / 评论 / 散文式技术随笔 |

Hosts can register their own archetypes:

```ts
import { registerArchetype, setArchetype } from '@talon/doc-runtime'
registerArchetype('my-style', CSS_STRING)
setArchetype('my-style')
```

## Minimal Standalone Skeleton

```html
<!doctype html>
<html lang="zh-CN" data-archetype="business-document">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Structured Artifact</title>
  </head>
  <body>
    <main class="tdr-doc">
      <h1>标题</h1>
      <p class="tdr-subtitle">副标题</p>

      <ms>
        <m v="47" t="受影响文件"></m>
        <m v="~4h" t="预估工时"></m>
      </ms>

      <d s="bad" v="P0" t="并发 refresh 误撤销 token 家族">
        <p>两个 tab 同时刷新同一个 token 时，第二个请求会撤销整个 token 家族。</p>
      </d>

      <c t="证据">
        <src id="refresh" p="src/auth/refresh.ts:8-16" l="ts">
          <pre><code>export async function rotateRefreshToken(token: string) {
  const record = await findToken(token)
  if (record.consumedAt) revokeFamily(record.familyId)
}</code></pre>
          <note>已消费 token 再次出现 = 可能被盗用。</note>
        </src>
      </c>

      <btn a="open" to="refresh">展开证据</btn>
    </main>
    <script src="../dist/talon-doc-runtime.iife.js"></script>
  </body>
</html>
```

## Bundled resources

- `references/canvas.md` — full writing principles. Read on first use.
- `references/lineage.md` — read this only when the user is *iterating on TDR itself* (adding a renderer, changing a CSS class, syncing docs after a runtime change). Most document-authoring sessions do not need it.
- `scripts/critique.mjs` — structural & style lint for one TDR HTML file (ref/id, Markdown residue, callout count, decision verdict, prose bridges).
- `scripts/balance.mjs` — visual budget check (top-level heavy components ≤ 1.5 × `<h2>` count).
- `assets/talon-doc-runtime.iife.js` — the compiled runtime, copy next to standalone HTML outputs.
