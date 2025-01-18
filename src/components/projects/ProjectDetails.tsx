import React, { useState } from 'react';
import { X, Plus, Camera, FileText, Package, MapPin, Users, Flag, TrendingUp } from 'lucide-react';
import type { Database } from '../../types/supabase';
import { supabase } from '../../lib/supabase';
import MaterialsSection from './MaterialsSection';
import NotesSection from './NotesSection';
import PhotosSection from './PhotosSection';
import AssignmentModal from './AssignmentModal';
import MilestoneModal from './MilestoneModal';
import ProgressSection from './ProgressSection';

type Project = Database['public']['Tables']['projects']['Row'] & {
  customers: Database['public']['Tables']['customers']['Row'];
  materials?: Database['public']['Tables']['materials']['Row'][];
  project_notes?: (Database['public']['Tables']['project_notes']['Row'] & {
    employees: Pick<Database['public']['Tables']['employees']['Row'], 'first_name' | 'last_name'>;
  })[];
  project_photos?: (Database['public']['Tables']['project_photos']['Row'] & {
    employees: Pick<Database['public']['Tables']['employees']['Row'], 'first_name' | 'last_name'>;
  })[];
  project_assignments?: (Database['public']['Tables']['project_assignments']['Row'] & {
    employees: Pick<Database['public']['Tables']['employees']['Row'], 'first_name' | 'last_name' | 'hourly_rate'>;
  })[];
  project_milestones?: Database['public']['Tables']['project_milestones']['Row'][];
};

interface ProjectDetailsProps {
  project: Project;
  onClose: () => void;
  onProjectUpdate: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onClose, onProjectUpdate }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'notes' | 'photos' | 'team' | 'milestones' | 'progress'>('details');
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<string | null>(null);
  const [editingHours, setEditingHours] = useState<number | null>(null);

  const handleActualHoursUpdate = async (assignmentId: string, hours: number) => {
    try {
      const { error } = await supabase
        .from('project_assignments')
        .update({ actual_hours: hours })
        .eq('id', assignmentId);

      if (error) throw error;
      await onProjectUpdate();
    } catch (error) {
      console.error('Error updating actual hours:', error);
    }
  };

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'materials', label: 'Material', icon: Package },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'milestones', label: 'Meilensteine', icon: Flag },
    { id: 'progress', label: 'Fortschritt', icon: TrendingUp },
    { id: 'notes', label: 'Notizen', icon: FileText },
    { id: 'photos', label: 'Fotos', icon: Camera },
  ];

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
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {project.title}
            </h3>
            <p className="text-sm text-gray-500">
              {project.customers.company_name || `${project.customers.first_name} ${project.customers.last_name}`}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* Status and Priority */}
        <div className="flex space-x-4 mb-4">
          {getStatusBadge(project.status)}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <Icon className={`
                  mr-2 h-5 w-5
                  ${activeTab === id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-3">Projektdetails</h4>
                {project.description && (
                  <p className="text-gray-600 mb-4">{project.description}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Geplantes Datum</p>
                    <p className="mt-1">
                      {project.planned_date ? new Date(project.planned_date).toLocaleDateString('de-DE') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ausführungsdatum</p>
                    <p className="mt-1">
                      {project.execution_date ? new Date(project.execution_date).toLocaleDateString('de-DE') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Geschätzte Dauer</p>
                    <p className="mt-1">
                      {project.estimated_duration ? `${Math.floor(project.estimated_duration / 60)}:${String(project.estimated_duration % 60).padStart(2, '0')} h` : '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-3">Einsatzort</h4>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    {project.location_street} {project.location_house_number}
                  </p>
                  <p className="text-gray-600">
                    {project.location_postal_code} {project.location_city}
                  </p>
                  <p className="text-gray-500">{project.location_country}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <MaterialsSection
              projectId={project.id}
              materials={project.materials}
              onUpdate={onProjectUpdate}
            />
          )}

          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-gray-900">Team</h4>
                <button
                  onClick={() => setIsAssignmentModalOpen(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md flex items-center space-x-1 text-sm hover:bg-blue-700"
                >
                  <Plus size={16} />
                  <span>Mitarbeiter zuweisen</span>
                </button>
              </div>

              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mitarbeiter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rolle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Geplante Stunden
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tatsächliche Stunden
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zeitraum
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {project.project_assignments?.map((assignment) => (
                      <tr key={assignment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.employees.first_name} {assignment.employees.last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {assignment.role === 'lead' ? 'Projektleiter' :
                             assignment.role === 'technician' ? 'Techniker' :
                             assignment.role === 'helper' ? 'Helfer' :
                             assignment.role === 'apprentice' ? 'Auszubildender' :
                             assignment.role}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {assignment.planned_hours}h
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingAssignment === assignment.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={editingHours ?? assignment.actual_hours ?? 0}
                                onChange={(e) => setEditingHours(parseFloat(e.target.value) || 0)}
                                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                              <button
                                onClick={async () => {
                                  if (editingHours !== null) {
                                    await handleActualHoursUpdate(assignment.id, editingHours);
                                    setEditingAssignment(null);
                                    setEditingHours(null);
                                  }
                                }}
                                className="text-green-600 hover:text-green-900"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => {
                                  setEditingAssignment(null);
                                  setEditingHours(null);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingAssignment(assignment.id);
                                setEditingHours(assignment.actual_hours || 0);
                              }}
                              className="text-sm text-gray-900 hover:text-blue-600"
                            >
                              {assignment.actual_hours || 0}h
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {assignment.start_date && (
                              <>
                                {new Date(assignment.start_date).toLocaleDateString('de-DE')}
                                {assignment.end_date && ' - '}
                              </>
                            )}
                            {assignment.end_date && new Date(assignment.end_date).toLocaleDateString('de-DE')}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-gray-900">Meilensteine</h4>
                <button
                  onClick={() => setIsMilestoneModalOpen(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md flex items-center space-x-1 text-sm hover:bg-blue-700"
                >
                  <Plus size={16} />
                  <span>Meilenstein hinzufügen</span>
                </button>
              </div>

              <div className="space-y-4">
                {project.project_milestones?.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`bg-white p-4 rounded-lg shadow ${
                      milestone.completed_at ? 'border-l-4 border-green-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-lg font-medium text-gray-900">{milestone.title}</h5>
                        {milestone.description && (
                          <p className="mt-1 text-sm text-gray-500">{milestone.description}</p>
                        )}
                        <div className="mt-2 flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            Fällig: {new Date(milestone.due_date).toLocaleDateString('de-DE')}
                          </span>
                          {milestone.completed_at && (
                            <span className="text-sm text-green-600">
                              Abgeschlossen: {new Date(milestone.completed_at).toLocaleDateString('de-DE')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <ProgressSection
              project={project}
              onUpdate={onProjectUpdate}
            />
          )}

          {activeTab === 'notes' && (
            <NotesSection
              projectId={project.id}
              notes={project.project_notes || []}
              onUpdate={onProjectUpdate}
            />
          )}

          {activeTab === 'photos' && (
            <PhotosSection
              projectId={project.id}
              photos={project.project_photos || []}
              onUpdate={onProjectUpdate}
            />
          )}
        </div>

        {/* Modals */}
        {isAssignmentModalOpen && (
          <AssignmentModal
            projectId={project.id}
            onClose={() => setIsAssignmentModalOpen(false)}
            onSave={onProjectUpdate}
          />
        )}

        {isMilestoneModalOpen && (
          <MilestoneModal
            projectId={project.id}
            onClose={() => setIsMilestoneModalOpen(false)}
            onSave={onProjectUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;