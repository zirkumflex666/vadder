import React from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import type { Database } from '../../types/supabase';

type Employee = Database['public']['Tables']['employees']['Row'];
type WorkingHours = Database['public']['Tables']['working_hours']['Row'] & {
  employees: Pick<Employee, 'first_name' | 'last_name'>;
  projects?: { title: string };
};

interface WeeklyOverviewProps {
  employees: Employee[];
  events: WorkingHours[];
  selectedDate: Date;
}

const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({ employees, events, selectedDate }) => {
  const weekStart = startOfWeek(selectedDate, { locale: de });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const standardDailyHours = 8; // 8 hours per day

  const getEventsForDay = (employeeId: string, date: Date) => {
    return events.filter(event => 
      event.employee_id === employeeId && 
      event.date === format(date, 'yyyy-MM-dd')
    );
  };

  const calculateDayHours = (dayEvents: WorkingHours[]) => {
    let totalMinutes = 0;
    let projectMinutes = 0;

    dayEvents.forEach(event => {
      if (!event.end_time) return;

      const startTime = new Date(`1970-01-01T${event.start_time}`);
      const endTime = new Date(`1970-01-01T${event.end_time}`);
      const duration = (endTime.getTime() - startTime.getTime()) / 1000 / 60 - event.break_duration;

      totalMinutes += duration;
      if (event.project_id) {
        projectMinutes += duration;
      }
    });

    return {
      total: Math.round(totalMinutes / 60 * 100) / 100,
      project: Math.round(projectMinutes / 60 * 100) / 100,
      regular: Math.round((totalMinutes - projectMinutes) / 60 * 100) / 100,
      overtime: Math.max(0, Math.round((totalMinutes / 60 - standardDailyHours) * 100) / 100)
    };
  };

  const calculateWeekHours = (employeeId: string) => {
    let totalMinutes = 0;
    let projectMinutes = 0;

    weekDays.forEach(day => {
      const dayEvents = getEventsForDay(employeeId, day);
      dayEvents.forEach(event => {
        if (!event.end_time) return;

        const startTime = new Date(`1970-01-01T${event.start_time}`);
        const endTime = new Date(`1970-01-01T${event.end_time}`);
        const duration = (endTime.getTime() - startTime.getTime()) / 1000 / 60 - event.break_duration;

        totalMinutes += duration;
        if (event.project_id) {
          projectMinutes += duration;
        }
      });
    });

    return {
      total: Math.round(totalMinutes / 60 * 100) / 100,
      project: Math.round(projectMinutes / 60 * 100) / 100,
      regular: Math.round((totalMinutes - projectMinutes) / 60 * 100) / 100,
      overtime: Math.max(0, Math.round((totalMinutes / 60 - standardDailyHours * 5) * 100) / 100)
    };
  };

  const formatTime = (time: string) => time.substring(0, 5);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
              Mitarbeiter
            </th>
            {weekDays.map(day => (
              <th 
                key={day.toString()} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div>{format(day, 'EEEE', { locale: de })}</div>
                <div>{format(day, 'dd.MM.', { locale: de })}</div>
              </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Woche
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employees.map(employee => {
            const weekHours = calculateWeekHours(employee.id);
            return (
              <tr key={employee.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {employee.first_name} {employee.last_name}
                </td>
                {weekDays.map(day => {
                  const dayEvents = getEventsForDay(employee.id, day);
                  const hours = calculateDayHours(dayEvents);
                  return (
                    <td key={day.toString()} className="px-6 py-4">
                      <div className="space-y-2">
                        {dayEvents.map(event => (
                          <div 
                            key={event.id}
                            className={`text-xs p-1 rounded ${
                              event.project_id 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            <div className="font-medium">
                              {formatTime(event.start_time)} - {formatTime(event.end_time)}
                            </div>
                            {event.projects && (
                              <div className="truncate">{event.projects.title}</div>
                            )}
                          </div>
                        ))}
                        {dayEvents.length > 0 && (
                          <div className="text-xs border-t border-gray-200 pt-1 mt-1">
                            <div className="flex items-center justify-between text-gray-500">
                              <Clock size={12} />
                              <span>{hours.total}h</span>
                            </div>
                            {hours.project > 0 && (
                              <div className="text-green-600">
                                Projekte: {hours.project}h
                              </div>
                            )}
                            {hours.overtime > 0 && (
                              <div className="text-orange-600">
                                Überstunden: +{hours.overtime}h
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
                <td className="px-6 py-4 bg-gray-50">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      Gesamt: {weekHours.total}h
                    </div>
                    {weekHours.project > 0 && (
                      <div className="text-green-600 text-xs">
                        Projekte: {weekHours.project}h
                      </div>
                    )}
                    {weekHours.regular > 0 && (
                      <div className="text-blue-600 text-xs">
                        Regulär: {weekHours.regular}h
                      </div>
                    )}
                    {weekHours.overtime > 0 && (
                      <div className="text-orange-600 text-xs">
                        Überstunden: +{weekHours.overtime}h
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyOverview;