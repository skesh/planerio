import { Router } from "express"
import type { Todo } from "../generated/prisma/client"
import { requireAuth } from "../middleware/auth.js"
import { prisma } from "../lib/prisma.js"

const router = Router()

router.get("/", requireAuth, async (req, res) => {
  const todos = await prisma.todo.findMany({ where: { userId: req.userId } })
  res.json(todos || [])
})

router.post("/sync", requireAuth, async (req, res) => {
  const todos: Todo[] = req.body

  if (todos.length > 0) {
    const existingIds = await prisma.todo.findMany({
      where: { id: { in: todos.map((t) => t.id) } },
      select: { id: true },
    })
    const existingIdSet = new Set(existingIds.map((t) => t.id))

    const existingProjectIds = new Set(
      (await prisma.project.findMany({ select: { id: true } })).map((p) => p.id),
    )

    const newTodos = todos
      .filter((t) => !existingIdSet.has(t.id))
      .map((t) => ({
        ...t,
        userId: req.userId,
        projectId: t.projectId && existingProjectIds.has(t.projectId) ? t.projectId : null,
      }))

    await prisma.todo.createMany({ data: newTodos })
  }

  res.json({ message: "TODO" })
})

export { router as todosRoutes }
