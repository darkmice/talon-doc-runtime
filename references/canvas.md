# 写作准则

写一份 TDR 文档，本质是回答两个问题：**谁会读？** **他们在第几秒决定是否继续？** 这份文档汇总了从过往交付里反复验证过的判断 — 凡是与下面这些规则冲突的"看起来更专业的写法"，几乎都是错的。

读到本文件意味着 skill 已被触发；后续动作请始终对照这里的判断，而不是凭直觉。

## 1. 文档是树，不是流水

读者第一屏看到的，应该是**结论的根**。证据、备选、回滚是树枝，挂在 `<c>` 里。

- `<d>` 摆在顶部 — verdict (`v`) 一眼可见，前提与结论通过 `<because>` / `<so>` 子标签描述，而不是堆在一段散文里。
- 证明结论的代码、数据、复现链路放进折叠区。读者扫一遍 `<h2>` + `<d>` 就能掌握全文判断，需要核对时再展开。
- "顶层精简、内层穷尽"。如果你交付的文档**没有任何 `<c>`**，几乎一定有信息被你藏在了散文里 — 那是读者将来必然要再问一次的内容。

## 2. 视觉预算：1.5 × `<h2>`

每多一个重组件，文档就多一份"被略过"的可能。整篇文档**顶层可见**的重组件总数（`<d>` / `<flow>` / `<branch>` / `<cmp>` / `<contrast>` / `<analogy>` / `<myth>` / `<steps>` / `<sb>` / `<tracks>` / `<timeline>` / `<risk>` / `<evidence>`）不应超过 `<h2>` 数 × 1.5。

- 5 个 `<h2>` 节 → 顶层最多 7~8 个重组件。
- `<src>` 和 `<ref>` 不计入预算 — 代码引用越多越好。
- `<c>` 内部的组件**完全不计**，因为读者要主动展开才会看见。
- 超出预算？挑最弱的两个：要么改成一句散文，要么挪进 `<c>`。

完稿前数一遍。这是这份 skill 唯一的硬阈值。

## 3. 状态色不能装饰

`s` 与 `k` 属性的取值就是文档的"色彩契约"。读者会无意识地把颜色映射到判断结果上，所以**不允许用颜色来"好看一点"**。

| 值 | 表达 |
|---|---|
| `ok` | 通过 / 已采纳 / 安全 |
| `bad` | 失败 / 已否决 / 风险 / **P0** |
| `warn` | 警示 / 进行中风险 / **P1** |
| `note` | 探索中 / 待评审 / **P2** |
| `info` | 中性、默认 |
| `done` | 完成 |
| `active` | 当前进行 |
| `accent` | 品牌强调 |

P0/P1/P2 必须用 `<d v="P0">` 等 verdict 直接挂在卡片上，靠 verdict 列阅读，而不是靠 `<call>` 反复打断。

## 4. 选哪个组件，不要凭手感

很多组件视觉上看起来都"能装下"同一段话。选错的代价不是难看 — 是读者一眼读不出你想表达的关系类型。当对应关系含糊时，按下面这张表选：

| 你想表达 | 用 |
|---|---|
| 一个判断 + 依据 + 结论 | `<d>` + `<because>` + `<so>` |
| **有时序**的执行链 | `<steps>` |
| **并行**的评估维度（互不依赖） | `<tracks>` + `<tk>` 每个维度一条 |
| 两个方案的得失 | `<cmp>` + `<pro>` + `<con>` |
| 同一个词在两个语境下含义不同 | `<contrast>` |
| "陌生 ≈ 熟悉"的类比 | `<analogy>` |
| 纠正一种流行的错误理解 | `<myth>` |
| 条件分支落地为并列卡片 | `<branch>` + `<bi>` |
| 一个结论 + 若干支撑论据 | `<evidence>` + `<ei>` |
| 单条值得突出的洞察 | `<finding>` |
| 带日期的事件序列 | `<timeline>` + `<ev>` |
| 风险登记（严重度 × 可能性 × 缓解） | `<risk>` + `<r>` |
| 行内术语，鼠标悬停看定义 | `<term w d>` |
| 文章开篇的题记 | `<lead>` |
| 行内状态徽标 | `<x s>` |
| 数字对比 | `<bars>` / `<sb>` |
| 关键值清单 | `<kv>` + `<row>` |
| 受影响文件清单 | `<files>` + `<fg>` + `<f>` |

特别提示：
- `<steps>` 与 `<tracks>` 经常被混用。**有先后** → steps；**无先后、各自评估** → tracks。
- `<contrast>` 与 `<myth>` 表面相似但语义相反 — contrast 是"两种都对，看语境"，myth 是"一种是错的、一种是对的"。
- `<branch>` 不是流程图。流程图用 `<flow>`；branch 是"如果 A 则 X，如果 B 则 Y"的并列分支卡片。

## 5. 散文是组件的胶水

两个结构组件**不能直接相邻**。中间至少要有一句话告诉读者："看完 A，请带着 X 这个观察去看 B。"

组件展示一个点，散文把点连成判断。漂亮的结构 + 缺胶水 = 一堆好看的卡片，没有论证。

## 6. 一节一念

每一个 `<h2>` 节应当只回答一个问题。两个问题就拆两节。短小聚焦的小节，比覆盖面广的大段落容易扫读得多。

## 7. 决定的另一半：被否决的方案

`<d s="approved">` 没有解释清楚"为什么不是其它"的话，这个决定就站不住。每一个真正困难的判断都应当配一个或多个 `<d s="rejected">`，用 `<because>` 写它的合理性、用 `<so>` 写它失败在哪一刻。

读者半年后回看，能复原"当时为什么没选 B"，这份文档才算交付完整。

## 8. 代码总是给原文

涉及代码的句子，必须配代码本身。`<src>` 给行号区间，`<cb>` 给简短片段，行内 `<code>` 给一小段标识。永远不要"代码大意如下"，描述代码不等于代码。

Bug 报告尤其要给**具体的复现轨迹**：

```html
<call k="bad" t="Bug">
  <p>并发 refresh 请求会导致合法用户的整个 token 家族被撤销。</p>
</call>

<c t="复现链路">
  <p>两个浏览器 tab 同时刷新，两个请求带相同的 refresh token <code>T1 = "dGhpcyBpcyBh..."</code>。</p>

  <src id="bug-rotate" p="src/lib/refresh.ts:8-17" l="ts">
    <pre><code>export async function rotateRefreshToken(token: string) {
  const record = await db.refreshToken.findByHash(hash(token))
  if (record.consumedAt) {                  // null → 跳过
    await db.refreshToken.revokeFamily(record.familyId)
    throw new AuthError('token_reuse_detected')
  }
  await db.refreshToken.markConsumed(record.id)
  return issueTokenPair(record.userId)
}</code></pre>
    <note>根因：函数无法区分"合法并发"与"被盗后重放"，对两者执行了相同的撤销。</note>
  </src>

  <steps>
    <step s="done" t="Tab A: 拿到新 token T2" d="正常"></step>
    <step s="active" t="Tab B: 触发 revokeFamily(7)" d="T2 也被撤销" f="BUG" fl="BUG"></step>
    <step s="bad" t="两个 tab 都被强制登出" f="IMPACT" fl="IMPACT"></step>
  </steps>
</c>
```

## 9. `<call>` 是打断，不是旁白

`<call>` 的语义是"读到这里请停一下"。它适用于：破坏性变更、危险操作、关键前置条件、不易察觉的坑。**不**适用于：补充信息、给段落"加点强调"、调节版面。

如果一段话能自然嵌进散文，就写散文。一篇文档里 `<call>` 超过 2~3 个，每一个的"打断价值"都会被读者衰减成 0。

## 10. 当 `<flow>` 装不下时，写 SVG

`<flow>` 是线性流。一旦你需要分叉、汇聚、循环或几何布局，直接在文档里写 `<svg>`。用 `var(--tdr-*)` 系列变量挑色填充，深色模式会自动跟随：

```html
<svg viewBox="0 0 500 200" width="100%" xmlns="http://www.w3.org/2000/svg" style="margin: 16px 0">
  <rect x="10" y="80" width="120" height="40" rx="6"
        fill="var(--tdr-accent-bg)" stroke="var(--tdr-accent)" stroke-width="1"/>
  <text x="70" y="105" text-anchor="middle"
        font-size="13" font-family="var(--tdr-font-body)" fill="var(--tdr-accent-text)">API Gateway</text>

  <line x1="130" y1="100" x2="200" y2="60"   stroke="var(--tdr-border)" stroke-width="1"/>
  <line x1="130" y1="100" x2="200" y2="140"  stroke="var(--tdr-border)" stroke-width="1"/>

  <rect x="200" y="40" width="120" height="40" rx="6"
        fill="var(--tdr-ok-bg)" stroke="var(--tdr-ok)" stroke-width="1"/>
  <text x="260" y="65" text-anchor="middle"
        font-size="13" font-family="var(--tdr-font-body)" fill="var(--tdr-ok-text)">Service A</text>

  <rect x="200" y="120" width="120" height="40" rx="6"
        fill="var(--tdr-warn-bg)" stroke="var(--tdr-warn)" stroke-width="1"/>
  <text x="260" y="145" text-anchor="middle"
        font-size="13" font-family="var(--tdr-font-body)" fill="var(--tdr-warn-text)">Service B</text>
</svg>
```

规则：必须给 `viewBox` 和 `width="100%"`；文字字号给到 12-13、字体用 `var(--tdr-font-body)`；SVG 紧跟引出它的那一段散文，不要悬挂在节的最前面。

## 11. 撰写细则（避免低级失误）

- **这是 HTML，不是 Markdown** — 除非用户明确要 `.md` 输入。直接产出 TDR HTML 时不要写 `## 标题`、` ```代码 ```、`**粗体**`、`- 列表`，用 `<h2>` / `<cb>` / `<strong>` / `<ul><li>`。若用户要 Markdown 输入，则按 `docs/markdown-flavor.md` 写：admonition、`file:path:lines` 代码块、task list 这些约定都会被 `tdr format` 自动 uplift；原生 TDR 标签也可以混在 Markdown 里。
- **短属性优先。** DSL 提供 `s` / `t` / `v` / `k` / `c` / `d` 等短别名就是为了让 Agent 输出紧凑。`<d s="bad" v="P0" t="...">` 总比 `<decision status="rejected" verdict="P0" title="...">` 好。
- **属性 vs 槽内容。** 纯文本能塞进属性时用属性（`<step t="..." d="...">`）；需要 `<strong>` / `<code>` / 内联链接时改写为带子元素的形式（`<step t="...">正文里有 <code>token</code> 这种东西</step>`）。
- **引号一致。** 中文引号 `"..."` 不要出现在属性里，会被 HTML 解析器截断；属性内用 ASCII 双引号或不引用。
- **延续性。** 同一次会话中一旦用过 talon-doc-runtime，后续 HTML 工件也继续用，不要倒退回裸 HTML。
- **语言一致性。** 散文用用户的语言；代码标识、技术名词保留英文原文。

## 12. 自检（交付前）

- 顶层重组件计数 ≤ 1.5 × `<h2>` 数？(`tdr balance file.html` 会算)
- 每个 `<ref to="X">` 都有目标 `<src id="X">` 或 `<c id="X">`？(`tdr critique file.html` 会查)
- 每个 `<d s="approved">` 都有至少一条相应的 `<d s="rejected">` 解释为什么不是其它？
- 每个 P0/P1 issue 都有 verdict (`v=`) 吗？
- Bug 类 `<call k="bad">` 后面跟着 `<c>` 复现链路了吗？

通不过其中任意一项，就回去补 — 不是为了仪式，是因为这些缺失都会让读者最终回头问。
