import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  port: '3308',
  database: 'todos'
})

export class TasksModel {
  static register = async ({ user }) => {
    const { name, email, password } = user
    const [findUser] = await connection.query(
      'SELECT BIN_TO_UUID(id) AS id, name,email, password FROM users WHERE LOWER(name) = LOWER(?)',
      [name]
    )

    if (findUser.length > 0) throw new Error('User alredy exists')

    const [[{ uuid }]] = await connection.query('SELECT UUID() AS uuid')

    try {
      await connection.query(
        'INSERT INTO users (id,name,email,password) VALUES (UUID_TO_BIN(?),?,?,?);',
        [uuid, name, email, password]
      )
      const [[{ id, name: userName, email: userEmail }]] =
        await connection.query(
          'SELECT BIN_TO_UUID(id) AS id, name,email, password FROM users WHERE BIN_TO_UUID(id) = ?',
          [uuid]
        )
      return { id, name: userName, email: userEmail }
    } catch (e) {
      console.error(e)
    }
  }

  static login = async ({ name, password }) => {
    try {
      const [[user]] = await connection.query('SELECT BIN_TO_UUID(id) AS id, name, password,email FROM users WHERE LOWER(name) = LOWER(?)', [name])

      if (!user) throw new Error('User does not exists')
      const isPasswordCorrect = await bcrypt.compare(password, user.password)
      if (!isPasswordCorrect) throw new Error('Password incorrect')

      return {
        id: user.id,
        name: user.name,
        email: user?.email
      }
    } catch (Error) {
      console.log(Error)
    }
  }

  static createTodo = async ({ userId, title, description }) => {
    try {
      await connection.query('INSERT INTO tasks (user, title, description) VALUES (UUID_TO_BIN(?),?,?)', [userId, title, description])
      const [[{ lastId }]] = await connection.query('SELECT LAST_INSERT_ID() AS  lastId')
      const [[tasksCreated]] = await connection.query('SELECT id,title, description, date FROM tasks WHERE id = ?', [lastId])
      return tasksCreated
    } catch (Error) {
      console.error(Error)
    }
  }
}
