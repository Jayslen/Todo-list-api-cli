import fs from 'node:fs/promises'
import jwt from 'jsonwebtoken'

export function createJWT ({ name, id, email }) {
  try {
    const accessToken = jwt.sign({ name, email }, 'secret', {
      expiresIn: '1m',
      subject: id
    })

    fs.writeFile('./token.txt', accessToken)
  } catch (Error) {
    console.error(Error)
  }
}

export async function verifyToken () {
  try {
    const accessToken = await fs.readFile('./token.txt', { encoding: 'utf-8' })
    return jwt.verify(accessToken, 'secret')
  } catch (Error) {
    if (Error instanceof jwt.TokenExpiredError) {
      return false
    } else {
      console.error('Error verifying token:', Error)
    }
  }
}
