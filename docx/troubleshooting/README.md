# 问题排查笔记

遇到的问题和解决方案汇总，适用于任何类似技术栈的项目。

| 编号 | 问题 | 技术栈 | 文件 |
|------|------|--------|------|
| 001 | Electron + native 模块版本不兼容 | Electron, better-sqlite3 | [001-electron-native-module.md](001-electron-native-module.md) |
| 002 | electron-vite 开发模式窗口空白 | electron-vite | [002-electron-vite-blank-window.md](002-electron-vite-blank-window.md) |
| 003 | electron-vite externalizeDepsPlugin 构建失败 | electron-vite 5.x, vite 8 | [003-externalize-deps-plugin-error.md](003-externalize-deps-plugin-error.md) |
| 004 | ESLint 不识别浏览器全局变量 | ESLint flat config | [004-eslint-browser-globals.md](004-eslint-browser-globals.md) |
| 005 | pnpm + Husky pre-commit hook 报 EBADDEVENGINES | pnpm, husky | [005-husky-pnpm-npx-conflict.md](005-husky-pnpm-npx-conflict.md) |
| 006 | Electron preload 脚本不支持 ESM | Electron, electron-vite | [006-preload-esm-not-supported.md](006-preload-esm-not-supported.md) |
| 007 | ESM 打包中 require() 导致模块未注册 | Vite, ESM, electron-vite | [007-require-in-esm-bundle.md](007-require-in-esm-bundle.md) |

---

## 经验总结

### Electron 项目的常见坑

1. **版本兼容是最大的坑** — Electron 版本、Node.js 版本、native 模块版本三者必须匹配。选择 Electron LTS 版本最稳妥。
2. **preload 必须是 CJS** — Electron 的 preload 沙箱不支持 ESM，即使项目是 `"type": "module"` 也得单独配置 preload 输出为 CJS。
3. **native 模块需要 rebuild** — 每次换 Electron 版本或系统环境变化，都要 `electron-rebuild`。
4. **不要用最新版 Electron** — 等社区 native 模块跟上再升级。

### 工具链的常见坑

5. **ESLint v9 flat config 是全新的** — 很多教程还是旧格式，全局变量需要手动声明。
6. **pnpm 项目不要用 npx** — 用 `pnpm exec` 代替，否则 devEngines 检查会拦截。
7. **electron-vite 的插件可能不兼容** — `externalizeDepsPlugin` 在新版本组合下可能失效，手动配置 external 更可靠。

### 调试技巧

- **窗口空白** → 先检查 DevTools Console 有没有报错
- **模块找不到** → 检查 `node_modules/` 下有没有 symlink，检查 package.json dependencies
- **编译失败** → 看具体错误是 TypeScript 类型错误还是 bundler 配置问题
- **native 模块崩溃** → 版本不匹配，rebuild 或降级
