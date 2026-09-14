import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { inquirySchema } from '@/lib/validators'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = inquirySchema.parse(body)

    // Link this enquiry to an existing client where possible. Client accounts
    // are deliberately created by an administrator, not from a public form.
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phone: data.phone },
        ],
      },
    })

    let customerId: string | undefined

    if (existingUser) {
      // Link inquiry to existing customer
      const customer = await prisma.customer.findUnique({
        where: { userId: existingUser.id },
      })
      customerId = customer?.id
    }

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        customerId,
      },
    })

    return NextResponse.json({ 
      message: 'Inquiry submitted successfully',
      inquiry,
    })
  } catch (error: any) {
    console.error('Inquiry error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit inquiry' },
      { status: 400 }
    )
  }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inquiries = await prisma.inquiry.findMany({
      include: {
        customer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ inquiries })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch inquiries' },
      { status: 500 }
    )
  }
}
