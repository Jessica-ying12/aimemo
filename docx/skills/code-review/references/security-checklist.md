# 安全检查清单

## SQL 注入

- [ ] 所有数据库查询使用参数化（`?` 占位符）
- [ ] 动态字段名（sortBy、sortOrder）使用白名单校验
- [ ] 不拼接用户输入到 SQL 字符串中

```typescript
// 好
db.prepare('SELECT * FROM t WHERE id = ?').get(id);

// 坏
db.prepare(`SELECT * FROM t WHERE id = '${id}'`).get();
```

## 输入校验

- [ ] 所有 IPC handler 的参数经过 Zod schema 校验
- [ ] 字符串参数有长度限制
- [ ] 数字参数有范围限制
- [ ] 文件路径参数验证在允许范围内

## 敏感信息

- [ ] API Key 使用 `safeStorage` 加密存储
- [ ] 日志中不输出完整的 API Key / Token / 密码
- [ ] .env 文件在 .gitignore 中
- [ ] 错误消息不暴露内部实现细节给用户

## Electron 安全

- [ ] `contextIsolation: true`（已在 main.ts 中设置）
- [ ] `nodeIntegration: false`（已在 main.ts 中设置）
- [ ] CSP 头已配置
- [ ] 不允许导航到外部 URL
- [ ] 不允许打开新窗口
- [ ] 生产环境禁用 DevTools

## 依赖安全

- [ ] 新增依赖来自知名维护者
- [ ] 依赖版本锁定（pnpm-lock.yaml）
- [ ] 定期运行 `pnpm audit`

## 文件系统

- [ ] 文件路径操作使用 `path.join()`，不手动拼接
- [ ] 读取文件前检查路径是否在预期目录内
- [ ] 不跟随符号链接到预期目录外
