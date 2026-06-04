#!/usr/bin/env node
// tdr — Talon Doc Runtime CLI.
//
// Subcommands:
//
//   tdr convert   <file...>   [-o out] [--fragment] [--archetype ...]
//                              [--lang <code>] [--runtime <url>] [--ext ...]
//       Convert .md/.markdown/.txt/.html/.htm into a TDR HTML document, routed
//       by extension (override with --ext). By default wraps the result in a
//       complete <!doctype html>; pass --fragment to emit only the inner HTML.
//       Accepts multiple inputs (batch).
//
//   tdr format    <input.md>  [...]
//       Back-compat alias for `convert --ext md`.
//
//   tdr critique  <doc.html>
//       Structural / style lint. Wraps scripts/critique.mjs.
//
//   tdr balance   <doc.html>
//       Visual budget check. Wraps scripts/balance.mjs.
//
//   tdr --help
//
// All subcommands accept `-h` / `--help`.
//
// Exit codes:
//   0  success
//   1  user error (bad flag, missing file, …)
//   2  domain-specific failure (lint error, budget exceeded, …)

import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { dirname, resolve, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
// Repo layout: scripts/tdr.mjs is sibling to scripts/critique.mjs etc.;
// the markdown bundle lives at ../dist/markdown.mjs.
const PKG_ROOT = resolve(__dirname, '..')

// Extension → pipeline. Declared before the dispatch switch (which runs at
// module top-level) to avoid a temporal-dead-zone reference.
const EXT_PIPELINE = {
  md: 'md', markdown: 'md', txt: 'txt', html: 'html', htm: 'html',
}

// ─── argv parsing ──────────────────────────────────────────────────────────

const args = process.argv.slice(2)
if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
  printRootHelp()
  process.exit(args.length === 0 ? 1 : 0)
}

const sub = args[0]
const subArgs = args.slice(1)

switch (sub) {
  case 'convert':  await runConvert(subArgs); break
  // `format` is a back-compat alias for `convert --ext md`.
  case 'format':   await runConvert([...subArgs, '--ext', 'md']); break
  case 'critique': await runDelegate('critique.mjs', subArgs); break
  case 'balance':  await runDelegate('balance.mjs', subArgs); break
  case '-v':
  case '--version':
    printVersion()
    break
  default:
    console.error(`tdr: unknown subcommand '${sub}'`)
    console.error(`Run 'tdr --help' for usage.`)
    process.exit(1)
}

// ─── tdr convert ───────────────────────────────────────────────────────────
// Routes .md/.markdown/.txt/.html/.htm to the right pipeline by extension
// (override with --ext). Single or batch inputs.

async function runConvert(argv) {
  if (argv.includes('-h') || argv.includes('--help')) {
    printConvertHelp()
    return
  }

  const opts = parseConvertArgs(argv)
  if (opts.inputs.length === 0) {
    console.error('tdr convert: missing input file')
    console.error(`Run 'tdr convert --help' for usage.`)
    process.exit(1)
  }
  for (const input of opts.inputs) {
    if (!existsSync(input)) {
      console.error(`tdr convert: input file not found: ${input}`)
      process.exit(1)
    }
  }

  // Resolve per-file format up front so a bad extension fails before any work.
  const jobs = opts.inputs.map((input) => {
    const ext = opts.ext ?? extOf(input)
    if (!ext || !(ext in EXT_PIPELINE)) {
      console.error(`tdr convert: cannot infer format for '${input}' (pass --ext)`)
      process.exit(1)
    }
    return { input, ext }
  })

  // Multi-input + -o requires a directory.
  const multi = jobs.length > 1
  if (multi && opts.output && existsSync(opts.output) && !isDir(opts.output)) {
    console.error('tdr convert: -o must be a directory for multiple inputs')
    process.exit(1)
  }

  // Lazy-load the converter — it pulls in remark/rehype, ~2 MB of deps that
  // other subcommands don't need.
  const { convert } = await import(join(PKG_ROOT, 'dist', 'markdown.mjs'))

  for (const { input, ext } of jobs) {
    const content = readFileSync(input, 'utf8')
    const { html, frontmatter, warnings } = await convert(content, {
      ext,
      document:        !opts.fragment,
      defaultArchetype: opts.archetype,
      defaultLang:     opts.lang,
      runtimeScript:   opts.runtime,
    })

    for (const w of warnings) console.error(`tdr convert: ${input}: ${w}`)

    const dest = resolveDest(input, opts.output, multi)
    if (dest) {
      writeFileSync(dest, html)
      const fmHint = Object.keys(frontmatter).length
        ? ` (frontmatter: ${Object.keys(frontmatter).join(', ')})`
        : ''
      console.error(`tdr convert: wrote ${dest}${fmHint}`)
    } else {
      process.stdout.write(html)
    }
  }
}

function extOf(file) {
  const m = file.toLowerCase().match(/\.([a-z0-9]+)$/)
  return m ? m[1] : ''
}

function isDir(p) {
  try { return statSync(p).isDirectory() } catch { return false }
}

// Where each input's HTML goes:
//   single + -o file      → that file
//   single + -o is a dir  → <dir>/<base>.html
//   single + no -o        → stdout (return null)
//   multi  + -o (dir)     → <dir>/<base>.html
//   multi  + no -o        → sibling <path-without-ext>.html
function resolveDest(input, output, multi) {
  const sibling = input.replace(/\.[^.]+$/, '') + '.html'
  if (!output) return multi ? sibling : null
  if (isDir(output)) {
    const base = basename(input).replace(/\.[^.]+$/, '') + '.html'
    return join(output, base)
  }
  return multi ? sibling : output
}

function parseConvertArgs(argv) {
  const opts = {
    inputs: [],
    output: null,
    fragment: false,
    archetype: 'business-document',
    lang: 'zh-CN',
    runtime: undefined,
    ext: undefined,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '-o' || a === '--output') opts.output = argv[++i]
    else if (a === '--fragment')        opts.fragment = true
    else if (a === '--archetype')       opts.archetype = argv[++i]
    else if (a === '--lang')            opts.lang = argv[++i]
    else if (a === '--runtime')         opts.runtime = argv[++i]
    else if (a === '--ext')             opts.ext = argv[++i]
    else if (a.startsWith('--')) {
      console.error(`tdr convert: unknown flag '${a}'`)
      process.exit(1)
    }
    else opts.inputs.push(a)
  }
  return opts
}

// ─── delegate to scripts/critique.mjs / scripts/balance.mjs ────────────────

function runDelegate(scriptName, argv) {
  return new Promise((resolveP) => {
    const scriptPath = join(__dirname, scriptName)
    if (!existsSync(scriptPath)) {
      console.error(`tdr: bundled script missing: ${scriptName}`)
      process.exit(1)
    }
    const child = spawn(process.execPath, [scriptPath, ...argv], {
      stdio: 'inherit',
    })
    child.on('exit', (code) => {
      resolveP()
      process.exit(code ?? 0)
    })
  })
}

// ─── help text ─────────────────────────────────────────────────────────────

function printRootHelp() {
  process.stderr.write(`tdr — Talon Doc Runtime CLI

Usage:
  tdr <subcommand> [options]

Subcommands:
  convert    Convert .md/.markdown/.txt/.html/.htm to TDR HTML.
  format     Alias for 'convert --ext md' (back-compat).
  critique   Lint a TDR document for structural and style issues.
  balance    Check the visual-component budget of a TDR document.

Common:
  -h, --help       Show help for a subcommand.
  -v, --version    Print version.

Examples:
  tdr convert docs/spec.md -o spec.html
  tdr convert notes.txt page.html -o build/
  tdr convert docs/spec.md --fragment > body.html
  tdr critique spec.html
  tdr balance  spec.html
`)
}

function printConvertHelp() {
  process.stderr.write(`tdr convert — Convert a file to a TDR HTML document

Usage:
  tdr convert <file...> [options]

Routes by extension: .md/.markdown → Markdown pipeline, .txt → plain-text
pipeline, .html/.htm → HTML pipeline. Override with --ext.

Options:
  -o, --output <path>     Write HTML to <path>. For multiple inputs, <path>
                          must be a directory. A single input with a directory
                          writes <dir>/<base>.html. Omit for stdout (single
                          input) or sibling <name>.html (multiple inputs).
      --fragment          Emit body fragment only (no <!doctype>, no <html>).
      --archetype <name>  Default archetype if frontmatter omits one.
                          (default: business-document)
      --lang <code>       Default lang attribute. (default: zh-CN)
      --runtime <url>     <script src> to use in standalone output.
                          (default: unpkg.com/@talon-ui/doc-runtime/dist/talon-doc-runtime.iife.js)
      --ext <md|txt|html> Force the pipeline, ignoring file extension.
  -h, --help              Show this help.

Conventions recognised (see docs/markdown-flavor.md):
  - GFM admonitions:        > [!NOTE]/[!WARNING]/[!TIP]/[!IMPORTANT]/[!CAUTION]
  - English / Chinese:      > NOTE: …  / > 注意：…
  - Plain blockquote:       > quoted text                  → <call k="note">
  - Code fence with path:   \`\`\`ts file:src/auth.ts:8-16   → <src>
  - Task list:              - [x] done  / - [ ] todo       → <chk>/<ck>
  - 2-column table:         | key | value |                → <kv>
  - --- above a heading:    --- + ## Title                 → <divider>
  - Native details/summary:                                  → <c t="…">
`)
}

function printVersion() {
  const pkg = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8'))
  process.stdout.write(`tdr ${pkg.version}\n`)
}
