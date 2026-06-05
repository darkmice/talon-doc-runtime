# 安装 Talon Doc Runtime Skill（Agent 运行手册）

> 这是一份**给 Agent 执行**的安装手册。如果你是 Claude / Codex 等助手，正被要求
> "安装 Talon Doc Runtime skill"，照着本文的决策树选一条路径、执行命令、跑验证即可。
> 人类读者也可以直接照抄命令。

把 TDR 以 [Anthropic Skills](https://docs.claude.com/en/docs/claude-code/skills) 格式装到
`~/.claude/skills/talon-doc-runtime/`。装好后，任何会话提到"结构化文档 / 复盘 / 决策记录 /
评审报告"时，Claude Code 会自动加载 `SKILL.md` 并触发这个 skill。

---

## Agent 决策树（先读这段）

```
用户要你安装 talon-doc-runtime skill
│
├─ 有 `gh` CLI 且已发过 Release？ ── 是 ──▶ 方式 A（推荐，一行搞定）
│
├─ 没有 gh，但有 curl + unzip？ ──────▶ 方式 B（纯 curl 拉 Release）
│
└─ 还没发过 Release / 想跟 main 最新？ ▶ 方式 C（从源文件 + npm 拼装）
```

规则：
1. **默认走方式 A。** 只有当 `gh` 不可用、或用户明说"我没有 GitHub CLI"时，才退到 B；只有当还没有任何 Release、或用户要 main 最新代码时，才用 C。
2. 选路径前先探测环境：`command -v gh`、`command -v curl`、`command -v unzip`。
3. 安装命令跑完后，**必须自动执行 [§验证](#验证)**，确认 `SKILL.md` 与 runtime 资产都在。
4. 装完不必重启会话；下一次相关主题的对话即会触发。可以这样告知用户。

仓库：`darkmice/talon-doc-runtime` · npm：`@talon-ui/doc-runtime`

---

## 方式 A：从 GitHub Release 一键安装（推荐）

适用：已发布版本，用户有 `gh` CLI。

```bash
mkdir -p ~/.claude/skills && \
gh release download --repo darkmice/talon-doc-runtime \
  --pattern '*.skill' \
  --output /tmp/talon-doc-runtime.skill && \
unzip -o /tmp/talon-doc-runtime.skill -d ~/.claude/skills/ && \
rm /tmp/talon-doc-runtime.skill && \
echo "✓ installed: ~/.claude/skills/talon-doc-runtime/"
```

固定到具体版本（生产环境推荐）：

```bash
VERSION=v0.1.3 && \
mkdir -p ~/.claude/skills && \
gh release download "$VERSION" --repo darkmice/talon-doc-runtime \
  --pattern '*.skill' \
  --output /tmp/talon-doc-runtime.skill && \
unzip -o /tmp/talon-doc-runtime.skill -d ~/.claude/skills/ && \
rm /tmp/talon-doc-runtime.skill && \
echo "✓ installed $VERSION"
```

`.skill` 是个 zip，里面顶层就是 `talon-doc-runtime/` 目录，所以解压到 `~/.claude/skills/`
即落到正确位置。

---

## 方式 B：纯 curl，不依赖 gh

适用：没有 `gh` 但有 `curl` + `unzip`。

```bash
mkdir -p ~/.claude/skills && \
SKILL_URL=$(curl -s https://api.github.com/repos/darkmice/talon-doc-runtime/releases/latest \
  | grep browser_download_url \
  | grep '\.skill"' \
  | head -1 \
  | cut -d '"' -f 4) && \
curl -fsSL "$SKILL_URL" -o /tmp/talon-doc-runtime.skill && \
unzip -o /tmp/talon-doc-runtime.skill -d ~/.claude/skills/ && \
rm /tmp/talon-doc-runtime.skill && \
echo "✓ installed: ~/.claude/skills/talon-doc-runtime/"
```

> 若 `SKILL_URL` 为空，说明该仓库还没有带 `.skill` 资产的 Release —— 改走方式 C。

---

## 方式 C：从仓库源文件 + npm 拼装（main 分支 / 未发版）

适用：还没有任何 Release，或想跟 main 最新代码。这条路不下载 `.skill`，而是把仓库里的
文档/脚本 + npm 上的 runtime 直接拼到本地 skill 目录。

```bash
# 1. 建目录骨架
SKILL_DIR=~/.claude/skills/talon-doc-runtime && \
mkdir -p "$SKILL_DIR/references" "$SKILL_DIR/scripts" "$SKILL_DIR/assets" && \

# 2. 从 main 拉文档与脚本
RAW=https://raw.githubusercontent.com/darkmice/talon-doc-runtime/main && \
curl -fsSL "$RAW/SKILL.md"             -o "$SKILL_DIR/SKILL.md" && \
curl -fsSL "$RAW/references/canvas.md"  -o "$SKILL_DIR/references/canvas.md" && \
curl -fsSL "$RAW/references/lineage.md" -o "$SKILL_DIR/references/lineage.md" && \
curl -fsSL "$RAW/scripts/critique.mjs"  -o "$SKILL_DIR/scripts/critique.mjs" && \
curl -fsSL "$RAW/scripts/balance.mjs"   -o "$SKILL_DIR/scripts/balance.mjs" && \

# 3. 从 npm 拉 runtime IIFE（最新已发布版本）
curl -fsSL https://unpkg.com/@talon-ui/doc-runtime/dist/talon-doc-runtime.iife.js \
  -o "$SKILL_DIR/assets/talon-doc-runtime.iife.js" && \

echo "✓ installed: $SKILL_DIR (from main + npm latest)"
```

> 想要固定版本的 runtime，把 unpkg URL 写成
> `https://unpkg.com/@talon-ui/doc-runtime@0.1.3/dist/talon-doc-runtime.iife.js`。

---

## 方式 D（维护者本地）：从仓库一条命令打包并安装

适用：你**就在这个仓库里**（克隆了源码），想把当前工作树的 skill 内容装到本机。

```bash
pnpm skill:pack
```

它会 `pnpm build` → 把仓库根的 `SKILL.md` / `references/` / `scripts/` / 新构建的 runtime
同步到 `~/.claude/skills/talon-doc-runtime/`，验证，并打出
`dist/skill/talon-doc-runtime.skill`（可作为 Release 资产上传）。依赖 `skill-creator` skill
已安装（提供 `quick_validate.py` / `package_skill.py`）。

---

## 验证

任意方式装完后，**Agent 应自动跑这一步**：

```bash
test -f ~/.claude/skills/talon-doc-runtime/SKILL.md && \
test -f ~/.claude/skills/talon-doc-runtime/assets/talon-doc-runtime.iife.js && \
echo "✓ skill installed correctly" || \
echo "✗ skill files missing — re-run install"
```

进一步确认内容完整（可选）：

```bash
ls ~/.claude/skills/talon-doc-runtime/{SKILL.md,references,scripts,assets}
```

应能看到 `SKILL.md`、`references/{canvas,lineage}.md`、`scripts/{critique,balance}.mjs`、
`assets/talon-doc-runtime.iife.js`。

---

## 故障排查

| 现象 | 原因 / 处理 |
|---|---|
| `gh: command not found` | 没装 GitHub CLI → 改走方式 B 或 C。 |
| `SKILL_URL` 为空 / 404 | 该仓库尚无带 `.skill` 资产的 Release → 走方式 C。 |
| `unzip: command not found` | 装 `unzip`（macOS 自带；Linux `apt install unzip`），或走方式 C（无需 unzip）。 |
| 解压后多了一层目录 | `.skill` 顶层应直接是 `talon-doc-runtime/`。若不是，解压到临时目录后把该目录手动挪到 `~/.claude/skills/`。 |
| skill 没触发 | 确认 `~/.claude/skills/talon-doc-runtime/SKILL.md` 存在；新开一轮对话；主题需贴近"结构化文档 / 复盘 / 决策记录 / 评审报告"。 |
| runtime 标签没渲染 | `assets/talon-doc-runtime.iife.js` 缺失或为旧版 → 重装，或方式 C 第 3 步重新拉。 |

---

## 卸载

```bash
rm -rf ~/.claude/skills/talon-doc-runtime && echo "✓ removed"
```

---

装好后做什么：在以"结构化文档 / 复盘 / 决策记录 / 评审报告"为主题的对话里直接提需求，
Claude Code 会自动加载 `SKILL.md`。skill 的写作规范见
[`SKILL.md`](../SKILL.md) 与 `references/canvas.md`；把 `.md` / `.txt` / `.html` 转成 TDR
见 [`docs/markdown-flavor.md`](markdown-flavor.md)。
