import { supabase } from '../supabase';
import type { Database } from '../../types/supabase';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export const projectsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        customers (
          id,
          company_name,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        customers (
          id,
          company_name,
          first_name,
          last_name,
          email,
          phone,
          street,
          house_number,
          postal_code,
          city
        ),
        materials (*),
        project_notes (
          *,
          employees (
            first_name,
            last_name
          )
        ),
        project_photos (
          *,
          employees (
            first_name,
            last_name
          )
        ),
        project_assignments (
          *,
          employees (
            first_name,
            last_name,
            hourly_rate
          )
        ),
        project_milestones (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(project: ProjectInsert) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: ProjectUpdate) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};