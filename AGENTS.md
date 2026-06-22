# yft-design — AI 代理指令

本项目为 **Vue 3 + TypeScript** 前端应用（在线设计工具）。
- 包管理器：**pnpm**（Node >= 16，volta 锁定 18.19.0）
- 样式方案：SCSS + Less + TailwindCSS
- UI 组件库：Element Plus v2.7
- Canvas 引擎：Fabric.js v6.4
- 状态管理：Pinia
- 构建工具：Vite 5

---

## Project Structure

```
src/
├── api/           # API 请求封装
├── app/           # Fabric Canvas 核心封装
├── assets/        # 静态资源（字体、样式）
├── components/    # 通用组件（PascalCase 命名）
├── configs/       # 配置文件
├── extension/     # Fabric 自定义对象/控件/特效
├── hooks/         # 可复用逻辑
├── icons/         # SVG 图标
├── plugins/       # Vue 插件
├── router/        # 路由定义
├── store/         # Pinia 状态管理
│   └── modules/   #   按功能拆分的 store
├── types/         # 类型定义
├── utils/         # 工具函数
├── views/         # 页面组件
│   └── Editor/    #   编辑器（按面板区域分目录）
│       ├── CanvasHeader/  # 顶部工具栏
│       ├── CanvasLeft/    # 左侧面板
│       ├── CanvasRight/   # 右侧属性面板
│       ├── CanvasCenter/  # 画布区域
│       ├── CanvasFooter/  # 底部（导出）
│       └── CanvasAffix/   # 浮动面板
└── worker/        # Web Worker
```

---

## Coding Style

**Vue / TypeScript**
- 使用 `<script setup lang="ts">` + Composition API
- Props 使用 `interface` 或 `withDefaults` + 类型标注，导出 defineProps / defineEmits
- 编辑器面板组件统一放置在 `views/Editor/` 下
- 新增可复用逻辑优先放入 `hooks/`，而非直接写在组件内
- Never 使用 `any` 类型（Fabric.js 桥接边界层除外）

**样式**
- 编辑器组件：SCSS（`.scss`）
- 通用组件：TailwindCSS
- Never 使用内联样式
- Never 硬编码颜色/尺寸值（使用 `configs/` 中的常量或 CSS 变量）

**路径别名**
- `@/*` → `src/*`

---

## Build Commands

| 命令 | 用途 |
|------|------|
| `pnpm dev` | 启动开发服务器（localhost:5174） |
| `pnpm build` | 生产构建 |

---

## Never 规则

- Never 修改 `components.d.ts`、`types/auto-imports.d.ts` 等自动生成文件
- Never 修改 `dist/`、`build/`（构建配置除外）等产物目录
- Never 在组件内使用 `any` 类型（Fabric.js 桥接层可以放宽此规则）
- Never 使用内联样式
- Never 在渲染路径中执行耗时操作（如大数组遍历、直接调用 fabric API 同步计算）
- Never 在 `v-for` 中省略 `:key`
- Never 硬编码敏感信息（token、密钥、数据库地址等）
- Never 修改 `pnpm-lock.yaml`（依赖变更需通过 `pnpm install` 重新生成）
- Never 直接修改 `node_modules/`、`.yarn/` 等依赖目录
- Never 覆盖或修改 `src/app/` 层已有 Canvas 初始化/生命周期逻辑而不理解其副作用
- Never 在 Pinia store 外直接操作 fabric canvas 实例（应通过 `store.useFabricStore()` 访问）

---

## 新增页面流程

1. `src/views/` 下创建页面目录
2. `src/router/` 注册路由（懒加载）
3. 如需全局状态 → `src/store/modules/` 新建 Pinia store
4. 如需 API → `src/api/` 添加请求函数
5. 编辑器内新面板 → `src/views/Editor/` 下按区域创建

---

## Commit 规范

```
格式：type(scope): description

类型: feat / fix / docs / style / refactor / test / chore
示例: feat(template): add image placeholder support
      fix(ruler): correct measurement at non-100% zoom
```
