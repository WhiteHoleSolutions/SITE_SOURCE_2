import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// PATCH /api/invoices/[id] - Update invoice
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const { id } = await params

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Calculate totals
    const items = data.items.map((item: any) => ({
      description: item.description,
      quantity: parseInt(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
      total: parseInt(item.quantity) * parseFloat(item.unitPrice),
    }))

    const subtotal = items.reduce((sum: number, item: any) => sum + item.total, 0)
    const tax = data.tax ? parseFloat(data.tax) : subtotal * 0.1
    const total = subtotal + tax

    // Delete existing items
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: id },
    })

    // Update invoice with new items
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        customerId: data.customerId,
        status: data.status,
        subtotal,
        tax,
        total,
        notes: data.notes,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        paymentLink: data.paymentLink,
        items: {
          create: items,
        },
      },
      include: {
        items: true,
        customer: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json({ invoice })
  } catch (error: any) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update invoice' },
      { status: 500 }
    )
  }
}

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const { id } = await params

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.invoice.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Invoice deleted successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}
