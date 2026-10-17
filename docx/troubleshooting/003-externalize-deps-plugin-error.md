# electron-vite externalizeDepsPlugin 构建失败

## 问题现象

```
[rolldown:vite-resolve] plugin `rolldown:vite-resolve` threw an error

Caused by:
    "./node" is not exported under the conditions ["module", "node", "development", "import"]
    from package electron-vite
```

## 原因

`externalizeDepsPlugin()` 是 electron-vite 提供的插件，用于自动将 Node.js 依赖标记为 external（不打包进 bundle）。

在 electron-vite 5.0.0 + vite 8.x 的组合下，这个插件内部尝试 import `electron-vite/node`，但该子路径在 package.json 的 exports 中只导出了类型定义（`.d.ts`），没有运行时代码。

## 解决方案

不使用 `externalizeDepsPlugin()`，改为手动在 `rollupOptions.external` 中指定需要排除的模块：

```typescript
// electron.vite.config.ts
import { defineConfig } from 'electron-vite';

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, 'electron/main.ts') },
        external: ['electron', 'better-sqlite3'],  // 手动指定
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, 'electron/preload.ts') },
        external: ['electron'],
      },
    },
  },
  renderer: {
    // renderer 不需要 external
  },
});
```

## 需要 external 的模块

| 模块 | 为什么要 external |
|------|-----------------|
| `electron` | Electron 内置，不能打包 |
| `better-sqlite3` | Native 模块（.node 文件），不能被 bundler 处理 |
| 其他 native 模块 | 同上 |

## 如何判断是否需要加 external

如果一个依赖满足以下任一条件，就需要加到 external：
1. 是 Electron 内置模块（`electron`）
2. 包含 `.node` 二进制文件（native addon）
3. 使用了 `__dirname`/`__filename` 且依赖运行时路径

## 适用范围

electron-vite 5.x + vite 8.x 项目。未来版本可能修复此问题。
