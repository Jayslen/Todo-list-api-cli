import bcrypt from 'bcrypt'
import fs from 'node:fs/promises'
import { prettifyError, flattenError } from 'zod/v4'
import { parseRegisterUser } from '../schemas/userSchema.js'
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP, SALT_ROUNDS } from '../config.js'
import { parseTask, parseTaskForUpdate } from '../schemas/tasksSchema.js'
import { createJWT } from '../utils/Token.js'
import { DataBadRequest, handleErrors } from '../schemas/Errors.js'

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
      const { name, id, email, sessionId } = modelResponse

      const accessToken = createJWT({ email, id, name, sessionId }, ACCESS_TOKEN_EXP)
      const refreshToken = createJWT({ email, id, name, sessionId }, REFRESH_TOKEN_EXP)

      res.status(200).json({ token: accessToken, refreshToken })
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
    const { id: userId } = req.session
    const { page = 1, limit = 4 } = req.query
    try {
      res.status(200).json(await this.TasksModel.getTodos({ userId, page: +page, limit: +limit }))
    } catch (Error) {
      handleErrors({ res, Error })
    }
  }

  createTodo = async (req, res) => {
    const { id: userId } = req.session
    const { title, description } = req.body

    const { success: isParsedSucess, data: parsedData, error: parsedErrors } = parseTask({ title, description })

    try {
      if (!isParsedSucess) { throw new DataBadRequest(flattenError(parsedErrors).fieldErrors) }

      const taskCreated = await this.TasksModel.createTodo({ userId, title: parsedData.title, description: parsedData.description })
      res.status(201).json(taskCreated)
    } catch (Error) {
      handleErrors({ res, Error })
    }
  }

  deleteTasks = async (req, res) => {
    const { id: taskId } = req.params
    try {
      await this.TasksModel.deleteTaks({ taskId, userId: req.session.id })
      res.sendStatus(204)
    } catch (Error) {
      handleErrors({ res, Error })
    }
  }

  updateTask = async (req, res) => {
    const { id: taskId } = req.params
    const userInput = req.body
    const { success: isParsedSucess, data: parsedData, error: parsedErrors } = parseTaskForUpdate(userInput)
    try {
      if (!isParsedSucess) { throw new DataBadRequest(flattenError(parsedErrors).fieldErrors) }

      const result = await this.TasksModel.updateTask({ taskId, userId: req.session.id, data: parsedData })
      res.status(200).json(result)
    } catch (Error) {
      handleErrors({ res, Error })
    }
  }
}
