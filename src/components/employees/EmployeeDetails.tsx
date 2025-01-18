import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Database } from '../../types/supabase';
import { workingHoursApi } from '../../lib/api/working-hours';

type Employee = Database['public']['Tables']['employees']['Row'];
type WorkingHours = Database['public']['Tables']['working_hours']['Row'];

interface EmployeeDetailsProps {
  employee: Employee;
  onClose: () => void;
}

const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ employee, onClose }) => {
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [loading, setLoading] = useState(true);

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

  const calculateMonthlyHours = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyHours = workingHours
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      })
      .reduce((total, entry) => {
        if (!entry.end_time) return total;
        const startTime = new Date(`1970-01-01T${entry.start_time}`);
        const endTime = new Date(`1970-01-01T${entry.end_time}`);
        const durationInMinutes = (endTime.getTime() - startTime.getTime()) / 1000 / 60 - entry.break_duration;
        return total + durationInMinutes;
      }, 0);

    return Math.round(monthlyHours / 60 * 100) / 100;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Mitarbeiterdetails
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 mb-3">Persönliche Informationen</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-sm font-medium">{employee.first_name} {employee.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="text-sm font-medium">{employee.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">E-Mail</p>
                <p className="text-sm font-medium">{employee.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <p className="text-sm font-medium">{employee.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Eintrittsdatum</p>
                <p className="text-sm font-medium">
                  {new Date(employee.start_date).toLocaleDateString('de-DE')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Stundensatz</p>
                <p className="text-sm font-medium">
                  {employee.hourly_rate ? `${employee.hourly_rate} €` : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Working Hours Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 mb-3">Arbeitszeitübersicht</h4>
            {loading ? (
              <p className="text-sm text-gray-500">Laden...</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Stunden diesen Monat</p>
                  <p className="text-sm font-medium">{calculateMonthlyHours()} h</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Letzte Zeiterfassung</p>
                  <p className="text-sm font-medium">
                    {workingHours[0] ? new Date(workingHours[0].date).toLocaleDateString('de-DE') : '-'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Vacation Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 mb-3">Urlaubsübersicht</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Urlaubstage gesamt</p>
                <p className="text-sm font-medium">30</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Verbleibender Urlaub</p>
                <p className="text-sm font-medium">15</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Genommener Urlaub</p>
                <p className="text-sm font-medium">15</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Krankheitstage</p>
                <p className="text-sm font-medium">3</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;