import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
})

export const albumSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  type: z.enum(['PUBLIC', 'PRIVATE']),
  coverImage: z.string().optional(),
})

export const invoiceItemSchema = z.object({
  description: z.string().min(2, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
})

export const invoiceSchema = z.object({
  customerId: z.string(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  tax: z.number().min(0).default(0),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
  paymentLink: z.string().url().optional().or(z.literal('')),
})
