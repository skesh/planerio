# Planner

## Правила
- **Не менять код без спроса.** Сначала спросить, что сделать и как, получить подтверждение — только потом делать.

Vim-like todo приложение. В проекте есть `apps/api` (Fastify + Prisma + PostgreSQL) и `apps/electron`.

## Стек
- Electron + Vite + React 19
- Zustand (стор)
- React Router 7
- shadcn/ui + Tailwind 4
- Biome (линтер + форматтер, конфиг в корневом `biome.json`)
- pnpm workspaces + Turborepo

## Структура `apps/electron/src`
Попытка FSD, но не строгая:
- `app/` — точка входа, конфиг, глобальные кейбиндинги
- `entities/Todo/` — TodoCard, TodoList, EditTodo, TodoDrawer (последние три должны быть в widgets/features — отложено)
- `pages/` — PageHome, PageInbox, PageProject
- `shared/` — ui (shadcn компоненты), hooks, lib, model (Todo и Project классы)
- `store/` — todosStore, projectsStore, uiStore (должны быть в entities — отложено)
- `widgets/` — Sidebar, Toolbar, Footer, Menu

## Модель данных
- `Todo` — класс с полями: id, title, description, tags, priority, date, time, endDate, projectId, repeat, dependsOn, done, doneDate, created
- `Project` — в `shared/model/project.ts`
- Хранение через `electron-store` (IPC: `window.ipcRenderer.store.get/set`)
- Даты в формате `dd.MM.yyyy` (константа `DATE_FORMAT` в `app/config.ts`)

## Навигация
- Vim-like кейбиндинги: `j/k` — движение, `enter` — открыть, `d` — удалить и т.д.
- Кейбиндинги разбиты по файлам рядом с компонентом (`*.keybind.ts`)
- Глобальные — в `app/global-keybindings.ts`
