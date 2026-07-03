import type { FeedItem } from "@repo/core"
import { filterProject } from "@repo/core"
import { useEffect, useMemo } from "react"
import { useParams } from "react-router"
import useGlobalKeybindings from "@/app/global-keybindings"
import { Textarea } from "@/shared/ui/textarea"
import { useProjectActions, useProjectSelectors } from "@/store/projectsStore"
import { useTodoSelectors } from "@/store/todosStore"
import FeedList from "@/shared/ui/FeedList"
import type { Project } from "@repo/core"

export default function PageProject() {
  const { id } = useParams<{ id: string }>()
  const { activeProjectId } = useProjectSelectors()
  const { setId } = useProjectActions()

  const { projects } = useProjectSelectors()
  const { editProject } = useProjectActions()
  const { todos } = useTodoSelectors()

  const activeProject = projects.find((p) => p.id === id)
  const projectTodos: FeedItem[] = useMemo(
    () => filterProject(todos, id ?? "").map((t) => Object.assign(Object.create(t), { kind: "todo" as const })),
    [todos, id],
  )

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

          <FeedList items={projectTodos} />
        </div>
      ) : (
        <div>Project not found</div>
      )}
    </>
  )
}
