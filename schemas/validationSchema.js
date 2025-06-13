import z from 'zod/v4'

const registerUserSchema = z.object({
  name: z.string('Name should be a string').min(4).max(15),
  email: z.email('Type a correct email').optional().default(null),
  password: z.string('Password should be a string').min(8).max(20)
})

const loginUserSchema = z.object({
  name: z.string(),
  password: z.string()
})

export const parseLoginUser = (input) => {
  return loginUserSchema.safeParse(input)
}

export const parseRegisterUser = (input) => {
  return registerUserSchema.safeParse(input)
}
