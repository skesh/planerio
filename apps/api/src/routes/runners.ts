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

export { router as runnersRoutes }
