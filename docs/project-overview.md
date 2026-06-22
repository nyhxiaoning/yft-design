# yft-design 项目概览

## 1. 项目定位

**yft-design** 是一个基于 Canvas 的开源在线设计工具（类似"稿定设计"），具备**海报设计**和**图片编辑**功能。支持：

- 导入 PSD/PDF（高还原度解析）
- 导出图片 / SVG / PDF
- 多页面编辑、图层管理、元素编辑（文字 / 图片 / 形状 / 线条）
- 滤镜、蒙版、裁切、阴影、吸附对齐、历史记录等完整设计工具链

归属 [dromara](https://github.com/dromara/yft-design) 开源组织，有 Demo 和 Pro 版本。

---

## 2. 技术栈

| 层次 | 技术 |
|------|------|
| 框架 | Vue 3.4 (Composition API + `<script setup>`) |
| 语言 | TypeScript 4.9 |
| 构建 | Vite 5, Rollup (terser 压缩) |
| UI 库 | Element Plus 2.7, TailwindCSS 3, SCSS / Less |
| Canvas 引擎 | Fabric.js 6.4 (核心) |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| 国际化 | vue-i18n 9 |
| HTTP | Axios |
| 其他 | Dexie (IndexedDB), Clipper-Lib (路径运算), Opentype.js (字体), Raphael / SVG 等 |

---

## 3. 目录结构

```
src/
├── api/                  # API 请求层
├── app/                  # Fabric Canvas 核心封装层
│   ├── fabricCanvas.ts   #   主 Canvas 管理器
│   ├── fabricControls.ts #   选择器控件
│   ├── fabricHistory.ts  #   撤销/重做
│   ├── fabricRuler.ts    #   标尺
│   ├── fabricTool.ts     #   拖拽工具
│   ├── fabricHover.ts    #   预选择高亮
│   ├── keybinding.ts     #   快捷键
│   └── wheelScroll.ts    #   滚轮缩放
├── assets/               # 字体、样式
├── components/           # 通用组件（颜色选择器、右键菜单、文件上传等）
├── configs/              # 配置文件（颜色、字体等）
├── extension/            # Fabric 扩展（自定义对象、控件、特效、滤镜）
├── hooks/                # 可复用逻辑（导出、快捷键、缩放、历史快照等）
├── icons/                # SVG 图标
├── plugins/              # Vue 插件（国际化、指令、组件注册）
├── router/               # 路由
├── store/                # Pinia 模块
│   └── modules/
│       ├── fabric.ts     #   Canvas 状态
│       ├── keyboard.ts   #   键盘绑定
│       ├── main.ts       #   主编辑器状态
│       ├── snapshot.ts   #   历史快照
│       ├── template.ts   #   模板
│       └── user.ts       #   用户
├── types/                # TS 类型定义
├── utils/                # 工具函数
├── views/                # 页面
│   ├── Home/             #   首页
│   ├── Editor/           #   编辑器（核心）
│   │   ├── CanvasHeader/ #     顶部工具栏
│   │   ├── CanvasLeft/   #     左侧面板（模板、素材、图层、文字等）
│   │   ├── CanvasRight/  #     右侧属性面板（样式、特效、滤镜）
│   │   ├── CanvasCenter/ #     画布区域
│   │   ├── CanvasFooter/ #     底部（页面管理、导出）
│   │   └── CanvasAffix/  #     浮动面板
│   ├── Error/            #   错误页（401, 404）
│   └── OAuth/            #   OAuth 回调
└── worker/               # Web Worker

build/                    # Vite 构建配置
docker/                   # Docker 部署（Dockerfile + nginx.conf）
```

---

## 4. 命令

| 命令 | 用途 |
|------|------|
| `pnpm dev` | 启动开发服务器（localhost:5174） |
| `pnpm build` | 生产构建，输出到 `dist/` |
| `bash deploy.sh` | 部署脚本 |

> 注意：使用 `pnpm`，Node >= 16（volta 锁定 18.19.0），**无测试命令**。

---

## 5. 新增页面的流程

1. 在 `src/views/` 下创建页面目录（如 `About/index.vue`）
2. 在 `src/router/index.ts` 的 `constantRoutes` 数组中注册路由（懒加载 `() => import()`）
3. 若需全局状态，在 `src/store/modules/` 新建 Pinia store
4. 若需 API，在 `src/api/` 添加请求函数
5. 编辑器内新增面板：在 `src/views/Editor/` 下按区域（Left / Center / Right / Affix / Footer）创建子组件

---

## 6. 明显维护风险

1. **无测试覆盖** — 无测试依赖和脚本，Canvas 编辑器像素级操作全靠手动回归。
2. **ESLint / Prettier 版本过时** — ESLint 7.x、Prettier 2.x、TypeScript 4.9，远落后于当前生态。
3. **`any` 类型泛滥** — 路由守卫、store 等关键位置大量使用 `any`，弱化类型检查收益。
4. **生产环境移除所有 console** — `drop_console: true` 导致线上无法保留 warn/error 级别日志。
5. **Node 18 EOL** — 2025 年 4 月已停止维护，无法使用较新的 JS 语法和性能优化。
6. **`vue-tsc 1.x` 与 Vue 3.4 不匹配** — 版本滞后，可能遗漏重要类型诊断；且构建脚本未集成类型检查。
7. **单包架构** — 随功能增长缺乏 monorepo 管理工具，可维护性下降。
