// ... (previous imports remain the same)

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: project?.customer_id || '',
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'new',
    planned_date: project?.planned_date || '',
    execution_date: project?.execution_date || '',
    estimated_duration: project?.estimated_duration || 60,
    start_time: project?.start_time || '08:00', // Add start time field
    location_street: project?.location_street || '',
    location_house_number: project?.location_house_number || '',
    location_postal_code: project?.location_postal_code || '',
    location_city: project?.location_city || '',
    location_country: project?.location_country || 'Deutschland',
  });

  // ... (rest of the component remains the same)

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        {/* ... (previous form fields remain the same) */}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Startzeit</label>
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Geschätzte Dauer (Minuten)</label>
            <input
              type="number"
              min="0"
              step="15"
              value={formData.estimated_duration}
              onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ... (rest of the form remains the same) */}
      </div>
    </div>
  );
};

export default ProjectModal;