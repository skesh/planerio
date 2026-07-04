import type { PrismaClient } from "../generated/prisma/client"
import { runHH } from "../modules/vacancies/hh-rss"

export async function runHHRss(
  userId: string,
  config: Record<string, unknown>,
  prisma: PrismaClient,
): Promise<number> {
  const keywords = (config.keywords as string[]) ?? []
  const blacklist = (config.blacklist as string[]) ?? []

  console.log(`[hh-rss] запуск: keywords=${keywords.join(",")} blacklist=${blacklist.join(",")} time=${new Date().toUTCString()}`)

  if (keywords.length === 0) {
    throw new Error("keywords is required in config")
  }

  return runHH(keywords, userId, prisma, blacklist)
}
