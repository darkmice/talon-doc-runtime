# 安装 Talon Doc Runtime Skill（Agent 运行手册）

> 这是一份**给 Agent 执行**的安装手册。如果你是 Claude Code / Codex / Gemini CLI /
> Cursor / Copilot CLI 等任意 agent CLI 中的助手，正被要求"安装 Talon Doc Runtime
> skill"，照着本文：**①确定你所属 CLI 的 skill 目录 → ②选一条下载路径 → ③跑验证**。
> 人类读者也可以直接照抄命令。

TDR 以 [Anthropic Skill](https://docs.claude.com/en/docs/claude-code/skills) 格式打包
（`SKILL.md` + `references/` + `scripts/` + `assets/` 渐进式资源）。装好后，相关主题的
会话里 agent 会加载 `SKILL.md` 并触发它。

仓库：`darkmice/talon-doc-runtime` · npm：`@talon-ui/doc-runtime`

---

## ① 确定 skill 目录（不要写死 `~/.claude`）

不同 agent CLI 的 skill 安装位置不同。**先按你所属的 CLI 设置 `SKILLS_DIR` 变量**，
后面所有命令都用它，不要硬编码某一家的路径：

| Agent CLI | 是否原生支持 Skill 格式 | `SKILLS_DIR` |
|---|---|---|
| **Claude Code** | ✅ 原生 | `~/.claude/skills` |
| **Cursor** | ✅（skills 机制） | `~/.cursor/skills-cursor` |
| **Codex CLI** | ⚠️ 经 `AGENTS.md` 注入 | 见下方[「不支持 skill 目录的 CLI」](#不支持原生-skill-目录的-cli) |
| **Gemini CLI** | ⚠️ 经 `GEMINI.md` / `activate_skill` | 同上 |
| **GitHub Copilot CLI** | ⚠️ 经 plugin / 指令文件 | 同上 |
| 其它 / 不确定 | —— | 若有 `XDG`，试 `~/.config/<cli>/skills`；否则问用户 |

```bash
# 按你的 CLI 选一行（默认 Claude Code）：
SKILLS_DIR=~/.claude/skills            # Claude Code
# SKILLS_DIR=~/.cursor/skills-cursor   # Cursor
# SKILLS_DIR=~/.config/<your-cli>/skills

mkdir -p "$SKILLS_DIR"
echo "skill 目录: $SKILLS_DIR"
```

> **Agent 自检**：你怎么知道自己是哪个 CLI？看你运行所在的环境/工具名。拿不准时，
> 探测目录存在性来推断：`for d in ~/.claude/skills ~/.cursor/skills-cursor; do [ -d "$d" ] && echo "$d"; done`，
> 或直接问用户"你用的是哪个 agent CLI"。

---

## ② 选下载路径

```
选好 SKILLS_DIR 后
│
├─ 有 `gh` CLI 且已发过 Release？ ── 是 ──▶ 方式 A（推荐）
├─ 没 gh，但有 curl + unzip？ ───────────▶ 方式 B（纯 curl 拉 Release）
└─ 还没发 Release / 想跟 main 最新？ ─────▶ 方式 C（从源文件 + npm 拼装）
```

默认走方式 A；`gh` 不可用退 B；无 Release 或要 main 最新用 C。选前先探测：
`command -v gh`、`command -v curl`、`command -v unzip`。

### 方式 A：从 GitHub Release 一键安装（推荐）

```bash
gh release download --repo darkmice/talon-doc-runtime \
  --pattern '*.skill' \
  --output /tmp/talon-doc-runtime.skill && \
unzip -o /tmp/talon-doc-runtime.skill -d "$SKILLS_DIR/" && \
rm /tmp/talon-doc-runtime.skill && \
echo "✓ installed: $SKILLS_DIR/talon-doc-runtime/"
```

固定到具体版本（生产推荐）：

```bash
VERSION=v0.1.4 && \
gh release download "$VERSION" --repo darkmice/talon-doc-runtime \
  --pattern '*.skill' \
  --output /tmp/talon-doc-runtime.skill && \
unzip -o /tmp/talon-doc-runtime.skill -d "$SKILLS_DIR/" && \
rm /tmp/talon-doc-runtime.skill && \
echo "✓ installed $VERSION → $SKILLS_DIR/talon-doc-runtime/"
```

`.skill` 是个 zip，顶层就是 `talon-doc-runtime/` 目录，解压到 `$SKILLS_DIR/` 即落到正确位置。

### 方式 B：纯 curl，不依赖 gh

```bash
SKILL_URL=$(curl -s https://api.github.com/repos/darkmice/talon-doc-runtime/releases/latest \
  | grep browser_download_url \
  | grep '\.skill"' \
  | head -1 \
  | cut -d '"' -f 4) && \
curl -fsSL "$SKILL_URL" -o /tmp/talon-doc-runtime.skill && \
unzip -o /tmp/talon-doc-runtime.skill -d "$SKILLS_DIR/" && \
rm /tmp/talon-doc-runtime.skill && \
echo "✓ installed: $SKILLS_DIR/talon-doc-runtime/"
```

> 若 `SKILL_URL` 为空，说明该仓库还没有带 `.skill` 资产的 Release → 改走方式 C。

### 方式 C：从仓库源文件 + npm 拼装（main 分支 / 未发版）

```bash
SKILL_DIR="$SKILLS_DIR/talon-doc-runtime" && \
mkdir -p "$SKILL_DIR/references" "$SKILL_DIR/scripts" "$SKILL_DIR/assets" && \
RAW=https://raw.githubusercontent.com/darkmice/talon-doc-runtime/main && \
curl -fsSL "$RAW/SKILL.md"             -o "$SKILL_DIR/SKILL.md" && \
curl -fsSL "$RAW/references/canvas.md"  -o "$SKILL_DIR/references/canvas.md" && \
curl -fsSL "$RAW/references/lineage.md" -o "$SKILL_DIR/references/lineage.md" && \
curl -fsSL "$RAW/scripts/critique.mjs"  -o "$SKILL_DIR/scripts/critique.mjs" && \
curl -fsSL "$RAW/scripts/balance.mjs"   -o "$SKILL_DIR/scripts/balance.mjs" && \
curl -fsSL https://unpkg.com/@talon-ui/doc-runtime/dist/talon-doc-runtime.iife.js \
  -o "$SKILL_DIR/assets/talon-doc-runtime.iife.js" && \
echo "✓ installed: $SKILL_DIR (from main + npm latest)"
```

> 固定版本的 runtime：把 unpkg URL 写成
> `https://unpkg.com/@talon-ui/doc-runtime@0.1.4/dist/talon-doc-runtime.iife.js`。

### 方式 D（维护者本地）：从仓库一条命令打包并安装

适用：你**就在这个仓库里**（克隆了源码）。

```bash
pnpm skill:pack
```

`pnpm build` → 把仓库根的 `SKILL.md` / `references/` / `scripts/` / 新构建的 runtime
同步到 `~/.claude/skills/talon-doc-runtime/`（Claude Code 路径），验证，并打出
`dist/skill/talon-doc-runtime.skill`（可作为 Release 资产上传）。其它 CLI 想本地安装，
把这个 `.skill` 解压到自己的 `$SKILLS_DIR` 即可。依赖已安装 `skill-creator` skill。

---

## 不支持原生 skill 目录的 CLI

Codex（`AGENTS.md`）、Gemini CLI（`GEMINI.md`）、Copilot CLI（plugin/指令文件）等没有
Claude 那样的 skill 自动发现目录。两种做法：

1. **把内容当作指令文件引入**：用方式 C 的命令把文件拉到一个本地目录（如
   `./.tdr-skill/`），然后在该 CLI 的指令文件里追加一行引用，例如在 `AGENTS.md` /
   `GEMINI.md` 中写：
   `> 处理"结构化文档/复盘/决策记录/评审报告"时，遵循 ./.tdr-skill/SKILL.md。`
2. **只取 runtime**：很多场景只需要 `talon-doc-runtime.iife.js`（让浏览器渲染 DSL）。
   直接 `npm i @talon-ui/doc-runtime`，runtime 在 `node_modules/@talon-ui/doc-runtime/dist/`，
   写作规范参考仓库的 [`SKILL.md`](../SKILL.md) 与 [`docs/markdown-flavor.md`](markdown-flavor.md)。

> 各 CLI 的 skill/扩展机制仍在演进；若你的 CLI 已支持某种 skill 目录，把上面的
> `SKILLS_DIR` 指过去即可，下载与验证步骤不变。

---

## ③ 验证

任意方式装完后，**Agent 应自动跑这一步**（沿用上面的 `$SKILLS_DIR`）：

```bash
SKILL_DIR="$SKILLS_DIR/talon-doc-runtime" && \
test -f "$SKILL_DIR/SKILL.md" && \
test -f "$SKILL_DIR/assets/talon-doc-runtime.iife.js" && \
echo "✓ skill installed correctly at $SKILL_DIR" || \
echo "✗ skill files missing — re-run install"
```

进一步确认内容完整（可选）：

```bash
ls "$SKILLS_DIR/talon-doc-runtime"/{SKILL.md,references,scripts,assets}
```

应能看到 `SKILL.md`、`references/{canvas,lineage}.md`、`scripts/{critique,balance}.mjs`、
`assets/talon-doc-runtime.iife.js`。

---

## 故障排查

| 现象 | 原因 / 处理 |
|---|---|
| 不知道该装到哪个目录 | 见[①确定 skill 目录](#-确定-skill-目录不要写死-claude)；拿不准就问用户用的哪个 CLI。 |
| `gh: command not found` | 没装 GitHub CLI → 改走方式 B 或 C。 |
| `SKILL_URL` 为空 / 404 | 该仓库尚无带 `.skill` 资产的 Release → 走方式 C。 |
| `unzip: command not found` | 装 `unzip`（macOS 自带；Linux `apt install unzip`），或走方式 C（无需 unzip）。 |
| 解压后多了一层目录 | `.skill` 顶层应直接是 `talon-doc-runtime/`。若不是，解压到临时目录后把该目录手动挪到 `$SKILLS_DIR/`。 |
| skill 没触发 | 确认 `$SKILLS_DIR/talon-doc-runtime/SKILL.md` 存在；新开一轮对话；主题贴近"结构化文档 / 复盘 / 决策记录 / 评审报告"。非 Claude CLI 见[不支持原生 skill 目录的 CLI](#不支持原生-skill-目录的-cli)。 |
| runtime 标签没渲染 | `assets/talon-doc-runtime.iife.js` 缺失或为旧版 → 重装，或方式 C 重新拉。 |

---

## 卸载

```bash
rm -rf "$SKILLS_DIR/talon-doc-runtime" && echo "✓ removed"
```

---

装好后：在以"结构化文档 / 复盘 / 决策记录 / 评审报告"为主题的对话里直接提需求，
支持 skill 的 agent 会自动加载 `SKILL.md`。写作规范见 [`SKILL.md`](../SKILL.md) 与
`references/canvas.md`；把 `.md` / `.txt` / `.html` 转成 TDR 见
[`docs/markdown-flavor.md`](markdown-flavor.md)。
