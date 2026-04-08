import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { inquirySchema } from '@/lib/validators'
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth'
import { generatePassword } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = inquirySchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phone: data.phone },
        ],
      },
    })

    let customerId: string | undefined

    // Create customer profile if valid email/phone and doesn't exist
    if (!existingUser) {
      const password = generatePassword()
      const hashedPassword = await hashPassword(password)

      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          phone: data.phone,
          role: 'CUSTOMER',
          customer: {
            create: {},
          },
        },
        include: {
          customer: true,
        },
      })

      customerId = user.customer?.id

      // TODO: Send email/SMS with login credentials
      console.log(`New customer created: ${data.email} | Password: ${password}`)
    } else {
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
