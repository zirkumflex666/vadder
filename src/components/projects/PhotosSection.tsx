import React, { useState } from 'react';
import { Plus, Trash2, X, Camera } from 'lucide-react';
import type { Database } from '../../types/supabase';
import { supabase } from '../../lib/supabase';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

type Photo = Database['public']['Tables']['project_photos']['Row'] & {
  employees: Pick<Database['public']['Tables']['employees']['Row'], 'first_name' | 'last_name'>;
};

interface PhotosSectionProps {
  projectId: string;
  photos: Photo[];
  onUpdate: () => void;
}

interface PhotoModalProps {
  projectId: string;
  onClose: () => void;
  onSave: () => void;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ projectId, onClose, onSave }) => {
  const { user } = useSupabaseAuth();
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `project-photos/${projectId}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // Create database record
      await supabase
        .from('project_photos')
        .insert({
          project_id: projectId,
          url: publicUrl,
          caption,
          uploaded_by: user?.id,
        });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Foto hochladen</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Foto</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              {preview ? (
                <div className="space-y-2">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 rounded-lg mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Entfernen
                  </button>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Foto auswählen</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG bis 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Optionale Beschreibung"
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
              disabled={!file || uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Wird hochgeladen...' : 'Hochladen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PhotosSection: React.FC<PhotosSectionProps> = ({ projectId, photos, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const handleDelete = async (photo: Photo) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Foto löschen möchten?')) return;

    try {
      // Delete from storage
      const filePath = photo.url.split('/').slice(-2).join('/');
      await supabase.storage
        .from('photos')
        .remove([filePath]);

      // Delete database record
      await supabase
        .from('project_photos')
        .delete()
        .eq('id', photo.id);

      onUpdate();
    } catch (error) {
      console.error('Error deleting photo:', error);
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
        <h4 className="text-lg font-medium text-gray-900">Fotos</h4>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded-md flex items-center space-x-1 text-sm hover:bg-blue-700"
        >
          <Plus size={16} />
          <span>Foto hinzufügen</span>
        </button>
      </div>

      {photos.length === 0 ? (
        <p className="text-center text-gray-500 py-4">Keine Fotos vorhanden</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative">
              <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={photo.url}
                  alt={photo.caption || 'Projektfoto'}
                  className="object-cover cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                />
                <button
                  onClick={() => handleDelete(photo)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {photo.caption && (
                <p className="mt-2 text-sm text-gray-500 truncate">{photo.caption}</p>
              )}
              <p className="text-xs text-gray-400">
                {photo.employees.first_name} {photo.employees.last_name} • {formatDate(photo.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Photo Upload Modal */}
      {isModalOpen && (
        <PhotoModal
          projectId={projectId}
          onClose={() => setIsModalOpen(false)}
          onSave={onUpdate}
        />
      )}

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl w-full">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || 'Projektfoto'}
              className="rounded-lg max-h-[80vh] mx-auto"
            />
            {selectedPhoto.caption && (
              <p className="text-white text-center mt-4">{selectedPhoto.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotosSection;