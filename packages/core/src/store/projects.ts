import { create } from "zustand"
import { useShallow } from "zustand/shallow"
import { Project } from "../models/project"
import type { StorageAdapter } from "../storage"

export interface ProjectsState {
  projects: Project[]
  activeId: string | null
  initialized: boolean
  initialize: () => Promise<void>
  reset: () => void
  saveProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  editProject: (id: string, project: Project) => void
  deleteById: (id: string) => void
  setId: (id: string) => void
}

export function createProjectsStore(storage: StorageAdapter) {
  const useStore = create<ProjectsState>((set, get) => ({
    projects: [],
    activeId: null,
    initialized: false,

    initialize: async () => {
      if (get().initialized) return
      set({ initialized: true })
      const projects = (await storage.get<Project[]>("projects")) ?? []
      set({ projects: projects.map((p) => new Project(p)) })
    },

    reset: () => set({ initialized: false, projects: [], activeId: null }),

    saveProjects: (projects: Project[]) => {
      set({ projects })
      storage.set("projects", projects)
    },

    addProject: (project: Project) => {
      const { projects, saveProjects } = get()
      saveProjects([...projects, new Project(project)])
    },

    editProject: (id: string, project: Project) => {
      const { projects, saveProjects } = get()
      const updated = new Project({ ...project, updatedAt: new Date().toISOString() })
      saveProjects(projects.map((p) => (p.id === id ? updated : p)))
    },

    deleteById: (id: string) => {
      if (!id) return
      const { projects, saveProjects } = get()
      saveProjects(projects.filter((p) => p.id !== id))
    },

    setId: (id: string) => set({ activeId: id }),
  }))

  const useProjectSelectors = () =>
    useStore(
      useShallow((s) => ({
        projects: s.projects,
        activeProjectId: s.activeId,
        activeProject: s.projects.find((p) => p.id === s.activeId),
      })),
    )

  const useProjectActions = () =>
    useStore(
      useShallow((s) => ({
        saveProjects: s.saveProjects,
        addProject: s.addProject,
        editProject: s.editProject,
        deleteById: s.deleteById,
        setId: s.setId,
      })),
    )

  return { useProjectStore: useStore, useProjectSelectors, useProjectActions }
}
