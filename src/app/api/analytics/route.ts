import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build date filter
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999) // End of day
      dateFilter.lte = end
    }

    // Fetch invoices
    const invoices = await prisma.invoice.findMany({
      where: startDate || endDate ? { createdAt: dateFilter } : undefined,
      include: {
        items: true,
      },
    })

    // Fetch expenses
    const expenses = await prisma.expense.findMany({
      where: startDate || endDate ? { expenseDate: dateFilter } : undefined,
    })

    // Fetch bills of sale
    const billsOfSale = await prisma.billOfSale.findMany({
      where: startDate || endDate ? { saleDate: dateFilter } : undefined,
    })

    // Calculate invoice metrics
    const totalInvoiceRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const paidInvoiceRevenue = invoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.total, 0)
    const unpaidInvoiceRevenue = invoices
      .filter((inv) => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
      .reduce((sum, inv) => sum + inv.total, 0)
    const invoiceGst = invoices.reduce((sum, inv) => sum + inv.tax, 0)
    const paidInvoiceGst = invoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.tax, 0)

    // Calculate expense metrics
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const expenseGst = expenses.reduce((sum, exp) => sum + (exp.gstAmount || 0), 0)

    // Calculate expenses by category
    const expensesByCategory = expenses.reduce((acc: any, exp) => {
      const category = exp.category
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0 }
      }
      acc[category].total += exp.amount
      acc[category].count += 1
      return acc
    }, {})

    // Calculate bills of sale metrics
    const equipmentBought = billsOfSale
      .filter((b) => b.type === 'BOUGHT')
      .reduce((sum, b) => sum + b.salePrice, 0)
    const equipmentSold = billsOfSale
      .filter((b) => b.type === 'SOLD')
      .reduce((sum, b) => sum + b.salePrice, 0)
    const billsGst = billsOfSale.reduce((sum, b) => sum + (b.gstAmount || 0), 0)
    const boughtBillsGst = billsOfSale
      .filter((b) => b.type === 'BOUGHT')
      .reduce((sum, b) => sum + (b.gstAmount || 0), 0)
    const soldBillsGst = billsOfSale
      .filter((b) => b.type === 'SOLD')
      .reduce((sum, b) => sum + (b.gstAmount || 0), 0)

    // Calculate profit/loss
    const totalRevenue = paidInvoiceRevenue + equipmentSold
    const totalCosts = totalExpenses + equipmentBought
    const profitLoss = totalRevenue - totalCosts

    // Calculate GST position (GST collected - GST paid)
    const gstCollected = paidInvoiceGst + soldBillsGst
    const gstPaid = expenseGst + boughtBillsGst
    const gstPosition = gstCollected - gstPaid

    // Invoice status breakdown
    const invoicesByStatus = invoices.reduce((acc: any, inv) => {
      const status = inv.status
      if (!acc[status]) {
        acc[status] = { count: 0, total: 0 }
      }
      acc[status].count += 1
      acc[status].total += inv.total
      return acc
    }, {})

    // Monthly breakdown (last 12 months)
    const monthlyData = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)

      const monthInvoices = invoices.filter(
        (inv) =>
          new Date(inv.createdAt) >= monthStart && new Date(inv.createdAt) <= monthEnd && inv.status === 'PAID'
      )
      const monthExpenses = expenses.filter(
        (exp) => new Date(exp.expenseDate) >= monthStart && new Date(exp.expenseDate) <= monthEnd
      )

      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0)
      const costs = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0)

      monthlyData.push({
        month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue,
        expenses: costs,
        profit: revenue - costs,
      })
    }

    const analytics = {
      summary: {
        totalRevenue,
        paidInvoiceRevenue,
        unpaidInvoiceRevenue,
        totalExpenses,
        equipmentBought,
        equipmentSold,
        profitLoss,
        profitMargin: totalRevenue > 0 ? (profitLoss / totalRevenue) * 100 : 0,
      },
      tax: {
        gstCollected,
        gstPaid,
        gstPosition,
        invoiceGst,
        expenseGst,
        billsGst,
      },
      invoices: {
        total: invoices.length,
        byStatus: invoicesByStatus,
        totalRevenue: totalInvoiceRevenue,
        paidRevenue: paidInvoiceRevenue,
        unpaidRevenue: unpaidInvoiceRevenue,
      },
      expenses: {
        total: expenses.length,
        totalAmount: totalExpenses,
        byCategory: expensesByCategory,
      },
      billsOfSale: {
        total: billsOfSale.length,
        bought: billsOfSale.filter((b) => b.type === 'BOUGHT').length,
        sold: billsOfSale.filter((b) => b.type === 'SOLD').length,
        equipmentBought,
        equipmentSold,
        netEquipment: equipmentSold - equipmentBought,
      },
      monthly: monthlyData,
    }

    return NextResponse.json({ analytics })
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
