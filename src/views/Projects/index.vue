<template>
  <div>
    <el-container>
      <el-header class="border-b-[1px] items-center flex">
        <el-row class="justify-between items-center">
          <el-col :span="4" class="h-[50px]">
            <img src="@/assets/logo.svg" alt="" class="h-full">
          </el-col>
          <el-col :span="6" class="flex justify-end items-center col-user">
            <el-tooltip content="GitHub 同步" placement="bottom">
              <el-button text @click="syncDialogVisible = true" class="github-sync-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
              </el-button>
            </el-tooltip>
            <el-button type="primary" @click="createNew">+ 新建海报</el-button>
          </el-col>
        </el-row>
      </el-header>
      <el-container>
        <el-aside width="216px">
          <el-menu active-text-color="#000" default-active="2" class="pt-[20px] h-lvh" @select="handleMenuSelect">
            <el-menu-item index="1">
              <span class="flex w-[30px] justify-center">
                <IconNavigation />
              </span>
              <span>为你推荐</span>
            </el-menu-item>
            <el-menu-item index="2">
              <span class="flex w-[30px] justify-center">
                <SvgIcon icon-class="chatgpt" className="svg-size" />
              </span>
              <span>我的项目</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main class="h-lvh" id="main">
          <el-row class="mt-[20px]">
            <b class="text-[20px]">我的项目</b>
          </el-row>
          <!-- 项目列表 -->
          <div v-if="projects.length > 0" class="project-grid">
            <div
              v-for="project in projects"
              :key="project.id"
              class="project-card"
            >
              <div class="project-thumb" @click="openProject(project.id)">
                <img
                  v-if="project.thumbnail"
                  :src="project.thumbnail"
                  alt="preview"
                />
                <div v-else class="no-thumb">
                  <SvgIcon icon-class="chatgpt" className="no-thumb-icon" />
                </div>
              </div>
              <div class="project-info">
                <div class="project-name">{{ project.name }}</div>
                <div class="project-time">{{ formatDate(project.updatedAt) }}</div>
              </div>
              <div class="project-actions">
                <el-button size="small" type="primary" link @click="openProject(project.id)">编辑</el-button>
                <el-button size="small" type="danger" link @click="handleDelete(project)">删除</el-button>
              </div>
            </div>
          </div>
          <!-- 空状态 -->
          <el-empty v-else description="还没有保存的项目" class="mt-[80px]">
            <el-button type="primary" @click="createNew">去创建一张海报</el-button>
          </el-empty>
        </el-main>
      </el-container>
    </el-container>
    <GithubSync v-model="syncDialogVisible" />
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/store'
import { ElMessageBox } from 'element-plus'
import type { SavedProject } from '@/types/project'
import GithubSync from './GithubSync.vue'

const router = useRouter()
const projectStore = useProjectStore()
const { projectList: projects } = storeToRefs(projectStore)

const syncDialogVisible = ref(false)

onMounted(() => {
  projectStore.loadProjects()
})

const formatDate = (ts: number) => {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const openProject = (id: string) => {
  const { href } = router.resolve({
    path: '/',
    query: { projectId: id },
  })
  window.open(href, '_blank')
}

const createNew = () => {
  window.open(router.resolve({ path: '/' }).href, '_blank')
}

const handleMenuSelect = (index: string) => {
  if (index === '1') {
    router.push('/home')
  }
}

const handleDelete = async (project: SavedProject) => {
  try {
    await ElMessageBox.confirm(
      `确认删除「${project.name}」？删除后无法恢复。`,
      '删除确认',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' },
    )
    projectStore.removeProject(project.id)
  } catch {
    // 用户取消
  }
}
</script>

<style lang="scss" scoped>
.col-user {
  display: flex;
  gap: 8px;

  .github-sync-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    color: #555;
    transition: all 0.14s;

    &:hover {
      background: #f0f0f0;
      color: #000;
    }
  }
}
.el-aside .el-menu .el-menu-item {
  height: 40px;
  padding-left: 0;
  padding-right: 0;
  margin-left: var(--el-menu-level-padding);
  border-radius: 5px;
  &:hover {
    background-color: #f1f2f4;
  }
}
.el-aside .el-menu .is-active {
  background-color: #f1f2f4;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.project-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
  transition: box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.18);

    .project-actions {
      opacity: 1;
      height: 36px;
    }
  }

  .project-thumb {
    width: 100%;
    aspect-ratio: 107 / 64;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .no-thumb {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #ccc;
    }

    .no-thumb-icon {
      font-size: 48px;
      opacity: 0.3;
    }
  }

  .project-info {
    padding: 10px 12px 4px;

    .project-name {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .project-time {
      font-size: 12px;
      color: #999;
      margin-top: 2px;
    }
  }

  .project-actions {
    display: flex;
    justify-content: flex-end;
    gap: 4px;
    padding: 0 12px 8px;
    opacity: 0;
    height: 0;
    transition: opacity 0.2s, height 0.2s;
    overflow: hidden;
    align-items: center;
  }
}
</style>
