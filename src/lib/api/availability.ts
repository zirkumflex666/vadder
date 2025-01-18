import { supabase } from '../supabase';
import type { Database } from '../../types/supabase';

type WorkingHours = Database['public']['Tables']['working_hours']['Row'];

export const availabilityApi = {
  async checkEmployeeAvailability(
    employeeId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeEventId?: string
  ) {
    try {
      // Check working hours conflicts
      const { data: workingHours, error: workingHoursError } = await supabase
        .from('working_hours')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', date)
        .not('id', 'eq', excludeEventId || null)
        .or(`start_time.lte.${endTime},end_time.gte.${startTime}`);

      if (workingHoursError) throw workingHoursError;

      // Check vacation conflicts
      const { data: vacations, error: vacationsError } = await supabase
        .from('vacation_entries')
        .select('*')
        .eq('employee_id', employeeId)
        .lte('start_date', date)
        .gte('end_date', date)
        .not('id', 'eq', excludeEventId || null);

      if (vacationsError) throw vacationsError;

      return {
        workingHours: workingHours || [],
        vacations: vacations || [],
        hasConflicts: (workingHours?.length || 0) > 0 || (vacations?.length || 0) > 0,
      };
    } catch (error) {
      console.error('Error checking availability:', error);
      return {
        workingHours: [],
        vacations: [],
        hasConflicts: false,
      };
    }
  },

  async checkProjectAvailability(
    projectId: string,
    date: string,
    excludeEventId?: string
  ) {
    try {
      // Check if there are other working hours entries for this project on the same date
      const { data, error } = await supabase
        .from('working_hours')
        .select(`
          *,
          employees (
            first_name,
            last_name
          )
        `)
        .eq('project_id', projectId)
        .eq('date', date)
        .not('id', 'eq', excludeEventId || null);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error checking project availability:', error);
      return [];
    }
  }
};