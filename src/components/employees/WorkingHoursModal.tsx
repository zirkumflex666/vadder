import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { workingHoursApi } from '../../lib/api/working-hours';
import type { Database } from '../../types/supabase';

type Employee = Database['public']['Tables']['employees']['Row'];
type WorkingHours = Database['public']['Tables']['working_hours']['Row'];

interface WorkingHoursModalProps {
  employee: Employee;
  onClose: () => void;
}

const WorkingHoursModal: React.FC<WorkingHoursModalProps> = ({ employee, onClose }) => {
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingHours, setIsAddingHours] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    break_duration: 30,
    notes: '',
  });

  useEffect(() => {
    loadWorkingHours();
  }, [employee.id]);

  const loadWorkingHours = async () => {
    try {
      const data = await workingHoursApi.getByEmployeeId(employee.id);
      setWorkingHours(data);
    } catch (error) {
      console.error('Error loading working hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await workingHoursApi.create({
        employee_id: employee.id,
        ...newEntry,
      });
      setIsAddingHours(false);
      loadWorkingHours();
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        break_duration: 30,
        notes: '',
      });
    } catch (error) {
      console.error('Error saving working hours:', error);
    }
  };

  const calculateDuration = (start: string, end: string, breakDuration: number) => {
    const startTime = new Date(`1970-01-01T${start}`);
    const endTime = new Date(`1970-01-01T${end}`);
    const durationInMinutes = (endTime.getTime() - startTime.getTime()) / 1000 / 60 - breakDuration;
    return `${Math.floor(durationInMinutes / 60)}:${String(durationInMinutes % 60).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Arbeitszeiten - {employee.first_name} {employee.last_name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={() => setIsAddingHours(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            <span>Arbeitszeit erfassen</span>
          </button>
        </div>

        {isAddingHours && (
          <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Datum</label>
                <input
                  type="date"
                  required
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Startzeit</label>
                <input
                  type="time"
                  required
                  value={newEntry.start_time}
                  onChange={(e) => setNewEntry({ ...newEntry, start_time: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Endzeit</label>
                <input
                  type="time"
                  required
                  value={newEntry.end_time}
                  onChange={(e) => setNewEntry({ ...newEntry, end_time: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pause (Minuten)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={newEntry.break_duration}
                  onChange={(e) => setNewEntry({ ...newEntry, break_duration: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Notizen</label>
                <textarea
                  value={newEntry.notes || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingHours(false)}
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
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ende
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pause
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arbeitszeit
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
              ) : workingHours.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Keine Arbeitszeiten erfasst
                  </td>
                </tr>
              ) : (
                workingHours.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.date).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.start_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.end_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.break_duration} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.end_time && calculateDuration(entry.start_time, entry.end_time, entry.break_duration)} h
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

export default WorkingHoursModal;