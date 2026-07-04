import { useVacancyStore, useRunnerStore, isRunnerExpired } from "@repo/core"

const VACANCY_RUNNER_TYPE = "hh-rss"

export async function loadData() {
  const vs = useVacancyStore.getState()

  vs.reset()
  await vs.initialize()

  const rs = useRunnerStore.getState()
  await rs.loadRunners()

  const runner = useRunnerStore.getState().runners.find((r) => r.type === VACANCY_RUNNER_TYPE)
  if (!runner) return

  if (runner.status === "running" || !runner.lastRunAt || isRunnerExpired(runner.lastRunAt, runner.schedule)) {
    await rs.triggerAndWait(runner.id, runner.lastRunAt, runner.schedule)

    vs.reset()
    await vs.initialize()
  }
}
