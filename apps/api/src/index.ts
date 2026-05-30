import cookie from "@fastify/cookie"
import cors from "@fastify/cors"
import jwt from "@fastify/jwt"
import Fastify from "fastify"
import { prismaPlugin } from "./plugins/prisma.js"
import { authRoutes } from "./routes/auth.js"
import { todosRoutes } from "./routes/todos.js"

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: true,
  credentials: true,
})

await app.register(cookie)

await app.register(jwt, {
  secret: process.env.JWT_SECRET ?? "dev-secret-change-in-production",
})

await app.register(prismaPlugin)

await app.register(authRoutes, { prefix: "/auth" })
await app.register(todosRoutes, { prefix: "/todos" })

app.get("/health", async () => ({ status: "ok" }))

try {
  await app.listen({ port: 3001, host: "0.0.0.0" })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
