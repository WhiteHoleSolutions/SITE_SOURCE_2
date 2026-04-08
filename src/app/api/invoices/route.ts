import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { invoiceSchema } from '@/lib/validators'
import { generateInvoiceNumber } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let invoices

    if (session.role === 'ADMIN') {
      invoices = await prisma.invoice.findMany({
        include: {
          items: true,
          customer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      // Customer can only see their own invoices
      const customer = await prisma.customer.findUnique({
        where: { userId: session.userId },
      })

      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }

      invoices = await prisma.invoice.findMany({
        where: { customerId: customer.id },
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json({ invoices })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = invoiceSchema.parse(body)

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice)
    }, 0)

    const total = subtotal + data.tax

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        customerId: data.customerId,
        status: 'DRAFT',
        subtotal,
        tax: data.tax,
        total,
        notes: data.notes,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        paymentLink: data.paymentLink || null,
        items: {
          create: data.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json({ invoice })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create invoice' },
      { status: 400 }
    )
  }
}
