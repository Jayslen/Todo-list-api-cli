import jwt from 'jsonwebtoken'
import { TOKEN_EXPIRE } from '../config.js'

export function createJWT ({ name, id, email }) {
  const accessToken = jwt.sing({ name, email }, 'secret', {
    expiresIn: TOKEN_EXPIRE,
    subject: id
  })

  return accessToken
}

export async function verifyToken (token) {
  try {
    const userData = jwt.verify(token, 'secret')
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
