import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const { id } = await params

    // Allow admin or the customer themselves
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            createdAt: true,
          },
        },
        invoices: {
          include: {
            items: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        albumAccess: {
          include: {
            album: {
              include: {
                media: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Check authorization
    if (session.role !== 'ADMIN' && customer.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ customer })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

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
    const { name, email, phone, adminNotes } = data

    // Get customer to find user
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Update user information
    await prisma.user.update({
      where: { id: customer.userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
      },
    })

    // Update customer admin notes if provided
    if (adminNotes !== undefined) {
      // @ts-ignore - Prisma client needs regeneration after schema update
      await prisma.customer.update({
        where: { id },
        data: { adminNotes },
      })
    }

    // Fetch updated customer
    const updatedCustomer = await prisma.customer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        invoices: true,
        albumAccess: true,
      },
    })

    return NextResponse.json({ customer: updatedCustomer })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update customer' },
      { status: 500 }
    )
  }
}

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

    // Get customer to find user
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Delete the user (which will cascade delete the customer due to schema)
    await prisma.user.delete({
      where: { id: customer.userId },
    })

    return NextResponse.json({ message: 'Customer deleted successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete customer' },
      { status: 500 }
    )
  }
}
