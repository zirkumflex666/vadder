/*
  # Disable RLS and Remove Policies

  1. Changes
    - Disable RLS on all tables
    - Remove all existing policies
    - Keep the admin user setup

  2. Security
    - Authentication will still be required through Supabase Auth
    - Access control will be handled at the application level
*/

-- Disable RLS on all tables
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE qualifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
DECLARE
  _table text;
  _sql text;
BEGIN
  FOR _table IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE tablename IN (
      'employees', 'customers', 'working_hours', 'projects', 
      'materials', 'project_notes', 'project_photos', 'qualifications',
      'project_categories', 'project_templates', 'project_assignments',
      'project_milestones'
    )
  LOOP
    FOR _sql IN (
      SELECT format('DROP POLICY IF EXISTS %I ON %I', policyname, _table)
      FROM pg_policies 
      WHERE tablename = _table
    ) LOOP
      EXECUTE _sql;
    END LOOP;
  END LOOP;
END $$;