import type { FastifyInstance } from "fastify"

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", async () => {
    return { message: "TODO" }
  })

  app.post("/login", async () => {
    return { message: "TODO" }
  })

  app.post("/logout", async () => {
    return { message: "TODO" }
  })
}
