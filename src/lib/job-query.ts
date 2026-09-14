export const jobWorkspaceInclude = {
  customer: { include: { user: { select: { name: true, email: true } } } },
  inquiry: { select: { id: true, name: true, email: true, status: true, message: true } },
  services: { orderBy: { createdAt: 'asc' as const } },
  tasks: { orderBy: [{ createdAt: 'asc' as const }, { id: 'asc' as const }] },
  invoices: { select: { id: true, invoiceNumber: true, status: true, total: true, tax: true, currency: true } },
  expenses: { select: { id: true, expenseNumber: true, description: true, amount: true, gstAmount: true, vendor: true } },
  albums: { include: { album: { select: { id: true, title: true, type: true, _count: { select: { media: true } } } } } },
}
