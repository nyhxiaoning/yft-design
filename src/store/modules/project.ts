import { defineStore } from 'pinia'
import { getLocal, setLocal, removeLocal } from '@/utils/local'
import type { SavedProject } from '@/types/project'

const STORAGE_KEY = 'YFT_PROJECTS'

export interface ProjectState {
  projects: SavedProject[]
  loaded: boolean
}

export const useProjectStore = defineStore('project', {
  state: (): ProjectState => ({
    projects: [],
    loaded: false,
  }),

  getters: {
    projectList(state) {
      return state.projects
    },
  },

  actions: {
    /** 从 localStorage 加载项目列表 */
    loadProjects() {
      const data = getLocal(STORAGE_KEY)
      this.projects = Array.isArray(data) ? data : []
      this.loaded = true
    },

    /** 保存项目（新建或覆盖） */
    saveProject(project: SavedProject) {
      if (!this.loaded) this.loadProjects()
      const idx = this.projects.findIndex(p => p.id === project.id)
      if (idx !== -1) {
        this.projects[idx] = project
      } else {
        this.projects.unshift(project)
      }
      setLocal(STORAGE_KEY, this.projects)
    },

    /** 根据 ID 获取项目 */
    getById(id: string): SavedProject | undefined {
      if (!this.loaded) this.loadProjects()
      return this.projects.find(p => p.id === id)
    },

    /** 删除项目 */
    removeProject(id: string) {
      if (!this.loaded) this.loadProjects()
      this.projects = this.projects.filter(p => p.id !== id)
      setLocal(STORAGE_KEY, this.projects)
    },

    /** 清空所有项目 */
    clearAll() {
      this.projects = []
      removeLocal(STORAGE_KEY)
    },
  },
})
