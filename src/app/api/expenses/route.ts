import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/expenses - Get all expenses
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const expenses = await prisma.expense.findMany({
      orderBy: { expenseDate: 'desc' },
    })

    return NextResponse.json({ expenses })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

// POST /api/expenses - Create new expense
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()

    // Generate expense number (EXP-YYYYMMDD-XXX format)
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const count = await prisma.expense.count()
    const expenseNumber = `EXP-${dateStr}-${String(count + 1).padStart(3, '0')}`

    // Calculate GST amount if applicable
    const amount = parseFloat(data.amount)
    let gstAmount = null
    if (data.includeGst) {
      // GST = amount × (10/110) for GST inclusive
      gstAmount = amount * (10 / 110)
    }

    const expense = await prisma.expense.create({
      data: {
        expenseNumber,
        description: data.description,
        category: data.category,
        amount,
        gstAmount,
        vendor: data.vendor,
        paymentMethod: data.paymentMethod,
        expenseDate: new Date(data.expenseDate),
        receiptUrl: data.receiptUrl,
        notes: data.notes,
      },
    })

    return NextResponse.json({ expense })
  } catch (error: any) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create expense' },
      { status: 500 }
    )
  }
}
