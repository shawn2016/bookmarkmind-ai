# AI 书签管家 — 前端开发需求文档

| 字段 | 内容 |
|------|------|
| 文档版本 | v1.0 |
| 创建日期 | 2026-07-15 |
| 关联文档 | AI书签管家_PRD.md · AI书签管家_UI设计规范.md |
| 适用对象 | 前端开发工程师 |
| 文档状态 | 评审稿 |

---

## 目录

1. [UI 设计规范评估](#1-ui-设计规范评估)
2. [页面/模块复杂度分析](#2-页面模块复杂度分析)
3. [技术架构方案](#3-技术架构方案)
4. [组件拆分清单](#4-组件拆分清单)
5. [目录结构](#5-目录结构)
6. [开发优先级与排期](#6-开发优先级与排期)
7. [前端开发规范要求](#7-前端开发规范要求)
8. [验收标准清单](#8-验收标准清单)
9. [风险与注意事项](#9-风险与注意事项)

---

## 1. UI 设计规范评估

### 1.1 综合评分

| 维度 | 评分 | 说明 |
|------|------|------|
| Design Token 完整度 | 9/10 | 色彩/字体/间距/圆角/阴影/z-index/动效全覆盖，数值精确到 px |
| 组件覆盖度 | 7.5/10 | P0 核心组件全部定义，但 P1/P2 部分模块缺失 UI 规格 |
| 交互状态定义 | 8/10 | 悬浮球三态、按钮四态、收藏四态清晰，但缺少错误态和边界态 |
| Chrome 扩展适配 | 7/10 | Shadow DOM 隔离已明确，但 CSP 降级方案、Popup 模式未定义 |
| 可开发性 | 8.5/10 | 尺寸/间距/动画/颜色均为具体值，开发可直接引用 Token 实现 |
| 无障碍规范 | 9/10 | WCAG AA 对比度验证、键盘导航、ARIA 标注、焦点管理全覆盖 |
| **综合** | **8.2/10** | P0 可直接进入开发，P1/P2 需补充 UI 规格 |

### 1.2 已覆盖的组件（可直接开发）

| 组件 | 规格完整度 | 备注 |
|------|-----------|------|
| 悬浮球 | 完整 | 收起/悬停/拖拽/右键/自动隐藏全覆盖 |
| 迷你操作栏 | 完整 | 4 按钮、动画、Tooltip 定义清晰 |
| 悬浮面板容器 | 完整 | 标题栏/Tab栏/状态栏/调整大小规格齐全 |
| AI 对话框 | 完整 | 气泡/流式输出/打字指示器/结果卡片/输入区/空状态 |
| 书签列表 | 完整 | 搜索/分类标签/列表项/批量操作/虚拟滚动 |
| 一键收藏 | 完整 | 按钮四态/Toast/分类选择下拉 |
| 模型配置设置页 | 完整 | 服务商选择/API Key/高级设置/隐私声明 |
| 悬浮球设置页 | 完整 | 开关/位置/透明度/操作栏模式/禁用网站/自动隐藏 |
| Toast 通知 | 完整 | 4 类型/堆叠/自动消失 |
| Modal 对话框 | 完整 | 遮罩/标题/内容/操作栏/动画 |
| 空状态 | 完整 | 通用空状态/搜索无结果 |
| 加载状态 | 完整 | 骨架屏/Spinner/进度条 |
| 深色模式 | 完整 | Token 覆写+特殊调整 |
| 通用表单控件 | 完整 | 输入框/密码框/数字框/滑块/开关/下拉/按钮四类型 |
| 动效系统 | 完整 | 10 种标准动效+降级处理 |
| 图标系统 | 完整 | Lucide Icons + 尺寸映射 + 颜色规则 |

### 1.3 缺失项清单（需补充后开发）

| # | 缺失项 | 影响模块 | 优先级 | 补充建议 |
|---|--------|---------|--------|---------|
| G1 | AI API 错误态 UI（网络超时/Key 失效/速率限制/余额不足） | AI 对话框 | P0 | 需定义 4 种错误状态的气泡样式+重试按钮 |
| G2 | 对话式批量操作确认 UI（操作预览+影响范围+二次确认） | AI 对话框 | P0 | 需定义操作预览卡片+确认/取消交互 |
| G3 | 分类管理设置页 UI（新建/重命名/删除/合并分类） | 设置页 | P1 | 需补充分类 CRUD 界面 |
| G4 | 通知设置页 UI | 设置页 | P1 | 需补充通知偏好设置 |
| G5 | 数据管理设置页 UI（导入/导出/回收站/清空数据） | 设置页 | P1 | 需补充导入导出+回收站界面 |
| G6 | 个性化设置页完整 UI（快捷键/语言/字体大小/主题切换） | 设置页 | P1 | 部分已在 PRD 中提及但未出 UI 规格 |
| G7 | 全量智能分类进度 UI（批量处理进度+结果预览+撤销） | 智能分类 | P1 | 需定义批量处理进度条+预览列表+撤销按钮 |
| G8 | 失效链接检测结果 UI | 智能检测 | P1 | 需定义结果列表+HTTP 状态码标注+批量操作 |
| G9 | 重复书签检测结果 UI | 智能检测 | P1 | 需定义重复组展示+保留选择交互 |
| G10 | CSP 阻止注入时的 Popup 降级 UI | 悬浮球 | P0 | 需定义降级 Popup 的布局和交互 |
| G11 | 关于页面 UI | 设置页 | P2 | 需补充版本信息/开源协议/反馈入口 |
| G12 | 首次使用引导/onboarding 流程 | 全局 | P1 | 需定义安装后的引导步骤 |

### 1.4 结论

> **P0 功能的 UI 规格已足够支撑开发启动**。G1/G2/G10 三项需在开发前补充，其余可在 Phase 2 开发前补充。

---

## 2. 页面/模块复杂度分析

### 2.1 复杂度评级标准

| 等级 | 说明 | 典型特征 |
|------|------|---------|
| 低 | 标准 UI 实现，无复杂交互 | 静态页面、简单表单 |
| 中 | 有状态管理或多步交互 | Tab 切换、搜索筛选、表单验证 |
| 高 | 异步数据流+复杂状态机+动画 | SSE 流式、虚拟滚动、拖拽调整 |
| 极高 | 跨上下文通信+Shadow DOM+性能优化 | Content Script 注入、跨标签同步 |

### 2.2 模块复杂度矩阵

| 模块 | 复杂度 | 技术难点 | 估时（人天） |
|------|--------|---------|-------------|
| 悬浮球 | 极高 | Content Script 注入+Shadow DOM+拖拽+右键菜单+URL 匹配规则+全屏检测+CSP 降级 | 4-5 |
| 迷你操作栏 | 中 | 悬停延时控制+滑入动画+消息通信 | 1.5-2 |
| 悬浮面板容器 | 高 | 拖拽移动+Resize 调整+位置/尺寸持久化+展开/收起动画+ESC 关闭 | 3 |
| AI 对话框 | 极高 | SSE 流式解析+消息历史管理+打字指示器+结果卡片渲染+自动滚动锁定+错误重试+操作确认交互 | 6-7 |
| 书签列表 | 高 | chrome.bookmarks API 集成+搜索防抖+分类筛选+虚拟滚动(react-window)+多选模式+批量操作+列表项 Hover 操作 | 5-6 |
| 一键收藏 | 高 | 当前标签页信息获取+favicon 抓取+AI 分类异步触发+Toast 交互+分类选择下拉+已收藏状态检测 | 3-4 |
| 模型配置 | 中 | 服务商选择+API Key 密码模式+测试连接(异步)+高级参数表单+本地模型配置 | 2.5-3 |
| 悬浮球设置 | 中 | 表单控件+URL 规则列表 CRUD+实时预览+配置同步到 Content Script | 2.5-3 |
| 其他设置页 | 中 | 分类管理+通知设置+数据管理+个性化+关于页 | 3-4 |
| 智能检测（P1） | 高 | 失效链接批量 HEAD 请求+并发控制+进度条+结果列表+重复检测算法 | 3-4 |
| 全量智能分类（P1） | 高 | 批量 AI 调用+分批处理+进度展示+结果预览+撤销机制 | 3-4 |
| 深色模式+i18n+a11y | 中 | Token 切换+中英文切换+ARIA 完善+键盘导航 | 2-3 |
| 首次引导（P1） | 低 | 3-4 步引导弹窗 | 1 |

### 2.3 工时汇总

| 阶段 | 范围 | 估时（人天） |
|------|------|-------------|
| Phase 1 MVP | P0 全部功能 | 27-34 |
| Phase 2 增强 | P1 全部功能 | 12-17 |
| Phase 3 完善 | P2 全部功能 | 5-7 |
| **总计** | | **44-58 人天（约 9-12 周）** |

> 以上为单人开发估时。如 2 人并行可压缩至 6-8 周。不含 Chrome Web Store 审核周期（通常 1-3 天）。

---

## 3. 技术架构方案

### 3.1 Chrome Extension MV3 架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      Chrome Extension (MV3)                      │
│                                                                 │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  Background     │  │  Content Script   │  │  Options Page  │ │
│  │  (Service Worker)│  │  (注入到网页)      │  │  (设置页)       │ │
│  │                 │  │                   │  │                │ │
│  │  - 书签 CRUD    │  │  - 悬浮球渲染     │  │  - 模型配置    │ │
│  │  - AI API 调用  │  │  - 迷你操作栏     │  │  - 悬浮球设置  │ │
│  │  - 消息路由     │  │  - 悬浮面板渲染   │  │  - 分类管理    │ │
│  │  - 定时任务     │  │  - Shadow DOM    │  │  - 数据管理    │ │
│  │  - 存储管理     │  │    隔离           │  │  - 个性化      │ │
│  │                 │  │                   │  │                │ │
│  └────────┬────────┘  └────────┬──────────┘  └────────┬───────┘ │
│           │                    │                      │        │
│           └────────────────────┼──────────────────────┘        │
│                                │                                 │
│                    ┌───────────▼───────────┐                    │
│                    │   chrome.storage      │                    │
│                    │   .local / .session   │                    │
│                    └───────────────────────┘                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Chrome APIs                              ││
│  │  bookmarks · tabs · storage · scripting · runtime ·        ││
│  │  contextMenus · commands · alarms                            ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 三大运行上下文职责划分

| 上下文 | 文件 | 职责 | 生命周期 |
|--------|------|------|---------|
| **Service Worker (Background)** | `src/background/index.ts` | AI API 调用（SSE 流）、书签 CRUD、消息路由、定时检测、存储管理 | 按需唤醒/休眠 |
| **Content Script** | `src/content/index.tsx` | 悬浮球+操作栏+面板的 React 渲染、Shadow DOM 隔离、拖拽/Resize 交互、页面状态检测 | 随页面加载/卸载 |
| **Options Page** | `src/options/index.tsx` | 设置页全屏 React 应用、所有配置项管理 | 用户主动打开 |

### 3.3 消息通信协议

Content Script 与 Service Worker 之间使用 `chrome.runtime.sendMessage` / `chrome.runtime.onMessage` 通信：

```typescript
// 消息类型定义
type Message =
  | { type: 'BOOKMARK_CREATE'; payload: { url: string; title: string } }
  | { type: 'BOOKMARK_SEARCH'; payload: { query: string } }
  | { type: 'BOOKMARK_BATCH_DELETE'; payload: { ids: string[] } }
  | { type: 'BOOKMARK_LIST'; payload: { folderId?: string } }
  | { type: 'AI_SEARCH'; payload: { query: string } }        // 返回 ReadableStream
  | { type: 'AI_CLASSIFY'; payload: { bookmarkId: string } }
  | { type: 'AI_BATCH_CLASSIFY'; payload: { bookmarkIds: string[] } }
  | { type: 'AI_INTENT'; payload: { message: string } }       // 对话式操作意图解析
  | { type: 'CHECK_BROKEN_LINKS'; payload: { bookmarkIds: string[] } }
  | { type: 'GET_CURRENT_TAB' }
  | { type: 'SETTINGS_GET'; payload: { key: string } }
  | { type: 'SETTINGS_SET'; payload: { key: string; value: unknown } }
  | { type: 'TEST_AI_CONNECTION'; payload: { provider: string; apiKey: string; baseUrl?: string } }
```

### 3.4 状态管理方案

使用 **Zustand** 管理各上下文内的状态：

```typescript
// Content Script 状态
interface ContentStore {
  // 悬浮球状态
  ballState: 'collapsed' | 'hover' | 'expanded';
  ballPosition: { side: 'left' | 'right'; y: number };
  ballOpacity: number;

  // 面板状态
  activeTab: 'chat' | 'bookmarks' | 'settings';
  panelSize: { width: number; height: number };
  panelPosition: { x: number; y: number };

  // AI 对话状态
  messages: ChatMessage[];
  isStreaming: boolean;
  aiConfigured: boolean;

  // 书签列表状态
  bookmarks: Bookmark[];
  selectedIds: Set<string>;
  searchQuery: string;
  activeCategory: string | null;
}

// Background 状态（Service Worker 无持久状态，使用 chrome.storage）
// Service Worker 每次唤醒从 chrome.storage 恢复

// Options Page 状态
interface OptionsStore {
  activeSection: string;
  modelConfig: ModelConfig;
  ballConfig: BallConfig;
  // ...
}
```

### 3.5 AI API 调用架构

```typescript
// AI 调用统一在 Service Worker 中执行
// Content Script 通过消息触发，Service Worker 返回 ReadableStream

// background/ai/provider.ts
interface AIProvider {
  chat(messages: Message[], options: AIOptions): ReadableStream<string>;
  classify(bookmark: BookmarkInfo): Promise<ClassifyResult>;
  testConnection(): Promise<boolean>;
}

// 支持 3 种 Provider
class OpenAIProvider implements AIProvider { /* ... */ }
class AnthropicProvider implements AIProvider { /* ... */ }
class CustomProvider implements AIProvider { /* ... */ } // Ollama 等 OpenAI 兼容 API

// Provider 工厂
function createProvider(config: ModelConfig): AIProvider {
  switch (config.provider) {
    case 'openai': return new OpenAIProvider(config);
    case 'anthropic': return new AnthropicProvider(config);
    case 'custom': return new CustomProvider(config);
  }
}
```

### 3.6 Shadow DOM 隔离策略

```typescript
// content/shadow-root.ts
function createShadowContainer(): ShadowRoot {
  const host = document.createElement('div');
  host.id = 'bookmarkmind-ai-host';
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // 注入 Tailwind 样式到 Shadow DOM
  const style = document.createElement('style');
  style.textContent = SHADOW_STYLES; // 编译后的 CSS 字符串
  shadow.appendChild(style);

  // React 挂载点
  const mountPoint = document.createElement('div');
  mountPoint.id = 'bookmarkmind-ai-root';
  shadow.appendChild(mountPoint);

  return shadow;
}

// 注意事项：
// 1. Tailwind CSS 在 Shadow DOM 中需要用 CSS 变量模式，不能用 @apply
// 2. Design Token 中的 CSS 变量需定义在 :host 上
// 3. Lucide Icons 作为 SVG 内联渲染，不依赖外部字体
// 4. 滚动条样式需在 Shadow DOM 内重新定义
```

---

## 4. 组件拆分清单

### 4.1 组件层级总览

```
App (Content Script Root)
├── FloatingBall                    // 悬浮球
│   ├── BallIcon                    // 悬浮球图标
│   ├── BallDragHandler             // 拖拽处理
│   └── BallContextMenu             // 右键菜单
├── MiniActionBar                   // 迷你操作栏
│   └── ActionButton               // 操作按钮 (x4)
├── FloatingPanel                   // 悬浮面板
│   ├── PanelHeader                 // 标题栏
│   │   ├── PanelTitle
│   │   └── PanelControls           // 最小化/关闭按钮
│   ├── PanelTabs                   // Tab 栏
│   │   └── TabItem                // 单个 Tab
│   ├── PanelContent                // 内容区（根据 Tab 切换）
│   │   ├── ChatTab                 // AI 对话 Tab
│   │   ├── BookmarkTab             // 书签列表 Tab
│   │   └── SettingsTab             // 快捷设置 Tab（面板内精简版）
│   └── PanelStatusBar              // 底部状态栏
│       └── BookmarkButton          // 收藏按钮
├── ChatTab                         // AI 对话内容
│   ├── MessageList                 // 消息列表
│   │   ├── AIMessage               // AI 消息气泡
│   │   │   └── BookmarkResultCard   // 书签结果卡片
│   │   ├── UserMessage             // 用户消息气泡
│   │   └── TypingIndicator         // 打字指示器
│   ├── ChatInput                   // 输入区
│   │   ├── ChatTextArea            // 文本输入
│   │   └── SendButton              // 发送按钮
│   └── ChatEmptyState              // 空状态（未配置 AI）
├── BookmarkTab                     // 书签列表内容
│   ├── SearchBar                   // 搜索栏
│   ├── CategoryTabs                // 分类标签横向滚动
│   │   └── CategoryPill            // 单个分类胶囊
│   ├── BookmarkList                 // 虚拟滚动列表
│   │   └── BookmarkItem            // 单个书签项
│   ├── BatchActionBar              // 批量操作栏
│   └── BookmarkEmptyState          // 空状态
├── Toast                           // Toast 通知
├── Modal                           // 确认弹窗
├── CategorySelector               // 分类选择下拉
└── PortalLayer                     // 弹层容器（Toast/Modal 渲染入口）

Options Page (Root)
├── OptionsHeader                   // 页面标题栏
├── OptionsSidebar                  // 左侧导航
│   └── NavItem                     // 导航项 (x7)
└── OptionsContent                  // 右侧内容区
    ├── ModelConfigSection          // 模型配置
    ├── BallConfigSection            // 悬浮球设置
    ├── CategoryManageSection       // 分类管理
    ├── NotificationSection         // 通知设置
    ├── PersonalizationSection      // 个性化
    ├── DataManageSection           // 数据管理
    └── AboutSection                // 关于

Shared / Atomic Components
├── Button (Primary/Secondary/Danger/Text)
├── Input (Text/Password/Number)
├── Select
├── Slider
├── Toggle
├── Badge
├── Spinner
├── Skeleton
├── ProgressBar
├── EmptyState
├── Tooltip
└── Icon (Lucide wrapper)
```

### 4.2 组件开发优先级

| 优先级 | 组件 | 依赖 | 说明 |
|--------|------|------|------|
| **第一批（基础）** | Button, Input, Toggle, Slider, Select, Badge, Icon, Spinner, Tooltip | 无 | 原子组件，所有页面依赖 |
| **第二批（骨架）** | PanelHeader, PanelTabs, TabItem, PanelStatusBar, PanelControls | 第一批 | 面板骨架，可先出空壳 |
| **第三批（核心）** | FloatingBall, MiniActionBar, FloatingPanel | 第一批+第二批 | 悬浮球交互入口 |
| **第四批（对话）** | ChatTab, MessageList, AIMessage, UserMessage, ChatInput, TypingIndicator, BookmarkResultCard, ChatEmptyState | 第一批 | AI 对话核心 |
| **第五批（列表）** | BookmarkTab, SearchBar, CategoryTabs, BookmarkList, BookmarkItem, BatchActionBar, BookmarkEmptyState | 第一批 | 书签列表核心 |
| **第六批（收藏）** | BookmarkButton, Toast, Modal, CategorySelector | 第一批 | 收藏+反馈交互 |
| **第七批（设置）** | OptionsHeader, OptionsSidebar, ModelConfigSection, BallConfigSection + 其余 Section | 第一批 | 设置页 |
| **第八批（增强）** | 骨架屏, ProgressBar, 全量分类进度 UI, 检测结果 UI | 第一批 | P1 功能 |

---

## 5. 目录结构

```
bookmarkmind-ai/
├── public/
│   ├── icons/                     # 扩展图标 (16/32/48/128px)
│   └── _locales/                  # i18n
│       ├── en/
│       │   └── messages.json
│       └── zh_CN/
│           └── messages.json
├── src/
│   ├── background/                # Service Worker
│   │   ├── index.ts               # 入口：消息监听+初始化
│   │   ├── ai/                    # AI 引擎
│   │   │   ├── provider.ts        # Provider 接口+工厂
│   │   │   ├── openai.ts          # OpenAI 实现
│   │   │   ├── anthropic.ts       # Anthropic 实现
│   │   │   ├── custom.ts          # 自定义 Provider
│   │   │   ├── prompt.ts          # Prompt 模板（搜索/分类/意图解析）
│   │   │   └── stream.ts          # SSE 流解析
│   │   ├── bookmarks/             # 书签操作
│   │   │   ├── crud.ts            # 增删改查
│   │   │   ├── search.ts          # 关键词预筛
│   │   │   ├── classify.ts        # AI 分类逻辑
│   │   │   └── detect.ts          # 失效/重复检测
│   │   ├── storage/               # 存储管理
│   │   │   ├── index.ts           # 统一存储接口
│   │   │   ├── schema.ts          # 数据结构定义
│   │   │   └── migration.ts      # 版本迁移
│   │   └── messaging.ts           # 消息路由
│   │
│   ├── content/                   # Content Script
│   │   ├── index.tsx              # 入口：Shadow DOM 创建+React 挂载
│   │   ├── shadow-root.ts         # Shadow DOM 管理
│   │   ├── App.tsx                # 根组件
│   │   ├── components/
│   │   │   ├── FloatingBall/
│   │   │   │   ├── FloatingBall.tsx
│   │   │   │   ├── BallIcon.tsx
│   │   │   │   ├── BallDragHandler.tsx
│   │   │   │   └── BallContextMenu.tsx
│   │   │   ├── MiniActionBar/
│   │   │   │   ├── MiniActionBar.tsx
│   │   │   │   └── ActionButton.tsx
│   │   │   ├── FloatingPanel/
│   │   │   │   ├── FloatingPanel.tsx
│   │   │   │   ├── PanelHeader.tsx
│   │   │   │   ├── PanelTabs.tsx
│   │   │   │   ├── PanelStatusBar.tsx
│   │   │   │   └── PanelResizer.tsx
│   │   │   ├── ChatTab/
│   │   │   │   ├── ChatTab.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── AIMessage.tsx
│   │   │   │   ├── UserMessage.tsx
│   │   │   │   ├── TypingIndicator.tsx
│   │   │   │   ├── BookmarkResultCard.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   └── ChatEmptyState.tsx
│   │   │   ├── BookmarkTab/
│   │   │   │   ├── BookmarkTab.tsx
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── CategoryTabs.tsx
│   │   │   │   ├── BookmarkList.tsx
│   │   │   │   ├── BookmarkItem.tsx
│   │   │   │   ├── BatchActionBar.tsx
│   │   │   │   └── BookmarkEmptyState.tsx
│   │   │   ├── BookmarkButton/
│   │   │   │   └── BookmarkButton.tsx
│   │   │   ├── CategorySelector/
│   │   │   │   └── CategorySelector.tsx
│   │   │   └── PortalLayer/
│   │   │       └── PortalLayer.tsx
│   │   ├── hooks/
│   │   │   ├── useBallState.ts
│   │   │   ├── usePanelState.ts
│   │   │   ├── useChat.ts
│   │   │   ├── useBookmarks.ts
│   │   │   ├── useBookmark.ts       # 收藏当前页
│   │   │   ├── useDrag.ts           # 拖拽
│   │   │   ├── useResize.ts         # 面板调整
│   │   │   └── useUrlMatch.ts      # URL 匹配规则
│   │   ├── store/
│   │   │   └── contentStore.ts     # Zustand store
│   │   └── styles/
│   │       └── shadow.css          # Shadow DOM 内样式
│   │
│   ├── options/                   # Options Page (设置页)
│   │   ├── index.tsx              # 入口
│   │   ├── App.tsx                # 根组件
│   │   ├── components/
│   │   │   ├── OptionsHeader.tsx
│   │   │   ├── OptionsSidebar.tsx
│   │   │   ├── sections/
│   │   │   │   ├── ModelConfigSection.tsx
│   │   │   │   ├── BallConfigSection.tsx
│   │   │   │   ├── CategoryManageSection.tsx
│   │   │   │   ├── NotificationSection.tsx
│   │   │   │   ├── PersonalizationSection.tsx
│   │   │   │   ├── DataManageSection.tsx
│   │   │   │   └── AboutSection.tsx
│   │   │   └── forms/
│   │   │       ├── ProviderSelector.tsx
│   │   │       ├── ApiKeyInput.tsx
│   │   │       ├── UrlRuleEditor.tsx
│   │   │       └── ConnectionTester.tsx
│   │   └── store/
│   │       └── optionsStore.ts
│   │
│   ├── shared/                    # 共享代码
│   │   ├── components/            # 原子组件
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Slider.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── Icon.tsx
│   │   ├── types/                 # 类型定义
│   │   │   ├── bookmark.ts
│   │   │   ├── message.ts
│   │   │   ├── config.ts
│   │   │   └── theme.ts
│   │   ├── utils/                  # 工具函数
│   │   │   ├── url-match.ts        # URL 通配符匹配
│   │   │   ├── debounce.ts
│   │   │   ├── format.ts           # 时间格式化等
│   │   │   └── constants.ts        # 常量
│   │   └── styles/
│   │       ├── tokens.css          # Design Token CSS 变量
│   │       ├── dark.css            # 深色模式覆写
│   │       └── globals.css         # 全局基础样式
│   │
│   └── manifest.ts                # Manifest V3 配置（crxjs 动态生成）
│
├── tests/
│   ├── unit/                      # 单元测试
│   ├── integration/               # 集成测试
│   └── e2e/                        # E2E 测试 (Playwright)
│
├── vite.config.ts                 # Vite 配置
├── tailwind.config.ts             # Tailwind 配置
├── tsconfig.json                  # TypeScript 配置
├── package.json
└── README.md
```

---

## 6. 开发优先级与排期

### 6.1 Sprint 规划（单人开发）

| Sprint | 周期 | 目标 | 交付物 |
|--------|------|------|--------|
| S1 | 第 1 周 | 项目搭建+基础组件+Design Token | 可运行的空壳扩展+全部原子组件 |
| S2 | 第 2 周 | 悬浮球+迷你操作栏+面板骨架 | 悬浮球可在网页显示/拖拽/右键 |
| S3 | 第 3-4 周 | AI 对话框+模型配置 | AI 对话可搜索书签（SSE 流式） |
| S4 | 第 5-6 周 | 书签列表+一键收藏+批量操作 | 完整 P0 功能可用 |
| S5 | 第 7 周 | 设置页全部+深色模式 | P0 功能完整交付 |
| S6 | 第 8 周 | 测试+Bug 修复+Chrome Web Store 提交 | MVP 上线 |
| S7 | 第 9-10 周 | P1 功能（智能检测+全量分类+回收站） | Phase 2 交付 |
| S8 | 第 11-12 周 | P2 功能（导入导出+个性化+引导） | Phase 3 交付 |

### 6.2 关键依赖路径

```
Design Token + 原子组件 (S1)
    ↓
Shadow DOM 注入框架 (S2)
    ↓
    ├── 悬浮球 + 操作栏 (S2)  ←── 独立可并行
    └── 面板容器 + Tab 切换 (S2)
            ↓
        ├── AI 对话框 (S3) ←── 依赖 Service Worker 的 AI 调用
        └── 书签列表 (S4)  ←── 依赖 chrome.bookmarks API
                ↓
            一键收藏 + 批量操作 (S4)
                ↓
            设置页 + 深色模式 (S5)
                ↓
            测试 + 提交 (S6)
```

### 6.3 可并行拆分建议（2 人开发）

| 开发者 A | 开发者 B |
|---------|---------|
| Content Script 全部（悬浮球/面板/对话框/书签列表） | Service Worker 全部（AI 引擎/书签 CRUD/消息路由/存储） |
| 原子组件 + Design Token | Options Page 全部 |
| 交互/动画/Shadow DOM | 数据层/存储/测试 |

---

## 7. 前端开发规范要求

### 7.1 技术栈锁定

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 扩展框架 | Chrome Extension Manifest V3 | — | 必须使用 MV3，不支持 MV2 |
| 前端框架 | React | 18.x | 使用 Function Component + Hooks |
| 语言 | TypeScript | 5.x | strict mode 必须开启 |
| UI 样式 | Tailwind CSS | 3.x | 配合 CSS 变量使用 |
| 状态管理 | Zustand | 4.x | 轻量，适合 Content Script |
| 虚拟滚动 | @tanstack/react-virtual | 3.x | 书签列表虚拟化 |
| 图标 | Lucide React | latest | 按需引入，减小体积 |
| 构建工具 | Vite | 5.x | |
| 扩展打包 | @crxjs/vite-plugin | 2.x | MV3 专用 Vite 插件 |
| 测试 | Vitest + Playwright | latest | 单元+E2E |
| 代码规范 | ESLint + Prettier | latest | |
| Git Hooks | Husky + lint-staged | latest | 提交前自动检查 |

### 7.2 TypeScript 严格模式要求

```json
// tsconfig.json 关键配置
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./src/shared/*"],
      "@background/*": ["./src/background/*"],
      "@content/*": ["./src/content/*"],
      "@options/*": ["./src/options/*"]
    }
  }
}
```

### 7.3 Chrome Extension 开发硬性要求

| # | 要求 | 原因 |
|---|------|------|
| 1 | Service Worker 中不能使用 DOM API | MV3 限制，SW 无 window 对象 |
| 2 | Service Worker 中不能使用 localStorage | 使用 chrome.storage.local 替代 |
| 3 | AI API 调用必须在 Service Worker 中执行 | Content Script 受 CSP 限制，SW 无 CSP 限制 |
| 4 | 所有注入页面的 UI 必须使用 Shadow DOM | 避免样式冲突，隔离宿主页面影响 |
| 5 | Content Script 不能使用 ES Module import | MV3 content_scripts 不支持 type:module，需打包为单文件 |
| 6 | chrome:// 和 chrome-extension:// 页面不注入 | MV3 安全限制 |
| 7 | permissions 最小化 | 仅申请 bookmarks、storage、tabs、scripting、contextMenus、commands |
| 8 | host_permissions 仅申请 `<all_urls>` | 悬浮球需注入所有页面，但可在运行时按规则跳过 |
| 9 | 图标资源内联或打包到扩展内 | 不从外部 CDN 加载任何资源 |
| 10 | 所有网络请求仅限用户配置的 AI API 地址 | 不连接任何其他外部服务 |

### 7.4 性能要求

| 指标 | 目标 | 验证方式 |
|------|------|---------|
| 悬浮球注入延迟 | < 100ms | 页面 load 后到悬浮球出现 |
| 悬浮球内存占用 | < 5MB | Shadow DOM + React 运行时 |
| 面板展开动画帧率 | 60fps | 使用 transform/opacity 动画 |
| 书签列表 1000+ 滚动 | 60fps | 虚拟滚动 |
| AI 首字延迟 | < 2s | SSE 首字节时间 |
| 搜索防抖延迟 | 300ms | 输入后 300ms 触发 |
| 面板切换动画 | < 150ms | opacity 过渡 |
| 扩展包体积 | < 500KB（gzip） | 不含图标资源 |

### 7.5 代码规范

| 规范 | 要求 |
|------|------|
| 命名 | 组件 PascalCase，函数 camelCase，常量 UPPER_SNAKE，CSS 变量 kebab-case |
| 文件组织 | 一个组件一个目录，含 index.tsx + 同目录 hooks |
| Props | 必须定义 interface/type，禁止 any |
| 状态 | 跨组件状态用 Zustand，组件内状态用 useState/useReducer |
| 副作用 | 数据请求/订阅使用自定义 Hook 封装 |
| CSS | Tailwind 优先，复杂样式用 CSS Modules 或内联 style |
| 注释 | 复杂逻辑必须注释，简单代码不加注释 |
| 测试 | 工具函数 100% 覆盖，组件至少快照测试 |

### 7.6 manifest.json 配置要求

```json
{
  "manifest_version": 3,
  "name": "AI 书签管家",
  "version": "1.0.0",
  "description": "AI 驱动的 Chrome 书签管理扩展",
  "permissions": [
    "bookmarks",
    "storage",
    "tabs",
    "scripting",
    "contextMenus",
    "commands",
    "alarms"
  ],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "src/background/index.ts",
    "type": "module"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["src/content/index.tsx"],
    "run_at": "document_idle"
  }],
  "options_page": "src/options/index.html",
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png"
    }
  },
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  "commands": {
    "toggle-panel": {
      "suggested_key": { "default": "Alt+B" },
      "description": "展开/收起悬浮面板"
    },
    "bookmark-current": {
      "suggested_key": { "default": "Alt+S" },
      "description": "收藏当前页面"
    }
  }
}
```

---

## 8. 验收标准清单

### 8.1 P0 功能验收

| # | 验收项 | 验收标准 | 验证方式 |
|---|--------|---------|---------|
| V1 | 悬浮球显示 | 安装后在普通网页显示 48px 悬浮球，chrome:// 页面不显示 | 手动验证 |
| V2 | 悬浮球透明度 | 默认 30%，可在设置中调节 0-100 | 手动验证 |
| V3 | 悬浮球拖拽 | 垂直拖拽，位置记忆 | 拖拽后刷新页面验证 |
| V4 | 悬浮球悬停 | 悬停 300ms 展开操作栏，移开 500ms 收起 | 手动验证 |
| V5 | 悬浮球右键 | 右键菜单显示"在当前网站隐藏"等选项 | 手动验证 |
| V6 | 禁用网站规则 | 添加规则后对应网站不显示悬浮球 | 添加 `*://*.google.com/*` 后访问验证 |
| V7 | 全屏自动隐藏 | F11 全屏后悬浮球消失 | 手动验证 |
| V8 | 面板展开/收起 | 点击悬浮球展开面板，ESC/外部点击收起 | 手动验证 |
| V9 | 面板拖拽移动 | 拖拽标题栏移动面板，位置记忆 | 拖拽后刷新验证 |
| V10 | 面板调整大小 | 拖拽右下角调整，约束在 320~600 × 400~800 | 手动验证 |
| V11 | Tab 切换 | 对话/书签/设置三个 Tab 可切换，动画 < 150ms | 手动验证 |
| V12 | AI 对话输入 | Enter 发送，Shift+Enter 换行 | 手动验证 |
| V13 | AI 流式输出 | 回复逐字显示，有光标闪烁 | 手动验证 |
| V14 | AI 搜索结果 | 返回书签卡片，点击可在新标签打开 | 手动验证 |
| V15 | AI 未配置提示 | 未配置 API Key 时显示空状态引导 | 安装后未配置时验证 |
| V16 | 一键收藏 | 点击后 < 1s 创建书签，Toast 提示分类 | 手动验证 |
| V17 | 自动分类 | AI 分类置信度 > 70% 自动归类，< 70% 进"待分类" | 收藏后检查书签位置 |
| V18 | 已收藏检测 | 已收藏页面显示"已收藏"状态 | 收藏后再次验证 |
| V19 | 模型配置 | OpenAI/Claude/自定义 三种可配 | 逐个验证 |
| V20 | API Key 测试 | 测试连接返回成功/失败提示 | 输入正确/错误 Key 验证 |
| V21 | 本地模型配置 | 自定义 Base URL 可连接 Ollama | 配置 localhost:11434 验证 |
| V22 | 书签列表展示 | 显示 favicon/标题/URL/分类/时间 | 手动验证 |
| V23 | 书签搜索 | 实时筛选，300ms 防抖 | 输入验证 |
| V24 | 分类筛选 | 点击分类标签筛选对应书签 | 手动验证 |
| V25 | 虚拟滚动 | 1000+ 书签流畅滚动 60fps | 导入大量书签验证 |
| V26 | 多选模式 | 点击批量操作后显示复选框 | 手动验证 |
| V27 | 批量删除 | 选中后删除，有确认弹窗 | 手动验证 |
| V28 | 回收站 | 删除的书签进入回收站，可恢复 | 删除后恢复验证 |
| V29 | 快捷键 | Alt+B 展开/收起，Alt+S 收藏 | 手动验证 |
| V30 | Shadow DOM 隔离 | 悬浮球样式不受宿主页面影响 | 在多个网站验证 |
| V31 | CSP 降级 | 在高 CSP 网站降级为 Popup | 在 GitHub 等网站验证 |

### 8.2 P1 功能验收

| # | 验收项 | 验收标准 |
|---|--------|---------|
| V32 | 全量智能分类 | 选择范围后批量处理，显示进度，可撤销 |
| V33 | 失效链接检测 | HEAD 请求检测，显示状态码，可批量删除 |
| V34 | 重复书签检测 | 按组展示，可选择保留 |
| V35 | 对话式批量操作 | AI 解析指令，展示预览，确认执行 |

### 8.3 P2 功能验收

| # | 验收项 | 验收标准 |
|---|--------|---------|
| V36 | 导入导出 | 标准 HTML 格式，导入触发分类 |
| V37 | 深色模式 | 三种模式切换正确 |
| V38 | 个性化 | 快捷键/语言/字体大小可配 |

---

## 9. 风险与注意事项

### 9.1 技术风险

| 风险 | 等级 | 缓解措施 |
|------|------|---------|
| Shadow DOM + Tailwind CSS 兼容 | 高 | Tailwind 需配置为 CSS 变量模式，不能用 @layer/@apply；编译为纯 CSS 注入 Shadow DOM |
| Service Worker 休眠导致 AI 调用中断 | 高 | AI 调用期间使用 `chrome.alarms` 保持唤醒；或在 Content Script 中使用 fetch 直接调用（需处理 CSP） |
| Content Script 体积过大影响页面加载 | 中 | 使用代码分割+懒加载；面板组件按 Tab 懒加载 |
| chrome.bookmarks API 返回同步书签的性能 | 中 | 分批加载，缓存到 chrome.storage.session |
| SSE 在 Service Worker 中的实现 | 中 | SW 支持 fetch + ReadableStream，但需注意 SW 可能中途休眠 |
| 不同网站 CSP 阻止 Content Script | 中 | 维护排除列表 + 降级为 Popup 模式 |
| Chrome Web Store 审核（API Key 功能） | 中 | 提前研究政策，准备隐私声明和合规文档 |

### 9.2 开发注意事项

1. **Service Worker 生命周期**：SW 会在空闲时休眠，所有持久状态必须存入 `chrome.storage`，不能依赖内存变量
2. **Content Script 注入时机**：使用 `run_at: "document_idle"` 避免阻塞页面渲染
3. **Shadow DOM 事件穿透**：部分事件（如 drag）可能需要 `composed: true` 才能冒泡
4. **Tailwind CSS 在 Shadow DOM 中**：需将 Tailwind 编译为纯 CSS 字符串注入，不能使用 JIT 模式的运行时扫描
5. **图标资源**：Lucide Icons 使用 SVG 内联方式，不依赖外部字体文件
6. **z-index 冲突**：悬浮球 z-index 从 1000 起步，但部分网站可能使用更高值，需要动态检测和调整
7. **内存管理**：长对话历史需限制条数（建议 50 条），超出时截断早期消息
8. **API Key 安全**：API Key 仅存 `chrome.storage.local`，不通过任何消息传递到 Content Script（Content Script 可被页面访问）
9. **跨标签同步**：用户在一个标签页修改设置后，其他标签页的悬浮球需通过 `chrome.storage.onChanged` 事件同步更新
10. **Manifest V3 commands API**：快捷键注册在 manifest 中，但用户可在 Chrome 设置中自定义覆盖

### 9.3 开发前必须确认的阻塞项

| # | 阻塞项 | 负责人 | 截止时间 |
|---|--------|--------|---------|
| B1 | Chrome Web Store 是否允许扩展内置用户自配 API Key 功能 | 产品/合规 | 开发前 |
| B2 | 补充 G1（AI 错误态 UI）、G2（对话式操作确认 UI）、G10（CSP 降级 UI）的 UI 规格 | 设计 | S2 前 |
| B3 | 确认扩展图标设计（16/32/48/128px） | 设计 | S1 前 |
| B4 | 确认品牌色是否使用 UI 规范中的 `#185FA5`（蓝色） | 设计 | S1 前 |

---

*文档结束 — 前端开发工程师请根据此文档进行技术评审，确认排期和分工后启动开发。如有疑问请在对应章节标注。*
