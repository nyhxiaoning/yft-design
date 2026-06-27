<template>
  <el-dialog
    v-model="visible"
    title="保存项目"
    width="400px"
    :close-on-click-modal="false"
    @opened="handleOpened"
  >
    <el-form @submit.prevent="handleSubmit">
      <el-form-item label="项目名称">
        <el-input
          ref="nameInputRef"
          v-model="projectName"
          placeholder="请输入项目名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :disabled="!projectName.trim()" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import useCanvasExport from '@/hooks/useCanvasExport'
import { useTemplatesStore, useProjectStore } from '@/store'
import { storeToRefs } from 'pinia'
import { nanoid } from 'nanoid'
import useCanvas from '@/views/Canvas/useCanvas'

const props = defineProps<{
  modelValue: boolean
  projectId?: string  // 传入表示编辑已有项目
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'saved'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const projectName = ref('')
const nameInputRef = ref()
const templatesStore = useTemplatesStore()
const projectStore = useProjectStore()

const handleOpened = async () => {
  await nextTick()
  // 如果是编辑已有项目，自动填充名称
  if (props.projectId) {
    const existing = projectStore.getById(props.projectId)
    if (existing) {
      projectName.value = existing.name
    }
  } else {
    projectName.value = ''
  }
  nameInputRef.value?.focus()
}

const handleSubmit = async () => {
  const name = projectName.value.trim()
  if (!name) return

  const { getJSONData } = useCanvasExport()
  const templates = templatesStore.templates
  const [canvas] = useCanvas()

  // 生成缩略图
  let thumbnail = ''
  try {
    thumbnail = canvas.toDataURL({
      multiplier: 0.15,
      format: 'jpeg',
      quality: 0.5,
    })
  } catch {
    // 缩略图生成失败不影响保存
  }

  const now = Date.now()
  const id = props.projectId || nanoid()

  const savedProject = {
    id,
    name,
    thumbnail,
    templates,
    createdAt: props.projectId ? (projectStore.getById(id)?.createdAt ?? now) : now,
    updatedAt: now,
  }

  projectStore.saveProject(savedProject)
  ElMessage.success(`项目「${name}」保存成功`)
  visible.value = false
  emit('saved')
}
</script>
