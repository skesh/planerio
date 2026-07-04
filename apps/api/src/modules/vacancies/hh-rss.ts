import { XMLParser } from "fast-xml-parser"
import type { PrismaClient } from "../../generated/prisma/client"

interface RSSItem {
  title: string
  link: string
  pubDate: string
  description: string
}

interface RSSChannel {
  item: RSSItem | RSSItem[]
}

interface RSSFeed {
  rss: {
    channel: RSSChannel
  }
}

const parser = new XMLParser()

function extractId(link: string): string | null {
  const match = link.match(/\/vacancy\/(\d+)/)
  return match?.[1] ?? null
}

function extractField(html: string, key: string): string | null {
  const match = html.match(new RegExp(`<p>${key}: (.+?)</p>`))
  return match?.[1] ?? null
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

const mergeUnique = (arr: string[] = [], val: string) => [...new Set([...arr, val])]

export async function runHH(
  keywords: string[],
  _userId: string,
  prisma: PrismaClient,
  blacklist: string[] = [],
): Promise<number> {
  let total = 0

  for (const keyword of keywords) {
    const url = `https://hh.ru/search/vacancy/rss?text=${encodeURIComponent(keyword)}&order_by=publication_time`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`HH RSS error: ${res.status}`)

    const xml = await res.text()
    const data = parser.parse(xml) as RSSFeed

    const items = data.rss.channel.item
    const list = Array.isArray(items) ? items : [items]

    for (const item of list) {
      const externalId = extractId(item.link)
      if (!externalId) continue

      const company = extractField(item.description, "Вакансия компании") ?? ""
      const area = extractField(item.description, "Регион")
      const salary = extractField(item.description, "Предполагаемый уровень месячного дохода")

      if (blacklist.some((b) => company.toLowerCase().includes(b.toLowerCase()))) continue

      const publishedAt = fmtDate(item.pubDate)

      const existing = await prisma.vacancy.findUnique({
        where: { externalSource_externalId: { externalSource: "hh-rss", externalId } },
        select: { keywords: true },
      })

      await prisma.vacancy.upsert({
        where: {
          externalSource_externalId: { externalSource: "hh-rss", externalId },
        },
        update: {
          company,
          area,
          salary,
          description: item.description,
          keywords: { set: mergeUnique(existing?.keywords, keyword) },
        },
        create: {
          externalSource: "hh-rss",
          externalId,
          company,
          title: item.title,
          publishedAt,
          area,
          salary,
          url: item.link,
          description: item.description,
          keywords: [keyword],
        },
      })

      total++
    }
  }

  return total
}
