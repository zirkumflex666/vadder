import React, { useState, useEffect } from 'react';
import { X, FileText, MapPin, Phone, Mail, Building2, User } from 'lucide-react';
import type { Database } from '../../types/supabase';
import { projectsApi } from '../../lib/api/projects';

type Customer = Database['public']['Tables']['customers']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];

interface CustomerDetailsProps {
  customer: Customer;
  onClose: () => void;
  onCustomerUpdate: () => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer, onClose, onCustomerUpdate }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [customer.id]);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.getAll();
      const customerProjects = data.filter(p => p.customer_id === customer.id);
      setProjects(customerProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800',
      planned: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels = {
      new: 'Neu',
      planned: 'Geplant',
      in_progress: 'In Bearbeitung',
      completed: 'Abgeschlossen',
      cancelled: 'Storniert',
    };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            {customer.company_name ? (
              <Building2 size={24} className="text-gray-400" />
            ) : (
              <User size={24} className="text-gray-400" />
            )}
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {customer.company_name || `${customer.first_name} ${customer.last_name}`}
              </h3>
              {customer.company_name && (
                <p className="text-sm text-gray-500">
                  {customer.first_name} {customer.last_name}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 mb-3">Kontaktinformationen</h4>
            <div className="space-y-3">
              {customer.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="text-gray-400" size={20} />
                  <a href={`mailto:${customer.email}`} className="text-blue-600 hover:text-blue-800">
                    {customer.email}
                  </a>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="text-gray-400" size={20} />
                  <a href={`tel:${customer.phone}`} className="text-blue-600 hover:text-blue-800">
                    {customer.phone}
                  </a>
                </div>
              )}
              <div className="flex items-start space-x-2">
                <MapPin className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-gray-900">{customer.street} {customer.house_number}</p>
                  <p className="text-gray-900">{customer.postal_code} {customer.city}</p>
                  <p className="text-gray-500">{customer.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Pricing */}
          {customer.custom_pricing && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-3">Individuelle Preise</h4>
              <div className="space-y-2">
                {Object.entries(customer.custom_pricing as Record<string, number>).map(([service, price]) => (
                  <div key={service} className="flex justify-between">
                    <span className="text-gray-600">{service}</span>
                    <span className="font-medium">{price.toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Aufträge</h4>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auftrag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Termine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ort
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
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Keine Aufträge vorhanden
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{project.title}</div>
                        {project.description && (
                          <div className="text-sm text-gray-500">{project.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(project.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {project.planned_date && (
                            <div className="text-sm">
                              <span className="text-gray-500">Geplant: </span>
                              <span className="text-gray-900">
                                {new Date(project.planned_date).toLocaleDateString('de-DE')}
                              </span>
                            </div>
                          )}
                          {project.execution_date && (
                            <div className="text-sm">
                              <span className="text-gray-500">Ausführung: </span>
                              <span className="text-gray-900">
                                {new Date(project.execution_date).toLocaleDateString('de-DE')}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {project.location_street} {project.location_house_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {project.location_postal_code} {project.location_city}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;