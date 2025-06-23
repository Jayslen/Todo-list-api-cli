import z from 'zod'

const tasksSchema = z.object({
  title: z.string().min(5).max(20),
  description: z.string().max(80).default(null).optional()
})

const taskTestSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  date: z.string()
})

export function parseTask (input) {
  return tasksSchema.safeParse(input)
}

export function parseTaskForUpdate (input) {
  return tasksSchema.partial().safeParse(input)
}

export function parseTestSchema (input) {
  return taskTestSchema.safeParse(input)
}
