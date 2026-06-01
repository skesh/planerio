import { cn } from "@/shared/lib/utils"
import { useProjectSelectors } from "@/store/projectsStore"
import { CircleDotIcon, CircleIcon, FlameIcon, RepeatIcon } from "lucide-react"
import type { Todo } from "@repo/core"
import { Item, ItemContent, ItemMedia, ItemTitle } from "../../shared/ui/item"
import styles from "./todoCard.module.css"

function TodoCard({ todo, isActive }: { todo: Todo; isActive: boolean }) {
  const { projects } = useProjectSelectors()

  return (
    <Item
      className={cn(`${isActive && styles.active}`, todo.done && "text-neutral-600")}
      data-id={todo.id}
    >
      <ItemMedia variant="icon">{todo.done ? <CircleDotIcon /> : <CircleIcon />}</ItemMedia>
      <ItemContent>
        <ItemTitle>
          <span>{todo.title}</span>
          {todo.priority && <FlameIcon color={isActive ? "white" : "red"} size="14px" />}
          {todo.repeat && <RepeatIcon size="12px" color={isActive ? "white" : "deeppink"} />}
        </ItemTitle>
        {/* <ItemDescription>{todo.description}</ItemDescription> */}
      </ItemContent>
      <div>
        {todo?.date} {todo?.time && todo.time}
      </div>
      <div className="flex gap-1">
        {/* {todo.tags?.length > 0 && */}
        {/*   todo.tags.map((t) => ( */}
        {/*     <Badge variant="secondary" key={t}> */}
        {/*       {t} */}
        {/*     </Badge> */}
        {/*   ))} */}
        {todo.projectId && projects.find((p) => p.id === todo.projectId)?.name}
      </div>
      {/* <ItemActions> */}
      {/*   <Button>Action</Button> */}
      {/* </ItemActions> */}
    </Item>
  )
}

export default TodoCard
