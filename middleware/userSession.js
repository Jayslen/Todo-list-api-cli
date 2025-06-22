import { verifyToken } from '../utils/Token.js'
import { handleErrors, Unauthorized } from '../schemas/Errors.js'

const authenticationPaths = ['/login', '/register']

export async function isUserLoggedIn (req, res, next) {
  try {
    const isAuthPath = authenticationPaths.includes(req.path)
    const token = req.headers.authorization?.split(' ')[1]
    req.session = null
    if (isAuthPath && !token) return next()

    const user = await verifyToken(token)
    // let the user auth is invalid or has expired
    if (isAuthPath && user.error) return next()

    if (!token || user.error) throw new Unauthorized()
    if (isAuthPath && user.data) throw new Unauthorized('You alredy has a session')

    if (user.data) {
      req.session = user.data
    }

    next()
  } catch (Error) {
    handleErrors({ res, Error })
  }
}
