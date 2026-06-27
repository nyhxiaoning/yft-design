<template>
  <el-config-provider :locale="locale.el">
    <Computer v-if="!isMobile()" />
    <Mobile v-else />
  </el-config-provider>
</template>

<script lang="ts" setup>

import Computer from '@/views/Editor/computer.vue'
import Mobile from '@/views/Editor/mobile.vue'
import useI18n from '@/hooks/useI18n'
import { useMainStore, useSnapshotStore, useTemplatesStore, useProjectStore } from '@/store'
import { storeToRefs } from 'pinia'
import { isMobile } from '@/utils/common'
import { LocalStorageDiscardedKey } from '@/configs/canvas'
import { deleteDiscardedDB } from '@/utils/database'
import { useRoute } from 'vue-router'
import { ElLoading } from 'element-plus'

const { messages }= useI18n()
const { databaseId } = storeToRefs(useMainStore())
const locale = computed(() => messages.value)
if (import.meta.env.MODE === 'production') {
  window.onbeforeunload = () => false
}

const snapshotStore = useSnapshotStore()
const templatesStore = useTemplatesStore()
const projectStore = useProjectStore()
const route = useRoute()

onMounted(async () => {
  await deleteDiscardedDB()
  // 检查是否有 projectId 参数，加载已有项目
  const projectId = route.query.projectId as string | undefined
  if (projectId) {
    projectStore.loadProjects()
    const project = projectStore.getById(projectId)
    if (project && project.templates && project.templates.length > 0) {
      const loading = ElLoading.service({
        lock: true,
        text: '加载项目中...',
        background: 'rgba(0, 0, 0, 0.3)',
      })
      try {
        await templatesStore.changeTemplate(project.templates)
        window.document.title = project.name
      } finally {
        loading.close()
      }
    }
  }
})

// 应用注销时向 localStorage 中记录下本次 indexedDB 的数据库ID，用于之后清除数据库
window.addEventListener('unload', () => {
  const discardedDB = localStorage.getItem(LocalStorageDiscardedKey)
  const discardedDBList: string[] = discardedDB ? JSON.parse(discardedDB) : []
  discardedDBList.push(databaseId.value)
  const newDiscardedDB = JSON.stringify(discardedDBList)
  localStorage.setItem(LocalStorageDiscardedKey, newDiscardedDB)
})
</script>
