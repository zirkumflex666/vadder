import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Database } from '../../types/supabase';
import { supabase } from '../../lib/supabase';

type Milestone = Database['public']['Tables']['project_milestones']['Row'];

interface MilestoneModalProps {
  projectId: string;
  milestone?: Milestone;
  onClose: () => void;
  onSave: () => void;
}

const MilestoneModal: React.FC<MilestoneModalProps> = ({
  projectId,
  milestone,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: milestone?.title || '',
    description: milestone?.description || '',
    due_date: milestone?.due_date || '',
    completed_at: milestone?.completed_at || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (milestone) {
        await supabase
          .from('project_milestones')
          .update(formData)
          .eq('id', milestone.id);
      } else {
        await supabase
          .from('project_milestones')
          .insert({
            ...formData,
            project_id: projectId,
          });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving milestone:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {milestone ? 'Meilenstein bearbeiten' : 'Neuer Meilenstein'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Titel</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fälligkeitsdatum</label>
            <input
              type="date"
              required
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {milestone && (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={!!formData.completed_at}
                onChange={(e) => setFormData({
                  ...formData,
                  completed_at: e.target.checked ? new Date().toISOString() : null,
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Als abgeschlossen markieren
              </label>
            </div>
          )}

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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MilestoneModal;