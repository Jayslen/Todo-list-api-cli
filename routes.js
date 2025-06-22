import { Router } from 'express'
import { TasksController } from './controller/tasksController.js'

export function createRoutes (TasksModel) {
  const routes = Router()
  const Controller = new TasksController(TasksModel)

  routes.post('/register', Controller.register)
  routes.post('/login', Controller.login)
  routes.post('/logout', Controller.logout)
  routes.post('/todos', Controller.createTodo)
  routes.get('/todos', Controller.getTodos)
  routes.delete('/todos/:id', Controller.deleteTasks)
  routes.put('/todos/:id', Controller.updateTask)

  return routes
}
