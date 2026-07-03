import { type FeedItem, Todo } from "@repo/core"
import { useMemo } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer"
import { useProjectSelectors } from "@/store/projectsStore"
import EditTodo from "./EditTodo.tsx"

interface TodoDrawerProps {
  open: "edit" | "add" | false
  onClose: () => void
  activeTodo?: FeedItem
}

export default function TodoDrawer({ open, onClose, activeTodo }: TodoDrawerProps) {
  const { activeProjectId } = useProjectSelectors()

  const initialTodo = useMemo(() => {
    if (open === "edit") {
      return activeTodo && "projectId" in activeTodo ? new Todo(activeTodo) : new Todo()
    }
    return new Todo({ projectId: activeProjectId ?? "" })
  }, [open, activeTodo, activeProjectId])

  return (
    <Drawer open={!!open}>
      <DrawerContent className="px-4 py-4">
        <DrawerHeader hidden={true}>
          <DrawerTitle>Title</DrawerTitle>
          <DrawerDescription>Description</DrawerDescription>
        </DrawerHeader>

        <EditTodo editMode={open} initialTodo={initialTodo} onClose={onClose} />
      </DrawerContent>
    </Drawer>
  )
}
