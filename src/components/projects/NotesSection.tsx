import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import type { Database } from '../../types/supabase';
import { supabase } from '../../lib/supabase';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

type Note = Database['public']['Tables']['project_notes']['Row'] & {
  employees: Pick<Database['public']['Tables']['employees']['Row'], 'first_name' | 'last_name'>;
};

interface NotesSectionProps {
  projectId: string;
  notes: Note[];
  onUpdate: () => void;
}

interface NoteModalProps {
  note?: Note;
  projectId: string;
  onClose: () => void;
  onSave: () => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ note, projectId, onClose, onSave }) => {
  const { user } = useSupabaseAuth();
  const [content, setContent] = useState(note?.content || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (note) {
        await supabase
          .from('project_notes')
          .update({ content })
          .eq('id', note.id);
      } else {
        await supabase
          .from('project_notes')
          .insert({
            project_id: projectId,
            content,
            created_by: user?.id,
          });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {note ? 'Notiz bearbeiten' : 'Neue Notiz'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Notiz</label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Geben Sie hier Ihre Notiz ein..."
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

const NotesSection: React.FC<NotesSectionProps> = ({ projectId, notes, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const { user } = useSupabaseAuth();

  const handleDelete = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Notiz löschen möchten?')) return;

    try {
      await supabase
        .from('project_notes')
        .delete()
        .eq('id', id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Notizen</h4>
        <button
          onClick={() => {
            setEditingNote(undefined);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded-md flex items-center space-x-1 text-sm hover:bg-blue-700"
        >
          <Plus size={16} />
          <span>Notiz hinzufügen</span>
        </button>
      </div>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Keine Notizen vorhanden</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    {note.employees.first_name} {note.employees.last_name} am {formatDate(note.created_at)}
                  </p>
                  <p className="text-gray-900 whitespace-pre-wrap">{note.content}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingNote(note);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <NoteModal
          note={editingNote}
          projectId={projectId}
          onClose={() => {
            setIsModalOpen(false);
            setEditingNote(undefined);
          }}
          onSave={onUpdate}
        />
      )}
    </div>
  );
};

export default NotesSection;