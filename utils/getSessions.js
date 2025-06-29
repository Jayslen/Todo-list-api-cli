import { db } from '../dbConnection.js'

export async function getSession ({ sessionId }) {
  const [results] = await db.query('SELECT * FROM sessions WHERE sessionId = ?', [sessionId])
  return results.length > 0
}
