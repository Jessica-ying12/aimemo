# ESLint Flat Config 不识别浏览器全局变量

## 问题现象

```
error  'document' is not defined   no-undef
error  'window' is not defined     no-undef
error  'localStorage' is not defined  no-undef
error  'navigator' is not defined  no-undef
error  'React' is not defined      no-undef
```

## 原因

ESLint v9 的 flat config 格式不再自动包含浏览器全局变量。旧版 `.eslintrc` 中可以写 `"env": { "browser": true }`，但 flat config 中需要手动声明 globals。

## 解决方案

在 `eslint.config.mjs` 的 `languageOptions.globals` 中添加需要的全局变量：

```javascript
// eslint.config.mjs
export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        // Node.js
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',

        // Browser
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        AbortController: 'readonly',

        // Electron
        Electron: 'readonly',
        NodeJS: 'readonly',
      },
    },
  },
];
```

## 更好的方案：使用 globals 包

```bash
pnpm add -D globals
```

```javascript
import globals from 'globals';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
];
```

## 为什么会遇到这个问题

- ESLint v9 flat config 是全新的配置格式
- 不再有 `env` 字段
- 需要显式声明所有全局变量
- 很多教程还是旧格式，容易踩坑

## 适用范围

所有使用 ESLint v9+ flat config 的项目。
