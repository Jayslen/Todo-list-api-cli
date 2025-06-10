import express from 'express'
import { PORT } from './config.js'

const app = express()

app.get('/', (req, res) => {
  res.send('<h1>Hello</h1>')
})

app.listen(PORT, () => {
  console.log(`App listening on port: http//:localhost:${PORT}`)
})
