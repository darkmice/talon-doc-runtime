#!/usr/bin/env node
// critique.mjs — 静态检查一份 TDR HTML 文档是否符合 references/canvas.md。
//
// 用法:
//   node scripts/critique.mjs path/to/doc.html
//
// 退出码:
//   0  没有错误（可能有警告）
//   1  存在错误
//
// 检查规则：
//   E1  缺少 <h1> 或存在多个 <h1>
//   E2  <ref to="X"> 找不到匹配的 id="X" 目标
//   E3  文档里出现 Markdown 语法残留（``` / ## / **bold** / - list）
//   E4  属性值里有中文引号 “/”
//   W1  <d> 缺少 verdict 属性 (v=)
//   W2  <call> 数量过多（> 3）— 打断信号失效
//   W3  <d s="approved"> 但全文没有任何 <d s="rejected">
//   W4  空 <c></c>
//   W5  两个顶层重组件直接相邻、中间没有散文桥接
//   I1  存在 <src id="X"> 但没有 <ref> 指向它

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
if (args.length < 1) {
  console.error('用法: node scripts/critique.mjs <doc.html>')
  process.exit(2)
}

const file = resolve(args[0])
const src = readFileSync(file, 'utf-8')

let errors = 0
let warnings = 0

const err = (code, msg) => { errors++; console.error(`  ✗ [${code}] ${msg}`) }
const warn = (code, msg) => { warnings++; console.warn(`  △ [${code}] ${msg}`) }
const info = (code, msg) => console.log(`  · [${code}] ${msg}`)

console.log(`\n🔍 lint: ${file}\n`)

// ─── 工具：从源码里剥掉注释、代码块，避免误报
function stripNoise (s) {
  return s
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<pre[\s\S]*?<\/pre>/gi, '')
    .replace(/<cb[\s>][\s\S]*?<\/cb>/gi, '')
    .replace(/<src[\s>][\s\S]*?<\/src>/gi, '')
}

const cleanSrc = stripNoise(src)
const proseSrc = cleanSrc

// ─── E1: H1
const h1s = cleanSrc.match(/<h1[\s>]/g) ?? []
if (h1s.length === 0) {
  err('E1', '文档缺少 <h1>。')
} else if (h1s.length > 1) {
  err('E1', `存在 ${h1s.length} 个 <h1>，一份文档只应有一个。`)
}

// ─── E2 / I1: ref <-> id 对齐（必须在剥除 <src> / <c> 之前，从原文里取 id）
// 但是要去掉 HTML 注释，避免示例代码里的 id 被当真。
const srcNoComments = src.replace(/<!--[\s\S]*?-->/g, '')
const refTargets = []
{
  const re = /<ref\b[^>]*\bto="([^"]+)"/g
  let m
  while ((m = re.exec(srcNoComments)) !== null) refTargets.push(m[1])
}

const ids = new Set()
{
  const re = /<(?:src|c)\b[^>]*\bid="([^"]+)"/g
  let m
  while ((m = re.exec(srcNoComments)) !== null) ids.add(m[1])
}

for (const to of refTargets) {
  if (!ids.has(to)) {
    err('E2', `<ref to="${to}"> 找不到对应的 <src id="${to}"> 或 <c id="${to}">。`)
  }
}
for (const id of ids) {
  if (!refTargets.includes(id)) {
    info('I1', `<src id="${id}"> 没有任何 <ref> 指向它 — 可考虑加 ref 或去掉 id。`)
  }
}

// ─── E3: Markdown 残留
const mdRules = [
  { re: /^```/m, msg: 'Markdown 代码栅栏 (```)，请改用 <cb> 或 <src>。' },
  { re: /^#{1,6}\s/m, msg: 'Markdown 标题（## ...），请改用 <h2> 等 HTML 标签。' },
  { re: /\*\*[^*\n]+\*\*/m, msg: 'Markdown 粗体 (**...**)，请改用 <strong>。' },
  { re: /^\s*-\s+\S/m, msg: 'Markdown 无序列表项 (- ...)，请改用 <ul><li>。' },
]
for (const { re, msg } of mdRules) {
  if (re.test(proseSrc)) err('E3', msg)
}

// ─── E4: 中文引号出现在属性里
{
  // 简单地扫描所有 attr="value" 段，看 value 里是否含 “ 或 ”
  const re = /\b\w+="([^"]*)"/g
  let m
  while ((m = re.exec(cleanSrc)) !== null) {
    const v = m[1]
    if (v.includes('“') || v.includes('”')) {
      err('E4', `属性值出现中文引号 “/”：${m[0].slice(0, 80)}…`)
    }
  }
}

// ─── W1: <d> 缺 verdict
{
  const re = /<d\b([^>]*)>/g
  let m
  while ((m = re.exec(cleanSrc)) !== null) {
    const attrs = m[1]
    if (!/\b(v|verdict)\s*=/.test(attrs)) {
      warn('W1', `<d ${attrs.trim().slice(0, 60)}…> 缺少 v="..." (verdict)。`)
    }
  }
}

// ─── W2: callout 数量
{
  const calls = cleanSrc.match(/<call\b/g) ?? []
  if (calls.length > 3) {
    warn('W2', `<call> 出现 ${calls.length} 次（建议 ≤ 3）— 过多 callout 会让打断信号失效。`)
  }
}

// ─── W3: approved 没有配对 rejected
{
  const hasApproved = /<d\b[^>]*\bs="(approved|ok)"/.test(cleanSrc)
  const hasRejected = /<d\b[^>]*\bs="(rejected|bad)"/.test(cleanSrc)
  if (hasApproved && !hasRejected) {
    warn('W3', '有 <d s="approved"> 但没有任何 <d s="rejected"> — 决定的"为什么不是其它"是否缺失？')
  }
}

// ─── W4: 空 <c>（用 srcNoComments，不能用 cleanSrc — 后者已经剥掉了 <pre>/<src>）
{
  const re = /<c\b[^>]*>\s*<\/c>/g
  let m
  while ((m = re.exec(srcNoComments)) !== null) {
    warn('W4', `空 <c> 块：${m[0].slice(0, 80)}…`)
  }
}

// ─── W5: 顶层重组件直接相邻
{
  const HEAVY = ['d', 'flow', 'branch', 'cmp', 'contrast', 'analogy', 'myth',
                 'steps', 'sb', 'tracks', 'timeline', 'risk', 'evidence']
  // 把所有 <c>...</c> 内部内容剔除（折叠里允许密集组件）
  const topLevel = cleanSrc.replace(/<c\b[\s\S]*?<\/c>/g, '')

  // 收集顶层重组件出现的 (start, tag) 列表，按位置排序
  const positions = []
  for (const tag of HEAVY) {
    const re = new RegExp(`<${tag}\\b[^>]*>`, 'g')
    let m
    while ((m = re.exec(topLevel)) !== null) {
      positions.push({ idx: m.index, tag })
    }
  }
  positions.sort((a, b) => a.idx - b.idx)

  // 两个相邻位置之间，如果中间没有 <p> 或 <hr>，标警
  for (let i = 1; i < positions.length; i++) {
    const between = topLevel.slice(positions[i - 1].idx, positions[i].idx)
    // 跳过自闭合后的结束标签，看中间是否出现 <p> 或 <hr>
    if (!/<p[\s>]/.test(between) && !/<hr[\s>/]/.test(between) && !/<h[1-6][\s>]/.test(between)) {
      warn('W5', `<${positions[i - 1].tag}> 与 <${positions[i].tag}> 之间没有散文/分隔/标题作为桥接。`)
    }
  }
}

// ─── 总结
console.log(`\n${'─'.repeat(40)}`)
if (errors === 0 && warnings === 0) {
  console.log('✅ 无问题')
} else {
  console.log(`${errors} error(s), ${warnings} warning(s)`)
}
process.exit(errors > 0 ? 1 : 0)
