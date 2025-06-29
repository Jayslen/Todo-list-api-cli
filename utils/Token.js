import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config.js'

export function createJWT ({ name, id, email, sessionId }, tokenExpTime) {
  const accessToken = jwt.sign({ name, email, sessionId }, JWT_SECRET, {
    expiresIn: tokenExpTime,
    subject: id
  })

  return accessToken
}

export async function verifyToken (token) {
  try {
    const { name, email, sessionId, sub: id } = jwt.verify(token, JWT_SECRET)
    return { data: { name, email, sessionId, id }, error: null }
  } catch (Error) {
    if (Error instanceof jwt.TokenExpiredError) {
      return { data: null, error: 'Token expired', expired: true }
    } else {
      console.error('Error verifying token:', Error)
      return { data: null, error: 'Invalid token' }
    }
  }
}
