# 架构说明

`talon-doc-runtime` 是 Talon 生态里的结构化文档 runtime。它不是文档站，也不是 Talon Pilot 的产品壳。

## 位置

```text
Agent output
  -> short DSL tags
  -> talon-doc-runtime
  -> themed interactive HTML
```

这个仓库承载稳定能力：

- 短标签 DSL 的解释规则
- 组件外观的基础主题
- 受控事件 action registry
- 单文件 / 嵌入式 HTML 的运行时增强

上层产品负责：

- 什么时候生成文档
- 文档放在哪个 artifact
- 动作事件如何接业务流程
- 是否把某个 action 映射到审批、验收、trace、handoff

## 为什么不用 Vue / React / Svelte

这个项目面向 Agent 输出，核心成本是 token 和协议稳定性，不是组件开发体验。无框架 DOM scanner 的优势是：

- Agent 可以输出 `<d>`、`<c>`、`<src>` 这种极短标签。
- 不需要框架模板语法，比如 `:items`、slot 语法、JSX。
- runtime 可以预加载，Agent 只输出 body 片段。
- 事件统一走受控 action registry，避免 inline JS。

## 运行时结构

```text
src/index.ts
  mount()
    injectStyles()
    registerDefaults()
    enhance()
    bindActions()

  renderers
    d -> decision card
    c -> details collapse
    src -> source block
    ref -> action link
    btn -> action button

  actions
    jump/open/close/toggle/copy/theme/emit
```

## 兼容边界

短标签如 `<d>`、`<c>`、`<src>` 不是标准 Custom Elements，不能通过 `customElements.define()` 注册。这里选择 DOM scanner 是刻意的：它用标准 HTML parser 接收短标签，再由 runtime 替换为真实元素。

如果将来要对外发布标准 Web Components，可以增加一层编译或别名：

```text
<d>       -> agent token 优先
<td-d>    -> web component 标准优先
```
