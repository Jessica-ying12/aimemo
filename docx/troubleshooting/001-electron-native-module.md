# Electron + Native 模块版本不兼容

## 问题现象

启动 Electron 应用时报错：

```
was compiled against a different Node.js version using
NODE_MODULE_VERSION 141. This version of Node.js requires
NODE_MODULE_VERSION 146.
```

或者 `electron-rebuild` 编译失败，报 V8 API 错误（`SetNativeDataProperty is ambiguous`、`too few arguments`）。

## 原因

Electron 内置了自己的 Node.js 版本，与系统安装的 Node.js 版本不同。Native 模块（如 better-sqlite3）是用 C++ 编写的，编译时绑定了特定的 Node.js ABI 版本。

- 系统 Node.js 编译的 `.node` 文件 → Electron 无法加载（ABI 不匹配）
- 需要针对 Electron 的 Node.js 版本重新编译

## 解决方案

### 方案 1：用 @electron/rebuild 重新编译

```bash
pnpm add -D @electron/rebuild
pnpm exec electron-rebuild -f -w better-sqlite3
```

### 方案 2：如果 rebuild 也失败（API 不兼容）

说明 native 模块版本与 Electron 版本不兼容。需要找到兼容的组合：

| Electron 版本 | Node.js 版本 | better-sqlite3 兼容版本 |
|--------------|-------------|----------------------|
| 33.x (LTS) | 20.x | 11.x ✓ |
| 34-36.x | 20.x | 11.x ✓ |
| 42.x | 22.x | 12.x ✗（V8 API 变化太大） |

**降级 Electron 到 LTS 版本是最稳妥的方案：**

```bash
pnpm remove electron
pnpm add -D electron@33
pnpm exec electron-rebuild -f -w better-sqlite3
```

### 方案 3：使用 electron-builder 的 postinstall

在 package.json 中配置：

```json
{
  "scripts": {
    "postinstall": "electron-builder install-app-deps"
  }
}
```

这会在 `pnpm install` 后自动为 Electron 重新编译 native 模块。

## 如何判断兼容性

```bash
# 查看 Electron 内置的 Node.js 版本
npx electron -e "console.log(process.versions)"

# 查看 native 模块需要的 Node.js 版本
node -e "console.log(process.versions.modules)"  # 系统 Node.js 的 ABI 版本
```

## 预防措施

1. **锁定 Electron 版本** — 不要用 `^` 前缀，用精确版本
2. **选择 Electron LTS** — 社区支持更好，native 模块兼容性更高
3. **CI 中测试 rebuild** — 确保每次依赖更新后 native 模块能编译
4. **考虑替代方案** — 如果 native 模块持续有兼容问题，考虑：
   - `sql.js`（SQLite 的 WASM 版本，无需编译）
   - 把数据库操作放到独立的 Node.js 子进程中（不受 Electron ABI 限制）

## 相关链接

- https://www.electronjs.org/docs/latest/tutorial/using-native-node-modules
- https://github.com/electron/rebuild
- https://github.com/nicolo-ribaudo/better-sqlite3/releases（查看各版本兼容性）
