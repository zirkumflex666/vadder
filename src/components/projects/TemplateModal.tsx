import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Database } from '../../types/supabase';
import { supabase } from '../../lib/supabase';

type Template = Database['public']['Tables']['project_templates']['Row'];
type Category = Database['public']['Tables']['project_categories']['Row'];

interface TemplateModalProps {
  template?: Template;
  onClose: () => void;
  onSave: () => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ template, onClose, onSave }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category_id: template?.category_id || '',
    estimated_duration: template?.estimated_duration || 60,
    default_materials: template?.default_materials || [],
    checklist: template?.checklist || [],
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await supabase
        .from('project_categories')
        .select('*')
        .order('name');
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAddMaterial = () => {
    setFormData({
      ...formData,
      default_materials: [
        ...formData.default_materials,
        { name: '', quantity: 1, unit: 'Stück', price_per_unit: 0 },
      ],
    });
  };

  const handleRemoveMaterial = (index: number) => {
    const materials = [...formData.default_materials];
    materials.splice(index, 1);
    setFormData({ ...formData, default_materials: materials });
  };

  const handleAddChecklistItem = () => {
    setFormData({
      ...formData,
      checklist: [
        ...formData.checklist,
        { id: crypto.randomUUID(), text: '', required: false },
      ],
    });
  };

  const handleRemoveChecklistItem = (id: string) => {
    setFormData({
      ...formData,
      checklist: formData.checklist.filter(item => item.id !== id),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (template) {
        await supabase
          .from('project_templates')
          .update(formData)
          .eq('id', template.id);
      } else {
        await supabase
          .from('project_templates')
          .insert(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {template ? 'Vorlage bearbeiten' : 'Neue Vorlage'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kategorie</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Keine Kategorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
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
            <label className="block text-sm font-medium text-gray-700">
              Geschätzte Dauer (Minuten)
            </label>
            <input
              type="number"
              min="0"
              step="15"
              value={formData.estimated_duration}
              onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Default Materials */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Standardmaterialien</label>
              <button
                type="button"
                onClick={handleAddMaterial}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {formData.default_materials.map((material, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={material.name}
                    onChange={(e) => {
                      const materials = [...formData.default_materials];
                      materials[index].name = e.target.value;
                      setFormData({ ...formData, default_materials: materials });
                    }}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Menge"
                    value={material.quantity}
                    onChange={(e) => {
                      const materials = [...formData.default_materials];
                      materials[index].quantity = parseFloat(e.target.value);
                      setFormData({ ...formData, default_materials: materials });
                    }}
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <select
                    value={material.unit}
                    onChange={(e) => {
                      const materials = [...formData.default_materials];
                      materials[index].unit = e.target.value;
                      setFormData({ ...formData, default_materials: materials });
                    }}
                    className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Stück">Stück</option>
                    <option value="Meter">Meter</option>
                    <option value="m²">m²</option>
                    <option value="m³">m³</option>
                    <option value="kg">kg</option>
                    <option value="Liter">Liter</option>
                    <option value="Packung">Packung</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Preis/Einheit"
                    value={material.price_per_unit}
                    onChange={(e) => {
                      const materials = [...formData.default_materials];
                      materials[index].price_per_unit = parseFloat(e.target.value);
                      setFormData({ ...formData, default_materials: materials });
                    }}
                    className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(index)}
                    className="text-red-600 hover:text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Checkliste</label>
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {formData.checklist.map((item: ChecklistItem) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Aufgabe"
                    value={item.text}
                    onChange={(e) => {
                      const checklist = formData.checklist.map(i =>
                        i.id === item.id ? { ...i, text: e.target.value } : i
                      );
                      setFormData({ ...formData, checklist });
                    }}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={item.required}
                      onChange={(e) => {
                        const checklist = formData.checklist.map(i =>
                          i.id === item.id ? { ...i, required: e.target.checked } : i
                        );
                        setFormData({ ...formData, checklist });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Erforderlich</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="text-red-600 hover:text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
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

export default TemplateModal;