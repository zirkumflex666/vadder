import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Building2, User } from 'lucide-react';
import { customersApi } from '../lib/api/customers';
import type { Database } from '../types/supabase';
import CustomerModal from '../components/customers/CustomerModal';
import CustomerDetails from '../components/customers/CustomerDetails';

type Customer = Database['public']['Tables']['customers']['Row'];

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Kunden löschen möchten?')) return;
    
    try {
      await customersApi.delete(id);
      loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const searchString = searchTerm.toLowerCase();
    return (
      customer.company_name?.toLowerCase().includes(searchString) ||
      customer.first_name.toLowerCase().includes(searchString) ||
      customer.last_name.toLowerCase().includes(searchString) ||
      customer.email?.toLowerCase().includes(searchString) ||
      customer.city.toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kunden</h1>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Neuer Kunde</span>
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Suche nach Kunden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontakt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Laden...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Keine Kunden gefunden
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsDetailsOpen(true);
                        }}
                        className="flex items-center space-x-3 text-blue-600 hover:text-blue-900"
                      >
                        {customer.company_name ? (
                          <Building2 size={20} className="text-gray-400" />
                        ) : (
                          <User size={20} className="text-gray-400" />
                        )}
                        <div className="text-left">
                          {customer.company_name && (
                            <div className="font-medium">{customer.company_name}</div>
                          )}
                          <div className={customer.company_name ? "text-sm text-gray-500" : "font-medium"}>
                            {customer.first_name} {customer.last_name}
                          </div>
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {customer.street} {customer.house_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.postal_code} {customer.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setEditingCustomer(customer);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Bearbeiten"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Löschen"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCustomer(null);
          }}
          onSave={async (data) => {
            try {
              if (editingCustomer) {
                await customersApi.update(editingCustomer.id, data);
              } else {
                await customersApi.create(data);
              }
              loadCustomers();
              setIsModalOpen(false);
              setEditingCustomer(null);
            } catch (error) {
              console.error('Error saving customer:', error);
            }
          }}
        />
      )}

      {isDetailsOpen && selectedCustomer && (
        <CustomerDetails
          customer={selectedCustomer}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedCustomer(null);
          }}
          onCustomerUpdate={loadCustomers}
        />
      )}
    </div>
  );
};

export default Customers;