import { verifyToken } from '../utils/Token.js'
const authenticationPaths = ['/login', '/register']

export async function isUserLoggedIn (req, res, next) {
  let user
  req.session = null

  try {
    user = await verifyToken()
    if (user) {
      req.session = user
    }
  } catch (Error) {
    console.error(Error)
  }
  const isAuthPath = authenticationPaths.includes(req.path)
  req.session = null

  if (user && isAuthPath) {
    return res.status(403).json({ msg: 'Esta autentificado' })
  }

  if (isAuthPath) return next()

  if (!user) return res.status(403).send('Not auth')

  next()
}
