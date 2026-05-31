import { FlameIcon, X } from "lucide-react"
import { useEffect, useRef } from "react"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/shared/ui/button"
import { DatePickerField } from "@/shared/ui/DatePickerField.tsx"
import { MultiSelect } from "@/shared/ui/MultiSelect.tsx"

import { useProjectSelectors } from "@/store/projectsStore.ts"
import { useTodoActions, useTodoSelectors } from "@/store/todosStore"
import { type UIState, useUiActions } from "@/store/uiStore.ts"
import type { Todo } from "../../shared/model/todo.ts"
import { RepeatPeriod } from "../../shared/model/todo.ts"
import { Field } from "../../shared/ui/field.tsx"
import { Input } from "../../shared/ui/input.tsx"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/ui/select.tsx"
import { Textarea } from "../../shared/ui/textarea.tsx"
import { Toggle } from "../../shared/ui/toggle.tsx"
import { ToggleGroup, ToggleGroupItem } from "../../shared/ui/toggle-group.tsx"

interface EditTodoProps {
  initialTodo: Todo
  todoOpen: UIState["todoOpen"]
}

export default function EditTodo({ initialTodo, todoOpen }: EditTodoProps) {
  const { control, handleSubmit, reset, setValue } = useForm<Todo>({
    defaultValues: initialTodo,
  })

  const { activeTodo, todos } = useTodoSelectors()
  const { addItem, editItemById } = useTodoActions()
  const { projects } = useProjectSelectors()
  const { setTodoOpen } = useUiActions()

  const otherTodos = todos.filter((t) => t.id !== initialTodo.id && !t.done)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    reset(initialTodo)
  }, [initialTodo, reset])

  useEffect(() => {
    inputRef.current?.focus()
  }, [todoOpen])

  function onSubmit(data: Todo) {
    switch (todoOpen) {
      case "add":
        addItem(data)
        break
      case "edit":
        if (activeTodo) editItemById(activeTodo.id, data)
        break
    }
    setTodoOpen(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(onSubmit)()}
              ref={(e) => {
                field.ref(e)
                inputRef.current = e
              }}
              placeholder="Title"
            />
          )}
        />
      </Field>

      <Field>
        <Controller
          name="description"
          control={control}
          render={({ field }) => <Textarea {...field} placeholder="Description" />}
        />
      </Field>

      {projects.length > 0 && (
        <Controller
          name="projectId"
          control={control}
          render={({ field }) => (
            <Field orientation="horizontal" className="gap-2">
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {projects.map((p) => (
                      <SelectItem value={p.id} key={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {field.value && (
                <Button
                  variant="secondary"
                  size="sm"
                  title="Remove project"
                  onClick={(e) => {
                    e.stopPropagation()
                    setValue("projectId", "")
                  }}
                >
                  <X />
                </Button>
              )}
            </Field>
          )}
        />
      )}

      <div className="flex justify-between">
        <div className="flex gap-4">
          <Controller
            name="date"
            control={control}
            render={({ field }) => <DatePickerField field={field} placeholder="Start date" />}
          />

          <Controller
            name="time"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="time"
                className="w-auto"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(onSubmit)()}
              />
            )}
          />
        </div>

        <Controller
          name="repeat"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              type="single"
              value={field.value}
              className="items-end gap-4"
              onValueChange={field.onChange}
            >
              {Object.values(RepeatPeriod).map((option) => (
                <ToggleGroupItem
                  key={option}
                  value={option}
                  className={field.value === option ? "!bg-[deeppink] !text-white" : ""}
                >
                  {option}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </div>

      <Controller
        name="priority"
        control={control}
        render={({ field }) => (
          <div className="flex gap-2">
            <Toggle
              aria-label="Toggle bookmark"
              pressed={field.value}
              onPressedChange={field.onChange}
            >
              <FlameIcon className="group-data-[state=on]/toggle:fill-foreground" />
              High Priority
            </Toggle>
          </div>
        )}
      />

      {otherTodos.length > 0 && (
        <Controller
          name="dependsOn"
          control={control}
          render={({ field }) => (
            <Field>
              <MultiSelect
                options={otherTodos.map((t) => ({
                  value: t.id,
                  label: t.title || "(no title)",
                }))}
                selected={field.value ?? []}
                onChange={field.onChange}
                placeholder="Depends on…"
                searchPlaceholder="Search…"
                emptyText="No tasks found"
              />
            </Field>
          )}
        />
      )}
    </form>
  )
}
