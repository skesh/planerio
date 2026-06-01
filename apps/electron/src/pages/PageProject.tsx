import useGlobalKeybindings from "@/app/global-keybindings"
import type { Project } from "@repo/core"
import { Textarea } from "@/shared/ui/textarea"
import { useProjectActions, useProjectSelectors } from "@/store/projectsStore"
import { useTodoSelectors } from "@/store/todosStore"
import { useEffect } from "react"
import { useParams } from "react-router"
import TodoDrawer from "../entities/Todo/TodoDrawer"
import TodoList from "../entities/Todo/TodoList/TodoList"

export default function PageProject() {
  const { id } = useParams<{ id: string }>()
  const { activeProjectId } = useProjectSelectors()
  const { setId } = useProjectActions()

  const { projects } = useProjectSelectors()
  const { editProject } = useProjectActions()
  const { todos } = useTodoSelectors()

  const activeProject = projects.find((p) => p.id === id)
  const projectTodos = todos.filter((t) => t.projectId === id)

  useGlobalKeybindings()

  useEffect(() => {
    if (activeProjectId !== id && id) {
      setId(id)
    }
  })

  function updateProjectField(field: keyof Project, value: unknown) {
    if (id && activeProject) {
      editProject(id, { ...activeProject, [field]: value })
    }
  }

  return (
    <>
      {activeProject ? (
        <div className="flex flex-col px-10 py-5 gap-4">
          <span className="text-[36px]">{activeProject.name}</span>
          <Textarea
            placeholder="Description..."
            value={activeProject.description}
            onChange={(e) => updateProjectField("description", e.target.value)}
          />

          <TodoList items={projectTodos} />

          <TodoDrawer />
        </div>
      ) : (
        <div>Project not found</div>
      )}
    </>
  )
}
