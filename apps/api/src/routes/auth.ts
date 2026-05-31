import { randomBytes, scryptSync } from "node:crypto"
import type { FastifyInstance } from "fastify"

import { prisma } from "../lib/prisma.js"

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: { email: string; password: string } }>(
    "/register",
    async (request, reply) => {
      const { email, password } = request.body

      if (!email || !password) {
        return reply.status(400).send({ error: "Email and password are required" })
      }

      if (typeof email !== "string" || typeof password !== "string") {
        return reply.status(400).send({ error: "Invalid input types" })
      }

      if (password.length < 6) {
        return reply.status(400).send({ error: "Password must be at least 6 characters" })
      }

      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return reply.status(409).send({ error: "Email already registered" })
      }

      const salt = randomBytes(16).toString("hex")
      const hash = scryptSync(password, salt, 64).toString("hex")
      const hashed = `${salt}:${hash}`

      const user = await prisma.user.create({
        data: { email, password: hashed },
      })

      const token = app.jwt.sign({ sub: user.id })

      return { token, user: { id: user.id, email: user.email } }
    },
  )

  app.post<{ Body: { email: string; password: string } }>(
    "/login",
    async (_request, _reply) => {
      return { message: "TODO" }
    },
  )

  app.post("/logout", async () => {
    return { message: "TODO" }
  })
}
