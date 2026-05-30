# Git 分支管理规范

## 分支模型

```
main ─────────────────────────────────────────────────── 稳定发布
  │                                                        ↑
  └── develop ──────────────────────────────────────────── 日常开发
        │         ↑         ↑         ↑
        ├── feature/xxx ────┘         │
        ├── feature/yyy ──────────────┘
        └── fix/zzz ──────────────────┘

release/v0.1.0 ── 发布准备（从 develop 切出，合并到 main）
hotfix/xxx ─────── 紧急修复（从 main 切出，合并回 main + develop）
```

---

## 分支类型

| 分支 | 命名 | 从哪切 | 合并到哪 | 生命周期 |
|------|------|--------|---------|---------|
| main | `main` | — | — | 永久，只接受合并 |
| develop | `develop` | main | main（通过 release） | 永久，日常开发 |
| feature | `feature/描述` | develop | develop | 功能完成后删除 |
| fix | `fix/描述` | develop | develop | 修复完成后删除 |
| release | `release/vX.Y.Z` | develop | main + develop | 发布后删除 |
| hotfix | `hotfix/描述` | main | main + develop | 修复后删除 |

---

## 分支命名规范

```bash
# feature 分支：feature/版本-功能描述
feature/v0.1-scaffold
feature/v0.1-database
feature/v0.2-collector-base
feature/v0.2-claude-code-parser

# fix 分支：fix/简短描述
fix/fts-index-sync
fix/ipc-timeout

# release 分支：release/版本号
release/v0.1.0
release/v0.2.0

# hotfix 分支：hotfix/简短描述
hotfix/db-corruption
hotfix/crash-on-startup
```

**规则：**
- 全小写
- 用 `-` 连接单词，不用 `_` 或驼峰
- 简短但能看出做什么（不超过 30 字符）
- 不要用中文

---

## 日常开发流程

### 开始一个新任务

```bash
# 1. 确保 develop 是最新的
git checkout develop
git pull origin develop

# 2. 创建 feature 分支
git checkout -b feature/v0.1-database

# 3. 开发...（按 task 文件执行）

# 4. 提交（可以多次提交）
git add electron/services/database/index.ts
git commit -m "feat(db): setup SQLite database with migration framework"

# 5. 推送到远程
git push -u origin feature/v0.1-database

# 6. 创建 PR → develop
# 在 GitHub 上创建 Pull Request，目标分支选 develop

# 7. PR 合并后，删除 feature 分支
git checkout develop
git pull origin develop
git branch -d feature/v0.1-database
```

### 一个 feature 分支可以包含多个 commit

```bash
# 如果一个 feature 分支对应多个 task 文件（比如 v0.1 的 006-010 都是数据库相关）
# 可以在同一个 feature 分支中提交多次：

git checkout -b feature/v0.1-database
# ... 完成 006
git commit -m "feat(db): setup SQLite database with migration framework"
# ... 完成 007
git commit -m "feat(db): implement CRUD operations for conversations, notes, and tags"
# ... 完成 010
git commit -m "fix(db): wrap multi-step operations in transactions and add busy_timeout"

# 然后一起推送，创建一个 PR
git push -u origin feature/v0.1-database
```

### 什么时候创建新的 feature 分支？

| 情况 | 做法 |
|------|------|
| 多个 task 属于同一个功能模块 | 一个 feature 分支，多个 commit |
| task 之间完全独立 | 各自一个 feature 分支 |
| 不确定 | 按 task 文件的"前置依赖"判断，有依赖关系的放一起 |

**建议的 V0.1 分支划分：**

```
feature/v0.1-init          → 001, 002, 003, 004（项目初始化）
feature/v0.1-database      → 005, 006, 007, 008, 009, 010（数据层+IPC）
feature/v0.1-ui-layout     → 011, 012（布局和主题）
feature/v0.1-import        → 013（导入功能）
feature/v0.1-list-detail   → 014, 015, 016（列表、详情、搜索）
feature/v0.1-infra         → 017, 018, 019（日志、测试、安全）
```

---

## 发布流程

### 准备发布

```bash
# 1. 从 develop 创建 release 分支
git checkout develop
git checkout -b release/v0.1.0

# 2. 在 release 分支上做最后的修复和调整
#    - 更新版本号（package.json）
#    - 更新 CHANGELOG.md
#    - 修复发现的小 bug
git commit -m "chore: bump version to 0.1.0"
git commit -m "docs: update CHANGELOG for v0.1.0"

# 3. 测试通过后，合并到 main
git checkout main
git merge release/v0.1.0 --no-ff
git tag v0.1.0

# 4. 同时合并回 develop（把 release 中的修复带回来）
git checkout develop
git merge release/v0.1.0 --no-ff

# 5. 推送
git push origin main --tags
git push origin develop

# 6. 删除 release 分支
git branch -d release/v0.1.0
git push origin --delete release/v0.1.0

# 7. CI 自动构建并发布到 GitHub Releases
```

### 紧急修复（线上 bug）

```bash
# 1. 从 main 切出 hotfix 分支
git checkout main
git checkout -b hotfix/crash-on-large-file

# 2. 修复
git commit -m "fix: handle large file import without memory overflow"

# 3. 合并到 main 并打 tag
git checkout main
git merge hotfix/crash-on-large-file --no-ff
git tag v0.1.1

# 4. 合并回 develop
git checkout develop
git merge hotfix/crash-on-large-file --no-ff

# 5. 推送并删除
git push origin main --tags
git push origin develop
git branch -d hotfix/crash-on-large-file
```

---

## PR（Pull Request）规范

### 创建 PR

```bash
# 用 GitHub CLI
gh pr create --title "feat(db): implement database layer" --body "$(cat <<'EOF'
## Summary
- Setup SQLite with migration framework
- Implement CRUD for conversations, notes, tags
- Add transaction protection and FTS5 indexing

## Changes
- New: electron/services/database/
- New: shared/types.ts, shared/ipc-channels.ts
- Modified: electron/main.ts (init database on startup)

## Test plan
- [ ] `pnpm dev` starts without error
- [ ] Database file created at userData path
- [ ] CRUD operations work via IPC
EOF
)"
```

### PR 标题规范

```
feat(db): implement database layer with migrations
fix(collector): handle EBUSY error on locked files
chore: upgrade electron to v30
```

和 commit message 格式一致。

### PR 描述模板

```markdown
## Summary
- 做了什么（1-3 个 bullet point）

## Changes
- New: 新增的文件/模块
- Modified: 修改的文件
- Deleted: 删除的文件（如果有）

## Test plan
- [ ] 验证步骤 1
- [ ] 验证步骤 2
```

### PR 合并规则

| 规则 | 说明 |
|------|------|
| CI 必须通过 | lint + typecheck + test 全绿 |
| 不能直接推 main | main 分支设置保护，只接受 PR 合并 |
| Squash merge | feature 分支合并到 develop 时用 squash（多个 commit 合为一个） |
| No-ff merge | release/hotfix 合并到 main 时用 `--no-ff`（保留合并记录） |

---

## Tag 规范

```bash
# 格式：v + 语义化版本号
v0.1.0    # 第一个发布版本
v0.1.1    # bug 修复
v0.2.0    # 新功能版本
v1.0.0    # 正式版

# 创建 tag
git tag v0.1.0
git push origin v0.1.0

# 查看所有 tag
git tag -l
```

---

## 保护规则（GitHub 设置）

在 GitHub 仓库 Settings → Branches 中配置：

### main 分支保护

- [x] Require pull request before merging
- [x] Require status checks to pass (CI)
- [x] Do not allow force pushes
- [x] Do not allow deletions

### develop 分支保护

- [x] Require status checks to pass (CI)
- [ ] Require pull request（个人项目可以不要求）

---

## 常用命令速查

```bash
# 查看当前分支
git branch

# 查看所有分支（含远程）
git branch -a

# 切换分支
git checkout develop
git checkout -b feature/xxx    # 创建并切换

# 查看状态
git status

# 查看提交历史
git log --oneline -10

# 暂存当前修改（切分支前用）
git stash
git stash pop    # 恢复

# 撤销未提交的修改
git checkout -- <file>         # 撤销单个文件
git checkout -- .              # 撤销所有

# 修改最后一次 commit message（未推送时）
git commit --amend -m "new message"

# 查看某个文件的修改历史
git log --oneline <file>

# 对比两个分支的差异
git diff develop..feature/xxx
```

---

## 禁止操作

| 操作 | 为什么禁止 |
|------|-----------|
| `git push --force` 到 main/develop | 会覆盖别人的代码 |
| 直接在 main 上 commit | main 只接受 PR 合并 |
| 删除 main 或 develop 分支 | 永久分支不能删 |
| commit 含有 .env 或 API Key | 安全风险 |
| 一个 PR 超过 500 行改动 | 太大无法 review，拆分 |
