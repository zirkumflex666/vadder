import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { Database } from '../../types/supabase';
import { supabase } from '../../lib/supabase';

type Material = Database['public']['Tables']['materials']['Row'];

interface MaterialsSectionProps {
  projectId: string;
  materials?: Material[];
  onUpdate: () => void;
}

interface MaterialModalProps {
  material?: Material;
  projectId: string;
  onClose: () => void;
  onSave: () => void;
}

const MaterialModal: React.FC<MaterialModalProps> = ({ material, projectId, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: material?.name || '',
    quantity: material?.quantity || 1,
    unit: material?.unit || 'Stück',
    price_per_unit: material?.price_per_unit || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (material) {
        const { error } = await supabase
          .from('materials')
          .update(formData)
          .eq('id', material.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('materials')
          .insert({
            ...formData,
            project_id: projectId,
          });

        if (error) throw error;
      }
      await onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving material:', error);
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {material ? 'Material bearbeiten' : 'Neues Material'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Bezeichnung</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Menge</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Einheit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Stück">Stück</option>
                <option value="Meter">Meter</option>
                <option value="m²">m²</option>
                <option value="m³">m³</option>
                <option value="kg">kg</option>
                <option value="Liter">Liter</option>
                <option value="Packung">Packung</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Preis pro Einheit (€)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price_per_unit}
              onChange={(e) => setFormData({ ...formData, price_per_unit: parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MaterialsSection: React.FC<MaterialsSectionProps> = ({ projectId, materials = [], onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Material löschen möchten?')) return;
    
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await onUpdate();
    } catch (error) {
      console.error('Error deleting material:', error);
      setError('Fehler beim Löschen des Materials. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (material: Material) => {
    return material.quantity * material.price_per_unit;
  };

  const calculateTotalCost = () => {
    return materials.reduce((sum, material) => sum + calculateTotal(material), 0);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Materialien</h4>
        <button
          onClick={() => {
            setEditingMaterial(undefined);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded-md flex items-center space-x-1 text-sm hover:bg-blue-700"
          disabled={loading}
        >
          <Plus size={16} />
          <span>Material hinzufügen</span>
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Material
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Menge
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preis/Einheit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gesamt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {materials.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Keine Materialien vorhanden
                </td>
              </tr>
            ) : (
              materials.map((material) => (
                <tr key={material.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {material.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {material.quantity} {material.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {material.price_per_unit.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calculateTotal(material).toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setEditingMaterial(material);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        disabled={loading}
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={loading}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {materials.length > 0 && (
              <tr className="bg-gray-50">
                <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                  Gesamtkosten:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {calculateTotalCost().toFixed(2)} €
                </td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <MaterialModal
          material={editingMaterial}
          projectId={projectId}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMaterial(undefined);
          }}
          onSave={onUpdate}
        />
      )}
    </div>
  );
};

export default MaterialsSection;