# Electron preload 脚本不支持 ESM（Cannot use import statement）

## 问题现象

启动 Electron 应用后控制台报错：

```
Unable to load preload script: /path/to/out/preload/index.js
SyntaxError: Cannot use import statement outside a module
```

导致 `window.electronAPI` 为 undefined，渲染进程所有 IPC 调用失败。

## 原因

Electron 的 preload 脚本运行在特殊的沙箱环境中，不支持 ES Module 格式（`import`/`export`）。必须使用 CommonJS 格式（`require`/`module.exports`）。

但 electron-vite 默认将所有代码编译为 ESM（因为 package.json 中有 `"type": "module"`）。

## 解决方案

在 `electron.vite.config.ts` 中明确指定 preload 的输出格式为 CJS：

```typescript
export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        output: { format: 'es' },  // main 可以用 ESM
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        output: { format: 'cjs' },  // preload 必须用 CJS！
      },
    },
  },
});
```

同时，main.ts 中引用 preload 的路径要改为 `.cjs` 后缀：

```typescript
// 输出文件名变为 index.cjs
preload: join(__dirname, '../preload/index.cjs'),
```

## 如何判断这个问题

- preload 编译后文件是 `.js` 且内容包含 `import` 语句 → 会报错
- preload 编译后文件是 `.cjs` 或内容包含 `require` → 正常

## 适用范围

所有 Electron + electron-vite 项目，特别是 package.json 中有 `"type": "module"` 的。
