import { createServer } from './app.js'
import { TasksModel } from './models/mysql/tasksModel.js'

createServer({ TasksModel })
