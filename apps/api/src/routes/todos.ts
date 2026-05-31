import type { Todo } from "@prisma/client"
import type { FastifyInstance } from "fastify"

import { prisma } from "../lib/prisma.js"

export async function todosRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return { message: "TODO" }
  })

  app.post<{ Body: Todo[] }>("/sync", async (request, reply) => {
    const { sub: userId } = await request.jwtVerify<{ sub: string }>()
    const { body: todos } = request

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
          userId,
          projectId: t.projectId && existingProjectIds.has(t.projectId) ? t.projectId : null,
        }))

      await prisma.todo.createMany({ data: newTodos })
    }
    return { message: "TODO" }
  })
}
