# talon-doc-runtime 工作约定

这份文件是给在本仓库**写代码**的 Agent / 贡献者看的工作守则。要给 Agent 用 TDR **生成文档**，入口是 [SKILL.md](SKILL.md) 与 [references/canvas.md](references/canvas.md)，不是这里。

## 定位

TDR 是 Talon 生态的**底层可复用能力**：Agent DSL runtime + 受控事件协议 + Archetype 视觉系统。

它**不是**：
- Talon Pilot 的产品壳。
- 文档站 / CMS / 协作编辑系统。
- 包含业务流程或品牌资源的 SDK。

任何让 TDR 绑定特定产品的改动（硬编码品牌色、写死 action handler、注入业务 API 调用）都应被否决；正确做法是让宿主通过 `registerAction()` / `registerArchetype()` 注入。

## 实现约束

- **runtime 零运行时依赖**：不引入 Vue、React、Svelte、Lit、jQuery。所有 DOM 操作走原生 API。
- **Agent 出 DSL，不出 JS**：所有交互通过 `<btn a="..." to="...">` 表达意图，由 runtime 的 action registry 路由到 handler。不允许出现需要 Agent 写 `onclick=` 或 `<script>` 的设计。
- **Agent 出语义，不出样式**：DSL 不接受 `style=` / `class=` 之外的视觉属性。颜色、间距、字体全部由 archetype CSS 控制；Agent 通过 `s` / `k` 等状态属性表达**意图**，由 CSS 兑现为视觉。
- **新组件必须四件套**：新增一个 renderer (`src/index.ts`)，对应的：(1) base CSS 骨架 (`src/styles/base.css.ts`)；(2) 至少一个 archetype 的视觉覆盖；(3) `examples/showcase.tdr.html` 中一段真实使用；(4) `tests/showcase.smoke.test.ts` 的 fixture + expectedClasses 登记。少任何一项都视为未完成。
- **archetype 改动遵循 CSS-in-JS 风格**：所有 archetype CSS 写在 `src/styles/archetypes/*.css.ts` 的模板字符串里，由 `composeCss()` 在挂载时拼接。**不**外置 `.css` 文件，**不**用 CSS Modules / PostCSS / unocss。
- **状态值用语义、不用颜色名**：`s="ok"` 而非 `s="green"`、`s="bad"` 而非 `s="red"`。新的状态值要先想清楚语义层级再加。
- **Token 化**：所有可调的视觉量（间距、字号、半径、状态色）必须用 `--tdr-*` CSS 变量声明，禁止硬编码 `16px` / `#abc123`。

## 命名约定

- **DSL 标签**：极短小写，1-6 字符。优先单字母（`<d>` `<c>` `<n>`），再字母对（`<bi>` `<ck>` `<ev>` `<tk>` `<sb>` `<ms>`）。HTML 保留字（`<track>` `<param>`）改用替代名（`<tk>` `<r>`）。
- **CSS class**：`tdr-` 前缀。组件根 class = `tdr-<tag>`（`<d>` → `.tdr-decision`，`<bi>` → `.tdr-bcase`）；子元素用连字符延伸（`.tdr-decision-head`、`.tdr-bcase-out`）。
- **CSS 变量**：`--tdr-<group>-<role>`，例如 `--tdr-bad-bg` / `--tdr-accent-line` / `--tdr-text-soft`。状态系列必须齐全：`--tdr-X` / `--tdr-X-bg` / `--tdr-X-line` / `--tdr-X-text`。
- **属性别名**：renderer 用 `firstAttr(source, ['短', '长'])` 接受短长两种形式（`s` / `status`，`t` / `title`，`v` / `verdict`），文档与 showcase 始终用短形式。
- **DOM 事件**：`talon-doc:*` 前缀（`talon-doc:action`、`talon-doc:archetype-changed`）。
- **数据属性**：状态用 `data-s`，类型用 `data-k`，自定义键用 `data-tdr-*`。

## 视觉与设计原则

详细写作准则见 [references/canvas.md](references/canvas.md) — 那是给"用 TDR 写文档的人"看的。对**实现组件**的人来说，下面这几条是 CSS 必须遵守的：

- **R1 卡片**：1px 边框 + 圆角 + 微阴影。表面色 = `--tdr-surface`，不用纯白；深色模式表面比背景**只**亮 2 个 L 等级（≈0.02），不要"漂浮的亮卡片"。
- **R2 状态 = 线，不是面**：状态色优先用在 1px 边框 / 4px 左色条 / chip 文字色上，不要给整个组件灌满 `--tdr-X-bg`。需要彩色面时用低饱和度的 `-bg` 变量（L>0.92 浅色 / L<0.22 深色，C≤0.05）。
- **R3 chip 契约**：所有状态徽标（verdict / flag / pill）共用同一组 token：11px / weight 600 / 1px×7px / 3px 半径 / 0.06em 字间距 / mono 字体 / 大写。在 `business-document.css.ts` 末尾有 FINAL PASS 段强制统一，新组件加 chip 时直接命中那批选择器。
- **R4 正文 chrome 与样式分离**：layout 容器（`.tdr-grid`、`.tdr-metrics`、`.tdr-bars`、`.tdr-stacked-track`、`.tdr-kv`）**不**带 card chrome（无边框/无背景/无内边距）。卡片只属于真正"独立信息单位"的组件。
- **R5 暗色不靠饱和度**：暗色模式调整 L、不调 C；状态色在暗色下 L 应在 0.65~0.80（文字）/ 0.20~0.25（背景），避免"暗色 = 高饱和度霓虹"。

## 验证

任何改动后**至少**：

```bash
pnpm typecheck
pnpm test
pnpm build
```

涉及组件 / archetype / CSS 的改动**额外**：

```bash
# 在浏览器里跑两份 showcase，对照检查
pnpm dev
# → http://localhost:4174/examples/showcase.tdr.html
# → http://localhost:4174/examples/showcase.editorial.tdr.html

# 浅色 / 深色 / 各 archetype 都过一遍
```

涉及 SKILL.md / references / scripts 的改动：

```bash
# 用 lint 检查现有 showcase 是否被新规则误伤
node scripts/critique.mjs examples/showcase.tdr.html
node scripts/balance.mjs  examples/showcase.tdr.html

# 重新打包 skill 验证 references / scripts 同步无误
pnpm skill:pack
```

`pnpm check` 是一次性跑通 typecheck + test + build。

## 提交与发布

- **commit message** 用 conventional 风格：`feat(branch): rewrite as bcase model`、`fix(editorial): collapse aside column when no marginalia`、`docs(canvas): add §11 self-check list`。
- **不在同一 commit 里混合**实现改动与 references/SKILL 内容改动。renderer 改完再补文档算两个 commit。
- **不要在没有更新 skill 的情况下发版**：发版前 `pnpm skill:pack`，确认 `dist/skill/talon-doc-runtime.skill` 是最新的。

## 处理回归报告

收到"组件 X 在 Y 场景下显示异常"的反馈时：

1. **先复现**。在 `examples/showcase.tdr.html` 找到该组件的位置；找不到就先去 §4 "新组件必须四件套" 补 fixture。
2. **隔离根因**：是 base.css 影响、archetype 覆盖问题、还是 renderer 输出错？三层任意一层都可能。base.css 的改动会跨 archetype 生效，archetype CSS 只影响一种 archetype，renderer 改动影响所有 archetype 的 DOM 结构。
3. **修最低层**：能在 archetype 覆盖里修的不要改 base；能在 base 里修的不要改 renderer。
4. **回归两份 showcase**：修完后浅色 / 深色 / business-document / editorial-longform 四个组合都要扫一眼，避免修 A 坏 B。

## 不允许的改动

- 给 runtime 引入运行时依赖（哪怕"只是 lodash"）。
- 把品牌色 / 公司名 / 业务概念硬编码进 base.css 或 base 渲染逻辑。
- 让 Agent 输出 inline JS / inline 大段 style。
- 删除已有的属性别名（`firstAttr(['s', 'status'])`）— 这是向后兼容契约。
- 在没有同步 showcase 与 smoke 测试的情况下增删组件。
