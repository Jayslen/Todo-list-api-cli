import { createJWT, verifyToken } from '../utils/Token.js'
import { handleErrors, Unauthorized } from '../schemas/Errors.js'
import { getSession } from '../utils/getSessions.js'
import { ACCESS_TOKEN_EXP } from '../config.js'

const authenticationPaths = ['/login', '/register']

export async function isUserLoggedIn (req, res, next) {
  try {
    const isAuthPath = authenticationPaths.includes(req.path)
    const token = req.headers.authorization?.split(' ')[1]
    const refreshToken = req.headers['x-refresh-token']

    req.session = null
    if (isAuthPath && !token) return next()
    if ((!token || !refreshToken) && !isAuthPath) throw new Unauthorized('Missing token')

    const { error, data, expired } = await verifyToken(token)

    if (isAuthPath && error && !refreshToken) return next()

    if (error === 'Invalid token') {
      if (!isAuthPath) throw new Unauthorized('Invalid token')
      return next()
    }
    if (isAuthPath && data && !expired) throw new Unauthorized('Already have a session')

    if (data && !error) {
      req.session = data
      return next()
    }

    if (expired && refreshToken) {
      const { data: refresh } = expired && refreshToken ? await verifyToken(refreshToken) : { data: null }

      if (!refresh) {
        if (!isAuthPath) throw new Unauthorized()
        return next()
      }

      const session = getSession({ sessionId: refresh.sessionId })

      if (!session) {
        if (!isAuthPath) throw new Unauthorized('No session in db')
        return next()
      }

      // this should be save in cookies
      const newAccessToken = createJWT({ ...refresh }, ACCESS_TOKEN_EXP)
      req.session = await verifyToken(newAccessToken)

      if (isAuthPath) throw new Unauthorized('Alredy have a session')
    }
  } catch (Error) {
    handleErrors({ res, Error })
  }
}
