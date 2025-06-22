import bcrypt from 'bcrypt'
import fs from 'node:fs/promises'
import { prettifyError, flattenError } from 'zod/v4'
import { parseRegisterUser } from '../schemas/userSchema.js'
import { SALT_ROUNDS } from '../config.js'
import { parseTask } from '../schemas/tasksSchema.js'
import { createJWT } from '../utils/Token.js'
import { handleErrors } from '../schemas/Errors.js'

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
    } catch (Error) {
      handleErrors({ res, Error })
    }
  }

  login = async (req, res) => {
    const data = req.body
    try {
      const modelResponse = await this.TasksModel.login({ name: data.name, password: data.password })
      const { name, id, email } = modelResponse

      const token = createJWT({ email, id, name })
      res.status(200).json({ token })
    } catch (Error) {
      handleErrors({ res, Error })
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

  getTodos = async (req, res) => {
    const { sub: userId } = req.session
    const { page = 1, limit = 2 } = req.query
    try {
      res.status(200).json(await this.TasksModel.getTodos({ userId, page: +page, limit: +limit }))
    } catch (Error) {
      handleErrors({ res, Error })
    }
  }

  createTodo = async (req, res) => {
    const { sub: userId } = req.session
    const { title, description } = req.body

    const { success: isParsedSucess, data: parsedData, error: parsedErrors } = parseTask({ title, description })

    //! create custom error
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
      handleErrors({ res, Error })
    }
  }

  deleteTasks = async (req, res) => {
    const { id: taskId } = req.params
    try {
      await this.TasksModel.deleteTaks({ taskId, userId: req.session.sub })
      res.sendStatus(204)
    } catch (Error) {
      handleErrors({ res, Error })
    }
  }
}
