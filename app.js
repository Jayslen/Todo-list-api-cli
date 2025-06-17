import express, { json } from 'express'
import { createRoutes } from './routes.js'
import { TasksModel } from './models/mysql/tasksModel.js'
import { PORT } from './config.js'
import { isUserLoggedIn } from './middleware/userSession.js'

const app = express()

app.use(json())
app.use(isUserLoggedIn)

app.use(createRoutes(TasksModel))

app.use((_, res, next) => {
  res.status(404).json({ msg: 'Rout not found', status: 404 })
})

app.listen(PORT, () => {
  console.log(`App listening on port: http//:localhost:${PORT}`)
})
