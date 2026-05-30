import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron'
import Store from 'electron-store'
import type { Project } from '@/shared/model/project'
import type { Todo } from '@/shared/model/todo'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const store = new Store<{ items: Todo[]; projects: Project[] }>({
  name: 'Todos',
  defaults: {
    items: [],
    projects: [],
  },
})

process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    titleBarStyle: 'default',
    trafficLightPosition: { x: 15, y: 15 },
    frame: false,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  async function exportData() {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: 'todos-backup.json',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })
    if (filePath) {
      const data = {
        items: store.get('items'),
        projects: store.get('projects'),
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    }
  }

  async function importData() {
    const { filePaths } = await dialog.showOpenDialog({
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile'],
    })
    if (filePaths.length > 0) {
      const data = JSON.parse(fs.readFileSync(filePaths[0], 'utf-8'))
      if (data.items) store.set('items', data.items)
      if (data.projects) store.set('projects', data.projects)
    }
  }

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Export Data',
          accelerator: 'CmdOrCtrl+E',
          click: exportData,
        },
        {
          label: 'Import Data',
          accelerator: 'CmdOrCtrl+I',
          click: importData,
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.handle('window:minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize()
})

const INBOX: Project = {
  id: 'inbox',
  name: 'Inbox',
  description: '',
  todoIds: [],
}

ipcMain.handle('store:get', (_event, key: string) => {
  if (key === 'projects') {
    const projects = (store.get('projects') as Project[]) || []
    return projects.some((p) => p.id === 'inbox') ? projects : [INBOX, ...projects]
  }
  return store.get(key)
})

ipcMain.handle('store:set', (_event, key: string, value: unknown) => {
  if (key === 'projects') {
    return store.set(
      key,
      (value as Project[]).filter((p) => p.id !== 'inbox'),
    )
  }
  return store.set(key, value)
})

ipcMain.on('data:changed', () => {
  win?.webContents.reload()
})

app.whenReady().then(() => {
  createWindow()
  // globalShortcut.register('o', () => {
  //   // Создать новое todo
  //   win?.webContents.send('shortcut:new-todo');
  // });
}) //   // Создать новое todo
//   win?.webContents.send('shortcut:new-todo');
// });
