import { expect, test, describe, beforeAll } from 'vitest'
import request from 'supertest'
import { createServer } from '../app'
import { TasksModel } from '../models/mysql/tasksModel'
import { AUTH_HEADER_TOKEN } from '../config.js'
import { Unauthorized, TaskNotFound } from '../schemas/Errors.js'
import { parseTestSchema } from '../schemas/tasksSchema.js'

const app = createServer({ TasksModel })
const task = {
  title: 'Leer 1 capitulo'
}

describe('unauthorized routes', () => {
  test('GET /todos with invalid JWT should throw 401 status code with json response ', async () => {
    const { statusCode, name: error, message } = new Unauthorized()
    await request(app)
      .get('/todos')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiamF5c2xlbiIsImVtYWlsIjoiamF5c2xlbkBnbWFpbC5jb20iLCJpYXQiOjE3NTAzNzAwNTksImV4cCI6MTc1MDM3MzY1OSwic3ViIjoiMjFiZjdmZTUtNDcyYS0xMWYwLTg3ZmItMzQ2ZjI0YTQxZGE0In0.sqLYDPqtYG6XDpzl1xEZXmOVR5EBHWqxH0NsvdhvyWw')
      .expect(statusCode)
      .expect({ error, message })
  })
})

let todosResponse
describe('GET /todos', () => {
  beforeAll(async () => {
    todosResponse = await request(app)
      .get('/todos')
      .set('Authorization', AUTH_HEADER_TOKEN)
  })

  test('Should return a 200 status code', async () => {
    expect(todosResponse.statusCode).toBe(200)
  })

  test('Should return a object eg : {data,limit,page,total}', async () => {
    expect(todosResponse.body).toHaveProperty('data')
    expect(todosResponse.body).toHaveProperty('limit')
    expect(todosResponse.body).toHaveProperty('page')
    expect(todosResponse.body).toHaveProperty('total')
  })
})

describe('GET /todos??page=1&limit=10', () => {
  test('should return 10 tasks', async () => {
    const res = await request(app)
      .get('/todos??page=1&limit=10')
      .set('Authorization', AUTH_HEADER_TOKEN)

    expect(res.body).toHaveProperty('limit', 10)
    expect(res.body.data).toHaveLength(10)
  })
})

describe('POST /todos', () => {
  test('Should return a 201 status code and the task created', async () => {
    const res = await request(app)
      .post('/todos')
      .set('Authorization', AUTH_HEADER_TOKEN)
      .set('Accept', 'application/json')
      .send(task)

    const dataParsed = parseTestSchema(res.body)
    expect(dataParsed.success).toBe(true)
    expect(res.statusCode).toBe(201)
  })
})

describe('PUT /todos/id', () => {
  test('Should return 400 bad request if no data is send', async () => {
    const res = await request(app)
      .put(`/todos/${4}`)
      .set('Authorization', AUTH_HEADER_TOKEN)
      .set('Accept', 'application/json')

    console.log('Update error', res.body)
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('conflicts')
    expect(res.body.conflicts).toBeTypeOf('object')
  })
})

test('Should return a 404 if task does not exist', async () => {
  const { statusCode, name, message } = new TaskNotFound()
  const res = await request(app)
    .put(`/todos/${200}`)
    .set('Authorization', AUTH_HEADER_TOKEN)
    .set('Accept', 'application/json')
    .send(task)

  expect(res.statusCode).toBe(statusCode)
  expect(res.body).toHaveProperty('error', name)
  expect(res.body).toHaveProperty('message', message)
})
