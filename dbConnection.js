import mysql from 'mysql2/promise'

export const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  port: '3308',
  database: 'todos',
  waitForConnections: true,
  connectionLimit: 10
})
