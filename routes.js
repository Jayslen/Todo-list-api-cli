import { Router } from 'express'
import { TasksController } from './controller/tasksController.js'

export function createRoutes (TasksModel) {
  const routes = Router()
  const Controller = new TasksController(TasksModel)

  routes.post('/register', Controller.register)

  return routes
}
