import { Router } from "express"
import type { Todo } from "../generated/prisma/client"
import { prisma } from "../lib/prisma"
import { requireAuth } from "../middleware/auth"

const router = Router()

router.get("/", requireAuth, async (req, res) => {
  const todos = await prisma.todo.findMany({ where: { userId: req.userId } })
  res.json(todos || [])
})

router.post("/sync", requireAuth, async (req, res) => {
  const todos: Todo[] = req.body

  if (todos.length > 0) {
    const existing = await prisma.todo.findMany({
      where: { id: { in: todos.map((t) => t.id) } },
    })
    const existingMap = new Map(existing.map((t) => [t.id, t]))

    const existingProjectIds = new Set(
      (await prisma.project.findMany({ select: { id: true } })).map((p) => p.id),
    )

    for (const todo of todos) {
      if (existingMap.has(todo.id)) {
        await prisma.todo.update({
          where: { id: todo.id },
          data: {
            title: todo.title,
            description: todo.description,
            tags: todo.tags,
            priority: todo.priority,
            date: todo.date,
            time: todo.time,
            endDate: todo.endDate,
            done: todo.done,
            doneDate: todo.doneDate,
            updatedAt: todo.updatedAt,
            projectId:
              todo.projectId && existingProjectIds.has(todo.projectId) ? todo.projectId : null,
          },
        })
      } else {
        await prisma.todo.create({
          data: {
            ...todo,
            userId: req.userId,
            projectId:
              todo.projectId && existingProjectIds.has(todo.projectId) ? todo.projectId : null,
          },
        })
      }
    }
  }

  res.json({ message: "Synced" })
})

export { router as todosRoutes }
