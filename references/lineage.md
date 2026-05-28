# 组件改动回流流程

适用场景：**已经**改完一个或多个 TDR 组件（新增 renderer、调整 CSS、改 archetype tokens）后，把改动同步到对外契约 — SKILL.md、`references/canvas.md`、showcase 示例、文档速查表。

本流程**不实现**组件，不重新设计 — 它是改完之后的"回流"。如果 Agent 当前还在写组件本身，先去 `src/`，不要进这里。

## 流程的目标

让下一次有 Agent 拿到这个 skill 时：

1. 能在 SKILL.md 的速查表里**发现**新组件。
2. 选组件的时候能从 `canvas.md` 的 cheatsheet 里读出**语义边界**。
3. 看 showcase 示例时，看到的是**当前 API**，不是过时的写法。
4. 改动涉及的状态 / 颜色 / 行为不会在文档与实现间产生漂移。

## 1. 把改了什么列清楚

```bash
git status --short
git diff --name-status
```

只关注下面这些路径上的改动 — 其它（构建产物、临时文件）忽略：

- `src/index.ts` — renderer 注册、tag → 函数的映射。
- `src/styles/base.css.ts` — 跨 archetype 共用的 class 与组件骨架。
- `src/styles/archetypes/*.css.ts` — 单 archetype 的视觉覆盖。
- 任何新增的属性别名（`firstAttr(source, ['新别名', '旧别名'])`）。

实现是契约的源头。文档跟着实现走，不要让文档"提前承诺"实现里不存在的属性。

## 2. 给每个新/改组件写一句"它表达什么"

每个动过的组件写一句话：

```
当读者需要表达 ___ 时使用 <tag>。
```

写不出这句话，说明这个组件的语义还没想清楚 — 回到代码层去定义清楚再回来。

写出来之后，对照 `canvas.md` 的 component cheatsheet 看：

- 新句子是否与现有组件的语义产生重叠？
- 若重叠，决定哪一个保留，另一个的文档里加一行"什么时候**不**用我，请用 X"。

## 3. 让 SKILL.md 反映现状

需要更新的位置：

- **DSL Vocabulary 速查表**：新增组件加一行；属性、子标签全列；附简短一句用途。
- **State Values** 表：新增状态值或别名都要落到这张表上。
- **Action Protocol** 表：新增 action handler 都要登记。
- **Archetypes** 表：新增 archetype 一定要登记，最好附"视觉血统"和"适合什么"。

SKILL.md 的 description（frontmatter）只在**用途真正变了**时才动 — 因为它是触发器，频繁改动会让历史会话里的引用错乱。

## 4. 让 `canvas.md` 反映现状

需要更新的位置：

- **§4 Component cheatsheet**：新组件一定要登记。
- **§3 状态契约**：新增状态值或语义改变都要落到这里。
- **§2 视觉预算**：新组件如果是"重组件"，加入到 §2 第一段那串括号列表里。

`canvas.md` 不要为了"完整"而臃肿。任何新增段落问自己：**这是经验，还是显而易见？** 显而易见的就不写。

## 5. 让 showcase.tdr.html 反映现状

`examples/showcase.tdr.html` 是组件总览。每个新组件**必须**在 showcase 中有一段真实位置 —"真实"是指：它存在的理由是文档需要它，而不是"为了演示"。

如果一个新组件在 showcase 里找不到自然的位置，那它在真实文档里也找不到。回去重新审视它的语义。

更新方式：

- 找到 showcase 中最贴近该组件主题的章节，把组件嵌进去。
- 在该章节的导语里写出"为什么这里出现了这个组件"。
- 不要为了组件单独开一节叫"演示 XXX 组件"。

## 6. 检查 smoke 测试覆盖

`tests/showcase.smoke.test.ts` 用内联 fixture 验证每个 renderer 都产出了对应的 class。新组件要把对应的 `.tdr-xxx` class 加进 `expectedClasses` 列表，并在 fixture 里写一段最小用法。

```bash
pnpm test
```

测试通过等于"renderer 接住了 fixture"，并不等于"视觉无回归"— 视觉回归需要在浏览器里跑一次 showcase。

## 7. 跑一遍漂移扫描

旧 API 残留的高发位置：

```bash
# 旧 tag 是否仍出现在文档里？
rg "<旧tag" SKILL.md references/ examples/

# 旧 class 是否还出现在 CSS 备注、文档里？
rg "tdr-旧class" docs/ references/ SKILL.md

# index.ts 里旧别名是否还在被读取？是否需要标 deprecated？
rg "'旧别名'" src/index.ts
```

判断：兼容写法可以留，但"首选示例"必须使用当前 API。

## 8. 打包前的最后一步

回流的产物是个新版本的 `.skill` 包：

```bash
pnpm build                # 重新构建 IIFE runtime
pnpm typecheck && pnpm test

# 同步到 ~/.claude/skills/talon-doc-runtime/
cp SKILL.md ~/.claude/skills/talon-doc-runtime/
cp -r references ~/.claude/skills/talon-doc-runtime/
cp -r scripts ~/.claude/skills/talon-doc-runtime/
cp dist/talon-doc-runtime.iife.js ~/.claude/skills/talon-doc-runtime/assets/

# 验证 + 打包
~/.claude/skills/skill-creator/scripts/quick_validate.py ~/.claude/skills/talon-doc-runtime
~/.claude/skills/skill-creator/scripts/package_skill.py \
  ~/.claude/skills/talon-doc-runtime \
  dist/skill
```

输出在 `dist/skill/talon-doc-runtime.skill`，可以直接安装。

## 9. 交付报告（给用户）

按这个顺序列出来：

1. 改了哪些组件 / archetype。
2. SKILL.md / canvas.md / showcase / 测试分别动了什么。
3. 是否新增了语义边界（"X 和 Y 的取舍变成了…"）。
4. 跑过的验证命令 + 结果。
5. 故意保留的旧别名/兼容写法清单（防止下一位 Agent 重新"清理"它）。
