import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import type { Database } from '../../types/supabase';
import { supabase } from '../../lib/supabase';

type Employee = Database['public']['Tables']['employees']['Row'];

interface VacationModalProps {
  employee: Employee;
  onClose: () => void;
}

interface VacationEntry {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'vacation' | 'sick_leave' | 'other';
  notes?: string;
  created_at: string;
}

const VacationModal: React.FC<VacationModalProps> = ({ employee, onClose }) => {
  const [vacations, setVacations] = useState<VacationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingVacation, setIsAddingVacation] = useState(false);
  const [newEntry, setNewEntry] = useState({
    start_date: '',
    end_date: '',
    type: 'vacation' as const,
    notes: '',
  });

  useEffect(() => {
    loadVacations();
  }, [employee.id]);

  const loadVacations = async () => {
    try {
      const { data, error } = await supabase
        .from('vacation_entries')
        .select('*')
        .eq('employee_id', employee.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setVacations(data || []);
    } catch (error) {
      console.error('Error loading vacations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('vacation_entries')
        .insert({
          employee_id: employee.id,
          ...newEntry,
          status: 'pending',
        });

      if (error) throw error;

      setIsAddingVacation(false);
      loadVacations();
      setNewEntry({
        start_date: '',
        end_date: '',
        type: 'vacation',
        notes: '',
      });
    } catch (error) {
      console.error('Error saving vacation:', error);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'Ausstehend',
      approved: 'Genehmigt',
      rejected: 'Abgelehnt',
    };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      vacation: 'Urlaub',
      sick_leave: 'Krankheit',
      other: 'Sonstiges',
    };
    return labels[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Urlaub & Abwesenheit - {employee.first_name} {employee.last_name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={() => setIsAddingVacation(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            <span>Abwesenheit eintragen</span>
          </button>
        </div>

        {isAddingVacation && (
          <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Von</label>
                <input
                  type="date"
                  required
                  value={newEntry.start_date}
                  onChange={(e) => setNewEntry({ ...newEntry, start_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bis</label>
                <input
                  type="date"
                  required
                  value={newEntry.end_date}
                  onChange={(e) => setNewEntry({ ...newEntry, end_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Typ</label>
                <select
                  required
                  value={newEntry.type}
                  onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as 'vacation' | 'sick_leave' | 'other' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="vacation">Urlaub</option>
                  <option value="sick_leave">Krankheit</option>
                  <option value="other">Sonstiges</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Notizen</label>
                <textarea
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingVacation(false)}
                className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Speichern
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Von
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notizen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Laden...
                  </td>
                </tr>
              ) : vacations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Keine Einträge vorhanden
                  </td>
                </tr>
              ) : (
                vacations.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.start_date).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.end_date).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {calculateDuration(entry.start_date, entry.end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getTypeLabel(entry.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(entry.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {entry.notes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VacationModal;