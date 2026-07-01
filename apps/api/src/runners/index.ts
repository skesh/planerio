import type { PrismaClient } from "../generated/prisma/client"

export interface RunnerHandler {
  run(userId: string, config: Record<string, unknown>, prisma: PrismaClient): Promise<number>
}

export const runners: Record<string, RunnerHandler> = {}
