# TDR-flavored Markdown

`tdr format` 把一份 Markdown 文档转成 TDR HTML。它做三件事：

1. **原子映射**：标题、列表、代码块、强调 — Markdown 该有的全保留，渲染时由 TDR 主题接管视觉。
2. **语义增强**：识别几条"人写 Markdown 时已经形成的约定俗成"，自动转成 TDR 语义组件（`<call>`、`<src>`、`<c>`、`<chk>`）。
3. **frontmatter 配置**：用 YAML frontmatter 设置 archetype、title、theme、lang。

下面是这套规范的完整定义。**Agent 输出 Markdown 时遵守这些约定就能被自动 uplift**，不需要直接写 HTML 标签。

## Frontmatter

文档第一行 `---` 开启 YAML frontmatter，第二个 `---` 结束。字段：

| 字段 | 取值 | 默认 | 说明 |
|---|---|---|---|
| `archetype` | `business-document` / `editorial-longform` / 自定义 | `business-document` | 视觉风格 |
| `title` | 字符串 | 文档第一个 `# Heading` | `<title>` 与 OG meta |
| `lang` | `zh-CN` / `en-US` / … | `zh-CN` | `<html lang>` |
| `theme` | `light` / `dark` / `auto` | `auto` | 强制主题（覆盖系统设置） |

```markdown
---
archetype: editorial-longform
title: 认证系统重构方案
lang: zh-CN
theme: auto
---

# 第一章
...
```

自定义字段允许（会原样保留在 `frontmatter` 对象里），便于 enricher 读取。

## 原子映射（L1）

| Markdown | TDR HTML |
|---|---|
| `# H1` … `###### H6` | `<h1>` … `<h6>` |
| `**bold**` | `<strong>bold</strong>` |
| `*italic*` | `<em>italic</em>` |
| `` `code` `` | `<code>code</code>` |
| `[label](url)` | `<a href="url">label</a>` |
| `- item` / `1. item` | `<ul><li>` / `<ol><li>` |
| `> quote` | `<blockquote>` |
| `\`\`\`lang\\n…\\n\`\`\`` | `<pre><code class="language-lang">` |
| GFM 表格 | `<table>` |
| `---` | `<hr>` |
| 原生 HTML（如 `<d>`、`<call>`） | 直接透传 |

**原生 TDR 标签可以直接写在 Markdown 里**。比如想要一个决策卡片：

```markdown
正文段落 …

<d s="bad" v="P0" t="Token 家族被撤销">
  <because>两个 tab 同时刷新…</because>
  <so>整个家族被撤销…</so>
</d>

继续正文 …
```

## 语义增强（L2）

下面这五条规则会被自动应用。它们是"约定式"的 — 如果你的 Markdown 已经按这种方式写，输出会更精细。

### 1. Admonition → `<call>`

**GFM 风格**（GitHub 官方语法）：

```markdown
> [!NOTE]
> 内容。

> [!WARNING]
> 内容。

> [!IMPORTANT]
> 内容。

> [!TIP]
> 内容。

> [!CAUTION]
> 内容。
```

映射：

| GFM marker | TDR `<call k>` |
|---|---|
| `[!NOTE]` | `note` |
| `[!TIP]` | `ok` |
| `[!IMPORTANT]` | `warn` |
| `[!WARNING]` | `warn` |
| `[!CAUTION]` | `bad` |

**英文/中文行内约定**（不需要 GFM marker）：

```markdown
> NOTE: 这一段是提示。
> WARNING: 这一段是警告。

> 注意：中文也认。
> 警告：…
> 提示：…
> 重要：…
> 风险：…
> 危险：…
```

英文识别词：`NOTE`、`TIP`、`IMPORTANT`、`WARNING`、`CAUTION`、`DANGER`、`INFO`。
中文识别词：`注意`、`提示`、`警告`、`重要`、`风险`、`危险`、`信息`。

**普通 blockquote 不会被转**。只有以 marker 开头的 blockquote 才升级为 `<call>`。

### 2. 代码块 info 含路径 → `<src>`

代码 fence 的 info string 里如果出现**文件路径**（带扩展名）+ 可选**行号区间**，整个代码块升级为 `<src>`：

```markdown
\`\`\`ts file:src/auth.ts:8-12
if (record.consumedAt) revokeFamily(record.familyId)
\`\`\`

\`\`\`ts src/payment.ts:42
return processAsNew(key)
\`\`\`

\`\`\`ts path=packages/sdk/uuid7.ts
export function generateUUIDv7() { /* … */ }
\`\`\`
```

输出：

```html
<src id="src-auth-ts-8-12" p="src/auth.ts:8-12" l="ts">
  <pre><code class="language-ts">if (record.consumedAt) revokeFamily(record.familyId)</code></pre>
</src>
```

**识别规则**：info string 里第一个匹配 `<path>.<ext>` 的子串（可选跟 `:行号` 或 `:起-止`）会被作为 `p=` 属性。前缀 `file:` / `path=` 可加可不加。

**普通代码块**（info 只有语言）不会被转：

```markdown
\`\`\`js
console.log('hi')
\`\`\`
```

→ `<pre><code class="language-js">`，TDR 主题渲染但不挂 `<src>` 的折叠 / 行号 UI。

### 3. Task list → `<chk>`/`<ck>`

GFM checkbox 列表自动转 `<chk>` + `<ck>`：

```markdown
- [x] 完成的任务
- [ ] 未完成的任务
- [x] 又一个完成的
```

→

```html
<chk>
  <ck k="true">完成的任务</ck>
  <ck>未完成的任务</ck>
  <ck k="true">又一个完成的</ck>
</chk>
```

**整组列表必须都是 checkbox** — 只要有一项是普通 bullet，整组按 `<ul>` 处理，不升级。

### 4. `<details>`/`<summary>` → `<c>`

直接写 HTML details 块：

```markdown
<details>
<summary>展开看证据</summary>

代码或更多说明 …

</details>
```

→ `<c t="展开看证据">…</c>`

带 `open` 时自动加 `o="true"`：

```markdown
<details open>
<summary>这块默认展开</summary>
…
</details>
```

→ `<c t="这块默认展开" o="true">…</c>`

### 5. 直接写 TDR 标签

任何想表达"我就要这个具体组件"的地方，直接写原生 TDR 标签即可：

```markdown
## 决策

<d s="approved" v="已采纳" t="幂等键改 UUIDv7">
  <because>当前实现无法保证唯一性。</because>
  <so>客户端生成 UUIDv7 透传，重试自然去重。</so>
</d>

## 时间线

<timeline>
  <ev d="09:14" s="bad">首笔重复扣款</ev>
  <ev d="09:36" s="ok">紧急止血</ev>
</timeline>
```

这是**最直接的方式**。语义增强只为节省常见模式的 token，需要精确控制时直接写 HTML 比"猜约定"更可靠。

## 输出形态

`tdr format` 默认产生**完整的 `<!doctype html>` 文档**。要嵌入到已有页面里，加 `--fragment`：

```bash
tdr format docs/spec.md                  # 完整 HTML
tdr format docs/spec.md --fragment       # 只有 <body> 里的内容
tdr format docs/spec.md -o spec.html     # 写到文件
tdr format docs/spec.md --archetype editorial-longform
tdr format docs/spec.md --runtime ./local-tdr.iife.js   # 自定义 runtime 脚本路径
```

## 编程接口

CLI 之外，也可以在自己的代码里调用：

```ts
import { mdToTdr } from '@talon-ui/doc-runtime/markdown'

const { html, frontmatter, warnings } = await mdToTdr(markdownString, {
  document: true,                  // false → fragment
  defaultArchetype: 'business-document',
  defaultLang: 'zh-CN',
  runtimeScript: 'https://unpkg.com/@talon-ui/doc-runtime/dist/talon-doc-runtime.iife.js',
  enrich: async (frag, ctx) => {
    // 调 LLM 进一步识别段落语义，把散文重写成 <d>/<myth>/<contrast> 等。
    return await mySemanticUplifter(frag, ctx)
  },
})
```

`enrich` 是异步钩子。它接收**已经过 L1+L2 转换**的 HTML 片段和 frontmatter / 原文上下文，返回升级后的 HTML。典型实现：调用 Claude，给一段 system prompt 说明"把这些段落识别为 `<d>` / `<myth>` / `<contrast>`"，让它产出更结构化的输出。

CLI 暂时**不直接暴露 `--enrich`**（避免硬绑定 LLM 提供商）。需要 enrichment 的人在自己的工作流里 `import { mdToTdr }` 自行实现。

## 关于 Markdown 写作风格

最佳实践是**用尽可能简洁的 Markdown + 少量原生 TDR 标签**：

- 散文、列表、表格、代码块 → 用 Markdown 写。
- 决策、误解澄清、类比、分支、风险登记 → 用原生 `<d>` / `<myth>` / `<analogy>` / `<branch>` / `<risk>` 写。
- 提示、警告 → 用 admonition 约定写（`> [!NOTE]` 或 `> 注意：`）。
- 代码引用（有行号/路径） → 用 fence info 约定写（`file:src/x.ts:5-10`）。
- 折叠详情 → 用 `<details>` 写或直接用 `<c>`。

这样 Agent 输出最紧凑，转换后又能产生丰富的 TDR 组件。
