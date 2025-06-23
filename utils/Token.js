import jwt from 'jsonwebtoken'
import { JWT_SECRET, TOKEN_EXPIRE } from '../config.js'

export function createJWT ({ name, id, email }) {
  const accessToken = jwt.sign({ name, email }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRE,
    subject: id
  })

  return accessToken
}

export async function verifyToken (token) {
  try {
    const userData = jwt.verify(token, JWT_SECRET)
    return { data: userData, error: null }
  } catch (Error) {
    if (Error instanceof jwt.TokenExpiredError) {
      return { data: null, error: 'Token expired' }
    } else {
      console.error('Error verifying token:', Error)
      return { data: null, error: 'Invalid token' }
    }
  }
}
