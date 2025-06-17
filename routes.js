import { Router } from 'express'
import { TasksController } from './controller/tasksController.js'

export function createRoutes (TasksModel) {
  const routes = Router()
  const Controller = new TasksController(TasksModel)

  routes.post('/register', Controller.register)
  routes.post('/login', Controller.login)
  routes.post('/todos', Controller.createTodo)

  return routes
}
