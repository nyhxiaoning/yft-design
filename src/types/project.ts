import type { Template } from "./canvas"

export interface SavedProject {
  id: string
  name: string
  thumbnail?: string
  templates: Template[]
  createdAt: number
  updatedAt: number
}
