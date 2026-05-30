# 提交前自查清单

每次 `git commit` 前过一遍：

## 必查项（任何一项不通过就不要提交）

- [ ] `pnpm lint` 无错误
- [ ] `pnpm typecheck` 无错误
- [ ] `pnpm test` 相关测试通过
- [ ] 没有 `console.log`（用 `logger` 代替）
- [ ] 没有硬编码的 API Key、密码、Token
- [ ] 没有 `as any` 类型断言（除非有 SAFETY 注释）
- [ ] 新增的 IPC handler 使用了 `registerHandler` wrapper
- [ ] 数据库多步写入包裹在 `db.transaction()` 中
- [ ] 新增文件位置和命名符合规范

## 应查项

- [ ] 新增功能有对应测试
- [ ] 错误情况有处理（不是只处理 happy path）
- [ ] 大列表有分页或虚拟滚动
- [ ] 异步操作有 loading 状态
- [ ] 用户输入有校验
- [ ] commit message 符合 Conventional Commits 格式

## 快速检查命令

```bash
# 一键检查
pnpm lint && pnpm typecheck && pnpm test

# 检查是否有敏感信息
git diff --cached | grep -iE "(sk-|api.key|password|secret|token)" 

# 检查是否有 console.log
git diff --cached | grep "console.log"

# 检查是否有 as any
git diff --cached | grep "as any"
```
