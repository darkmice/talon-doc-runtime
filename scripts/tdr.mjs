#!/usr/bin/env node
// tdr — Talon Doc Runtime CLI.
//
// Subcommands:
//
//   tdr format    <input.md>  [-o out.html] [--fragment] [--archetype ...]
//                              [--runtime <url>]
//       Convert TDR-flavored Markdown into a TDR HTML document. By default
//       wraps the result in a complete <!doctype html>; pass --fragment to
//       emit only the inner HTML (for embedding inside an existing page).
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

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
// Repo layout: scripts/tdr.mjs is sibling to scripts/critique.mjs etc.;
// the markdown bundle lives at ../dist/markdown.mjs.
const PKG_ROOT = resolve(__dirname, '..')

// ─── argv parsing ──────────────────────────────────────────────────────────

const args = process.argv.slice(2)
if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
  printRootHelp()
  process.exit(args.length === 0 ? 1 : 0)
}

const sub = args[0]
const subArgs = args.slice(1)

switch (sub) {
  case 'format':   await runFormat(subArgs); break
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

// ─── tdr format ────────────────────────────────────────────────────────────

async function runFormat(argv) {
  if (argv.includes('-h') || argv.includes('--help')) {
    printFormatHelp()
    return
  }

  const opts = parseFormatArgs(argv)
  if (!opts.input) {
    console.error('tdr format: missing input file')
    console.error(`Run 'tdr format --help' for usage.`)
    process.exit(1)
  }
  if (!existsSync(opts.input)) {
    console.error(`tdr format: input file not found: ${opts.input}`)
    process.exit(1)
  }

  // Lazy-load the markdown transformer — it pulls in remark/rehype, ~2 MB
  // of deps that other subcommands don't need.
  const { mdToTdr } = await import(join(PKG_ROOT, 'dist', 'markdown.mjs'))

  const md = readFileSync(opts.input, 'utf8')
  const { html, frontmatter, warnings } = await mdToTdr(md, {
    document:        !opts.fragment,
    defaultArchetype: opts.archetype,
    defaultLang:     opts.lang,
    runtimeScript:   opts.runtime,
  })

  for (const w of warnings) {
    console.error(`tdr format: ${w}`)
  }

  if (opts.output) {
    writeFileSync(opts.output, html)
    const fmHint = Object.keys(frontmatter).length
      ? ` (frontmatter: ${Object.keys(frontmatter).join(', ')})`
      : ''
    console.error(`tdr format: wrote ${opts.output}${fmHint}`)
  } else {
    process.stdout.write(html)
  }
}

function parseFormatArgs(argv) {
  const opts = {
    input: null,
    output: null,
    fragment: false,
    archetype: 'business-document',
    lang: 'zh-CN',
    runtime: undefined,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '-o' || a === '--output') opts.output = argv[++i]
    else if (a === '--fragment')        opts.fragment = true
    else if (a === '--archetype')       opts.archetype = argv[++i]
    else if (a === '--lang')            opts.lang = argv[++i]
    else if (a === '--runtime')         opts.runtime = argv[++i]
    else if (a.startsWith('--')) {
      console.error(`tdr format: unknown flag '${a}'`)
      process.exit(1)
    }
    else if (!opts.input) opts.input = a
    else {
      console.error(`tdr format: unexpected argument '${a}'`)
      process.exit(1)
    }
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
  format     Convert TDR-flavored Markdown to TDR HTML.
  critique   Lint a TDR document for structural and style issues.
  balance    Check the visual-component budget of a TDR document.

Common:
  -h, --help       Show help for a subcommand.
  -v, --version    Print version.

Examples:
  tdr format docs/spec.md -o spec.html
  tdr format docs/spec.md --fragment > body.html
  tdr critique spec.html
  tdr balance  spec.html
`)
}

function printFormatHelp() {
  process.stderr.write(`tdr format — Convert TDR-flavored Markdown to TDR HTML

Usage:
  tdr format <input.md> [options]

Options:
  -o, --output <file>     Write HTML to <file> instead of stdout.
      --fragment          Emit body fragment only (no <!doctype>, no <html>).
      --archetype <name>  Default archetype if frontmatter omits one.
                          (default: business-document)
      --lang <code>       Default lang attribute. (default: zh-CN)
      --runtime <url>     <script src> to use in standalone output.
                          (default: unpkg.com/@talon-ui/doc-runtime/dist/talon-doc-runtime.iife.js)
  -h, --help              Show this help.

Markdown conventions recognised (see docs/markdown-flavor.md):
  - GFM admonitions:        > [!NOTE]/[!WARNING]/[!TIP]/[!IMPORTANT]/[!CAUTION]
  - English prefix:         > NOTE: …  / > WARNING: …
  - Chinese prefix:         > 注意：…  / > 警告：…
  - Code fence with path:   \`\`\`ts file:src/auth.ts:8-16   → <src>
  - Task list:              - [x] done  / - [ ] todo       → <chk>/<ck>
  - Native details/summary:                                  → <c t="…">
`)
}

function printVersion() {
  const pkg = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8'))
  process.stdout.write(`tdr ${pkg.version}\n`)
}
