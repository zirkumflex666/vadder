import React from 'react';
import { TrendingUp, Clock, DollarSign, CheckSquare } from 'lucide-react';
import type { Database } from '../../types/supabase';
import { supabase } from '../../lib/supabase';

type Project = Database['public']['Tables']['projects']['Row'] & {
  materials?: Database['public']['Tables']['materials']['Row'][];
  project_assignments?: (Database['public']['Tables']['project_assignments']['Row'] & {
    employees: Pick<Database['public']['Tables']['employees']['Row'], 'first_name' | 'last_name' | 'hourly_rate'>;
  })[];
};

interface ProgressSectionProps {
  project: Project;
  onUpdate: () => void;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({ project, onUpdate }) => {
  const calculateMaterialCosts = () => {
    return (project.materials || []).reduce((sum, material) => {
      return sum + (material.quantity * material.price_per_unit);
    }, 0);
  };

  const calculateLaborCosts = () => {
    return (project.project_assignments || []).reduce((sum, assignment) => {
      const rate = assignment.employees.hourly_rate || 0;
      return sum + ((assignment.actual_hours || 0) * rate);
    }, 0);
  };

  const calculateTotalCosts = () => {
    return calculateMaterialCosts() + calculateLaborCosts();
  };

  const calculateProgress = () => {
    if (!project.checklist || project.checklist.length === 0) {
      return project.progress || 0;
    }

    const checklist = project.checklist as { id: string; text: string; completed: boolean }[];
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  const getBudgetStatus = () => {
    if (!project.budget) return 'neutral';
    const totalCosts = calculateTotalCosts();
    const budgetUsage = (totalCosts / project.budget) * 100;

    if (budgetUsage > 100) return 'danger';
    if (budgetUsage > 90) return 'warning';
    return 'success';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fortschritt</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {calculateProgress()}%
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>

        {/* Time Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Zeitaufwand</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {(project.project_assignments || []).reduce((sum, a) => sum + (a.actual_hours || 0), 0)}h
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            von {(project.project_assignments || []).reduce((sum, a) => sum + (a.planned_hours || 0), 0)}h geplant
          </p>
        </div>

        {/* Budget Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(calculateTotalCosts())}
              </p>
            </div>
            <div className={`rounded-full p-3 ${
              getBudgetStatus() === 'danger' ? 'bg-red-100' :
              getBudgetStatus() === 'warning' ? 'bg-yellow-100' :
              'bg-green-100'
            }`}>
              <DollarSign className={`h-6 w-6 ${
                getBudgetStatus() === 'danger' ? 'text-red-600' :
                getBudgetStatus() === 'warning' ? 'text-yellow-600' :
                'text-green-600'
              }`} />
            </div>
          </div>
          {project.budget && (
            <p className="mt-2 text-sm text-gray-500">
              von {formatCurrency(project.budget)} Budget
            </p>
          )}
        </div>
      </div>

      {/* Checklist */}
      {project.checklist && (project.checklist as any[]).length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Checkliste</h4>
          <div className="space-y-2">
            {(project.checklist as { id: string; text: string; completed: boolean }[]).map((item) => (
              <div key={item.id} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={async (e) => {
                    const updatedChecklist = (project.checklist as any[]).map(i =>
                      i.id === item.id ? { ...i, completed: e.target.checked } : i
                    );
                    try {
                      await supabase
                        .from('projects')
                        .update({ checklist: updatedChecklist })
                        .eq('id', project.id);
                      onUpdate();
                    } catch (error) {
                      console.error('Error updating checklist:', error);
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Kostenaufstellung</h4>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Materialkosten</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(calculateMaterialCosts())}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Personalkosten</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(calculateLaborCosts())}
            </p>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-600">Gesamtkosten</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(calculateTotalCosts())}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressSection;