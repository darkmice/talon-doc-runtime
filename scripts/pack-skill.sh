#!/usr/bin/env bash
# pack-skill.sh — 同步仓库根的 SKILL.md / references / scripts / runtime 到
# ~/.claude/skills/talon-doc-runtime/，验证后打包成 .skill 文件，输出到
# dist/skill/talon-doc-runtime.skill。
#
# 依赖 skill-creator 工具：~/.claude/skills/skill-creator/scripts/{quick_validate,package_skill}.py

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILL_DIR="$HOME/.claude/skills/talon-doc-runtime"
SKILL_CREATOR="$HOME/.claude/skills/skill-creator/scripts"
OUT_DIR="$REPO_ROOT/dist/skill"

if [ ! -d "$SKILL_CREATOR" ]; then
  echo "✗ skill-creator 未安装。请先 install skill-creator skill。" >&2
  exit 1
fi

echo "→ 同步 skill 内容到 $SKILL_DIR"
mkdir -p "$SKILL_DIR/references" "$SKILL_DIR/scripts" "$SKILL_DIR/assets"

# 清掉旧的 references/scripts，避免上次遗留的文件残留
rm -f "$SKILL_DIR/references/"*.md "$SKILL_DIR/scripts/"*.mjs

cp "$REPO_ROOT/SKILL.md"                       "$SKILL_DIR/SKILL.md"
cp "$REPO_ROOT/references/"*.md                "$SKILL_DIR/references/"
cp "$REPO_ROOT/scripts/critique.mjs"           "$SKILL_DIR/scripts/"
cp "$REPO_ROOT/scripts/balance.mjs"            "$SKILL_DIR/scripts/"
cp "$REPO_ROOT/dist/talon-doc-runtime.iife.js" "$SKILL_DIR/assets/"

echo "→ 验证"
"$SKILL_CREATOR/quick_validate.py" "$SKILL_DIR"

echo "→ 打包"
mkdir -p "$OUT_DIR"
"$SKILL_CREATOR/package_skill.py" "$SKILL_DIR" "$OUT_DIR"

echo ""
echo "✅ 输出: $OUT_DIR/talon-doc-runtime.skill"
