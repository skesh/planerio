import { prisma } from "./lib/prisma"
import { runners } from "./runners"

function parseSchedule(schedule: string): number | null {
  const num = Number.parseInt(schedule, 10)
  if (!Number.isNaN(num)) return num

  const match = schedule.match(/^every\s+(\d+)\s+(minute|hour|day)/i)
  if (match) {
    const amount = Number.parseInt(match[1], 10)
    const unit = match[2].toLowerCase()
    if (unit === "minute") return amount
    if (unit === "hour") return amount * 60
    if (unit === "day") return amount * 60 * 24
  }

  return null
}

async function tick() {
  const dueRunners = await prisma.runner.findMany({
    where: {
      enabled: true,
      schedule: { not: null },
    },
  })

  for (const runner of dueRunners) {
    if (!runner.schedule) continue

    if (runner.status === "running") continue

    const intervalMinutes = parseSchedule(runner.schedule)
    if (!intervalMinutes) continue

    if (runner.lastRunAt) {
      const elapsed = (Date.now() - runner.lastRunAt.getTime()) / 1000 / 60
      if (elapsed < intervalMinutes) continue
    }

    const handler = runners[runner.type]
    if (!handler) continue

    await prisma.runner.update({
      where: { id: runner.id },
      data: { status: "running" },
    })

    try {
      const count = await handler.run(
        runner.userId,
        runner.config as Record<string, unknown>,
        prisma,
      )
      await prisma.runner.update({
        where: { id: runner.id },
        data: { lastRunAt: new Date(), status: "idle" },
      })
      console.log(`[scheduler] runner ${runner.name} (${runner.id}): done, created ${count}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      await prisma.runner.update({
        where: { id: runner.id },
        data: { status: "error" },
      })
      console.error(`[scheduler] runner ${runner.name} (${runner.id}): error - ${message}`)
    }
  }
}

export function startScheduler() {
  console.log("[scheduler] starting")
  tick()
  setInterval(tick, 60_000)
}
