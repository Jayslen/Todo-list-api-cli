import bcrypt from 'bcrypt'
import fs from 'node:fs/promises'
import { prettifyError, flattenError } from 'zod/v4'
import { parseRegisterUser } from '../schemas/userSchema.js'
import { SALT_ROUNDS } from '../config.js'
import { parseTask } from '../schemas/tasksSchema.js'
import { createJWT } from '../utils/Token.js'

export class TasksController {
  constructor (TasksModel) {
    this.TasksModel = TasksModel
  }

  register = async (req, res) => {
    const data = req.body
    if (Object.entries(data).length === 0) return res.status(400).json({ msg: 'User empty' })
    const parsedData = parseRegisterUser(data)

    if (!parsedData.success) {
      console.log(prettifyError(parsedData.error))
      return res
        .status(400)
        .json({
          status: 400,
          error: 'Bad request with the data expected',
          conflits: flattenError(parsedData.error).fieldErrors
        })
    }
    const hashPassword = await bcrypt.hash(data.password, (+SALT_ROUNDS))
    const user = { name: data.name, password: hashPassword, email: data.email }
    try {
      const { name, email, id } = await this.TasksModel.register({ user })
      const token = createJWT({ email, id, name })
      res.status(200).json({ token })
    } catch (e) {
      res.status(400).json({ status: 400, msg: e.message })
      console.error(e)
    }
  }

  login = async (req, res) => {
    const data = req.body
    try {
      const modelResponse = await this.TasksModel.login({ name: data.name, password: data.password })
      const { name, id, email } = modelResponse

      const token = await createJWT({ email, id, name })
      res.status(200).json({ token })
    } catch (e) {
      res.sendStatus(400)
      console.log(e)
    }
  }

  logout = async (req, res) => {
    try {
      await fs.writeFile('./token.txt', '', { encoding: 'utf-8' })
      res.sendStatus(204)
    } catch (Error) {
      res.status(500).json({ msg: 'Unexpected error' })
    }
  }

  createTodo = async (req, res) => {
    const { sub: userId } = req.session
    const { title, description } = req.body

    const { success: isParsedSucess, data: parsedData, error: parsedErrors } = parseTask({ title, description })

    if (!isParsedSucess) {
      console.log(prettifyError(parsedErrors))
      return res
        .status(400)
        .json({
          status: 400,
          error: 'Bad request with the data expected',
          conflits: flattenError(parsedErrors).fieldErrors
        })
    }

    try {
      const taskCreated = await this.TasksModel.createTodo({ userId, title: parsedData.title, description: parsedData.description })
      res.status(201).json(taskCreated)
    } catch (Error) {
      res.sendStatus(500)
    }
  }
}
