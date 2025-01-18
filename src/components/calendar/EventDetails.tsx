import React from 'react';
import { X, MapPin, Clock, Calendar, FileText, User } from 'lucide-react';
import type { Database } from '../../types/supabase';

type Project = Database['public']['Tables']['projects']['Row'] & {
  customers: Pick<Database['public']['Tables']['customers']['Row'], 'company_name' | 'first_name' | 'last_name'>;
};

type WorkingHours = Database['public']['Tables']['working_hours']['Row'] & {
  employees: Pick<Database['public']['Tables']['employees']['Row'], 'first_name' | 'last_name'>;
  projects?: Pick<Project, 'title'>;
};

interface EventDetailsProps {
  event: {
    type: 'project' | 'working-hours' | 'vacation';
    project?: Project;
    workingHours?: WorkingHours;
  };
  onClose: () => void;
  onEdit: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event, onClose, onEdit }) => {
  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:mm
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {event.type === 'project' ? 'Auftrag' :
             event.type === 'working-hours' ? 'Arbeitszeit' : 'Urlaub'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {event.type === 'project' && event.project && (
            <>
              <div>
                <h4 className="text-md font-medium text-gray-900">{event.project.title}</h4>
                <p className="text-sm text-gray-500">
                  {event.project.customers.company_name || 
                   `${event.project.customers.first_name} ${event.project.customers.last_name}`}
                </p>
              </div>

              {event.project.description && (
                <div className="flex items-start space-x-3">
                  <FileText className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Beschreibung</p>
                    <p className="text-sm text-gray-500">{event.project.description}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <MapPin className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Einsatzort</p>
                  <p className="text-sm text-gray-500">
                    {event.project.location_street} {event.project.location_house_number}
                  </p>
                  <p className="text-sm text-gray-500">
                    {event.project.location_postal_code} {event.project.location_city}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Geschätzte Dauer</p>
                  <p className="text-sm text-gray-500">
                    {Math.floor(event.project.estimated_duration / 60)}:
                    {String(event.project.estimated_duration % 60).padStart(2, '0')} h
                  </p>
                </div>
              </div>
            </>
          )}

          {event.type === 'working-hours' && event.workingHours && (
            <>
              <div className="flex items-start space-x-3">
                <User className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Mitarbeiter</p>
                  <p className="text-sm text-gray-500">
                    {event.workingHours.employees.first_name} {event.workingHours.employees.last_name}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Datum</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.workingHours.date).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Arbeitszeit</p>
                  <p className="text-sm text-gray-500">
                    {formatTime(event.workingHours.start_time)} - {formatTime(event.workingHours.end_time)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Pause: {event.workingHours.break_duration} min
                  </p>
                </div>
              </div>

              {event.workingHours.projects && (
                <div className="flex items-start space-x-3">
                  <FileText className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Projekt</p>
                    <p className="text-sm text-gray-500">{event.workingHours.projects.title}</p>
                  </div>
                </div>
              )}

              {event.workingHours.notes && (
                <div className="flex items-start space-x-3">
                  <FileText className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notizen</p>
                    <p className="text-sm text-gray-500">{event.workingHours.notes}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
          >
            Schließen
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Bearbeiten
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;