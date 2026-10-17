# electron-vite 开发模式窗口空白

## 问题现象

`pnpm dev` 启动后 Electron 窗口打开但显示空白页面，DevTools 中可能看到 `ERR_CONNECTION_REFUSED`。

## 原因

主进程中加载 renderer URL 的方式不正确。常见错误：

```typescript
// 错误：硬编码 URL + 用 NODE_ENV 判断
if (process.env.NODE_ENV === 'development') {
  mainWindow.loadURL('http://localhost:5173');
}
```

问题：
1. electron-vite dev 模式下 `NODE_ENV` 不一定是 `'development'`
2. renderer dev server 的端口可能不是 5173（被占用时会换端口）

## 解决方案

使用 electron-vite 自动注入的环境变量 `ELECTRON_RENDERER_URL`：

```typescript
function createWindow() {
  const mainWindow = new BrowserWindow({ ... });

  // electron-vite dev 模式下会自动设置这个环境变量
  const rendererUrl = process.env['ELECTRON_RENDERER_URL'];
  if (rendererUrl) {
    mainWindow.loadURL(rendererUrl);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}
```

## 为什么这样更好

- `ELECTRON_RENDERER_URL` 由 electron-vite 自动设置，包含正确的端口号
- 生产模式下这个变量不存在，自动走 `loadFile` 分支
- 不依赖 `NODE_ENV`，更可靠

## 适用范围

所有使用 electron-vite 的项目。
