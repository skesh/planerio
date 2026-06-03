import { Router } from "express"
import { requireAuth } from "../middleware/auth.js"
import { prisma } from "../lib/prisma.js"

const router = Router()

router.get("/", requireAuth, async (req, res) => {
  const projects = await prisma.project.findMany({ where: { userId: req.userId } })
  res.json(projects || [])
})

router.post("/sync", requireAuth, async (req, res) => {
  const projects: Array<Record<string, unknown>> = req.body

  if (projects.length > 0) {
    const existingIds = await prisma.project.findMany({
      where: { id: { in: projects.map((p) => p.id as string) } },
      select: { id: true },
    })

    const existingIdSet = new Set(existingIds.map((p) => p.id))
    const newProjects = projects
      .filter((p) => !existingIdSet.has(p.id as string))
      .map(({ todoIds, description, ...p }) => ({ ...p, userId: req.userId }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.project.createMany({ data: newProjects as any })
  }

  res.json({ message: "TODO" })
})

export { router as projectRoutes }
