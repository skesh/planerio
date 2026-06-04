# Planner

Vim-like todo приложение. Монорепо на pnpm workspaces + Turborepo.

## Приложения

| Приложение | Описание |
|---|---|
| `apps/electron` | Десктопное приложение (Electron + React 19) |
| `apps/api` | REST API (Express + Prisma + PostgreSQL) |
| `apps/mobile` | Мобильное приложение (в разработке) |

## Стек

**Electron**
- Electron + Vite
- React 19 + React Router 7
- Zustand
- shadcn/ui + Tailwind 4
- TypeScript

**API**
- Express 5
- Prisma + PostgreSQL
- JWT

**Общее**
- pnpm workspaces + Turborepo
- Biome (линтер + форматтер)

## Требования

- Node.js >= 18
- pnpm >= 11
- Docker (для PostgreSQL)

## Разработка

```sh
pnpm install
pnpm dev
```

`pnpm dev` поднимает Docker (PostgreSQL) и запускает все приложения параллельно через Turborepo.

### Отдельные приложения

```sh
# только electron
pnpm --filter electron dev

# только api
pnpm --filter api dev
```

### База данных

```sh
# применить миграции
pnpm db:migrate

# синхронизировать схему без миграций
pnpm db:push
```

### Линтинг и форматирование

```sh
pnpm lint
pnpm format
pnpm check-types
```

## Кейбиндинги

Навигация в стиле Vim:

| Клавиша | Действие |
|---|---|
| `j` / `k` | Движение вниз / вверх |
| `Enter` | Открыть задачу |
| `d` | Удалить задачу |
| `g g` | Перейти в начало |
| `G` | Перейти в конец |
