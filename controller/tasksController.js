import bcrypt from 'bcrypt'
import { prettifyError, flattenError } from 'zod/v4'
import { parseRegisterUser } from '../schemas/validationSchema.js'
import { SALT_ROUNDS } from '../config.js'

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
      res.status(200).json(await this.TasksModel.register({ user }))
    } catch (e) {
      res.status(400).json({ status: 400, msg: e.message })
      console.error(e)
    }
  }
}
