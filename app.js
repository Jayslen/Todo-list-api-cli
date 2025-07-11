import express, { json } from 'express'
import { createRoutes } from './routes.js'
import { PORT } from './config.js'
import { isUserLoggedIn } from './middleware/userSession.js'
import { rateLimit } from './middleware/rateLimit.js'

export function createServer ({ TasksModel }) {
  const app = express()

  app.use(json())
  app.use(rateLimit)
  app.use(isUserLoggedIn)

  app.use(createRoutes(TasksModel))

  app.use((_, res, next) => {
    res.status(404).json({ msg: 'Rout not found', status: 404 })
  })

  app.listen(PORT, () => {
    console.log(`App listening on port: http//:localhost:${PORT}`)
  })

  return app
}
