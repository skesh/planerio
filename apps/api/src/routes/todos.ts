import type { FastifyInstance } from "fastify"

export async function todosRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return { message: "TODO" }
  })

  app.post("/sync", async () => {
    return { message: "TODO" }
  })
}
