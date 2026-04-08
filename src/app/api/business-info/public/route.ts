import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Force dynamic rendering - don't try to prerender during build
export const dynamic = 'force-dynamic'

// GET /api/business-info/public - Get public business information (no auth required)
export async function GET(req: NextRequest) {
  try {
    // Get the first (and should be only) business info record
    let businessInfo = await prisma.businessInfo.findFirst()

    // If no business info exists, create default one
    if (!businessInfo) {
      businessInfo = await prisma.businessInfo.create({
        data: {
          businessName: 'White Hole Solutions',
          country: 'Australia',
          taxRate: 10.0,
          paymentTerms: 'Net 30',
        },
      })
    }

    // Return only public fields
    return NextResponse.json({
      businessInfo: {
        businessName: businessInfo.businessName,
        email: businessInfo.email,
        phone: businessInfo.phone,
        address: businessInfo.address,
        suburb: businessInfo.suburb,
        state: businessInfo.state,
        postcode: businessInfo.postcode,
        country: businessInfo.country,
        website: businessInfo.website,
      },
    })
  } catch (error) {
    console.error('Error fetching business info:', error)
    return NextResponse.json({ error: 'Failed to fetch business info' }, { status: 500 })
  }
}
