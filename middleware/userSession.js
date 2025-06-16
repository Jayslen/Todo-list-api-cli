import { verifyToken } from '../utils/Token.js'

export async function isUserLoggedIn (req, res, next) {
  const user = await verifyToken()
  if (user) {
    req.session = { id: user.sub, name: user.name, email: user.email }
  } else {
    req.session = null
  }
  next()
}
