import { Router } from "express"
import { prisma } from "../lib/prisma.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

router.get("/", requireAuth, async (req, res) => {
  const projects = await prisma.project.findMany({ where: { userId: req.userId } })
  res.json(projects || [])
})

router.post("/sync", requireAuth, async (req, res) => {
  const projects: Array<Record<string, unknown>> = req.body

  if (projects.length > 0) {
    const existing = await prisma.project.findMany({
      where: { id: { in: projects.map((p) => p.id as string) } },
    })
    const existingMap = new Map(existing.map((p) => [p.id, p]))

    for (const project of projects) {
      const { todoIds, description, ...data } = project
      if (existingMap.has(project.id as string)) {
        await prisma.project.update({
          where: { id: project.id as string },
          data: {
            name: data.name as string,
            updatedAt: data.updatedAt as string,
          },
        })
      } else {
        await prisma.project.create({
          data: {
            id: data.id as string,
            name: data.name as string,
            description: (description as string) ?? "",
            userId: req.userId,
            createdAt: data.createdAt as string,
            updatedAt: data.updatedAt as string,
          },
        })
      }
    }
  }

  res.json({ message: "Synced" })
})

export { router as projectRoutes }
