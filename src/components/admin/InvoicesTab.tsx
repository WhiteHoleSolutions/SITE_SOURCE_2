'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Download, Edit2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  items: InvoiceItem[];
  tax: number;
  notes: string | null;
  dueDate: string;
  paymentLink: string | null;
  status: string;
  paidAt: string | null;
  createdAt: string;
  total: number;
}

interface Customer {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface NewInvoice {
  customerId: string;
  items: InvoiceItem[];
  tax: number;
  notes: string;
  dueDate: string;
  paymentLink: string;
  status: string;
}

export default function InvoicesTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [newInvoice, setNewInvoice] = useState<NewInvoice>({
    customerId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    tax: 0,
    notes: '',
    dueDate: '',
    paymentLink: '',
    status: 'DRAFT',
  });

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      toast.error('Failed to load invoices');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      toast.error('Failed to load customers');
    }
  };

  const handleDownloadPDF = async (id: string, invoiceNumber: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}/pdf`);
      if (!response.ok) throw new Error('Failed to download PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice),
      });

      if (!response.ok) throw new Error('Failed to create invoice');

      toast.success('Invoice created successfully');
      fetchInvoices();
      closeModal();
    } catch (error) {
      toast.error('Failed to create invoice');
    }
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setNewInvoice({
      customerId: invoice.customerId,
      items: invoice.items,
      tax: invoice.tax,
      notes: invoice.notes || '',
      dueDate: invoice.dueDate,
      paymentLink: invoice.paymentLink || '',
      status: invoice.status,
    });
    setShowModal(true);
  };

  const handleUpdateInvoice = async () => {
    if (!editingInvoice) return;

    try {
      const response = await fetch(`/api/invoices/${editingInvoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice),
      });

      if (!response.ok) throw new Error('Failed to update invoice');

      toast.success('Invoice updated successfully');
      fetchInvoices();
      closeModal();
    } catch (error) {
      toast.error('Failed to update invoice');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete invoice');

      toast.success('Invoice deleted successfully');
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingInvoice(null);
    setNewInvoice({
      customerId: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      tax: 0,
      notes: '',
      dueDate: '',
      paymentLink: '',
      status: 'DRAFT',
    });
  };

  const addInvoiceItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', quantity: 1, unitPrice: 0 }],
    });
  };

  const removeInvoiceItem = (index: number) => {
    setNewInvoice({
      ...newInvoice,
      items: newInvoice.items.filter((_, i) => i !== index),
    });
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...newInvoice.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const calculateSubtotal = () => {
    return newInvoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + newInvoice.tax;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark-900">Invoices</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paid Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-900">
                  {invoice.invoiceNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-900">
                  {invoice.customer.user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-900">
                  {formatDate(invoice.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-900">
                  {formatCurrency(invoice.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-900">
                  {invoice.paidAt ? formatDate(invoice.paidAt) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleDownloadPDF(invoice.id, invoice.invoiceNumber)}
                    className="text-primary-500 hover:text-primary-700"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditInvoice(invoice)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteInvoice(invoice.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-dark-900">{invoice.invoiceNumber}</p>
                <p className="text-sm text-dark-900">{invoice.customer.user.name}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                {invoice.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Date</p>
                <p className="text-dark-900">{formatDate(invoice.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">Amount</p>
                <p className="text-dark-900">{formatCurrency(invoice.total)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Paid Date</p>
                <p className="text-dark-900">{invoice.paidAt ? formatDate(invoice.paidAt) : '-'}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={() => handleDownloadPDF(invoice.id, invoice.invoiceNumber)}
                className="flex-1 bg-primary-500 text-white px-3 py-2 rounded-lg hover:bg-primary-600 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={() => handleEditInvoice(invoice)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDeleteInvoice(invoice.id)}
                className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-bold text-dark-900">
                {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-900 mb-2">
                    Customer *
                  </label>
                  <select
                    value={newInvoice.customerId}
                    onChange={(e) => setNewInvoice({ ...newInvoice, customerId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-dark-900 placeholder-gray-400"
                    required
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-900 mb-2">
                    Status *
                  </label>
                  <select
                    value={newInvoice.status}
                    onChange={(e) => setNewInvoice({ ...newInvoice, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-dark-900 placeholder-gray-400"
                    required
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="SENT">SENT</option>
                    <option value="PAID">PAID</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-dark-900">
                    Invoice Items
                  </label>
                  <button
                    onClick={addInvoiceItem}
                    className="text-primary-500 hover:text-primary-700 flex items-center gap-1 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {newInvoice.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-12 md:col-span-5">
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-dark-900 placeholder-gray-400"
                        />
                      </div>
                      <div className="col-span-5 md:col-span-3">
                        <input
                          type="number"
                          placeholder="Quantity"
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-dark-900 placeholder-gray-400"
                        />
                      </div>
                      <div className="col-span-5 md:col-span-3">
                        <input
                          type="number"
                          placeholder="Unit Price"
                          value={item.unitPrice}
                          onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-dark-900 placeholder-gray-400"
                          step="0.01"
                        />
                      </div>
                      {newInvoice.items.length > 1 && (
                        <div className="col-span-2 md:col-span-1">
                          <button
                            onClick={() => removeInvoiceItem(index)}
                            className="text-red-600 hover:text-red-900 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-900 mb-2">
                    Tax
                  </label>
                  <input
                    type="number"
                    value={newInvoice.tax}
                    onChange={(e) => setNewInvoice({ ...newInvoice, tax: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-dark-900 placeholder-gray-400"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-900 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-dark-900 placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-900 mb-2">
                  Payment Link (Revolut)
                </label>
                <input
                  type="text"
                  value={newInvoice.paymentLink}
                  onChange={(e) => setNewInvoice({ ...newInvoice, paymentLink: e.target.value })}
                  placeholder="https://revolut.me/..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-dark-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-900 mb-2">
                  Notes
                </label>
                <textarea
                  value={newInvoice.notes}
                  onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-dark-900 placeholder-gray-400"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-900">Subtotal:</span>
                  <span className="text-dark-900">{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-900">Tax:</span>
                  <span className="text-dark-900">{formatCurrency(newInvoice.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span className="text-dark-900">Total:</span>
                  <span className="text-dark-900">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={editingInvoice ? handleUpdateInvoice : handleCreateInvoice}
                  className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
                >
                  {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-dark-900 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
