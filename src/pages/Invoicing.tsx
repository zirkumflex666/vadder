import React from 'react';
import { FileText, Plus } from 'lucide-react';

const Invoicing = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Rechnungen</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Neue Rechnung</span>
        </button>
      </div>

      {/* Placeholder content */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Rechnungen</h3>
            <p className="mt-1 text-sm text-gray-500">
              Erstellen Sie Ihre erste Rechnung, um loszulegen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoicing;