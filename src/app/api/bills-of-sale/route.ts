import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/bills-of-sale - Get all bills of sale
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bills = await prisma.billOfSale.findMany({
      orderBy: { saleDate: 'desc' },
    })

    return NextResponse.json({ bills })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bills of sale' },
      { status: 500 }
    )
  }
}

// POST /api/bills-of-sale - Create new bill of sale
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()

    // Generate bill number (BOS-YYYYMMDD-XXX format)
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const count = await prisma.billOfSale.count()
    const billNumber = `BOS-${dateStr}-${String(count + 1).padStart(3, '0')}`

    // Calculate GST if included
    let gstAmount = null
    if (data.gstIncluded) {
      const salePrice = parseFloat(data.salePrice)
      // GST = sale price × (tax rate / (100 + tax rate))
      // For 10% GST: GST = price × (10/110) = price × 0.0909090909
      gstAmount = salePrice * (10 / 110)
    }

    const bill = await prisma.billOfSale.create({
      data: {
        billNumber,
        type: data.type,
        sellerName: data.sellerName,
        sellerAddress: data.sellerAddress,
        sellerPhone: data.sellerPhone,
        sellerEmail: data.sellerEmail,
        buyerName: data.buyerName,
        buyerAddress: data.buyerAddress,
        buyerPhone: data.buyerPhone,
        buyerEmail: data.buyerEmail,
        equipmentType: data.equipmentType,
        description: data.description,
        serialNumber: data.serialNumber,
        condition: data.condition,
        salePrice: parseFloat(data.salePrice),
        gstIncluded: data.gstIncluded,
        gstAmount,
        saleDate: new Date(data.saleDate),
        notes: data.notes,
      },
    })

    return NextResponse.json({ bill })
  } catch (error: any) {
    console.error('Error creating bill of sale:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create bill of sale' },
      { status: 500 }
    )
  }
}
