import { verifyToken } from '../utils/Token.js'
const authenticationPaths = ['/login', '/register']

export async function isUserLoggedIn (req, res, next) {
  const isAuthPath = authenticationPaths.includes(req.path)
  const token = req.headers.authorization?.split(' ')[1]
  req.session = null
  if (isAuthPath && !token) return next()

  const user = await verifyToken(token)
  // let the user auth is invalid or has expired
  if (isAuthPath && user.error) return next()

  if (!token || user.error) return res.status(401).json({ message: 'Unauthorized' })
  if (isAuthPath && user.data) return res.status(401).json({ message: 'Unauthorized you are logged in' })

  if (user.data) {
    req.session = user.data
  }

  next()
}
