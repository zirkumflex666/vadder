export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          auth_id: string | null
          first_name: string
          last_name: string
          email: string
          phone: string | null
          position: string
          start_date: string
          hourly_rate: number | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id?: string | null
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          position: string
          start_date: string
          hourly_rate?: number | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          position?: string
          start_date?: string
          hourly_rate?: number | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      working_hours: {
        Row: {
          id: string
          employee_id: string
          date: string
          start_time: string
          end_time: string | null
          break_duration: number
          project_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          date: string
          start_time: string
          end_time?: string | null
          break_duration?: number
          project_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          date?: string
          start_time?: string
          end_time?: string | null
          break_duration?: number
          project_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          company_name: string | null
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          street: string
          house_number: string
          postal_code: string
          city: string
          country: string
          custom_pricing: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name?: string | null
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          street: string
          house_number: string
          postal_code: string
          city: string
          country?: string
          custom_pricing?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string | null
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          street?: string
          house_number?: string
          postal_code?: string
          city?: string
          country?: string
          custom_pricing?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          customer_id: string
          title: string
          description: string | null
          status: string
          planned_date: string | null
          execution_date: string | null
          estimated_duration: number | null
          location_street: string
          location_house_number: string
          location_postal_code: string
          location_city: string
          location_country: string
          location_coordinates: unknown | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          title: string
          description?: string | null
          status: string
          planned_date?: string | null
          execution_date?: string | null
          estimated_duration?: number | null
          location_street: string
          location_house_number: string
          location_postal_code: string
          location_city: string
          location_country?: string
          location_coordinates?: unknown | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          title?: string
          description?: string | null
          status?: string
          planned_date?: string | null
          execution_date?: string | null
          estimated_duration?: number | null
          location_street?: string
          location_house_number?: string
          location_postal_code?: string
          location_city?: string
          location_country?: string
          location_coordinates?: unknown | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}