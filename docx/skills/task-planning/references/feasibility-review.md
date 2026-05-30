# 可行性审查清单

## 何时审查

- 方案写完、commit 列表拆好之后
- 开始生成任务文件之前
- 每个 commit 的代码片段写完之后

---

## 审查维度

### 1. 依赖链完整性

逐个 commit 检查：

- [ ] 该 commit 引用的文件，在前置 commit 中已创建？
- [ ] 该 commit 使用的函数/类型，在前置 commit 中已导出？
- [ ] 该 commit 需要的依赖库，在前置 commit 中已安装？
- [ ] 该 commit 需要的数据库表，在前置 commit 中已通过迁移创建？
- [ ] 该 commit 需要的 IPC 通道，在前置 commit 中已注册？

**检查方法：** 对每个 commit 的 import 语句，追溯到创建该文件的 commit，确认顺序正确。

### 2. 编译可通过

每个 commit 完成后：

- [ ] `pnpm typecheck` 能通过？（无类型错误）
- [ ] 没有引用不存在的模块？
- [ ] 没有使用未安装的依赖？
- [ ] 接口类型匹配？（函数参数、返回值）

**检查方法：** 心理模拟执行 `tsc --noEmit`，看每个 import 是否能解析。

### 3. 运行时可工作

每个 commit 完成后：

- [ ] `pnpm dev` 能启动？（不会因为缺少初始化而崩溃）
- [ ] 新增的服务有在 main.ts 中初始化？
- [ ] 新增的路由有在 App.tsx 中注册？
- [ ] 新增的 IPC handler 有在 registerIpcHandlers() 中注册？

**检查方法：** 追踪启动链路 main.ts → initDatabase → setupCollectors → registerIpcHandlers → createWindow。

### 4. 技术兼容性

- [ ] 新增依赖与 Electron 版本兼容？（特别是 native 模块）
- [ ] 新增依赖与已有依赖无冲突？（版本、peer deps）
- [ ] 使用的 API 在目标 Node.js 版本中可用？
- [ ] 使用的浏览器 API 在 Electron 的 Chromium 中可用？

### 5. 数据安全

- [ ] 数据库迁移是追加式的？（不修改已有迁移）
- [ ] 新增字段有默认值？（不会导致已有数据查询失败）
- [ ] 删除操作有级联处理？
- [ ] 敏感数据有加密/脱敏？

### 6. 性能影响

- [ ] 新增的文件监控不会监控过多目录？
- [ ] 新增的数据库查询有索引支持？
- [ ] 新增的定时任务不会过于频繁？
- [ ] 新增的 AI API 调用有速率控制？

---

## 审查输出格式

```markdown
## 可行性审查结果

**审查日期：** 2026-XX-XX
**方案：** XXX 功能

### 通过项
- ✅ 依赖链完整
- ✅ 编译可通过
- ✅ 技术兼容

### 问题项
- ❌ Commit #3 引用了 #4 才创建的 `ChatService` 类
  - **修复：** 将 ChatService 的创建移到 #2
- ⚠️ Commit #5 的 UI 没有处理加载状态
  - **修复：** 添加 loading state

### 结论
- [ ] 通过，可以生成任务文件
- [x] 需修正后重新审查
```

---

## 快速审查命令

对已有的任务文件做自动化检查：

```bash
# 检查所有 import 路径是否在前置任务中已创建
# （人工检查，逐文件过）

# 检查是否有遗漏的依赖安装
grep -r "from '" docx/tasks/v0.X/*.md | grep -v "node_modules" | sort

# 检查是否有重复的文件创建
grep -r "创建.*\.ts" docx/tasks/v0.X/*.md | sort
```
