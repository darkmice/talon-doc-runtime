# Launch tweets — three angles

挑一条发就好，别全发（同一个 timeline 重复发布看起来很 forced）。

平台预设：
- 字数：x.com 单条上限 280 字符（英文）/ 140 字（中文）。下面三版都按英文 ≤ 270 设计，留位置给 hashtag 或感叹号。
- 主图：OG 卡片在 https://darkmice.github.io/talon-doc-runtime/og.svg
  （x.com 偶尔抓不到 SVG → unfurl 会变成纯文本卡，仍可读，但要看预览效果就先在 https://cards-dev.twitter.com/validator 验证一下；如果发现 SVG 不出图，参考底部「关于 SVG OG 图」一节准备 PNG 备份）
- 主链接：放在 tweet 末尾会被 x.com 自动 unfurl 成卡片，所以**只保留一个链接**就行，避免分散预览权重。

---

## 方案 A — Builder 发布型（推荐）

> Just shipped **Talon Doc Runtime** —
> an agent-native HTML DSL for structured documents.
>
> Short tags like `<d>`, `<evidence>`, `<branch>`, `<myth>` get rendered
> into themed, interactive docs — decisions, evidence cards, branch flows,
> all styled, dark-mode aware.
>
> Drop-in for Claude / GPT artifacts.
>
> 👉 https://darkmice.github.io/talon-doc-runtime/

**字符数**：~270。**适用**：开发者社区 / OSS 发布社群（X 上的 `#buildinpublic`、`#opensource`）。

中文版（如果你想发中文）：

> 刚发了 **Talon Doc Runtime** —
> 一套给 Agent 用的结构化文档 DSL。
>
> 短标签 `<d>` `<evidence>` `<branch>` `<myth>` 直接渲染成带主题、可交互的文档卡片 —
> 决策、证据、分支流程，深色模式自动跟随。
>
> 让 Claude 输出的文档不再像"半成品 Markdown"。
>
> 👉 https://darkmice.github.io/talon-doc-runtime/

---

## 方案 B — Problem → Solution 叙事

> Tired of Claude / GPT outputs that look like half-baked markdown
> with no visual hierarchy?
>
> Give your agent a 30-tag HTML DSL instead.
>
> It'll write `<d s="bad" v="P0">…</d>` and you'll get a styled
> decision card, with evidence collapsed below — at lower token cost
> than the equivalent prose.
>
> 👉 https://darkmice.github.io/talon-doc-runtime/

**字符数**：~270。**适用**：引发讨论 / quote-tweet 用，立场更鲜明。可能招来"为什么不直接用 markdown"的争论，准备好回复。

---

## 方案 C — 代码演示型

> Agent writes:
>
>   `<d s="bad" v="P0" t="Token family revoked">`
>   `  <because>Two tabs race the consumed? check.</because>`
>   `  <so>Whole family revoked. Both tabs logged out.</so>`
>   `</d>`
>
> Reader sees: a styled decision card, premise + conclusion,
> verdict chip, evidence collapsed below.
>
> @talon-ui/doc-runtime — https://darkmice.github.io/talon-doc-runtime/

**字符数**：~265。**适用**：Hacker News / X 工程师圈，代码即诱饵。预览图会被 OG 卡片占满 — 整体观感"代码 + 视觉成品 + 链接"，转化率往往最高。

---

## 后续 thread（可选 — 任何一条主 tweet 后接 1–2 条）

> /2 — Why HTML DSL and not markdown?
>
> Markdown is one-dimensional (block A, block B, …) — agents end up
> faking hierarchy with bold + bullet trees. With TDR, the structure
> *is* the markup. A `<d>` is a decision, not a styled paragraph.
>
> Lower tokens, higher fidelity. Same agent, better doc.

> /3 — There's an Anthropic Skills package too:
>
> `.skill` bundle installs into ~/.claude/skills/, includes a 12-rule
> writing guide and two doc-lint scripts. Claude will pick up
> "structured doc / postmortem / decision record" prompts and route
> through TDR automatically.
>
> Install: see the README's "Online install" section.

---

## 关于 SVG OG 图

x.com 抓取 OG 图的逻辑：

- 接受 SVG（content-type 必须是 `image/svg+xml`，GitHub Pages 默认会发对）
- 但**偏好 PNG/JPG**。SVG 在某些情况下会被忽略，回退到纯文本 unfurl。

如果发现卡片不出图，把 SVG 转 PNG：

```bash
# 装一次工具
brew install librsvg

# 转
rsvg-convert -w 1200 -h 630 examples/og.svg -o examples/og.png

# 改 index.html 里的 meta：
#   og:image  → https://darkmice.github.io/talon-doc-runtime/og.png
#   twitter:image → 同上
```

PNG 版本兼容性最广，建议正式宣传前先转一份。
