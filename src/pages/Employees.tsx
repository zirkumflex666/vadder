import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Clock, Calendar, X } from 'lucide-react';
import { employeesApi } from '../lib/api/employees';
import { workingHoursApi } from '../lib/api/working-hours';
import type { Database } from '../types/supabase';
import WorkingHoursModal from '../components/employees/WorkingHoursModal';
import VacationModal from '../components/employees/VacationModal';
import EmployeeDetails from '../components/employees/EmployeeDetails';

type Employee = Database['public']['Tables']['employees']['Row'];

interface EmployeeModalProps {
  employee?: Employee | null;
  onClose: () => void;
  onSave: (data: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'auth_id'>) => Promise<void>;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ employee, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: employee?.first_name || '',
    last_name: employee?.last_name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    position: employee?.position || '',
    start_date: employee?.start_date || '',
    hourly_rate: employee?.hourly_rate || null,
    role: employee?.role || 'employee',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {employee ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vorname</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nachname</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">E-Mail</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Telefon</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <input
              type="text"
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Eintrittsdatum</label>
            <input
              type="date"
              required
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Stundensatz (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.hourly_rate || ''}
              onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value ? parseFloat(e.target.value) : null })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Rolle</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="employee">Mitarbeiter</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isWorkingHoursModalOpen, setIsWorkingHoursModalOpen] = useState(false);
  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await employeesApi.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Mitarbeiter löschen möchten?')) return;
    
    try {
      await employeesApi.delete(id);
      loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const searchString = searchTerm.toLowerCase();
    return (
      employee.first_name.toLowerCase().includes(searchString) ||
      employee.last_name.toLowerCase().includes(searchString) ||
      employee.email.toLowerCase().includes(searchString) ||
      employee.position.toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mitarbeiter</h1>
        <button
          onClick={() => {
            setEditingEmployee(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Neuer Mitarbeiter</span>
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Suche nach Mitarbeitern..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Employee list */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontakt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Eintrittsdatum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Laden...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Keine Mitarbeiter gefunden
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsDetailsModalOpen(true);
                        }}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900"
                      >
                        {employee.first_name} {employee.last_name}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{employee.email}</div>
                      <div className="text-sm text-gray-500">{employee.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(employee.start_date).toLocaleDateString('de-DE')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsWorkingHoursModalOpen(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Arbeitszeiten"
                        >
                          <Clock size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsVacationModalOpen(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Urlaub"
                        >
                          <Calendar size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingEmployee(employee);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Bearbeiten"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
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
        <EmployeeModal
          employee={editingEmployee}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEmployee(null);
          }}
          onSave={async (data) => {
            try {
              if (editingEmployee) {
                await employeesApi.update(editingEmployee.id, data);
              } else {
                await employeesApi.create(data);
              }
              loadEmployees();
              setIsModalOpen(false);
              setEditingEmployee(null);
            } catch (error) {
              console.error('Error saving employee:', error);
            }
          }}
        />
      )}

      {isWorkingHoursModalOpen && selectedEmployee && (
        <WorkingHoursModal
          employee={selectedEmployee}
          onClose={() => {
            setIsWorkingHoursModalOpen(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {isVacationModalOpen && selectedEmployee && (
        <VacationModal
          employee={selectedEmployee}
          onClose={() => {
            setIsVacationModalOpen(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {isDetailsModalOpen && selectedEmployee && (
        <EmployeeDetails
          employee={selectedEmployee}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
};

export default Employees;