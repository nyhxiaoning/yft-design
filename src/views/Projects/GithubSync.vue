<template>
  <el-dialog
    v-model="visible"
    title=""
    :width="540"
    :close-on-click-modal="false"
    destroy-on-close
    class="github-sync-dialog"
  >
    <!-- Header -->
    <div class="sync-head">
      <div class="sync-head-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
        </svg>
      </div>
      <div class="sync-head-copy">
        <div class="sync-title">GitHub 同步</div>
        <div class="sync-sub">配置后可将项目数据推送/拉取到 GitHub 仓库</div>
      </div>
    </div>

    <!-- Sync Status Banner -->
    <div v-if="hasConfig" class="sync-banner">
      <div class="sync-banner-dot"></div>
      <div class="sync-banner-copy">
        <span class="sync-banner-title">已配置同步</span>
        <span class="sync-banner-sub">上次同步: {{ lastSyncedAtFormatted }}</span>
      </div>
    </div>

    <!-- Form Body -->
    <el-form ref="formRef" :model="form" label-position="top" class="sync-form">
      <!-- Repository Section -->
      <div class="sync-section">
        <div class="sync-section-head">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <span class="sync-section-label">仓库信息</span>
        </div>
        <el-row :gutter="10">
          <el-col :span="10">
            <el-form-item label="用户名" prop="owner">
              <el-input v-model="form.owner" placeholder="如 nyhxiaoning" />
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="仓库名" prop="repo">
              <el-input v-model="form.repo" placeholder="如 yft-backup" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="文件路径" prop="path">
          <el-input v-model="form.path" placeholder="如 data/projects.json" />
          <div class="sync-field-hint">数据存储路径，建议按功能命名</div>
        </el-form-item>
      </div>

      <!-- Token Section -->
      <div class="sync-section">
        <div class="sync-section-head">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span class="sync-section-label">认证</span>
        </div>
        <el-form-item label="Personal Access Token" prop="token">
          <el-input
            v-model="form.token"
            :type="showToken ? 'text' : 'password'"
            placeholder="ghp_..."
          >
            <template #suffix>
              <span class="sync-token-toggle" @click="showToken = !showToken">
                <svg v-if="!showToken" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </span>
            </template>
          </el-input>
          <div class="sync-field-hint">
            需要 <code>repo</code> 权限。
            <a href="https://github.com/settings/tokens" target="_blank" rel="noopener" class="sync-link">创建 Token →</a>
          </div>
        </el-form-item>
      </div>

      <!-- Sync Actions -->
      <div v-if="hasConfig" class="sync-sync-actions">
        <el-button @click="handlePush" :loading="pushLoading" class="sync-action-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="margin-right:4px">
            <polyline points="17 1 21 5 17 9"/>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <polyline points="7 23 3 19 7 15"/>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
          上传到 GitHub
        </el-button>
        <el-button @click="handlePull" :loading="pullLoading" class="sync-action-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="margin-right:4px">
            <polyline points="23 18 17 24 11 18"/>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
          从 GitHub 拉取
        </el-button>
      </div>
    </el-form>

    <template #footer>
      <div class="sync-footer">
        <div class="sync-footer-left">
          <el-button v-if="hasConfig" type="danger" link @click="handleClear">解除同步</el-button>
        </div>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saveLoading">保存配置</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getLocal, setLocal, removeLocal } from '@/utils/local'
import { useProjectStore } from '@/store'
import { getFile, createOrUpdateFile } from '@/api/github'
import type { GithubConfig } from '@/api/github'

const SYNC_CONFIG_KEY = 'YFT_GITHUB_SYNC'
const LAST_SYNC_KEY = 'YFT_GITHUB_LAST_SYNC'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const showToken = ref(false)
const saveLoading = ref(false)
const pushLoading = ref(false)
const pullLoading = ref(false)
const hasConfig = ref(false)
const lastSyncedAt = ref('')

const form = ref<GithubConfig>({
  owner: '',
  repo: '',
  path: 'yft-design-backup/projects.json',
  token: '',
})

const lastSyncedAtFormatted = computed(() => {
  if (!lastSyncedAt.value) return '从未同步'
  const d = new Date(lastSyncedAt.value)
  return d.toLocaleString('zh-CN')
})

watch(() => props.modelValue, (val) => {
  if (val) {
    showToken.value = false
    form.value.token = ''
    loadConfig()
  }
})

function loadConfig() {
  const saved = getLocal(SYNC_CONFIG_KEY) as GithubConfig | null
  if (saved) {
    form.value.owner = saved.owner || ''
    form.value.repo = saved.repo || ''
    form.value.path = saved.path || 'yft-design-backup/projects.json'
    hasConfig.value = true
  } else {
    form.value.owner = ''
    form.value.repo = ''
    form.value.path = 'yft-design-backup/projects.json'
    hasConfig.value = false
  }

  const syncTime = getLocal(LAST_SYNC_KEY) as string | null
  lastSyncedAt.value = syncTime || ''
}

/** 保存配置 */
async function handleSave() {
  if (!form.value.owner || !form.value.repo || !form.value.path || !form.value.token) {
    ElMessage.warning('请填写所有必填项')
    return
  }
  saveLoading.value = true
  try {
    setLocal(SYNC_CONFIG_KEY, {
      owner: form.value.owner,
      repo: form.value.repo,
      path: form.value.path,
      token: form.value.token,
    })
    hasConfig.value = true
    ElMessage.success('GitHub 同步配置已保存')
    visible.value = false
  } catch (e: any) {
    ElMessage.error(e.message || '保存配置失败')
  } finally {
    saveLoading.value = false
  }
}

/** 上传到 GitHub */
async function handlePush() {
  const config = getLocal(SYNC_CONFIG_KEY) as GithubConfig | null
  if (!config) {
    ElMessage.warning('请先保存配置')
    return
  }

  pushLoading.value = true
  try {
    const projectStore = useProjectStore()
    projectStore.loadProjects()
    const projects = projectStore.projectList

    // 尝试获取已有文件（获取 sha）
    let sha: string | undefined
    try {
      const result = await getFile(config)
      sha = result.sha
    } catch {
      // 文件不存在，新建
    }

    await createOrUpdateFile(config, projects, sha)

    const now = new Date().toISOString()
    setLocal(LAST_SYNC_KEY, now)
    lastSyncedAt.value = now
    ElMessage.success(`上传成功，共 ${projects.length} 个项目`)
  } catch (e: any) {
    ElMessage.error(e.message || '上传失败')
  } finally {
    pushLoading.value = false
  }
}

/** 从 GitHub 拉取 */
async function handlePull() {
  const config = getLocal(SYNC_CONFIG_KEY) as GithubConfig | null
  if (!config) {
    ElMessage.warning('请先保存配置')
    return
  }

  pullLoading.value = true
  try {
    const result = await getFile(config)
    const remoteProjects = result.data

    if (!Array.isArray(remoteProjects)) {
      ElMessage.error('远程数据格式错误，不是有效的项目数组')
      return
    }

    // 让用户选择合并策略
    try {
      await ElMessageBox.confirm(
        '将远程数据合并到本地已有项目，按项目 ID 匹配覆盖并补充新项目。',
        '确认拉取',
        { confirmButtonText: '合并拉取', cancelButtonText: '取消', type: 'info' },
      )
    } catch {
      return // 用户取消
    }

    const projectStore = useProjectStore()
    projectStore.loadProjects()

    // 合并：id 匹配覆盖 / 新增
    for (const remote of remoteProjects) {
      const localIdx = (projectStore as any).projects.findIndex((p: any) => p.id === remote.id)
      if (localIdx !== -1) {
        (projectStore as any).projects[localIdx] = remote
      } else {
        (projectStore as any).projects.unshift(remote)
      }
    }

    // 持久化到 localStorage
    setLocal('YFT_PROJECTS', (projectStore as any).projects)

    const now = new Date().toISOString()
    setLocal(LAST_SYNC_KEY, now)
    lastSyncedAt.value = now
    ElMessage.success(`拉取成功，共 ${remoteProjects.length} 个项目`)
  } catch (e: any) {
    ElMessage.error(e.message || '拉取失败')
  } finally {
    pullLoading.value = false
  }
}

/** 解除同步 */
async function handleClear() {
  try {
    await ElMessageBox.confirm(
      '解除同步后配置信息将被清除，本地数据不受影响。',
      '确认解除',
      { confirmButtonText: '解除', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return
  }

  removeLocal(SYNC_CONFIG_KEY)
  hasConfig.value = false
  form.value.token = ''
  ElMessage.success('同步配置已清除')
  visible.value = false
}
</script>

<style lang="scss" scoped>
:deep(.el-dialog__body) {
  padding: 0;
}
:deep(.el-dialog__header) {
  display: none;
}

.sync-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 22px 18px;
  border-bottom: 1px solid rgba(27, 41, 64, 0.07);

  .sync-head-icon {
    width: 40px;
    height: 40px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(13, 17, 23, 0.06);
    color: #24292f;
    flex-shrink: 0;
  }

  .sync-head-copy {
    min-width: 0;
    flex: 1;
  }

  .sync-title {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a1a;
  }

  .sync-sub {
    font-size: 12px;
    color: #888;
    margin-top: 2px;
    line-height: 1.45;
  }
}

// Banner
.sync-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 22px;
  background: rgba(45, 122, 69, 0.07);
  border-bottom: 1px solid rgba(45, 122, 69, 0.1);

  .sync-banner-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2d7a45;
    flex-shrink: 0;
    box-shadow: 0 0 0 3px rgba(45, 122, 69, 0.14);
  }

  .sync-banner-copy {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
    flex: 1;
  }

  .sync-banner-title {
    font-size: 12px;
    font-weight: 600;
    color: #1a5a32;
  }

  .sync-banner-sub {
    font-size: 11px;
    color: rgba(26, 90, 50, 0.65);
  }
}

// Form
.sync-form {
  padding: 18px 22px 4px;
}

.sync-field-hint {
  font-size: 11px;
  color: #999;
  line-height: 1.5;
  margin-top: 4px;

  code {
    font-size: 10px;
    background: rgba(27, 41, 64, 0.06);
    padding: 1px 4px;
    border-radius: 3px;
  }
}

.sync-link {
  color: #409eff;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
}

// Section
.sync-section {
  padding: 14px;
  border-radius: 14px;
  background: rgba(248, 250, 254, 0.72);
  border: 1px solid rgba(27, 41, 64, 0.06);
  margin-bottom: 14px;

  .sync-section-head {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 10px;

    svg {
      width: 22px;
      height: 22px;
      border-radius: 7px;
      padding: 4px;
      background: rgba(13, 17, 23, 0.05);
      color: #666;
      flex-shrink: 0;
    }

    .sync-section-label {
      font-size: 12px;
      font-weight: 700;
      color: #444;
      letter-spacing: 0.03em;
    }
  }

  // 覆盖 el-form-item 间距
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
  :deep(.el-form-item + .el-form-item) {
    margin-top: 10px;
  }
  :deep(.el-form-item__label) {
    font-size: 11px;
    font-weight: 600;
    color: #666;
    padding-bottom: 3px;
    line-height: 1.4;
  }
  :deep(.el-form-item__content) {
    line-height: 1;
  }
}

// Token toggle
.sync-token-toggle {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #999;
  transition: color 0.14s;

  &:hover {
    color: #333;
  }
}

// Sync action buttons
.sync-sync-actions {
  display: flex;
  gap: 10px;
  padding: 6px 0 10px;

  .sync-action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

// Footer
.sync-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  .sync-footer-left {
    flex: 1;
  }
}
</style>
