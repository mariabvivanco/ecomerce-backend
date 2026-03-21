import { z } from 'zod'

const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
})

const ShippingSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().default('ES'),
  phone: z.string().optional(),
})

const BillingSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nif: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().default('ES'),
  email: z.string().email(),
})

export const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  shipping: ShippingSchema,
  billing: BillingSchema,
})

export type CreateOrderPayload = z.infer<typeof CreateOrderSchema>
