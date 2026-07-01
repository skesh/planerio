import type { PrismaClient } from "../generated/prisma/client"

interface HHVacancy {
  id: string
  name: string
  area: { name: string }
  employer: { name: string }
  published_at: string
  salary: { from: number | null; to: number | null; currency: string } | null
  employment: { name: string } | null
  schedule: { name: string } | null
  snippet: {
    responsibility: string | null
    requirement: string | null
  } | null
  counters: {
    responses: number | null
  } | null
  alternate_url: string | null
}

interface HHResponse {
  items: HHVacancy[]
}

function fmtSalary(salary: HHVacancy["salary"]): string {
  if (!salary) return "ЗП: не указана"
  const from = salary.from ?? ""
  const to = salary.to ?? ""
  const range = from && to ? `${from} - ${to}` : from || to
  return `ЗП: ${range} ${salary.currency}${salary.from && salary.to ? "" : ""}`
}

function parseDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

export async function runHH(
  userId: string,
  config: Record<string, unknown>,
  prisma: PrismaClient,
): Promise<number> {
  const query = String(config.query ?? "")
  const area = String(config.area ?? "113")
  const perPage = Number(config.per_page ?? 20)
  const blacklist: string[] = (config.blacklist as string[]) ?? []

  const url = `https://api.hh.ru/vacancies?text=${encodeURIComponent(query)}&area=${encodeURIComponent(area)}&per_page=${perPage}`

  const res = await fetch(url, {
    headers: { "User-Agent": "Planner/1.0" },
  })

  if (!res.ok) {
    throw new Error(`HH API error: ${res.status} ${await res.text()}`)
  }

  const data = (await res.json()) as HHResponse
  const items = data.items ?? []

  const existing = await prisma.todo.findMany({
    where: { externalSource: "hh", externalId: { in: items.map((i) => i.id) }, userId },
    select: { externalId: true },
  })
  const existingIds = new Set(existing.map((t) => t.externalId))

  let created = 0

  for (const item of items) {
    if (existingIds.has(item.id)) continue

    const employerName = item.employer?.name ?? ""
    if (blacklist.some((b) => employerName.toLowerCase().includes(b.toLowerCase()))) continue

    const parts: string[] = []
    parts.push(`Опубликовано: ${item.published_at}`)
    if (item.area?.name) parts.push(item.area.name)
    parts.push(fmtSalary(item.salary))
    if (item.employment?.name) parts.push(item.employment.name)
    if (item.schedule?.name) parts.push(item.schedule.name)
    parts.push("")
    if (item.snippet?.responsibility) parts.push(item.snippet.responsibility)
    if (item.snippet?.requirement) parts.push(item.snippet.requirement)
    if (item.counters?.responses) parts.push(`\nОткликов: ${item.counters.responses}`)

    await prisma.todo.create({
      data: {
        title: `${employerName} / ${item.name}`,
        description: parts.join("\n"),
        date: parseDate(item.published_at),
        externalSource: "hh",
        externalId: item.id,
        userId,
      },
    })

    created++
  }

  return created
}
