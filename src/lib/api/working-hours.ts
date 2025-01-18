import { supabase } from '../supabase';
import type { Database } from '../../types/supabase';

type WorkingHours = Database['public']['Tables']['working_hours']['Row'];
type WorkingHoursInsert = Database['public']['Tables']['working_hours']['Insert'];
type WorkingHoursUpdate = Database['public']['Tables']['working_hours']['Update'];

export const workingHoursApi = {
  async getByEmployeeId(employeeId: string) {
    try {
      const { data, error } = await supabase
        .from('working_hours')
        .select(`
          *,
          projects (
            id,
            title
          )
        `)
        .eq('employee_id', employeeId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting working hours:', error);
      return [];
    }
  },

  async getByDateRange(startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from('working_hours')
        .select(`
          *,
          employees (
            id,
            first_name,
            last_name
          ),
          projects (
            id,
            title
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting working hours:', error);
      return [];
    }
  },

  async create(workingHours: WorkingHoursInsert) {
    try {
      const { data, error } = await supabase
        .from('working_hours')
        .insert(workingHours)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating working hours:', error);
      throw error;
    }
  },

  async update(id: string, updates: WorkingHoursUpdate) {
    try {
      const { data, error } = await supabase
        .from('working_hours')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating working hours:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('working_hours')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting working hours:', error);
      throw error;
    }
  }
};