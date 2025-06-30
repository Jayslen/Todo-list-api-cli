import { REFILL_INTERVAL, TOKEN_RATE, BUCKET_SIZE } from '../config.js'
import { handleErrors, ToManyRequest } from '../schemas/Errors.js'

const bucket = []

export function rateLimit (req, res, next) {
  try {
    const now = new Date()

    let userBucket = bucket.find(data => data.ip === req.ip)

    if (!userBucket) {
      userBucket = { ip: req.ip, tokens: BUCKET_SIZE, lastRefilled: new Date() }
      bucket.push(userBucket)
    }

    const timePassed = now - userBucket.lastRefilled
    const tokensToAdd = Math.floor(timePassed / REFILL_INTERVAL) * TOKEN_RATE

    if (tokensToAdd > 0) {
      userBucket.tokens = Math.min(BUCKET_SIZE, userBucket.tokens + tokensToAdd)
      userBucket.lastRefilled = now
    }

    if (userBucket.tokens <= 0) throw new ToManyRequest()

    userBucket.tokens -= 1

    next()
  } catch (Error) {
    handleErrors({ Error, res })
  }
}
