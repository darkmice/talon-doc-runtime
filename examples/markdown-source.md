---
archetype: business-document
title: 幂等键改 UUIDv7 — Markdown 写法
lang: zh-CN
---

# 支付重复扣款复盘

线上在 09:14 出现首笔重复扣款。下面这份文档用 **TDR-flavored Markdown** 写成，左边是你写的源码，右边是 `tdr format` 转出来的结果。散文、列表、表格照常用 Markdown；提示、代码引用、清单按约定写，会自动 uplift 成 TDR 组件。

## 根因

幂等键由服务端在收到请求后生成，无法跨重试保持一致。客户端重试时拿到的是**两个不同的 key**，于是被当成两笔独立支付。

> [!WARNING]
> 这个缺陷在低并发下几乎不可见 — 只有重试窗口与首次写入重叠时才触发。

> 复盘当天我们把链路上每个服务的当前状态拉了一遍，确认止血没有遗漏。没有 `[!XXX]` 标记、也没有「注意：」前缀的普通引用，会被当成补充说明，自动 uplift 成 `<call k="note">`。

故障期间各服务的状态如下。两列、键名规整的小表格会被识别成键值对，转成 `<kv>`：

| 服务 | 状态 |
| --- | --- |
| 支付网关 | 降级 |
| 幂等校验 | 异常 |
| 对账服务 | 正常 |
| 退款队列 | 积压 |

代码引用直接写在 fence 的 info 里，带上 `file:path:lines`：

```ts file:src/payment/idempotency.ts:42-46
function keyFor(req: Request) {
  return hash(req.body) + Date.now()   // ← Date.now() 让 key 每次都不同
}
```

## 决策

需要精确控制组件时，直接写原生 TDR 标签 —— 它们在 Markdown 里原样透传：

<d s="approved" v="已采纳" t="幂等键改客户端生成的 UUIDv7">
  <because>服务端生成无法跨重试保持一致。</because>
  <so>客户端生成 UUIDv7 并透传，重试天然去重。</so>
</d>

---
## 收尾清单

紧贴在标题上方的 `---` 不会变成普通分隔线，而是带上后面这个标题文本，转成 `<divider t="收尾清单">`。单独成段的 `---` 仍然是 `<hr>`。

GFM task list 会变成 `<chk>`：

- [x] 紧急止血：临时关闭重试
- [x] 定位根因
- [ ] 上线 UUIDv7 方案
- [ ] 补回归测试

<details>
<summary>展开看完整的修复 diff</summary>

`<details>` 会变成可折叠的 `<c>`。

```ts
function keyFor(req: Request) {
  return req.headers['idempotency-key']   // 由客户端 UUIDv7 提供
}
```

</details>

> 注意：中文「注意：」开头的引用也会被识别成提示框。
