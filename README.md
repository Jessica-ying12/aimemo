# AIMemo · AI 对话知识沉淀桌面应用

> 把与 AI 工具（Claude、Codex 等）的对话内容，自动采集、整理、分类、沉淀成可搜索的个人知识库。

## 项目简介

AIMemo 是一款桌面端应用，解决「和 AI 聊了很多，但内容散落各处、无法沉淀复用」的痛点。它会自动采集 AI 对话，结构化存储到本地，并支持搜索、浏览与导出，让临时问答变成可长期复用的个人知识资产。

## 技术栈

- **Electron** — 桌面应用框架
- **React + TypeScript** — 渲染进程 UI
- **SQLite** — 本地数据存储
- **electron-vite** — 构建工具
- **Zustand** — 状态管理
- **Vitest** — 单元测试

## 核心功能

- **对话采集**：自动采集 AI 会话内容与状态
- **会话管理**：会话列表浏览、详情查看
- **全文搜索**：快速检索历史知识
- **数据导入**：导入已有对话记录
- **设置管理**：采集与存储配置

## 架构

```
aimemo/
├── electron/          # 主进程（Node.js）
│   ├── main.ts        # 窗口创建与生命周期
│   ├── ipc-handlers.ts# IPC 通信处理
│   ├── preload.ts     # 安全的渲染进程桥接
│   └── services/      # 采集、存储等核心服务
├── src/               # 渲染进程（React）
│   ├── pages/         # 页面组件
│   ├── stores/        # Zustand 状态管理
│   └── lib/           # API 调用封装
└── shared/            # 主/渲染进程共享的类型与 IPC 通道定义
```

## 快速开始

```bash
pnpm install        # 安装依赖
pnpm dev            # 启动开发环境
pnpm test           # 运行测试
pnpm typecheck      # 类型检查
pnpm build:mac      # 打包 macOS 应用
```

## 技术栈关键词

`Electron` · `React` · `TypeScript` · `SQLite` · `Zustand` · `electron-vite`

---

_让每一次 AI 对话，都成为可复用的知识。_
