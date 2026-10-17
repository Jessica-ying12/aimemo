# Claude Code JSONL 格式与文档/旧版不同

## 问题现象

采集器全量扫描完成但对话列表为空，今日 +0。日志中没有报错。

## 原因

Claude Code 的 JSONL 文件格式与网上流传的文档不同：

**错误假设（旧版或文档）：**
```json
{"type":"human","content":"你好"}
{"type":"assistant","content":[{"type":"text","text":"你好！"}]}
```

**实际格式（2026 年版本）：**
```json
{"type":"user","message":{"role":"user","content":"你好"},"timestamp":"2026-05-28T17:03:16.693Z"}
{"type":"assistant","message":{"content":[{"type":"text","text":"你好！"}]},"timestamp":"..."}
```

关键区别：
| 字段 | 旧假设 | 实际 |
|------|--------|------|
| 用户消息 type | `"human"` | `"user"` |
| 内容位置 | `item.content` | `item.message.content` |
| 其他 type 值 | 无 | `"mode"`, `"system"`, `"tool_use"`, `"file-history-snapshot"` 等 |

## 解决方案

```typescript
// 正确的解析逻辑
if (item.type !== 'user' && item.type !== 'assistant') continue;

const messageObj = item.message || item;
const content = messageObj.content;

if (typeof content === 'string') {
  msgContent = content;  // 用户消息
} else if (Array.isArray(content)) {
  msgContent = content
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('\n');  // AI 消息
}
```

## 另一个坑：文件路径

JSONL 文件直接在项目目录中，不在 `conversations/` 子目录中：

```
实际：~/.claude/projects/{hash}/*.jsonl
错误假设：~/.claude/projects/{hash}/conversations/*.jsonl
```

## 教训

1. **永远先看实际文件内容再写解析器** — `head -5 file.jsonl` 比猜格式有用
2. **AI 工具更新频繁，格式会变** — 不要依赖旧文档
3. **静默失败最难排查** — 解析器找不到匹配的行就返回空数组，不报错，看起来像"功能正常但没数据"

## 适用范围

所有需要解析第三方工具数据文件的项目。格式可能随版本变化，需要实际验证。
