class UsersNotFound extends Error {
  constructor (message = 'User does not exist') {
    super(message)
    this.name = 'UsersNotFound'
    this.statusCode = 404
  }
}

class UserFound extends Error {
  constructor (message = 'This user is taken') {
    super(message)
    this.name = 'User found'
    this.statusCode = 409
  }
}

class TaskNotFound extends Error {
  constructor (message = 'No tasks where found with this id') {
    super(message)
    this.name = 'TaskNotFound'
    this.statusCode = 404
  }
}

class Unauthorized extends Error {
  constructor (message = 'This route is protected') {
    super(message)
    this.name = 'Unauthorized'
    this.statusCode = 401
  }
}

class Forbidden extends Error {
  constructor (message = 'You allowed to complete the operation') {
    super(message)
    this.name = 'Forbidden'
    this.statusCode = 403
  }
}

class DataBadRequest extends Error {
  constructor (conflicts, message = 'Bad request with the data expected') {
    super(message)
    this.name = 'No data received'
    this.statusCode = 400
    this.conflicts = conflicts
  }
}

class ToManyRequest extends Error {
  constructor (message = 'Too many requests. Please try later') {
    super()
    this.message = message
    this.name = 'ToManyRequest'
    this.statusCode = 429
  }
}

const customErrors = [UsersNotFound, UserFound, TaskNotFound, Unauthorized, Forbidden, DataBadRequest, ToManyRequest]

function handleErrors ({ res, Error }) {
  console.error(Error)
  let name = 'Internal Error'; let statusCode = 500
  const isCustomError = customErrors.some(customError => Error instanceof customError)
  if (isCustomError) {
    name = Error.name
    statusCode = Error.statusCode
  }

  res.status(statusCode).json({
    error: name,
    message: isCustomError ? Error.message : 'An unexpected error happend.Try again',
    conflicts: Error?.conflicts
  })
}

export { UsersNotFound, UserFound, TaskNotFound, Unauthorized, Forbidden, DataBadRequest, ToManyRequest, handleErrors }
