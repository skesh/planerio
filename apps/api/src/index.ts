import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"

import vacanciesRoutes from "./modules/vacancies"
import { authRoutes } from "./routes/auth"
import { projectRoutes } from "./routes/projects"
import { runnersRoutes } from "./routes/runners"
import { todosRoutes } from "./routes/todos"

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(cookieParser())
app.use(express.json())

app.get("/health", (_req, res) => res.json({ status: "ok" }))
app.use("/auth", authRoutes)
app.use("/todos", todosRoutes)
app.use("/projects", projectRoutes)
app.use("/runners", runnersRoutes)
app.use("/vacancies", vacanciesRoutes)

app.listen(3001, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:3001")
})
