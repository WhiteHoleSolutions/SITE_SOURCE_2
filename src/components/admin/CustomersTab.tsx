'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Key } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Customer {
  id: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  adminNotes?: string;
  _count?: {
    albums: number;
    invoices: number;
  };
  totalSpent?: number;
  createdAt: string;
}

export default function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [passwordData, setPasswordData] = useState({ newPassword: '' });
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (error) {
      toast.error('Failed to load customers');
      console.error(error);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });

      if (!res.ok) throw new Error('Failed to create customer');

      toast.success('Customer created successfully');
      setShowModal(false);
      setNewCustomer({ name: '', email: '', phone: '', password: '' });
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to create customer');
      console.error(error);
    }
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    try {
      const res = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingCustomer.user.name,
          email: editingCustomer.user.email,
          phone: editingCustomer.user.phone,
          adminNotes: editingCustomer.adminNotes,
        }),
      });

      if (!res.ok) throw new Error('Failed to update customer');

      toast.success('Customer updated successfully');
      setShowEditModal(false);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to update customer');
      console.error(error);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await fetch(`/api/customers/${editingCustomer.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: passwordData.newPassword }),
      });

      if (!res.ok) throw new Error('Failed to reset password');

      toast.success('Password reset successfully');
      setShowPasswordModal(false);
      setEditingCustomer(null);
      setPasswordData({ newPassword: '' });
    } catch (error) {
      toast.error('Failed to reset password');
      console.error(error);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;

    try {
      const res = await fetch(`/api/customers/${deletingCustomer.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete customer');

      toast.success('Customer deleted successfully');
      setShowDeleteDialog(false);
      setDeletingCustomer(null);
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
      console.error(error);
    }
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowEditModal(true);
  };

  const openPasswordModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowPasswordModal(true);
  };

  const openDeleteDialog = (customer: Customer) => {
    setDeletingCustomer(customer);
    setShowDeleteDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark-900">Customers</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jobs Done
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoices
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {customer.user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.user.phone || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(customer.totalSpent || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer._count?.albums || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer._count?.invoices || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(customer)}
                      className="text-primary-500 hover:text-primary-700"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openPasswordModal(customer)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Reset Password"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteDialog(customer)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {customers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-lg shadow p-4">
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-500">Name</span>
                <p className="text-sm font-medium text-gray-900">{customer.user.name}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Email</span>
                <p className="text-sm text-gray-900">{customer.user.email}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Phone</span>
                <p className="text-sm text-gray-900">{customer.user.phone || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-xs text-gray-500">Total Spent</span>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(customer.totalSpent || 0)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Jobs Done</span>
                  <p className="text-sm text-gray-900">{customer._count?.albums || 0}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Invoices</span>
                  <p className="text-sm text-gray-900">{customer._count?.invoices || 0}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => openEditModal(customer)}
                  className="flex-1 text-primary-500 hover:text-primary-700 py-2 px-3 border border-primary-500 rounded-lg flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => openPasswordModal(customer)}
                  className="flex-1 text-blue-600 hover:text-blue-800 py-2 px-3 border border-blue-600 rounded-lg flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Password
                </button>
                <button
                  onClick={() => openDeleteDialog(customer)}
                  className="flex-1 text-red-500 hover:text-red-700 py-2 px-3 border border-red-500 rounded-lg flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-dark-900">Create Customer</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-dark-900">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-dark-900">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-dark-900">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-dark-900">
                  Password
                </label>
                <input
                  type="password"
                  value={newCustomer.password}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                  placeholder="Leave blank to auto-generate"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If left blank, a random password will be generated
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setNewCustomer({ name: '', email: '', phone: '', password: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-dark-900">Edit Customer</h3>
            <form onSubmit={handleEditCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-dark-900">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingCustomer.user.name}
                  onChange={(e) =>
                    setEditingCustomer({ 
                      ...editingCustomer, 
                      user: { ...editingCustomer.user, name: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-dark-900">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={editingCustomer.user.email}
                  onChange={(e) =>
                    setEditingCustomer({ 
                      ...editingCustomer, 
                      user: { ...editingCustomer.user, email: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-dark-900">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={editingCustomer.user.phone || ''}
                  onChange={(e) =>
                    setEditingCustomer({ 
                      ...editingCustomer, 
                      user: { ...editingCustomer.user, phone: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-dark-900">
                  Admin Notes
                </label>
                <textarea
                  value={editingCustomer.adminNotes || ''}
                  onChange={(e) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      adminNotes: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                  placeholder="Notes not visible to customer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  These notes are only visible to admins
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCustomer(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-dark-900">
              Reset Password for {editingCustomer.user.name}
            </h3>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-dark-900">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ newPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                  placeholder="Enter new password (min 6 chars)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setEditingCustomer(null);
                    setPasswordData({ newPassword: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && deletingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-dark-900">Delete Customer</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete{' '}
              <strong>{deletingCustomer.user.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletingCustomer(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
