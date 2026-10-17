# pnpm 项目中 Husky pre-commit hook 报 EBADDEVENGINES

## 问题现象

`git commit` 时报错：

```
npm error EBADDEVENGINES Invalid devEngines.packageManager
npm error Invalid name "pnpm" does not match "npm" for "packageManager"
husky - pre-commit script failed (code 1)
```

## 原因

Husky 的 hook 脚本中使用了 `npx`（npm 的命令），但项目的 `package.json` 中配置了 `devEngines.packageManager` 为 pnpm。npm 检测到不匹配就报错了。

```json
// package.json 中有这个配置（pnpm init 自动生成）
{
  "devEngines": {
    "packageManager": {
      "name": "pnpm",
      "version": "^11.4.0"
    }
  }
}
```

## 解决方案

把 hook 脚本中的 `npx` 改为 `pnpm exec`：

```bash
# .husky/pre-commit（修改前）
npx lint-staged

# .husky/pre-commit（修改后）
pnpm exec lint-staged
```

```bash
# .husky/commit-msg（修改前）
npx --no -- commitlint --edit $1

# .husky/commit-msg（修改后）
pnpm exec commitlint --edit $1
```

## 为什么会遇到这个问题

- `pnpm init` 会自动在 package.json 中加入 `devEngines.packageManager`
- Husky 的默认模板和很多教程都用 `npx`
- `npx` 是 npm 的工具，在 pnpm 项目中应该用 `pnpm exec` 或 `pnpm dlx`

## 区别

| 命令 | 用途 |
|------|------|
| `pnpm exec <cmd>` | 执行已安装的本地依赖的命令 |
| `pnpm dlx <cmd>` | 下载并执行一次性命令（类似 npx） |
| `npx <cmd>` | npm 的版本，pnpm 项目中不要用 |

## 适用范围

所有使用 pnpm + Husky 的项目。
