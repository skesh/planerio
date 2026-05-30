import { nanoid } from 'nanoid'

export class Project {
  id: string
  name: string
  description: string
  todoIds: string[]

  constructor(project?: Partial<Project>) {
    this.id = project?.id || nanoid()
    this.name = project?.name || ''
    this.description = project?.description || ''
    this.todoIds = project?.todoIds || []
  }
}
