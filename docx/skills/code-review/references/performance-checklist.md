# 性能检查清单

## 数据库

- [ ] 频繁查询的字段有索引
- [ ] WHERE 条件中的字段有索引
- [ ] ORDER BY 字段有索引
- [ ] 没有 N+1 查询（循环中逐条查询）
- [ ] 列表查询有 LIMIT（分页）
- [ ] 大批量写入使用事务（批量 INSERT 比逐条快 100x）
- [ ] FTS 查询使用 `MATCH` 而非 `LIKE '%xxx%'`

```typescript
// 坏：N+1
const notes = db.prepare('SELECT * FROM notes').all();
for (const note of notes) {
  const tags = db.prepare('SELECT * FROM tags JOIN note_tags...').all(note.id);
}

// 好：JOIN 一次查完
const notesWithTags = db.prepare(`
  SELECT n.*, GROUP_CONCAT(t.name) as tags
  FROM notes n LEFT JOIN note_tags nt ON n.id = nt.note_id
  LEFT JOIN tags t ON nt.tag_id = t.id
  GROUP BY n.id
`).all();
```

## 内存

- [ ] 大文件使用流式读取（不一次性 readFileSync 整个文件）
- [ ] 事件监听器在组件卸载/服务停止时移除
- [ ] 定时器在不需要时 clearInterval/clearTimeout
- [ ] 大数组处理完后释放引用（let arr = null）
- [ ] Electron BrowserWindow 关闭后释放引用

## React 渲染

- [ ] 列表组件有 `key` prop（且不是 index）
- [ ] 大列表使用虚拟滚动（@tanstack/react-virtual）
- [ ] 昂贵计算使用 `useMemo`
- [ ] 回调函数使用 `useCallback`（传给子组件时）
- [ ] 避免在 render 中创建新对象/数组（导致子组件重渲染）

## 网络

- [ ] API 调用有超时（30s）
- [ ] 重复请求有防抖/节流
- [ ] 批量 API 调用有并发限制
- [ ] 失败请求有重试（指数退避）
- [ ] 区分可重试错误（429、5xx）和不可重试错误（401、400）

## 文件系统

- [ ] 文件监控使用 `awaitWriteFinish` 避免读取未写完的文件
- [ ] 目录遍历有深度限制（防止无限递归）
- [ ] 大目录扫描不阻塞主线程

## 启动性能

- [ ] 非关键模块延迟加载
- [ ] 数据库迁移只在需要时执行
- [ ] 采集服务延迟 3s 启动（不阻塞窗口显示）
- [ ] 路由组件使用 `React.lazy()` 按需加载
