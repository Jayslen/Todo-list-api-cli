import jwt from 'jsonwebtoken'
import { TOKEN_EXPIRE } from '../config.js'

export function createJWT ({ name, id, email }) {
  try {
    const accessToken = jwt.sign({ name, email }, 'secret', {
      expiresIn: TOKEN_EXPIRE,
      subject: id
    })

    return accessToken
  } catch (Error) {
    console.error(Error)
  }
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
