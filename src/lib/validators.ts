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

export const jobSchema = z.object({
  title: z.string().trim().min(2, 'A job title is required').max(120),
  customerId: z.string().optional().nullable(),
  inquiryId: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  clientGoal: z.string().trim().max(2000).optional().nullable(),
  internalNotes: z.string().trim().max(4000).optional().nullable(),
  location: z.string().trim().max(200).optional().nullable(),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  quotedAmount: z.number().min(0).default(0),
  services: z.array(z.object({
    serviceType: z.enum(['PHOTO_VIDEO', 'DRONE', 'PRODUCT_IMAGERY', 'PRINT', 'WEBSITE', 'SOFTWARE']),
    scope: z.string().trim().max(1000).optional().nullable(),
  })).default([]),
})

export const jobUpdateSchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  customerId: z.string().nullable().optional(),
  inquiryId: z.string().nullable().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  clientGoal: z.string().trim().max(2000).nullable().optional(),
  internalNotes: z.string().trim().max(4000).nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  startDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  quotedAmount: z.number().min(0).optional(),
  services: z.array(z.object({
    serviceType: z.enum(['PHOTO_VIDEO', 'DRONE', 'PRODUCT_IMAGERY', 'PRINT', 'WEBSITE', 'SOFTWARE']),
    scope: z.string().trim().max(1000).optional().nullable(),
  })).optional(),
  status: z.enum(['LEAD', 'SCOPED', 'QUOTE_SENT', 'CONFIRMED', 'SCHEDULED', 'IN_PRODUCTION', 'CLIENT_REVIEW', 'READY_TO_DELIVER', 'COMPLETE', 'ARCHIVED']).optional(),
})
