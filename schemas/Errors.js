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
    this.statusCode = 404
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

const customErrors = [UsersNotFound, UserFound, TaskNotFound, Unauthorized]

function handleErrors ({ res, Error }) {
  console.error(Error)
  let name = 'Internal Error'; let statusCode = 500
  const isCustomError = customErrors.some(customError => Error instanceof customError)
  if (isCustomError) {
    name = Error.name
    statusCode = Error.statusCode
  }

  res.status(statusCode).json({ errorName: name, errorCause: isCustomError ? Error.message : 'An unexpected error happend.Try again' })
}

export { UsersNotFound, UserFound, TaskNotFound, Unauthorized, handleErrors }
