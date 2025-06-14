import mysql from 'mysql2/promise'

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
}
