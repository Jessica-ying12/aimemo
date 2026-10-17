# ESM 环境中 require() 动态导入导致模块未注册

## 问题现象

Electron 渲染进程报错：

```
Error: No handler registered for 'collector:status'
```

主进程中明明注册了 handler，但运行时找不到。

## 原因

在 `ipc-handlers.ts` 中使用了 `require()` 动态导入：

```typescript
// 错误写法：ESM 打包后 require 不会被正确解析
registerHandler('collector:status', () => {
  const { collectorManager } = require('./services/collector/manager');
  return collectorManager.getStatus();
});
```

问题链：
1. 项目是 ESM（`"type": "module"`）
2. electron-vite 用 Vite/Rollup 打包主进程代码
3. bundler 遇到 `require()` 时不会跟踪依赖（它只处理 `import`）
4. 打包后的 `out/main/index.js` 中 `require('./services/collector/manager')` 变成了一个无法解析的路径
5. 运行时模块加载失败，handler 没有被成功注册

## 解决方案

把 `require()` 改为顶层静态 `import`：

```typescript
// 正确写法：顶层静态 import
import { collectorManager } from './services/collector/manager';
import { detectInstalledTools } from './services/collector/detector';

export function registerIpcHandlers() {
  registerHandler('collector:status', () => {
    return collectorManager.getStatus();
  });
}
```

## 规则

在被 bundler 打包的代码中（electron-vite 的 main 和 preload）：

| 写法 | 结果 |
|------|------|
| `import x from 'y'`（顶层） | ✓ bundler 正确跟踪和打包 |
| `const x = require('y')` | ✗ bundler 忽略，运行时找不到模块 |
| `await import('y')`（动态） | ⚠️ 可能工作，但 bundler 可能不分析 |

**简单规则：在 electron-vite 项目中，永远用 `import`，不用 `require`。**

## 例外

唯一可以用 `require` 的地方是被标记为 `external` 的模块（如 `better-sqlite3`），因为它们不会被打包，运行时直接从 `node_modules` 加载。但即使这样，用 `import` 也同样可以工作。

## 如何排查

如果遇到 "No handler registered" 或 "Cannot find module"：
1. 检查 handler 是否用了 `require()` 导入
2. 检查 `out/main/index.js` 中是否有未解析的 `require` 调用
3. 改为静态 `import`

## 适用范围

所有使用 Vite/Rollup/esbuild 打包的 ESM 项目。不限于 Electron。
