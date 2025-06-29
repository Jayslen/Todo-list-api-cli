import bcrypt from 'bcrypt'
import { db } from '../../dbConnection.js'
import { UsersNotFound, UserFound, TaskNotFound, Forbidden } from '../../schemas/Errors.js'

export class TasksModel {
  static register = async ({ user }) => {
    const { name, email, password } = user
    const [findUser] = await db.query(
      'SELECT BIN_TO_UUID(id) AS id, name,email, password FROM users WHERE LOWER(name) = LOWER(?)',
      [name]
    )

    if (findUser.length > 0) throw new UserFound()

    const [[{ uuid }]] = await db.query('SELECT UUID() AS uuid')

    await db.query(
      'INSERT INTO users (id,name,email,password) VALUES (UUID_TO_BIN(?),?,?,?);',
      [uuid, name, email, password]
    )
    const [[{ id, name: userName, email: userEmail }]] =
        await db.query(
          'SELECT BIN_TO_UUID(id) AS id, name,email, password FROM users WHERE BIN_TO_UUID(id) = ?',
          [uuid]
        )
    return { id, name: userName, email: userEmail }
  }

  static login = async ({ name, password }) => {
    const [[user]] = await db.query('SELECT BIN_TO_UUID(id) AS id, name, password,email FROM users WHERE LOWER(name) = LOWER(?)', [name])

    if (!user) throw new UsersNotFound()
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) throw new Error('Password incorrect')

    const { id, name: userName, email } = user

    await db.query('INSERT INTO SESSIONS (userId,name,email) VALUES (?,?,?)', [id, userName, email])
    const [[{ sessionId }]] = await db.query('SELECT LAST_INSERT_ID() AS sessionId')

    return { id, name: userName, email, sessionId }
  }

  static getTodos = async ({ page, limit, userId }) => {
    const offset = (page - 1) * limit
    const [tasks] = await db.query('SELECT id, title, description, date FROM tasks WHERE BIN_TO_UUID(user) = ? LIMIT ? OFFSET ?', [userId, limit, offset])
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM tasks WHERE BIN_TO_UUID(user) = ?', [userId])
    const response = {
      data: tasks,
      page,
      limit,
      total
    }
    return response
  }

  static createTodo = async ({ userId, title, description }) => {
    await db.query('INSERT INTO tasks (user, title, description) VALUES (UUID_TO_BIN(?),?,?)', [userId, title, description])
    const [[{ lastId }]] = await db.query('SELECT LAST_INSERT_ID() AS  lastId')
    const [[tasksCreated]] = await db.query('SELECT id,title, description, date FROM tasks WHERE id = ?', [lastId])
    return tasksCreated
  }

  static deleteTask = async ({ taskId, userId }) => {
    const [[result]] = await db.query('SELECT BIN_TO_UUID(user) AS tasksUserId FROM tasks WHERE id = ?', [taskId])
    if (!result) throw new TaskNotFound()

    const { tasksUserId } = result
    if (tasksUserId !== userId) throw new Forbidden('Cannot a delete a task own by other')

    await db.query('DELETE FROM tasks WHERE id = ?', [taskId])
  }

  static updateTask = async ({ taskId, userId, data }) => {
    const [[result]] = await db.query('SELECT BIN_TO_UUID(user) AS tasksUserId FROM tasks WHERE id = ?', [taskId])
    if (!result) throw new TaskNotFound()

    const { tasksUserId } = result
    if (tasksUserId !== userId) throw new Forbidden('Cannot a edit a task own by other')

    const keysForUpdate = Object.keys(data).map(key => key.concat(' = ?')).join(', ')
    const values = Object.values(data)

    await db.query(`UPDATE tasks SET ${keysForUpdate} WHERE id = ?`, [...values, taskId])

    const [[taskUpdated]] = await db.query('SELECT id, title, description FROM tasks WHERE id = ?', [taskId])

    return taskUpdated
  }
}
