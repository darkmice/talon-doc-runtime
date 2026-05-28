# Talon Doc Runtime DSL 协议 (v2)

这个协议面向 Agent 输出。Agent 使用入口是仓库根目录的 `SKILL.md`；本文件是 skill 在需要细节时加载的协议参考。目标是让 Agent 用尽量少的 token 表达结构、判断、证据、动作意图——并且不需要操心样式。**样式由 archetype CSS 决定**，同一份 DSL 渲染成不同 archetype 时**完全不改 DSL**。

## 设计原则

- Agent 只写结构和语义，不写 CSS。
- Agent 只写动作意图，不写 JavaScript。
- 标签和属性短，但语义稳定。
- 同一份 DSL 必须在所有 archetype 下都能渲染。
- runtime 负责外观、事件、安全边界、archetype、主题。

## 标签词汇表

### 决策与提示

| 标签 | 含义 | 属性 | 子元素 |
|---|---|---|---|
| `<d>` | 决策 / 结论卡 | `s` 状态, `v` verdict, `t` 标题 | 任意正文 |
| `<call>` | 提示框 | `k` 类型, `t` 标题, `icon` | 任意正文 |

### 折叠与证据

| 标签 | 含义 | 属性 | 子元素 |
|---|---|---|---|
| `<c>` | 折叠详情 | `t` 标题, `o`/`open` 默认展开, `flat`/`borderless` 扁平样式 | 任意正文 |
| `<src>` | 代码 / 引用源（带行号 + 复制） | `id`, `p` 路径:起-止, `l` 语言, `o` 默认展开 | `<pre><code>` + 可选 `<note>` |
| `<ref>` | 行内跳转链接 | `to` 目标 id, `x` 显示文本 | — |
| `<btn>` | 受控动作按钮 | `a` 动作, `to` 目标 | 按钮文本 |
| `<x>` | 行内徽章 / 标签 | `s` 状态 | 标签文本 |

### 指标与图表

| 标签 | 含义 | 属性 | 子元素 |
|---|---|---|---|
| `<ms>` | 指标行容器（自动栅格） | — | `<m>` * N |
| `<m>` | 单个指标 | `v` 数值, `t` 标签 | — |
| `<bars>` | 横向 bar 容器 | — | `<bar>` * N |
| `<bar>` | 单条 bar | `t` 标签, `v` 显示值, `p` 百分比 (0-100), `s` 颜色 | — |
| `<sb>` | 堆叠 bar + 图例 | — | `<seg p s>` * N + `<lg t s>` * N |

### 流程

| 标签 | 含义 | 属性 | 子元素 |
|---|---|---|---|
| `<flow>` | 流程容器 | `v` / `vertical` 切到竖排 | `<n>` 与 `<arr>` 交替 |
| `<n>` | 流程节点 | `s` 颜色（accent/ok/warn/bad/note/purple…）, `meta` 副数据, `sub` 副标题 | 节点文本 |
| `<arr>` | 流程箭头 | `t` 标签 | — |

### 步骤

| 标签 | 含义 | 属性 | 子元素 |
|---|---|---|---|
| `<steps>` | 步骤容器 | `p`/`progress` 进度 (0-100) | `<step>` * N |
| `<step>` | 单步 | `s`/`status`/`progress`（done/active/bad/warn/info）, `t` 标题, `d` 描述, `f` flag, `fl` flag 文本 | — |

### 对比与数据

| 标签 | 含义 | 属性 | 子元素 |
|---|---|---|---|
| `<cmp>` | 优劣对比 | — | `<pro t>`, `<con t>` |
| `<kv>` | 键值列表 | — | `<row k v>` * N  |
| `<tabs>` | 标签页容器 | — | `<tab t>` * N |
| `<chk>` | 复选清单 | — | `<ck k>` * N（`k` 存在则已勾选） |

### 结构与资产

| 标签 | 含义 | 属性 | 子元素 |
|---|---|---|---|
| `<grid>` | 卡片栅格 | `c`/`cols` 列数 | `<card>` * N |
| `<card>` | 卡片 | `t` 标题 | 任意正文 + 可选 `<foot>` |
| `<files>` | 文件清单容器 | — | `<fg>` * N |
| `<fg>` | 文件模块分组 | `m`/`module` 模块路径 | `<f>` * N |
| `<f>` | 文件条目 | `p` 路径, `s` 状态（added/modified/deleted）, `why`/`purpose` 用途 | — |
| `<cb>` | 简化代码块（无行号） | `f`/`file` 头部标签 | `<pre><code>` |

### 原生 HTML

`<table>` / `<ul>` / `<ol>` / `<pre>` / `<h1>-<h6>` / `<p>` / `<code>` / `<hr>` / `<a>` 都直接走原生，archetype CSS 会重新美化。

## 状态枚举（`s` / `k`）

下列别名都会归一到核心 8 态之一：

| 归一值 | 别名 |
|---|---|
| `ok` | `approved`, `success`, `pass`, `passed`, `done`, `good` |
| `bad` | `rejected`, `danger`, `error`, `fail`, `failed`, `p0`, `blocked` |
| `warn` | `warning`, `risk`, `caution`, `p1`, `at-risk`, `polish` |
| `note` | `exploring`, `review`, `purple`, `pending`, `p2` |
| `info` | （默认） |
| `done` | 步骤已完成 |
| `active` | 步骤进行中 / `in-progress` / `wip` |
| `accent` | 品牌强调 |

未识别值原样保留——CSS 通过 `[data-s="..."]` 兜底成 `info` 样式。

## 事件协议

Agent 不写事件代码，只写动作意图：

```html
<btn a="open" to="refresh-src">展开证据</btn>
<btn a="jump" to="refresh-src">定位证据</btn>
<btn a="theme" to="dark">深色</btn>
<btn a="archetype" to="business-document">切换 archetype</btn>
```

runtime 内置动作：

| 动作 | 行为 |
|---|---|
| `jump` | 打开 + 滚动 + 高亮目标 |
| `open` / `close` / `toggle` | `<details>` 控制 |
| `copy` | 复制目标或当前 `<pre>` |
| `tab` | 切换 tab 面板（由 `<tabs>` 内部用） |
| `theme` | 切换 `light` / `dark` / `auto` |
| `archetype` | 切换 archetype（v 或 to 指定名字） |
| `emit` | 派发 `talon-doc:action` 自定义事件 |

宿主可注册新动作：

```ts
import { registerAction } from '@talon-ui/doc-runtime'

registerAction('accept', ({ target }) => {
  console.log('accept', target?.id)
})
```

## Archetype 协议

每个文档选**一个**archetype，写在根元素上：

```html
<html lang="zh-CN" data-archetype="business-document">
```

或在 mount 时传入：

```ts
TalonDocRuntime.mount(document.body, { archetype: 'business-document' })
```

或运行时切换：

```ts
TalonDocRuntime.setArchetype('business-document')
```

内置 archetype（v1）：

- `business-document` — 现代企业文档（Stripe Atlas / Vercel docs 风）。warm-neutral OKLCH 调色板、Inter 字族、单蓝 accent、8px 圆角、零阴影。

未来扩展（同一份 DSL）：`longform-reading` / `editorial-magazine` / `classic-novel` / `executive-brief` / `presentation-deck` / `newspaper-layout` / `academic-journal` / `textbook` / `zine` / `lookbook` / `knowledge-base`。

宿主可注册自定义 archetype：

```ts
import { registerArchetype, setArchetype } from '@talon-ui/doc-runtime'

registerArchetype('my-corp-style', `
  [data-archetype="my-corp-style"] {
    --tdr-bg: #ffffff;
    --tdr-text: #111;
    --tdr-accent: oklch(0.55 0.18 30);
    /* ...全套 token */
  }
`)
setArchetype('my-corp-style')
```

## 示例

```html
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

<ms>
  <m v="47" t="受影响文件"></m>
  <m v="~4h" t="预估工时"></m>
</ms>
```

完整示例见 `examples/showcase.tdr.html`。
