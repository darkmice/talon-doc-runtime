#!/usr/bin/env node
// balance.mjs — 计算文档的"视觉重组件预算"。
//
// 规则（来自 references/canvas.md §2）：
//   顶层可见的重组件总数 ≤ 1.5 × <h2> 数量
//
// 顶层意味着"不在 <c>...</c> 折叠块内"。
// 重组件清单：
//   <d>  <flow>  <branch>  <cmp>  <contrast>  <analogy>  <myth>
//   <steps>  <sb>  <tracks>  <timeline>  <risk>  <evidence>
//
// <src> 与 <ref> 不计入预算（代码引用越多越好）。
//
// 用法:
//   node scripts/balance.mjs path/to/doc.html
//
// 退出码:
//   0  在预算内
//   1  超出预算

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
if (args.length < 1) {
  console.error('用法: node scripts/balance.mjs <doc.html>')
  process.exit(2)
}

const file = resolve(args[0])
const src = readFileSync(file, 'utf-8')

const HEAVY = ['d', 'flow', 'branch', 'cmp', 'contrast', 'analogy', 'myth',
               'steps', 'sb', 'tracks', 'timeline', 'risk', 'evidence']

// 折叠块内的组件全部不计
const topLevel = src.replace(/<c\b[\s\S]*?<\/c>/g, '')

const breakdown = {}
let heavyCount = 0
for (const tag of HEAVY) {
  const re = new RegExp(`<${tag}\\b[^>]*>`, 'g')
  const n = (topLevel.match(re) ?? []).length
  if (n > 0) breakdown[tag] = n
  heavyCount += n
}

const h2Count = (topLevel.match(/<h2[\s>]/g) ?? []).length
const budget = Math.ceil(Math.max(h2Count, 1) * 1.5)

console.log(`\n📊 视觉预算：${file}\n`)

console.log(`  <h2>           ${h2Count}`)
console.log(`  顶层重组件     ${heavyCount}`)
console.log(`  预算上限       ${budget}  ( = ⌈ ${Math.max(h2Count, 1)} × 1.5 ⌉ )`)

if (Object.keys(breakdown).length > 0) {
  console.log('\n  分布：')
  const sorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1])
  for (const [tag, n] of sorted) {
    console.log(`    <${tag.padEnd(10)} ${String(n).padStart(2)}`)
  }
}

console.log(`\n${'─'.repeat(40)}`)
if (h2Count === 0) {
  console.log('△ 文档没有 <h2> 章节 — 视觉预算建议至少切出 2~3 节作为骨架。')
  process.exit(0)
}
if (heavyCount > budget) {
  console.log(`✗ 超出预算 ${heavyCount - budget} 个 — 考虑把若干组件挪进 <c> 折叠块，或改写为散文。`)
  process.exit(1)
}
console.log(`✅ 在预算内（剩余 ${budget - heavyCount} 个组件额度）`)
process.exit(0)
