import { z } from 'zod'

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  billing: z
    .object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      nif: z.string().min(1),
      address: z.string().min(1),
      city: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().default('ES'),
      phone: z.string().optional(),
    })
    .optional(),
})

export type UpdateProfilePayload = z.infer<typeof UpdateProfileSchema>
