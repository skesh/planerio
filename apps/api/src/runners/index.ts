import type { PrismaClient } from "../generated/prisma/client"
import { runHH } from "./hh"
import { runHHRss } from "./hh-rss"

export interface RunnerHandler {
  run(userId: string, config: Record<string, unknown>, prisma: PrismaClient): Promise<number>
}

export const runners: Record<string, RunnerHandler> = {
  hh: { run: runHH },
  "hh-rss": { run: runHHRss },
}
