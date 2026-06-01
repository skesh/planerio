import type { FastifyInstance } from "fastify"
import type { Project } from "../generated/prisma/client"
import { prisma } from "../lib/prisma.js"

export async function projectRoutes(app: FastifyInstance) {
  app.get("/", async (request, replay) => {
    const { sub: userId } = await request.jwtVerify<{ sub: string }>()

    const projects = await prisma.project.findMany({
      where: { userId },
    })

    return projects || []
  })

  app.post<{ Body: Project[] }>("/sync", async (request, replay) => {
    const { sub: userId } = await request.jwtVerify<{ sub: string }>()
    const { body: projects } = request

    if (projects.length > 0) {
      const existingIds = await prisma.project.findMany({
        where: { id: { in: projects.map((p) => p.id) } },
        select: { id: true },
      })

      const existingIdSet = new Set(existingIds.map((p) => p.id))
      const newTodos = projects
        .filter((p) => !existingIdSet.has(p.id))
        .map(({ todoIds, description, ...p }) => ({ ...p, userId }))

      await prisma.project.createMany({ data: newTodos })
    }
    return { message: "TODO" }
  })
}
