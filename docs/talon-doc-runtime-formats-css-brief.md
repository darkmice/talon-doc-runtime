# Talon Doc Runtime 文档格式与 CSS 设计清单

这份文档是给设计师与前端实现使用的 Talon Doc Runtime（TDR）速查表。它覆盖 runtime 当前支持的短 DSL 标签、`tdr-*` CSS class、状态属性和可替换的 CSS 变量契约。

当前 runtime 已实现一组组件标签；标记为 `planned` 的标签是后续设计目标，不代表当前 runtime 已实现。

## 项目定位

`talon-doc-runtime` 的使用方式是：

```text
Agent skill
  -> 输出短 HTML DSL
  -> 页面预加载 talon-doc-runtime
  -> runtime 扫描 DOM 并增强为结构化文档
  -> host 产品用 action registry 接业务事件
```

Agent 侧入口是 [SKILL.md](../SKILL.md)，不是提示词。Agent 不写 CSS、不写事件代码，只写结构、语义和动作意图。

## 命名原则

### Agent DSL 命名

- 面向 Agent 输出，优先短标签、短属性。
- 标签表达文档语义，不表达视觉样式。
- 事件统一用 `a` 表达 action，用 `to` 表达目标。
- 设计师不需要设计 `p-*`，只需要设计 `tdr-*`。

常用属性：

| 属性 | 含义 | 示例 |
|---|---|---|
| `t` | title / label | `<d t="结论">` |
| `s` | semantic state | `ok` / `bad` / `warn` / `note` / `info` |
| `k` | kind / callout type | `<call k="warn">` |
| `v` | verdict 或 value | `<d v="P0">` / `<m v="12ms">` |
| `d` | description | `<step d="说明">` |
| `p` | path | `<src p="src/a.ts:1-9">` |
| `l` | language | `<src l="ts">` |
| `x` | display text | `<ref x="auth.ts:8">` |
| `a` | action | `<btn a="open">` |
| `to` | target id | `<btn to="src1">` |
| `id` | anchor id | `<src id="src1">` |

### CSS 命名

- 根容器：`.tdr-root`
- 文档容器：`.tdr-doc`
- 组件主类：`.tdr-{semantic-name}`，例如 `.tdr-decision`
- 子元素：`.tdr-{semantic-name}-{part}`，例如 `.tdr-source-head`
- 状态：`data-s`、`data-k`、`data-a`、`data-mode`

### CSS 变量命名

CSS 不绑定任何现有产品 UI。设计师可以重新定义色彩、字体、间距、圆角和阴影，但变量名建议保持 `--tdr-*`，这样 runtime、demo 和上层产品只依赖稳定契约，不依赖某套具体视觉。

建议覆盖的核心变量：

```css
--tdr-bg, --tdr-canvas, --tdr-surface, --tdr-muted-surface
--tdr-text, --tdr-text-soft, --tdr-muted
--tdr-border, --tdr-border-soft, --tdr-strong-border
--tdr-accent, --tdr-accent-bg, --tdr-accent-line, --tdr-accent-strong
--tdr-ok, --tdr-ok-bg, --tdr-ok-line
--tdr-warn, --tdr-warn-bg, --tdr-warn-line
--tdr-bad, --tdr-bad-bg, --tdr-bad-line
--tdr-note, --tdr-note-bg, --tdr-note-line
--tdr-code-bg, --tdr-hover-bg
--tdr-font, --tdr-mono
--tdr-text-xs ... --tdr-text-3xl
--tdr-space-1 ... --tdr-space-11
--tdr-radius-2, --tdr-radius, --tdr-radius-pill
--tdr-shadow-1, --tdr-shadow-focus
```

`talon-doc-runtime` 自带 CSS 只是可运行的占位实现，不作为最终视觉参考。正式设计稿应直接给出一套新的 `tdr-*` 样式。

## 当前已实现格式

### 1. 决策卡片：`<d>` / `<decision>`

Agent DSL：

```html
<d s="bad" v="P0" t="并发 refresh 误撤销 token 家族">
  两个 tab 同时刷新同一个 token 时，第二个请求会撤销整个 token 家族。
</d>
```

Runtime DOM / CSS：

```text
.tdr-decision
.tdr-decision-head
.tdr-decision-title
.tdr-decision-body
.tdr-badge[data-s]
```

设计状态：

| `s` | 含义 | 视觉 |
|---|---|---|
| `ok` | 通过 / 安全 / 已采纳 | success |
| `bad` | 危险 / P0 / 否决 | error |
| `warn` | 风险 / P1 / 待复核 | warning |
| `note` | 备注 / 特殊说明 | magenta |
| `info` | 普通信息 | accent / info |

### 2. 提醒块：`<call>`

Agent DSL：

```html
<call k="warn" t="边界">
  Agent 只输出结构和动作意图，不输出 CSS 或事件代码。
</call>
```

Runtime DOM / CSS：

```text
.tdr-callout
.tdr-callout-body
.tdr-callout-title
```

设计状态：`k="ok|bad|warn|note|info"`。

### 3. 折叠详情：`<c>` / `<collapse>`

Agent DSL：

```html
<c t="复现链路">
  ...
</c>
```

Runtime DOM / CSS：

```text
.tdr-collapse
.tdr-collapse-title
.tdr-collapse-body
```

设计状态：

| 状态 | 设计要求 |
|---|---|
| closed | summary 可点击，内容隐藏 |
| open | 内容展开，层级清楚 |
| nested | 内部可嵌套 `<src>`、`<steps>`、`<d>` |

### 4. 代码证据：`<src>`

Agent DSL：

```html
<src id="refresh-src" p="src/auth/refresh.ts:8-16" l="ts">
  <pre><code>export async function rotateRefreshToken(token: string) {
  ...
}</code></pre>
</src>
```

Runtime DOM / CSS：

```text
.tdr-source
.tdr-source-head
.tdr-source-path
.tdr-source-lang
.tdr-source-body
.tdr-line
.tdr-copy
```

设计要求：

- Header 展示 path 和 lang。
- 代码块必须横向滚动，不撑破页面。
- `.tdr-line::before` 显示行号。
- Copy button 是代码块内的受控 action。
- 当 `<btn a="open" to="src-id">` 或 `<ref to="src-id">` 触发时，父级 `<c>` 也会一起展开。

### 5. 行内证据引用：`<ref>`

Agent DSL：

```html
关键证据见 <ref to="refresh-src" x="refresh.ts:8"></ref>。
```

Runtime DOM / CSS：

```text
.tdr-ref
.tdr-focus
```

设计要求：

- 行内 chip，不能破坏正文节奏。
- 点击后打开目标并滚动，目标出现 focus ring。

### 6. 受控动作按钮：`<btn>`

Agent DSL：

```html
<btn a="open" to="refresh-src">展开证据</btn>
<btn a="theme" to="dark">深色</btn>
```

Runtime DOM / CSS：

```text
.tdr-action
```

内置 action：

| `a` | 行为 |
|---|---|
| `jump` | 打开并滚动到目标 |
| `open` | 展开目标和父级 details |
| `close` | 收起目标 |
| `toggle` | 切换目标 |
| `copy` | 复制目标或当前代码 |
| `theme` | 切换 `dark` / `light` / `auto` |
| `emit` | 派发 `talon-doc:action` |

设计要求：

- 按钮要像控制台操作，不要像营销 CTA。
- hover / active / focus-visible 必须清晰。
- 后续业务 action 如 `accept`、`handoff`、`trace` 会复用同一按钮样式。

### 7. 指标：`<m>` / `<metric>`

Agent DSL：

```html
<m v="12ms" t="平均延迟"></m>
```

Runtime DOM / CSS：

```text
.tdr-metric
.tdr-metric-body
.tdr-metric-value
.tdr-metric-label
```

设计要求：数值突出，label 弱化，适合并排多项。

### 8. 简单流程：`<flow>`、`<n>`、`<arr>`

Agent DSL：

```html
<flow>
  <n>Agent DSL</n>
  <arr>mount</arr>
  <n>DOM scanner</n>
  <arr>enhance</arr>
  <n>HTML view</n>
</flow>
```

Runtime DOM / CSS：

```text
.tdr-flow
.tdr-flow-body
.tdr-node
.tdr-arrow
```

设计要求：

- 默认横向流程。
- 移动端允许 wrap。
- `<arr>` 应该是轻量连接语义，不是重图形。

### 9. 步骤链：`<steps>`、`<step>`

Agent DSL：

```html
<steps>
  <step s="ok" t="Tab A" d="先消费 T1，拿到 T2"></step>
  <step s="bad" t="Tab B" d="再次使用 T1，被当作重放攻击"></step>
</steps>
```

Runtime DOM / CSS：

```text
.tdr-steps
.tdr-steps-body
.tdr-step
.tdr-step-mark
.tdr-step-title
.tdr-step-desc
```

设计状态：`s="ok|bad|warn|note|info"`。

## DSL → CSS class 索引

下面是 runtime 当前实现的标签与其根 class。设计稿对组件样式的约定应映射到 `.tdr-*` class。

| 能力族 | Talon DSL | CSS 主类 |
|---|---|---|
| 决策 | `<d>` / `<decision>` | `.tdr-decision` |
| 提醒 | `<call>` / `<callout>` | `.tdr-callout` |
| 折叠 | `<c>` / `<collapse>` | `.tdr-collapse` |
| 源码证据 | `<src>` | `.tdr-source` |
| 简单代码块 | `<cb>` | `.tdr-code` |
| 行内引用 | `<ref>` | `.tdr-ref` |
| 行内徽标 | `<x>` | `.tdr-badge` |
| 行动按钮 | `<btn>` | `.tdr-action` |
| 主题分隔 | `<divider>` / `<hr2>` | `.tdr-divider` |
| 题记 | `<lead>` | `.tdr-lead` |
| 单指标 | `<m>` / `<metric>` | `.tdr-metric` |
| 指标容器 | `<ms>` / `<metrics>` | `.tdr-metrics` |
| 条形图容器 | `<bars>` | `.tdr-bars` |
| 单条形 | `<bar>` | `.tdr-bar` |
| 堆叠条 | `<sb>` / `<stacked>` | `.tdr-stacked-track` + `.tdr-stacked-legend` |
| 流程容器 | `<flow>` | `.tdr-flow` |
| 流程节点 | `<n>` / `<node>` | `.tdr-node` |
| 流程箭头 | `<arr>` / `<arrow>` | `.tdr-arrow` |
| 步骤容器 | `<steps>` | `.tdr-steps` |
| 单步骤 | `<step>` | `.tdr-step` |
| 分支根 | `<branch>` | `.tdr-branch` |
| 分支项 | `<bi>` | `.tdr-bcase` |
| 评估轨道容器 | `<tracks>` | `.tdr-tracks` |
| 评估轨道 | `<tk>` | `.tdr-track` |
| 优劣对比 | `<cmp>` / `<compare>` | `.tdr-compare` |
| 语境对比 | `<contrast>` | `.tdr-contrast` |
| 类比 | `<analogy>` | `.tdr-analogy` |
| 误解澄清 | `<myth>` | `.tdr-myth` |
| KV | `<kv>` / `<row>` | `.tdr-kv` |
| Tabs | `<tabs>` / `<tab>` | `.tdr-tabs` |
| Checklist | `<chk>` / `<ck>` | `.tdr-checklist` |
| 卡片网格 | `<grid>` / `<card>` | `.tdr-grid` + `.tdr-card` |
| 文件列表 | `<files>` / `<fg>` / `<f>` | `.tdr-files` |
| 证据组 | `<evidence>` / `<ei>` | `.tdr-evidence` |
| 发现 | `<finding>` | `.tdr-finding` |
| 术语 | `<term>` | `.tdr-term` |
| 时间线 | `<timeline>` / `<ev>` | `.tdr-timeline` + `.tdr-ev` |
| 风险登记表 | `<risk>` / `<r>` | `.tdr-risk` |

## 状态矩阵

设计师需要覆盖这些状态，而不是按具体组件重复造颜色。

| 状态类型 | Talon 值 | 说明 |
|---|---|---|
| 语义状态 | `ok` | 成功、通过、安全 |
| 语义状态 | `bad` | 错误、危险、P0 |
| 语义状态 | `warn` | 风险、注意、P1 |
| 语义状态 | `note` | 备注、审查、非阻塞 |
| 语义状态 | `info` | 普通信息 |
| 文件状态 | `add` / `mod` / `del` | planned；对应 added / modified / deleted |
| 步骤状态 | `ok` / `bad` / `warn` / `note` / `info` | 当前 `<step>` 复用语义状态 |
| 轨道状态 | `pass` / `polish` / `risk` / `block` / `note` | planned |
| 流程箭头 | `dash` / `thick` / `async` / `fail` | planned |
| 参数类型 | `range` / `select` / `toggle` | planned |
| 主题模式 | `data-mode="dark|light"` | current |

## 当前 CSS class 入口

当前 runtime 已生成这些 class，设计师应优先覆盖：

```text
.tdr-root
.tdr-doc
.tdr-decision
.tdr-decision-head
.tdr-decision-title
.tdr-decision-body
.tdr-badge
.tdr-callout
.tdr-callout-body
.tdr-callout-title
.tdr-collapse
.tdr-collapse-title
.tdr-collapse-body
.tdr-source
.tdr-source-head
.tdr-source-path
.tdr-source-lang
.tdr-source-body
.tdr-line
.tdr-copy
.tdr-ref
.tdr-action
.tdr-metric
.tdr-metric-body
.tdr-metric-value
.tdr-metric-label
.tdr-flow
.tdr-flow-body
.tdr-node
.tdr-arrow
.tdr-steps
.tdr-steps-body
.tdr-step
.tdr-step-mark
.tdr-step-title
.tdr-step-desc
.tdr-focus
```

后续扩展建议保持同一命名：

```text
.tdr-tabs .tdr-tab
.tdr-pages .tdr-page
.tdr-grid
.tdr-card
.tdr-code
.tdr-bars .tdr-bar
.tdr-files .tdr-file-group .tdr-file
.tdr-checks .tdr-check
.tdr-compare
.tdr-branch .tdr-branch-item
.tdr-tracks .tdr-track
.tdr-evidence .tdr-evidence-item
.tdr-params .tdr-param
```

## 设计交付范围

### 1. 页面基础

必须覆盖：

```html
<main class="tdr-doc">
<h1> <h2> <h3> <p> <a> <strong> <code> <pre><code>
<ul> <ol> <li> <table> <hr>
```

要求：

- 默认提供 dark mode，但具体风格由新设计决定。
- light mode 可读。
- 中文长句、代码标识符、英文混排不拥挤。
- 不做营销页，不做 hero，大量信息时仍能扫描。

### 2. 文档组件

当前优先级：

1. `<d>`、`<call>`、`<c>`、`<src>`、`<ref>`
2. `<btn>`、`<m>`、`<flow>`、`<steps>`
3. planned 的扩展组件

### 3. 交互状态

必须设计：

```text
hover
active
focus-visible
open / closed
copied
selected / active tab
dark / light
long content overflow
mobile wrap
```

## CSS 交付方式

设计稿不需要对接外部 token 包，直接产出 `tdr-*` 变量和 class 样式即可：

| 文档语义 | 建议变量 |
|---|---|
| 页面背景 | `--tdr-bg` |
| 文档画布 | `--tdr-canvas` |
| 组件表面 | `--tdr-surface` / `--tdr-muted-surface` |
| 代码背景 | `--tdr-code-bg` |
| 主文字 | `--tdr-text` |
| 次文字 | `--tdr-text-soft` / `--tdr-muted` |
| 弱边框 | `--tdr-border-soft` / `--tdr-border` |
| 强边框 | `--tdr-strong-border` |
| 主要动作 | `--tdr-accent` / `--tdr-accent-strong` |
| 成功 | `--tdr-ok` / `--tdr-ok-bg` / `--tdr-ok-line` |
| 警告 | `--tdr-warn` / `--tdr-warn-bg` / `--tdr-warn-line` |
| 错误 | `--tdr-bad` / `--tdr-bad-bg` / `--tdr-bad-line` |
| 审查/备注 | `--tdr-note` / `--tdr-note-bg` / `--tdr-note-line` |

接入时有两种方式：

1. 使用 IIFE 自动挂载：把最终 CSS 放在 runtime 脚本之后加载，用 `tdr-*` class 覆盖默认样式。
2. 使用模块手动挂载：调用 `mount(root, { injectStyles: false })`，完全不注入默认 CSS。

## 设计验收清单

- Agent 输出短标签时，不需要额外 class 也能有完整样式。
- `bad/warn/ok/note/info` 五个状态在暗色和亮色下都清晰。
- `<src>` 在长代码、长路径、中文注释、横向滚动下不破版。
- `<ref>` 行内显示不打断段落，并且点击目标有明显 focus。
- `<btn>` 看起来像工具按钮，不像营销按钮。
- `<c>` 展开后层级清楚；嵌套 `<src>` 时不拥挤。
- `<flow>` 移动端能换行，不出现箭头和节点重叠。
- `<steps>` 长中文标题和说明不重叠。
- light/dark 通过 `data-mode` 切换，不依赖外部服务。
- 设计稿能映射到 `tdr-*` class，组件层不需要再额外约定 class 命名。
