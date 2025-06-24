# Todo list REST API.
This project is built with nodeJS, express for handle server request and MySql as a database. This project is from [Roadmap.sh](https://roadmap.sh/projects/todo-list-api),
the purpose of it is, build a REST api that has to be able to: create, update, delete and get todos from a user and has user auth.

## Description
The project uses JWT to handle user auth and uses bcrypt for encrypt the password , it has a middleware for check the Token every request the user does, the token has to be
in the header ```Authorization: Bearer tokenxxxxx```. The app has some basic test included developed with vitest and supertest.
Another important features are the errors handling.The Error.js Schema has multiples classes that extens the Error class and create an own error. 

### Project structure
```
├── controller/              # Contains the logic of requests and the response of endpoints
├── models/                  # Handles the data store in DB and serve it to the controller
├── middleware/               
├── schemas/                 # Validation Schemas for data, errors 
├── test /                   # Basic test for some enpoints
├── utils /                  # Helpers functions
├── config.js                # default config. Values take for .env file
├── routes.js                # API route definitions
├── app.js                   # function for create the server that takes the model need it and return the server initiated
├── server.js                # Running server
├── server-with-local.js     # Server setup using local storage
├── server-with-mongo.js     # Server setup using MongoDB
```


### Enpoints.
```
├── GET todos?page=1&limit=10     # Return all the taks created by the user logged in.
├── POST register/                # Params {name: required, email: optional, password: required} return the token.
├── POST login/                   # Params {name, password} return the token.
├── POST /todos                   # Params {title: required, description: optional} return the todo created.
├── PUT todos/id                  # Params {title: optional, description: optional} return the todo updated.
├── DELETE todos/id               # Return a 200 status code after delete the todo.
```

## installation

```
git clone
npm install
- Create a mysql db with the query db_query.sql
- Modify the config variables if need it.
- Then run:
npm run start
```
### Pending tasks
- Refresh Token
- Rate limiting and throttling for the API
- Refresh token mechanism for the authentication
