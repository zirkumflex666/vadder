import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { projectsApi } from '../../lib/api/projects';
import { workingHoursApi } from '../../lib/api/working-hours';
import { employeesApi } from '../../lib/api/employees';
import { availabilityApi } from '../../lib/api/availability';
import type { Database } from '../../types/supabase';

type Employee = Database['public']['Tables']['employees']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type WorkingHours = Database['public']['Tables']['working_hours']['Row'];

interface EventModalProps {
  type: 'working-hours' | 'vacation' | 'project';
  date: Date;
  event?: WorkingHours | null;
  project?: Project | null;
  onClose: () => void;
  onSave: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ type, date, event, project, onClose, onSave }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: event?.employee_id || '',
    date: event?.date || date.toISOString().split('T')[0],
    start_time: event?.start_time || project?.start_time || '08:00',
    end_time: event?.end_time || (project?.start_time && project?.estimated_duration 
      ? new Date(new Date(`1970-01-01T${project.start_time}`).getTime() + (project.estimated_duration * 60000))
        .toTimeString().slice(0, 5)
      : '17:00'),
    break_duration: event?.break_duration || 30,
    project_id: event?.project_id || project?.id || '',
    notes: event?.notes || '',
  });

  // ... (rest of the component remains the same)