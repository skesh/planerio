import { Router } from "express"
import { prisma } from "../lib/prisma"
import { requireAuth } from "../middleware/auth"
import { runners } from "../runners/index"

const router = Router()

router.get("/", requireAuth, async (req, res) => {
  const list = await prisma.runner.findMany({ where: { userId: req.userId } })
  res.json(list)
})

router.get("/:id", requireAuth, async (req, res) => {
  const id = req.params.id as string
  const runner = await prisma.runner.findFirst({
    where: { id, userId: req.userId },
  })
  if (!runner) {
    res.status(404).json({ error: "Runner not found" })
    return
  }
  res.json(runner)
})

router.post("/:id/run", requireAuth, async (req, res) => {
  const id = req.params.id as string
  const runner = await prisma.runner.findFirst({
    where: { id, userId: req.userId },
  })
  if (!runner) {
    res.status(404).json({ error: "Runner not found" })
    return
  }

  const handler = runners[runner.type]
  if (!handler) {
    res.status(400).json({ error: `No handler for runner type: ${runner.type}` })
    return
  }

  try {
    const count = await handler.run(runner.userId, runner.config as Record<string, unknown>, prisma)
    await prisma.runner.update({
      where: { id: runner.id },
      data: { lastRunAt: new Date(), lastStatus: "ok", errorMessage: null },
    })
    res.json({ created: count })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    await prisma.runner.update({
      where: { id: runner.id },
      data: { lastStatus: "error", errorMessage: message },
    })
    res.status(500).json({ error: message })
  }
})

router.post("/", requireAuth, async (req, res) => {
  const { name, type, schedule, config, projectId } = req.body

  if (!name || !type) {
    res.status(400).json({ error: "name and type are required" })
    return
  }

  const runner = await prisma.runner.create({
    data: {
      name,
      type,
      schedule: schedule ?? null,
      config: config ?? {},
      projectId: projectId ?? null,
      userId: req.userId,
    },
  })

  console.log(`[runners] created: ${runner.name} (${runner.id}) type=${runner.type} schedule=${runner.schedule}`)
  res.status(201).json(runner)
})

router.patch("/:id", requireAuth, async (req, res) => {
  const id = req.params.id as string
  const existing = await prisma.runner.findFirst({
    where: { id, userId: req.userId },
  })
  if (!existing) {
    res.status(404).json({ error: "Runner not found" })
    return
  }

  const { name, schedule, config, enabled } = req.body
  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = name
  if (schedule !== undefined) data.schedule = schedule
  if (config !== undefined) data.config = config
  if (enabled !== undefined) data.enabled = enabled

  const updated = await prisma.runner.update({ where: { id }, data })

  console.log(`[runners] updated: ${updated.name} (${updated.id})`)
  res.json(updated)
})

router.delete("/:id", requireAuth, async (req, res) => {
  const id = req.params.id as string
  const existing = await prisma.runner.findFirst({
    where: { id, userId: req.userId },
  })
  if (!existing) {
    res.status(404).json({ error: "Runner not found" })
    return
  }

  await prisma.runner.delete({ where: { id } })
  console.log(`[runners] deleted: ${existing.name} (${existing.id})`)
  res.status(204).end()
})

export { router as runnersRoutes }
