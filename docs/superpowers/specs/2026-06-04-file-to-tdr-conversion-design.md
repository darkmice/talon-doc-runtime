# File-to-TDR Conversion — Design Spec

**Date:** 2026-06-04
**Status:** Approved (pending user review of this doc)
**Author:** dark (with Claude Code)

## 1. Goal

Let `.md`, `.markdown`, `.txt`, `.html`, `.htm` files all convert into a TDR-rendered
document. Route by file extension to three pipelines that **share one set of
semantic-uplift rules**, and extend the Markdown→TDR mapping so common Markdown
constructs become their equivalent TDR components instead of plain HTML.

Today only `.md`/`.markdown` is handled (via `mdToTdr` in
[src/markdown.ts:81](../../../src/markdown.ts#L81)). This spec adds `.txt` and
`.html`/`.htm`, adds four new Markdown mappings, and exposes the capability in
both the CLI and the browser bundle.

## 2. Architecture overview

```
                       convert(content, { ext })          ← single entry
                                  │
        ┌─────────────────────────┼─────────────────────────┐
   ext = md/markdown          ext = txt                 ext = html/htm
        │                         │                          │
   mdToTdr(content)      txtToMarkdown(content)       htmlToTdrFragment(content)
   (existing pipeline)   → mdToTdr(markdown)          rehype-parse → extract main
        │                         │                   → hast uplift → stringify
        │                         │                          │
        └─────────── fragment ────┴───────── fragment ───────┘
                                  │
              enrich? (opts.enrich)  →  wrapDocument(fragment, frontmatter, opts)
                                  │
                          TransformResult { html, frontmatter, warnings }
```

Three pipelines, one tail. `enrich` + `wrapDocument` run once in `convert()` so the
document framing is byte-identical regardless of source format — only **fragment
production** differs per format.

### Shared-rule strategy

The L2 uplift **decision logic** (regexes, the `kind→<call k>` table, id
generation, `file:path:Ls-Le` parsing, the details/summary string-rewrite) moves
into a new pure module `src/uplift-shared.ts`. The existing mdast plugins and the
new hast visitors both import these helpers, so the two pipelines can never drift.
We do **not** convert HTML→Markdown via turndown.

## 3. Modules

### New: `src/uplift-shared.ts` (pure — no `unified`/`mdast`/`hast` imports)

Extracted verbatim from `src/markdown.ts`:

| Export | Current home |
|---|---|
| `ADMONITION_GFM`, `ADMONITION_INLINE_EN`, `ADMONITION_INLINE_ZH` | `markdown.ts:159-161` |
| `KIND_MAP` | `markdown.ts:163-168` |
| `escapeText`, `escapeAttr` | `markdown.ts:267-270` |
| `SRC_META_RE` | `markdown.ts:285` |
| `makeId` | `markdown.ts:306-311` |
| `stripParagraphWrap` | `markdown.ts:362-366` |
| `extractFirstHeading` | `markdown.ts:422-426` |
| `STD_HTML_TAGS` | `markdown.ts:440-445` |

New pure functions distilled from currently-mixed plugins:

- `matchAdmonition(text): { kind: string | null; prefix: string | null }` — the
  regex + `KIND_MAP` logic from `markdown.ts:181-208`; returns the resolved call
  kind and the marker prefix to strip. No tree mutation.
- `parseSrcMeta(meta): { path: string | null; lang: string }` — `SRC_META_RE`
  extraction from `markdown.ts:291-295`.
- `kindToCallK(rawKind): string` — `KIND_MAP` lookup, `'info'` fallback.
- `detailsSummaryToC(html): string` — the two `.replace` chains from
  `markdown.ts:375-382`, callable on any serialized HTML.

New **tree-agnostic** detection+emit helpers for §7's mappings (both the mdast
plugin and the hast visitor feed them pre-extracted plain-text, so neither tree
shape leaks in):

- `tableToKv(header: string[], rows: string[][]): string | null` — applies the
  §7.1 guards; returns a `<kv>…</kv>` string when all hold, else `null` (caller
  keeps the native `<table>`).
- `looksKeyish(text: string): boolean` — the §7.1 header predicate.
- `dividerFromHeading(headingText: string): string` — returns
  `<divider t="…">` (§7.3); the caller decides adjacency/H1 from tree context.

### Changed: `src/markdown.ts`

All mdast-bound plugins stay here, rewired to import the pure helpers above.
`wrapDocument` (`markdown.ts:388-420`) and the relocated `extractFirstHeading`
become **exported** so `convert.ts` can wrap html/txt fragments uniformly.
`mdToTdr` / `mdToPlainHtml` exports stay intact (the playground depends on them,
[examples/playground.html:280-292](../../../examples/playground.html#L280-L292)).

`markdown.ts` adds `export { convert } from './convert'` so `convert` is reachable
from the build entry's export graph (see §8 — otherwise esbuild tree-shakes it and
`rehype-parse` never lands in the browser bundle).

### New: `src/txt.ts`

`txtToMarkdown(text): string` — pure heuristic preprocessor (§5). Kept separate
from `convert.ts` for testability (mirrors the per-format test-file pattern).

### New: `src/html.ts`

`htmlToTdrFragment(html, opts): { fragment: string; frontmatter: Frontmatter; warnings: string[] }`
— the rehype pipeline (§6).

### New: `src/convert.ts`

`convert(content, opts)` — the dispatcher (§4). Imports `mdToTdr`,
`wrapDocument`, and `extractFirstHeading` from `./markdown`. Combined with
`markdown.ts`'s `export { convert } from './convert'`, this forms an intentional
ESM cycle (`markdown.ts → convert.ts → markdown.ts`). It is safe because only
**functions** cross the cycle (no top-level execution depends on the other module
at load time); document it so it isn't "fixed" by accident.

## 4. The `convert()` contract

```ts
export type SourceExt = 'md' | 'markdown' | 'txt' | 'html' | 'htm'

export interface ConvertOptions extends TransformOptions {
  /** Explicit format override; else inferred from `filename`. */
  ext?: SourceExt
  /** Source filename, used to infer ext when `ext` omitted. */
  filename?: string
}
// TransformOptions already carries: document, defaultArchetype, defaultLang,
// runtimeScript, enrich  (markdown.ts:49-72)

export async function convert(
  content: string,
  opts?: ConvertOptions,
): Promise<TransformResult>   // { html, frontmatter, warnings }  (markdown.ts:74-78)
```

**Dispatch:**

1. Resolve `ext`: `opts.ext` → else the lowercased extension of `opts.filename`
   (no dot) → else `'md'`.
2. **Unknown extension** (e.g. `.rst`): push a warning
   `unknown extension '<ext>', treated as markdown` and route to the md pipeline.
   *(Resolved decision: warn + treat as md — never throw. Both CLI and browser
   depend on this lenient contract.)*
3. Route:
   - `md` / `markdown` → `mdToTdr(content, opts)` directly.
   - `txt` → `mdToTdr(txtToMarkdown(content), opts)`. Inherits every L2 rule.
   - `html` / `htm` → `htmlToTdrFragment(content, opts)` → fragment + frontmatter;
     then `convert` applies `enrich` (if set) and `wrapDocument` when
     `opts.document !== false`, mirroring `mdToTdr`'s tail (`markdown.ts:108-115`).
4. Always returns the same `TransformResult` shape.

## 5. txt heuristic rules (`txtToMarkdown`)

Light, deterministic, conservative — does not mistake ordinary prose for Markdown.
Operates on logical lines split on `\n`, grouped into blank-line-delimited blocks.
Applied in order:

1. **Normalize newlines** — `\r\n`/`\r` → `\n`; strip a leading UTF-8 BOM.
2. **Block segmentation** — split on `/\n[ \t]*\n/`. Blank lines between blocks are
   preserved (paragraph breaks).
3. **Indented code block** — if every non-blank line of a block begins with ≥4
   spaces or a tab, emit the block verbatim (4-space indent = Markdown indented
   code). Guard: only when indentation is uniform; never re-indent.
4. **Bullet block** — if **every** non-blank line matches
   `/^\s*([-*•·]|\d+[.)])\s+/`, treat as a list. Normalize glyphs: `•`/`·` → `- `;
   `-`/`*` keep; `N.`/`N)` → `N. `. Guard: a **mixed** block (some bullet lines,
   some not) is NOT a list → falls through to paragraph.
5. **URL autolink** — wrap bare `https?://…` runs as `<url>` angle-bracket
   autolinks so remark-gfm renders `<a>`. Do not touch URLs already inside `< >`.
   **Runs only on paragraph (rule 6) and bullet (rule 4) blocks — never on
   indented-code blocks (rule 3), whose output is final and verbatim.**
6. **Paragraph (default)** — any other block becomes one Markdown paragraph; join
   its lines with a single space. *(Resolved decision: **collapse** soft-wraps —
   deterministic and simplest. No hard-break preservation.)*
7. **Escaping** — minimal. Backslash-escape only **block-leading** `#` and `>` on
   paragraph blocks so plain text isn't misread as a heading/quote. Nothing else —
   over-escaping defeats the purpose. *(Resolved decision: this exact minimal set.)*

txt does **not** synthesize admonitions, headings, or tables. Those only appear if
the user already wrote Markdown-ish txt, in which case the md pipeline handles them.

## 6. html pipeline (`htmlToTdrFragment`)

1. **Parse** — `unified().use(rehypeParse, { fragment: false })` → hast tree.
2. **Main-content extraction** — first match in priority order
   **`article` → `main` → `body`**; else the whole tree. **Title:** do not derive a
   title in this stage. The shared tail's `wrapDocument` already falls back to
   `extractFirstHeading(fragment)` over the serialized `<h1>`, so html relies on
   that single mechanism (no separate hast-walked title — avoids double-sourcing).
   Leave `frontmatter.title` unset unless the input carried an explicit title.
3. **hast uplift stages** (new visitors, decisions delegated to
   `uplift-shared.ts`), rewriting **tags/attributes in place** so `rehypeStringify`
   emits them — no parallel hast serializer:
   - **blockquote → call** — collect the blockquote's text, run
     `matchAdmonition`. Marker found → `<call k=…>`; no marker → the new
     plain-blockquote rule (§7.2) emits `<call k="note">`.
   - **GFM table / two-col → kv / dashes→divider** — the same pure
     detection+emit helpers used by the md pipeline (§7), called from hast
     visitors.
4. **Stringify** — `rehypeStringify({ allowDangerousHtml: true })`, then run
   `detailsSummaryToC(fragment)` (reusing the proven md string-regex —
   *resolved decision*: string-regex, not a hast `details→c` visitor).
5. Return `{ fragment, frontmatter, warnings }` to `convert` for `enrich` /
   `wrapDocument`.

**Resolved decision — html `<pre> → <src>`: NOT in v1.** HTML has no fence-info
channel for `file:path:Ls-Le`. All `<pre>` in `.html` input render as `<cb>`
(still skinned, with a copy button). Path/line-number `<src>` uplift for HTML is a
documented follow-up.

## 7. New Markdown mappings

Detection + emit live as pure helpers in `uplift-shared.ts`; the md plugin visits
mdast and the html visitor visits hast, both calling the shared decision. Added to
the md pipeline, inherited by txt (via md) and html (via shared helpers).

### 7.1 GFM table → `<table>` (passthrough) and two-column table → `<kv>`/`<row>`

- **Detection** — `node.type === 'table'`; two-column iff every `tableRow` has
  exactly 2 cells.
- **Emit (kv)** — `<kv>` with one `<row k="…" v="…">` per body row; `k` = cell-0
  text, `v` = cell-1 text (plain text preferred so `inferKvType` at
  [src/index.ts:749-757](../../../src/index.ts#L749-L757) works).
- **Emit (otherwise)** — leave as native `<table>` (survives via `STD_HTML_TAGS`,
  skinned by the archetype). No plugin action.
- **Safety guards — convert to kv ONLY when ALL hold** *(resolved: conservative)*:
  - Exactly 2 columns in every row (no ragged rows).
  - Body row count ≤ `KV_MAX_ROWS = 8`.
  - Header looks key-ish: cell-0 ≤ 24 chars, no terminal punctuation, no inline
    code/link/image. Predicate `looksKeyish`:
    `/^[\w一-龥 .\-_/]{1,24}$/` and not ending in `.`/`。`/`?`/`？`.
  - All cells are simple text — no list, code block, image, or multi-line content.
  - When any guard fails or it's ambiguous → keep `<table>` (lossless default).

### 7.2 Plain blockquote (no admonition marker) → `<call k="note">`

- **Detection** — a `blockquote` whose first paragraph does not match any
  admonition regex (`matchAdmonition` → `kind: null`).
- **Emit** — `<call k="note">{body}</call>`.
- **Implementation** *(resolved decision)* — **merge into `promoteAdmonitions`**:
  `matchAdmonition` returns a kind → `<call k=kind>`; returns null → `<call
  k="note">`. One visitor, no double-processing, no `node.data.processed` marker.
- **Content guard** — only promote blockquotes containing ≥1 paragraph/text node.
  A blockquote that is purely nested blockquotes or only a code block stays a
  `<blockquote>`.
- **Test impact** — this **flips** the existing negative test
  [tests/markdown.test.ts:91-96](../../../tests/markdown.test.ts#L91-L96) (which
  asserts plain blockquotes stay `<blockquote>`). That test must be **updated**,
  not left.

### 7.3 `---` adjacent to a heading → `<divider t="…">`

- **Detection** *(resolved decision: `---` above the heading only)* — a
  `thematicBreak` node immediately **followed** by a `heading` sibling in
  `parent.children`. Use the heading's text (`mdastToString`) as the label.
- **Emit** — replace the `thematicBreak` + `heading` pair with one
  `<divider t="{headingText}">` (renderer
  [src/index.ts:1285-1298](../../../src/index.ts#L1285-L1298) reads `t`).
- **Safety guards:**
  - Runs **after** `extractFrontmatter` so the leading frontmatter `---` is already
    consumed and never seen as a `thematicBreak`.
  - **Skip H1** (heading depth === 1): H1 feeds the document title via
    `extractFirstHeading` — collapsing it would drop the title. An H1 after `---`
    leaves both nodes untouched.
  - A standalone `---` with no following heading stays a native `<hr>`.

### 7.4 Links / images / bold → stay as-is

No plugin. `link`/`image`/`strong`/`emphasis`/`inlineCode` flow remark-gfm →
rehype untouched. The kv (§7.1) and call (§7.2) serializers must preserve them when
serializing inner content — except **kv values**, where plain text is preferred so
type inference works; a value cell with inline formatting keeps the formatting and
skips inference (matches the `onlyText` guard at index.ts:811).

## 8. Build / browser / package changes

- **`package.json`** — add `"rehype-parse": "^9.0.1"` to **`dependencies`** (not
  devDependencies): `nodeExternals` (`build.mjs:23-26`) reads `dependencies` to
  externalize it for the Node build; the browser build bundles it regardless.
- **`scripts/build.mjs`** — **no structural change.** Both markdown builds keep
  entryPoint `src/markdown.ts`. Because `markdown.ts` re-exports `convert` (§3),
  esbuild follows the import graph: the Node build externalizes `rehype-parse`; the
  browser build bundles it into `dist/markdown.browser.js`. *Critical:* the
  re-export is what keeps `convert` from being tree-shaken out of the browser
  bundle.
- **`dist/markdown.d.ts`** — will include `convert`'s type automatically via the
  re-export; no exports-map change needed (`convert` ships from `./markdown` and
  `./markdown.browser`).
- **Playground** — no change in this PR. It keeps importing `{ mdToTdr,
  mdToPlainHtml }`. The local browser bundle gains `convert`, but the unpkg
  fallback won't until a release is published; wiring `convert` into the playground
  UI is a follow-up.
- Note the browser bundle grows by `rehype-parse` + `parse5` in the PR description.

## 9. CLI `convert` subcommand

Add `case 'convert': await runConvert(subArgs); break` to the dispatch switch
([scripts/tdr.mjs:49-61](../../../scripts/tdr.mjs#L49-L61)). New `runConvert` +
`parseConvertArgs` modeled on `runFormat`/`parseFormatArgs` (`:65-137`).

```
tdr convert <file...> [-o <out>] [--fragment] [--archetype <name>]
                      [--lang <code>] [--runtime <url>] [--ext <md|txt|html>]
```

- `parseConvertArgs` reuses the `parseFormatArgs` flag loop, but positionals
  accumulate into `inputs: string[]`.
- `--ext` forces the pipeline (override inference).
- **One lazy import** of `{ convert }` from `dist/markdown.mjs` (`:85` pattern);
  `convert` dispatches internally, so no conditional per-format imports.

**Extension → pipeline routing** (per input file):

| Extension | Pipeline |
|---|---|
| `.md`, `.markdown` | md |
| `.txt` | txt |
| `.html`, `.htm` | html |
| other / none | error: `tdr convert: cannot infer format for '<file>' (pass --ext)` |

**Output behavior** *(resolved decisions)*:

- Single input + `-o file` → write that file.
- Single input + `-o` is an existing directory → write `<base>.html` into it.
- Single input, no `-o` → stdout.
- Multiple inputs + `-o` → `-o` must be a **directory**; write `<base>.html` into
  it. `-o` is an existing file with >1 input → error.
- Multiple inputs, no `-o` → write each next to its source as
  `<path-without-ext>.html`; stderr-log each.
- **No directory auto-expansion** in v1 — globbing is the shell's job.
- Errors prefixed `tdr convert:`, user errors `exit(1)` (matches existing
  convention).

**`format` ⇒ alias** *(resolved decision)* — `tdr format` becomes a thin alias for
`tdr convert --ext md` (back-compat for existing scripts). Add `printConvertHelp`
and a `printRootHelp` line.

## 10. Test plan

Convention: import from `../src` (no rebuild needed); assert on `result.html` with
`toContain`/`toMatch`/`not.toContain` (matches `tests/markdown.test.ts`).

- **`tests/uplift-shared.test.ts`** — `matchAdmonition` (GFM/EN/ZH/none),
  `parseSrcMeta` (`file:`/`path=`/bare), `makeId`, `stripParagraphWrap`,
  `detailsSummaryToC` (with/without `open`), `kindToCallK`.
- **`tests/convert.test.ts`** — `convert(md,{ext:'md'})` matches `mdToTdr`; ext
  inference from `filename`; unknown ext → warning + md routing; `document:false`
  returns a fragment for all three exts.
- **`tests/txt.test.ts`** — blank-line blocks → `<p>`; bullet block → `<ul>`/`<ol>`;
  4-space block → code; bare URL → `<a>`; mixed bullet/non-bullet block → one `<p>`.
- **`tests/html.test.ts`** — `<article>` chosen over `<main>` over `<body>`;
  `<blockquote>[!WARNING]…` → `<call k="warn">`; plain `<blockquote>` →
  `<call k="note">`; `<details open><summary>T</summary>…` → `<c t="T" o="true">`.
- **New-mapping tests (in `tests/markdown.test.ts`)** — table→kv (2-col/≤8/key-ish
  → `<kv>` + `<row>`; negatives: 12 rows, 3-col, list-in-cell → `<table>`);
  plain-blockquote→call (**update** the existing negative at `:91-96`);
  `---`+heading→divider (above-heading → `<divider t>`; standalone `---` → `<hr>`;
  leading frontmatter `---` never a divider; H1 not consumed); links/images/bold
  passthrough.
- **Fixtures** — add `examples/txt-source.txt` and `examples/html-source.html`
  paralleling `examples/markdown-source.md`; inline `FIXTURE` consts for unit tests.
- One smoke check that `pnpm build` produces a `dist/markdown.browser.js`
  containing `convert` (or rely on `pnpm check`).

## 11. Out of scope (follow-ups)

- HTML `<pre> → <src>` with path/line-number uplift.
- Playground UI wiring for `convert` + a new file-type selector.
- Directory/glob expansion in the CLI.
- txt hard-line-break preservation mode.
