# 实现计划：GitHub 同步功能

## 需求理解

在项目列表页（`/projects`）右上角增加一个 GitHub 同步按钮，点击后弹出配置弹窗，让用户可以：
1. 填写 GitHub 仓库信息（owner / repo / 文件路径 / Personal Access Token）
2. **上传（push）**所有本地项目数据到 GitHub 仓库的指定 JSON 文件
3. **下载（pull）**从 GitHub 仓库拉取数据合并到本地
4. 配置持久化到 localStorage
5. 支持清除配置

## 技术方案

| 层 | 方案 | 理由 |
|---|------|------|
| GitHub API 调用 | **`fetch` 直连** `https://api.github.com` | 无需后端，浏览器端直连，使用 PAT 认证 |
| Toast 提示 | **Element Plus `ElMessage`** | 项目已有，替代参考的 `vue-sonner` |
| 配置存储 | **localStorage** | 与项目存储一致 |
| 弹窗 UI | **ElDialog** + 自研表单 | 与 Element Plus 风格统一 |
| 认证 | **Personal Access Token (PAT)** | GitHub API 标准方式，需 `repo` 权限 |

## 新增文件

| 文件 | 用途 |
|------|------|
| `src/api/github/index.ts` | GitHub REST API 客户端（读取/创建更新/删除文件） |
| `src/views/Projects/GithubSync.vue` | 同步配置对话框组件 |

## 修改文件

| 文件 | 改动 |
|------|------|
| `src/views/Projects/index.vue` | 右上角 header 增加 GitHub 同步按钮 |

## 数据类型

```typescript
// 存储于 localStorage key: 'YFT_GITHUB_SYNC'
interface GithubSyncConfig {
  owner: string
  repo: string
  path: string     // 如 "yft-design-backup/projects.json"
  token: string
}

// lastSyncedAt 单独存储
const LAST_SYNC_KEY = 'YFT_GITHUB_LAST_SYNC'
```

## GitHub API 调用（`src/api/github/index.ts`）

三个功能：

1. **getFile**(config) → `GET /repos/{owner}/{repo}/contents/{path}`
   - 返回 content（base64 解码后是 JSON 字符串）
   - 返回 sha（用于后续更新）

2. **createOrUpdateFile**(config, content, sha?) → `PUT /repos/{owner}/{repo}/contents/{path}`
   - 有 sha → 更新；无 sha → 新建
   - content 传入 JS 对象，内部做 base64 编码

3. **deleteFile**(config, sha) → `DELETE /repos/{owner}/{repo}/contents/{path}`

认证方式：`Authorization: Bearer {token}`

## GitHubSync 组件结构

参考提供的组件结构，调整为 Element Plus 风格：

- 弹窗使用 `el-dialog`
- 表单使用 `el-form` / `el-input` / `el-button`
- Token 输入框带显示/隐藏切换
- 已有配置时显示状态条 + "上次同步时间"
- 操作按钮：保存配置 / 立即同步（上传）/ 从 GitHub 拉取 / 解除同步

## 交互流程

### 配置保存
1. 用户填写 owner/repo/path/token
2. 点击「保存配置」→ 写入 localStorage → 显示成功提示
3. 不清除 token，但下次打开弹窗时 token 留空（安全考虑）

### 上传同步（Push）
1. 从 projectStore 读取所有项目
2. 序列化为 JSON
3. 调用 GitHub API 检查文件是否存在
4. 存在 → 获取 sha → PUT 更新；不存在 → PUT 新建
5. 保存 `lastSyncedAt` 时间戳
6. 显示成功/失败提示

### 下载拉取（Pull）
1. 调用 GitHub API GET 获取文件
2. base64 解码 → 解析 JSON 数组
3. 弹窗确认是否覆盖本地（「合并」或「替换」）
4. 合并策略：按 id 匹配覆盖 + 新增没有的
5. 刷新列表

### 解除同步
1. 清除 localStorage 中的配置
2. 不清除本地项目数据
