export function parseScheduleMinutes(schedule: string): number | null {
  const num = Number.parseInt(schedule, 10)
  if (!Number.isNaN(num)) return num

  const match = schedule.match(/^every\s+(\d+)\s+(minute|hour|day)/i)
  if (match) {
    const amount = Number.parseInt(match[1], 10)
    const unit = match[2].toLowerCase()
    if (unit === "minute") return amount
    if (unit === "hour") return amount * 60
    if (unit === "day") return amount * 60 * 24
  }

  return null
}

export function isRunnerExpired(lastRunAt: string | null, schedule: string | null): boolean {
  if (!lastRunAt || !schedule) return true
  const interval = parseScheduleMinutes(schedule)
  if (!interval) return true
  const elapsed = (Date.now() - new Date(lastRunAt).getTime()) / 1000 / 60
  return elapsed >= interval
}
