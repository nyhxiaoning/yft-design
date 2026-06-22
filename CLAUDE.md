# yft-design — Claude Code 指令

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
└── worker/        # Web Worker
```

---

## Coding Style

**Vue / TypeScript**
- 使用 `<script setup lang="ts">` + Composition API
- Props 使用 `interface` 或 `withDefaults` + 类型标注
- 事件使用 `defineEmits<{ (e: 'name', payload: T): void }>()`
- Never 使用 `any` 类型（除非与 Fabric.js 类型系统交互的边界处）

**样式**
- 编辑器组件：优先使用 **SCSS**（`lang="scss"`）
- 通用组件：使用 TailwindCSS 工具类
- Never 使用内联样式
- Never 硬编码颜色值（使用 `configs/` 或 CSS 变量）

**路径别名**
- `@/*` → `src/*`（已在 tsconfig 和 vite 中配置）

**导入顺序**
1. Vue / 框架依赖
2. 第三方库
3. `@/store` / `@/hooks` / `@/app`
4. `@/components`
5. 相对路径（`./`）

---

## Build Commands

| 命令 | 用途 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 |
| `bash deploy.sh` | 部署到服务器 |

---

## Never 规则

- Never 修改 `components.d.ts`、`src/types/auto-imports.d.ts` 等自动生成文件
- Never 修改 `dist/` 构建产物
- Never 在组件内使用 `any` 类型（Fabric.js 桥接层除外）
- Never 使用内联样式
- Never 在渲染路径中执行耗时操作
- Never 在 `v-for` 中省略 `:key`
- Never 硬编码敏感信息（token、密钥等）
- Never 修改 `pnpm-lock.yaml`
- Never 移除生产环境的错误日志（如需调整 `drop_console`，保留 `console.warn`/`console.error`）
- Never 直接在 `fabric.js` 或 `node_modules` 中修改代码

---

## Commit 规范

```
格式：type(scope): description

类型: feat / fix / docs / style / refactor / test / chore
示例: feat(export): add PDF export with embedded fonts
      fix(canvas): correct ruler offset after zoom
```
