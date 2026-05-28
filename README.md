# Talon Doc Runtime

> Agent 出 DSL，runtime 出版式。一份短标签 HTML，渲染成可投递的结构化文档。

`talon-doc-runtime`（下文简称 **TDR**）是一个面向 Agent 的结构化文档运行时。Agent 输出一组短小、语义明确的 HTML 标签 — `<d>` / `<src>` / `<branch>` / `<evidence>` / `<myth>` 等 — 浏览器加载 runtime 后，DOM 被原地增强为带主题、折叠、代码高亮、引用跳转和受控事件的可交付文档。

它的设计目标只有一个：**让 Agent 用尽可能少的 token，输出结构稳定、视觉成熟、可复用的文档制品**。

## 主要特性

- **30+ 语义组件**：决策卡（`<d>`）、误解澄清（`<myth>`）、类比（`<analogy>`）、分支可能性（`<branch>`）、评估轨道（`<tracks>`）、风险登记（`<risk>`）、时间线、流程图、引用证据……每个组件对应一种"读者在第几秒该看到什么"的判断。
- **Archetype 视觉系统**：同一份 DSL，切换 `data-archetype` 即可在"商务文档"和"长文杂志"之间无损切换。新增 archetype 只需要写一份 CSS，不动 DSL。
- **受控动作协议**：Agent 写 `<btn a="open" to="src1">`，runtime 处理事件分发；宿主通过 `registerAction()` 接入业务系统。Agent 永远不写 JS。
- **代码即证据**：`<src p="file:line-line" l="ts">` 渲染出折叠的源码块，配可点击的行号、复制按钮、内联注解、跨段引用跳转。
- **完整暗色模式**：OKLCH 调色板，浅色/深色都经过手工调过感知亮度，避免"暗色模式 = 把背景调成黑"这种廉价做法。
- **零依赖、单 IIFE**：编译后约 220 KB（含 highlight.js 子集），无 Vue / React / Lit。

## 快速开始

### 在浏览器里看效果

```bash
pnpm install
pnpm build
python3 -m http.server 4174
```

打开下面任一示例：

- <http://localhost:4174/examples/showcase.tdr.html> — 完整组件总览（business-document）
- <http://localhost:4174/examples/showcase.editorial.tdr.html> — 长文风格（editorial-longform）
- <http://localhost:4174/examples/demo.html> — 最小示例

### 在你的页面里集成

```html
<html data-archetype="business-document">
  <body>
    <main class="tdr-doc">
      <h1>支付链路 P0 复盘</h1>

      <d s="bad" v="P0" t="幂等键碰撞导致重复扣款">
        <because>键由"订单号 + 秒级时间戳"拼成，同一秒内的两次请求会得到相同的键。</because>
        <so>改由客户端在请求前生成 UUIDv7，通过 header 透传，重试自然去重。</so>
      </d>

      <c t="复现链路">
        <src id="bug-site" p="src/gateway/idempotency.ts:42-58" l="ts">
          <pre><code>switch (record?.status) {
  case 'committed': case 'failed': return replay(record)
  // BUG: missing 'processing' case
  default: return processAsNew(key, req)
}</code></pre>
        </src>
      </c>

      <btn a="open" to="bug-site">展开证据</btn>
    </main>
    <script src="/dist/talon-doc-runtime.iife.js"></script>
  </body>
</html>
```

IIFE 包会自动 `mount()`。要手动控制：

```ts
import { mount, registerAction, setArchetype } from '@talon-ui/doc-runtime'

registerAction('accept', ({ target }) => {
  acceptArtifact(target?.id)
})

setArchetype('editorial-longform')
mount(document.querySelector('#artifact'))
```

## 给 Agent 使用：Skill 安装

TDR 以 Anthropic Skills 格式打包，安装后任何 Agent 会话提到"结构化文档 / 复盘 / 决策记录 / 评审报告"时自动触发。

```bash
pnpm build              # 先构建 runtime
pnpm skill:pack         # 验证 + 打包出 dist/skill/talon-doc-runtime.skill
```

把 `dist/skill/talon-doc-runtime.skill` 在 Claude Code 里一键安装，或解压到 `~/.claude/skills/`。

Skill 包含的资源：

```
talon-doc-runtime.skill
└── talon-doc-runtime/
    ├── SKILL.md                              触发条件 + DSL 速查 + 最小骨架
    ├── references/
    │   ├── canvas.md                         写作准则（视觉预算、组件选型、状态契约）
    │   └── lineage.md                        改完 runtime 后的回流 SOP
    ├── scripts/
    │   ├── critique.mjs                      结构 & 风格 lint（节点对齐、Markdown 残留、callout 滥用）
    │   └── balance.mjs                       视觉预算（重组件 ≤ 1.5 × <h2>）
    └── assets/
        └── talon-doc-runtime.iife.js         runtime 本体
```

`SKILL.md`、`references/canvas.md` 与 `references/lineage.md` 在仓库根的同名路径下也能直接阅读 — 它们是仓库与 skill 共享的同一份契约。

## DSL 速查

完整协议见 [docs/protocol.md](docs/protocol.md)。下面是按"读者在文档里想做什么"组织的命中表：

| 想表达 | 用 |
|---|---|
| 判断 + 前提 + 结论 | `<d>` + `<because>` + `<so>` |
| 重要打断 / 注意事项 | `<call k="info\|note\|warn\|bad\|ok">` |
| 折叠详情 | `<c>` |
| 代码证据（折叠 + 行号 + 注解） | `<src id p l>` 内含 `<pre><code>` + `<note>` |
| 简单代码片段 | `<cb f>` |
| 行内跳转 | `<ref to="id">` |
| 行内状态徽标 | `<x s>` |
| 受控按钮 | `<btn a to>` |
| 关键指标行 | `<ms>` + `<m v t>` |
| 顺序步骤 | `<steps p>` + `<step s t d>` |
| 并行分支可能性 | `<branch r>` + `<bi c s out>` |
| 多维评估轨道 | `<tracks>` + `<tk t f>` |
| 横向柱状图 | `<bars>` + `<bar t v p s>` |
| 堆叠条 + 图例 | `<sb>` + `<seg p s>` + `<lg t s>` |
| 流程图（线性） | `<flow v>` + `<n s t meta>` + `<arr t>` |
| 优劣两栏 | `<cmp>` + `<pro>` + `<con>` |
| 同一词两种语境 | `<contrast w d>` + `<l c>` + `<r c>` |
| "A ≈ B" 类比 | `<analogy s sd t td why>` |
| 误解 → 事实 | `<myth>` + `<wrong>` + `<right>` |
| 结论 + 论据 | `<evidence t>` + `<ei>` |
| 单条洞察 | `<finding t>` + `<detail>` |
| 时间线 | `<timeline>` + `<ev d t s>` |
| 风险登记 | `<risk>` + `<r t sev lik mit>` |
| Key-Value | `<kv>` + `<row k v vk>` |
| Tabs | `<tabs>` + `<tab t>` |
| Checklist | `<chk>` + `<ck k>` |
| 卡片网格 | `<grid c>` + `<card t>` + `<foot>` |
| 文件变更清单 | `<files>` + `<fg m>` + `<f p s why>` |
| 行内术语（hover 定义） | `<term w d>` |
| 题记 | `<lead>` |

状态属性 `s` / `k` 接受语义值：`ok`、`bad`、`warn`、`note`、`info`、`done`、`active`、`accent`。常见别名（`approved` / `rejected` / `success` / `danger` / `exploring` / `pending` / `p0` / `p1` / `p2` / `blocked` / `at-risk` ...）会被自动规范化。

## Archetype 系统

一份 DSL，多套视觉。在根元素上挂 `data-archetype` 选择风格：

```html
<html data-archetype="business-document">  <!-- 或 editorial-longform -->
```

| Archetype | 视觉血统 | 适用 |
|---|---|---|
| `business-document` | Stripe Atlas / Linear changelog / Vercel docs article pages | 工程报告、决策记录、复盘、交付文档 |
| `editorial-longform` | 文学杂志 / 衬线长文 | 深度长文、技术随笔、评论 |

注册自定义 archetype：

```ts
import { registerArchetype, setArchetype } from '@talon-ui/doc-runtime'
registerArchetype('my-style', CSS_STRING)
setArchetype('my-style')
```

CSS 契约见 [docs/talon-doc-runtime-formats-css-brief.md](docs/talon-doc-runtime-formats-css-brief.md) — 所有可覆盖的 `--tdr-*` token 都在里面。

## 受控动作

Agent 写**意图**，不写**代码**：

```html
<btn a="open"      to="bug-site">展开证据</btn>
<btn a="jump"      to="bug-site">定位</btn>
<btn a="copy">复制</btn>
<btn a="theme"     to="dark">深色</btn>
<btn a="archetype" to="editorial-longform">切换长文风</btn>
<btn a="emit"      to="my-event">触发自定义事件</btn>
```

内置动作：`jump` / `open` / `close` / `toggle` / `copy` / `tab` / `theme` / `archetype` / `emit`。宿主通过 `registerAction(name, handler)` 接入业务事件，例如把 `accept`、`handoff`、`open-in-jira` 等接回 Talon Pilot / 自有平台。

## 项目结构

```
talon-doc-runtime/
├── src/
│   ├── index.ts                          renderer 注册 + mount + action registry
│   └── styles/
│       ├── base.css.ts                   跨 archetype 的组件骨架
│       └── archetypes/
│           ├── business-document.css.ts
│           └── editorial-longform.css.ts
├── docs/
│   ├── protocol.md                       完整 DSL 协议
│   ├── architecture.md                   runtime / host / Agent 三方边界
│   └── talon-doc-runtime-formats-css-brief.md   CSS 契约速查
├── references/                           skill 内嵌的写作 references
│   ├── canvas.md
│   └── lineage.md
├── scripts/
│   ├── build.mjs                         esbuild 构建
│   ├── critique.mjs                      文档 lint
│   └── balance.mjs                       视觉预算计算
├── examples/
│   ├── demo.html
│   ├── showcase.tdr.html                 完整组件总览
│   └── showcase.editorial.tdr.html
├── tests/                                Vitest + jsdom
└── SKILL.md                              skill 入口
```

## 文档地图

- **[SKILL.md](SKILL.md)** — Agent 入口，给 LLM 看。
- **[references/canvas.md](references/canvas.md)** — 写作准则（视觉预算、组件选型、状态契约）。
- **[references/lineage.md](references/lineage.md)** — 改完组件后如何回流到契约层。
- **[docs/protocol.md](docs/protocol.md)** — 完整 DSL 协议，包括所有标签的属性、子标签、行为细节。
- **[docs/architecture.md](docs/architecture.md)** — runtime、host、Agent 三方的责任边界。
- **[docs/talon-doc-runtime-formats-css-brief.md](docs/talon-doc-runtime-formats-css-brief.md)** — CSS class 与 token 契约。

## 开发与验证

```bash
pnpm install
pnpm typecheck            # TypeScript
pnpm test                 # Vitest（runtime + 渲染 + smoke）
pnpm build                # esbuild → dist/

# 文档质量检查（可对任意 TDR HTML 文件运行）
node scripts/critique.mjs path/to/doc.html
node scripts/balance.mjs  path/to/doc.html
```

`pnpm skill:pack` 会把当前 SKILL.md + references + scripts + dist runtime 打包成可分发的 `.skill` 文件。

## 发版

每次 push / PR 都会跑 CI（typecheck + test + build）。npm 发布由**推送 git tag**触发：

```bash
# 1. 修改 package.json 里的 version（必须与即将创建的 tag 一致）
#    例如 0.1.0 → 0.1.1
pnpm version patch       # 自动改 package.json + 创建本地 tag v0.1.1

# 2. 推送 tag
git push --follow-tags

# 3. GitHub Actions 自动：
#    - 校验 tag 与 package.json version 一致
#    - 跑 typecheck / test / build
#    - npm publish --provenance --access public
#    - 创建 GitHub Release（自动生成 changelog）
```

首次发布前，需要在 GitHub repo Settings → Secrets and variables → Actions 配置一个 `NPM_TOKEN` secret，token 在 npmjs.com → Access Tokens → Generate New Token → **Automation**（必须是 automation 类型，否则 provenance 签名会失败）。

预发版本用带连字符的 tag，会自动标记为 prerelease：

```bash
pnpm version prerelease --preid=rc   # 0.1.1 → 0.1.2-rc.0
git push --follow-tags
```

## 项目边界

TDR 属于 Talon 生态里的底层可复用能力：

- **提供**：Agent DSL runtime、受控事件协议、Archetype 视觉系统、组件库。
- **不提供**：业务流程、产品壳、文档站、CMS、协作编辑。

上层产品（Talon Pilot、SuperClaw 等）通过 `registerAction()` 把 `accept` / `handoff` / `trace` / `open-artifact` 等动作接回自己的业务系统；通过 `registerArchetype()` 提供品牌化的视觉皮肤。

## License

MIT.
