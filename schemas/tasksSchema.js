import z from 'zod'

const tasksSchema = z.object({
  title: z.string().min(5).max(20),
  description: z.string().max(80).default(null).optional()
})

export function parseTask (input) {
  return tasksSchema.safeParse(input)
}
