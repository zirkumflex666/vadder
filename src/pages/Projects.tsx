import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Clock, MapPin, FileText } from 'lucide-react';
import { projectsApi } from '../lib/api/projects';
import type { Database } from '../types/supabase';
import ProjectDetails from '../components/projects/ProjectDetails';
import ProjectModal from '../components/projects/ProjectModal';

type Project = Database['public']['Tables']['projects']['Row'] & {
  customers: Database['public']['Tables']['customers']['Row'];
};

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Auftrag löschen möchten?')) return;
    
    try {
      await projectsApi.delete(id);
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleSave = async (data: any) => {
    try {
      setError(null);
      if (editingProject) {
        await projectsApi.update(editingProject.id, {
          ...data,
          start_time: data.start_time || '08:00',
        });
      } else {
        await projectsApi.create({
          ...data,
          start_time: data.start_time || '08:00',
        });
      }
      await loadProjects();
      setIsModalOpen(false);
      setEditingProject(null);
    } catch (err) {
      console.error('Error saving project:', err);
      setError('Fehler beim Speichern des Auftrags');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customers.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${project.customers.first_name} ${project.customers.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Aufträge</h1>
        <button
          onClick={() => {
            setEditingProject(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Neuer Auftrag</span>
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Suche nach Aufträgen oder Kunden..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="all">Alle Status</option>
              <option value="new">Neu</option>
              <option value="planned">Geplant</option>
              <option value="in_progress">In Bearbeitung</option>
              <option value="completed">Abgeschlossen</option>
              <option value="cancelled">Storniert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Project List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auftrag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kunde
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
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
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Keine Aufträge gefunden
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setIsDetailsOpen(true);
                        }}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900"
                      >
                        {project.title}
                      </button>
                      {project.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {project.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {project.customers.company_name || `${project.customers.first_name} ${project.customers.last_name}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {project.customers.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setEditingProject(project);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Bearbeiten"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
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

      {isModalOpen && (
        <ProjectModal
          project={editingProject}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProject(null);
          }}
          onSave={handleSave}
        />
      )}

      {isDetailsOpen && selectedProject && (
        <ProjectDetails
          project={selectedProject}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedProject(null);
          }}
          onProjectUpdate={loadProjects}
        />
      )}
    </div>
  );
};

export default Projects;