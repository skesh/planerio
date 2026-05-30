import { PrismaClient } from "@prisma/client"
import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"

const prisma = new PrismaClient()

export const prismaPlugin = fp(async (app: FastifyInstance) => {
  app.decorate("prisma", prisma)

  app.addHook("onClose", async () => {
    await prisma.$disconnect()
  })
})

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}
