# 本地项目管理系统 — 设计文档

## 1. 需求概述

为设计海报编辑器增加一次完整的**本地项目生命周期管理**功能：

- 每一张海报完成设计后，可将数据**保存为 JSON**（持久化到浏览器本地存储）
- 已保存的海报以命名项目形式组织，展示在**项目列表中**
- 在项目列表中可**快速编辑**（一键打开到编辑器）、**删除**（确认后移除）已保存的海报
- 可**快速点击**进入之前已经完成的海报页面，继续编辑

---

## 2. 技术选型

| 层 | 方案 | 理由 |
|---|------|------|
| 持久化 | **localStorage** | 无需后端、零依赖、保留即用；项目规模适合 KV 存储 |
| 状态管理 | **Pinia store**（`src/store/modules/project.ts`） | 与现有状态管理体系保持一致 |
| 路由 | **Vue Router**（新增 `/projects` 路径） | 复用现有路由系统和 `query` 参数传 ID |
| 缩略图 | Fabric.js `canvas.toDataURL()` | 已有实现，无需额外依赖 |
| 工具函数 | `src/utils/local.ts` 的 `getLocal`/`setLocal` | 项目已有 localStorage 封装 |

---

## 3. 数据模型

### 类型定义（`src/types/project.ts`）

```typescript
export interface SavedProject {
  id: string            // nanoid 生成
  name: string          // 用户命名的项目名称
  thumbnail?: string    // base64 缩略图（可选，提升列表展示体验）
  templates: Template[] // 完整的画布数据（复用 Template 类型）
  createdAt: number     // 创建时间戳
  updatedAt: number     // 最后更新时间戳
}
```

**为什么直接存 `Template[]`？**

- 项目核心状态管理依赖 `useTemplatesStore`，其数据模型就是 `Template[]`
- 无需额外的序列化/反序列化映射层
- 保存时直接从 store 取，加载时直接喂给 `changeTemplate()`
- 一条 `localStorage` key 保存所有项目，结构简单

### localStorage Key

| Key | 格式 |
|-----|------|
| `'YFT_PROJECTS'` | `SavedProject[]`（JSON 字符串） |

---

## 4. 数据流

### 保存流程

```
用户点击"保存"按钮
  → ProjectSave.vue 弹出命名对话框（默认使用已有名称或"未命名项目"）
  → 用户输入名称、点击确定
  → useCanvasExport.getJSONData()(可选) 获取缩略图
  → useTemplatesStore.templates 获取完整画布数据
  → ProjectStore.save(name, templates)
  → 构造 SavedProject 对象（id/name/templates/timestamps）
  → 将切片写入 localStorage（getLocal → 追加 → setLocal）
  → Element Plus 消息提示"保存成功"
  
(如果是编辑已有项目 → id 匹配后替换，而非追加)
```

### 加载流程

```
用户进入编辑器（/ 或 /?projectId=xxx）
  onMounted:
    ├─ 检测 router.query.projectId
    │   └─ 无 → 保持空白/默认模板（现有行为）
    │   └─ 有 → ProjectStore.getById(projectId)
    │            → 从 localStorage 读取 SavedProject
    │            → templatesStore.changeTemplate(savedProject.templates)
    │            → canvas 渲染所有元素
    └─ 设置页面 title = 项目名称
```

### 删除流程

```
用户点击删除按钮（在项目列表页）
  → ElMessageBox.confirm("确认删除「xxx」？")
  → 用户确认
  → ProjectStore.remove(id)
  → localStorage 移除该项
  → 列表页响应式更新
```

---

## 5. 路由设计

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | `Editor/index.vue` | 编辑器（query: `?projectId=xxx` 加载已有项目） |
| `/home` | `Home/index.vue` | 模板推荐主页（现有） |
| `/projects` | `Projects/index.vue` | **新增** — 本地项目列表页 |

编辑器通过 `router.query.projectId` 参数判断是否加载已保存项目，而非新增路由。

---

## 6. 新增文件清单

| 文件 | 操作 | 用途 |
|------|------|------|
| `src/types/project.ts` | **新建** | SavedProject 类型定义 |
| `src/store/modules/project.ts` | **新建** | Pinia store — 管理 localStorage 中的项目 CRUD |
| `src/views/Projects/index.vue` | **新建** | 项目列表页面 — 卡片网格布局，展示项目缩略图 + 名称 + 操作按钮 |
| `src/views/Editor/CanvasHeader/ProjectSave.vue` | **新建** | 保存项目对话框 |

## 7. 修改文件清单

| 文件 | 修改内容 |
|------|---------|
| `src/router/index.ts` | 新增 `/projects` 路由 |
| `src/views/Editor/CanvasHeader/index.vue` | 添加"保存项目"按钮和"项目列表"按钮 |
| `src/views/Editor/index.vue` | `onMounted` 检测 `route.query.projectId`，自动加载项目 |
| `src/views/Home/index.vue` | 左侧菜单增加"我的项目"菜单项 |

---

## 8. 项目列表页设计

### 布局

- 与 Home 页保持一致的布局风格
- 顶部导航栏 + 左侧菜单 + 右侧内容区
- 左侧菜单："我的项目"高亮
- 内容区：**卡片式网格**（CSS Grid, 与 Home 页瀑布流一致）
- 每张卡片包含：
  - 缩略图（base64 dataURL，保存时截取）
  - 项目名称
  - 最后编辑时间（格式化显示：`2024-01-15 14:30`）
  - 悬停操作区：「编辑」「删除」按钮
- 空状态：引导用户去编辑器创建新海报

### 交互

| 操作 | 行为 |
|------|------|
| 点击卡片主体 / "编辑" | `router.push({ path: '/', query: { projectId } })` → 编辑器加载项目 |
| "删除" | 弹出确认对话框 → 确认后移除项目 → 实时刷新列表 |
| "新建海报" | `router.push('/')` → 打开空白编辑器 |

---

## 9. 与现有系统的集成点

### 集成点 1：模板 Store（`useTemplatesStore`）

- **保存时**：直接读取 `templatesStore.templates`（`Template[]`）
- **加载时**：调用 `templatesStore.changeTemplate(data)` 将项目数据载入 Canvas
- **无需修改** Template 类型，完全复用

### 集成点 2：Canvas Export（`useCanvasExport`）

- **缩略图生成**：复用 `getJSONData()` 的思路，调用 `canvas.toDataURL()` 获取缩略图
- 注意：只能在 `nextTick` 或 Canvas 渲染完成后调用

### 集成点 3：Fabric Canvas

- **重新打开已有项目**：通过 `templatesStore.renderTemplate()` 自动渲染
- 已有 `canvas.loadFromJSON()` 流程无需改动

### 集成点 4：localStorage 工具

- 使用 `src/utils/local.ts` 的 `getLocal`/`setLocal`/`removeLocal`

---

## 10. 注意事项与边界情况

1. **localStorage 容量限制**：约 5MB，一张完整海报 JSON 约 50-200KB，保守估计可存 25-100 个项目。缩略图是 base64 会比较大，如果遇到容量问题，可以：
   - 缩略图压缩为低质量 JPEG
   - 将缩略图存储改为 IndexedDB（大文件）
   - 提示用户空间不足

2. **缩略图异步获取**：`canvas.toDataURL()` 必须在渲染完成后的 `nextTick` 调用，否则可能拿到空白

3. **编辑模式下的保存行为**：
   - 无 projectId → 新建保存（提示输入名称）
   - 有 projectId → 原位覆盖保存（可快速保存，无需再次命名）

4. **数据结构兼容性**：Fabric.js 版本升级可能导致序列化数据格式变化，`SavedProject` 不锁定 fabric 版本号，由 `Template.version` 字段承载

5. **浏览器隐私模式**：localStorage 在部分浏览器的隐私模式下会在关闭标签页后清空，适合开发测试阶段；生产环境应提供 API 远程存储选项

---

## 11. 后续扩展方向

- **云同步**：localStorage ↔ 后端 API 双向同步
- **导出/导入**：导出全部项目为 `.zip`，跨设备迁移
- **搜索/排序**：按名称搜索、按时间/名称排序
- **自动保存**：编辑器定时自动保存草稿
- **历史版本**：同一项目保存多次，保留版本历史
