import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Database } from '../../types/supabase';
import { supabase } from '../../lib/supabase';
import { employeesApi } from '../../lib/api/employees';

type Employee = Database['public']['Tables']['employees']['Row'];
type Assignment = Database['public']['Tables']['project_assignments']['Row'];

interface AssignmentModalProps {
  projectId: string;
  assignment?: Assignment;
  onClose: () => void;
  onSave: () => void;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  projectId,
  assignment,
  onClose,
  onSave,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employee_id: assignment?.employee_id || '',
    role: assignment?.role || '',
    planned_hours: assignment?.planned_hours || 0,
    actual_hours: assignment?.actual_hours || 0,
    start_date: assignment?.start_date || '',
    end_date: assignment?.end_date || '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await employeesApi.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      setError('Fehler beim Laden der Mitarbeiter');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (assignment) {
        const { error } = await supabase
          .from('project_assignments')
          .update(formData)
          .eq('id', assignment.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('project_assignments')
          .insert({
            ...formData,
            project_id: projectId,
          });

        if (error) throw error;
      }
      await onSave();
      onClose();
    } catch (error) {
      console.error('Error saving assignment:', error);
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {assignment ? 'Zuweisung bearbeiten' : 'Neue Zuweisung'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Mitarbeiter</label>
            <select
              required
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={!!assignment} // Disable employee selection when editing
            >
              <option value="">Mitarbeiter auswählen</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Rolle</label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Rolle auswählen</option>
              <option value="lead">Projektleiter</option>
              <option value="technician">Techniker</option>
              <option value="helper">Helfer</option>
              <option value="apprentice">Auszubildender</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Geplante Stunden</label>
            <input
              type="number"
              min="0"
              required
              value={formData.planned_hours}
              onChange={(e) => setFormData({ ...formData, planned_hours: parseInt(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tatsächliche Stunden</label>
            <input
              type="number"
              min="0"
              value={formData.actual_hours}
              onChange={(e) => setFormData({ ...formData, actual_hours: parseInt(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Startdatum</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Enddatum</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
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

export default AssignmentModal;