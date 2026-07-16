# AI 书签管家 (BookmarkMind AI)

> AI 驱动的 Chrome 书签管理扩展 — 收藏即整理，搜索即对话

**GitHub：** https://github.com/shawn2016/bookmarkmind-ai

Chrome Extension MV3 + React 18 + TypeScript + Tailwind CSS + Zustand

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

构建后 `dist/` 目录可直接加载为 Chrome 未打包扩展：
1. 打开 `chrome://extensions`
2. 开启「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择 `dist/` 目录

## 技术栈

| 模块 | 技术 |
|------|------|
| 扩展框架 | Chrome Extension Manifest V3 |
| 前端框架 | React 18 + TypeScript (strict) |
| UI 样式 | Tailwind CSS + CSS 变量 Design Token |
| 状态管理 | Zustand |
| 虚拟滚动 | @tanstack/react-virtual |
| 图标 | Lucide React |
| 构建工具 | Vite 5 + @crxjs/vite-plugin |

## 项目结构

```
bookmarkmind-ai/
├── src/
│   ├── manifest.ts              # MV3 清单配置
│   ├── background/              # Service Worker
│   │   ├── index.ts             # 消息路由 + 初始化
│   │   ├── ai/                  # AI 引擎
│   │   │   ├── provider.ts      # Provider 接口 + 工厂
│   │   │   ├── openai.ts        # OpenAI (SSE 流式)
│   │   │   ├── anthropic.ts     # Anthropic Claude
│   │   │   ├── custom.ts       # 自定义/本地模型
│   │   │   ├── prompt.ts        # Prompt 模板
│   │   │   └── stream.ts        # SSE 流解析
│   │   ├── bookmarks/           # 书签操作
│   │   │   ├── crud.ts          # 增删改查 + 回收站
│   │   │   ├── search.ts        # 关键词预筛
│   │   │   └── classify.ts      # AI 智能分类
│   │   ├── storage/             # 存储管理
│   │   └── messaging.ts         # 类型安全消息通信
│   │
│   ├── content/                 # Content Script（注入网页）
│   │   ├── index.tsx             # 入口：Shadow DOM + React
│   │   ├── shadow-root.ts       # Shadow DOM 隔离
│   │   ├── App.tsx              # 根组件
│   │   ├── store/contentStore.ts # Zustand 全局状态
│   │   ├── hooks/               # 拖拽/调整/对话/书签
│   │   ├── components/
│   │   │   ├── FloatingBall/     # 悬浮球（三态：收起/悬停/展开）
│   │   │   ├── MiniActionBar/    # 迷你操作栏
│   │   │   ├── FloatingPanel/    # 悬浮面板容器
│   │   │   ├── ChatTab/          # AI 对话框（流式输出）
│   │   │   ├── BookmarkTab/      # 书签列表（虚拟滚动+批量）
│   │   │   ├── BookmarkButton/   # 一键收藏
│   │   │   ├── Toast/            # 通知
│   │   │   └── Modal/            # 确认弹窗
│   │   └── styles/shadow.css     # Shadow DOM 内样式
│   │
│   ├── options/                  # 设置页（新标签页全屏）
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   └── components/
│   │       ├── sections/         # 模型配置/悬浮球设置/关于
│   │       └── forms/            # Provider选择/APIKey/URL规则
│   │
│   ├── popup/                    # 工具栏 Popup（降级方案）
│   │   └── Popup.tsx
│   │
│   └── shared/                   # 共享代码
│       ├── types/index.ts        # 全局类型定义
│       ├── styles/tokens.css     # Design Token CSS 变量
│       ├── utils/                # URL匹配/防抖/格式化
│       └── components/           # 原子组件（Button/Input/Toggle/...）
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

## 核心功能

### P0（已实现）
- **悬浮球**：48px 圆角方形，30% 透明度，可拖拽，悬停展开操作栏
- **AI 对话框**：自然语言搜索书签，SSE 流式输出，打字指示器
- **一键收藏**：自动 AI 分类，Toast 反馈，已收藏检测
- **模型配置**：OpenAI / Anthropic / 自定义（Ollama 等），API Key 本地存储
- **批量管理**：多选删除/移动，确认弹窗，虚拟滚动
- **悬浮球配置**：透明度/位置/禁用网站/操作栏模式/全屏自动隐藏

### P1（架构已就绪）
- 全量智能分类、失效链接检测、重复书签检测、对话式批量操作

## 架构亮点

### Shadow DOM 隔离
所有注入页面的 UI 使用 Shadow DOM 隔离，CSS 内联注入，零样式冲突。

### Service Worker AI 引擎
AI API 调用在 Service Worker 中执行（不受 CSP 限制），通过 `chrome.runtime.sendMessage` + `chrome.tabs.sendMessage` 实现流式传输。

### Design Token 系统
完整的 CSS 变量系统（色彩/字体/间距/圆角/阴影/z-index/动效），支持浅色/深色模式。

### 动效设计（参考 Pinmark）
- Spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)` 用于交互元素
- `:active { transform: scale(0.97) }` 按钮按压反馈
- Glassmorphism `backdrop-filter: blur(14px) saturate(140%)`
- 面板展开 `scale(0.8) → 1 + opacity 0 → 1`
- 操作栏滑入 `translateX(20px) → 0`

## 配置说明

首次使用需要在设置页配置 AI 模型：
1. 点击悬浮球 → 设置 → 打开设置页面
2. 选择 AI 服务商（OpenAI / Anthropic / 自定义）
3. 输入 API Key
4. 点击「测试连接」验证
5. 即可使用 AI 搜索和智能分类

## 许可证

MIT — 源码托管于 [shawn2016/bookmarkmind-ai](https://github.com/shawn2016/bookmarkmind-ai)
