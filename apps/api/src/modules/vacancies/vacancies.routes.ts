import { Router } from "express"
import { prisma } from "../../lib/prisma"
import { requireAuth } from "../../middleware/auth"
import { runHH } from "./hh-rss"

const router = Router()

router.get("/", requireAuth, async (req, res) => {
  const vacancies = await prisma.vacancy.findMany({
    include: {
      users: { where: { userId: req.userId } },
    },
  })

  const result = vacancies.map((v) => ({
    ...v,
    status: v.users[0]?.status ?? "new",
    users: undefined,
  }))

  res.json(result)
})

router.patch("/:id/status", requireAuth, async (req, res) => {
  const id = req.params.id as string
  const { status } = req.body as { status: string }

  if (!status) {
    res.status(400).json({ error: "status is required" })
    return
  }

  const vacancy = await prisma.vacancy.findUnique({ where: { id } })
  if (!vacancy) {
    res.status(404).json({ error: "Vacancy not found" })
    return
  }

  const record = await prisma.userVacancy.upsert({
    where: { userId_vacancyId: { userId: req.userId, vacancyId: id } },
    update: { status },
    create: { userId: req.userId, vacancyId: id, status },
  })

  res.json({ status: record.status })
})

router.post("/run", requireAuth, async (req, res) => {
  const { keywords, blacklist } = req.body as {
    keywords?: string[]
    blacklist?: string[]
  }

  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    res.status(400).json({ error: "keywords is required" })
    return
  }

  try {
    const count = await runHH(keywords, req.userId, prisma, blacklist)
    res.json({ created: count })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    res.status(500).json({ error: message })
  }
})

export { router as vacanciesRoutes }
