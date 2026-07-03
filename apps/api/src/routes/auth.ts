import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"
import { Router } from "express"
import jwt from "jsonwebtoken"
import { prisma } from "../lib/prisma"
import { JWT_SECRET } from "../middleware/auth"

const router = Router()

router.post("/register", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" })
    return
  }

  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Invalid input types" })
    return
  }

  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" })
    return
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ error: "Email already registered" })
    return
  }

  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  const hashed = `${salt}:${hash}`

  const user = await prisma.user.create({
    data: { email, password: hashed },
  })

  const token = jwt.sign({ sub: user.id }, JWT_SECRET)

  res.json({ token, user: { id: user.id, email: user.email } })
})

router.post("/login", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" })
    return
  }

  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Invalid input types" })
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" })
    return
  }

  const [salt, storedHash] = user.password.split(":")
  const hash = scryptSync(password, salt, 64).toString("hex")
  const match = timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash))
  if (!match) {
    res.status(401).json({ error: "Invalid email or password" })
    return
  }

  const token = jwt.sign({ sub: user.id }, JWT_SECRET)
  res.json({ token, user: { id: user.id, email: user.email } })
})

export { router as authRoutes }
