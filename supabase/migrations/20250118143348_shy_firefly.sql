/*
  # Fix Employee RLS Policies

  1. Changes
    - Temporarily disable RLS for initial setup
    - Create initial admin user if none exists
    - Re-enable RLS
    - Create new simplified policies:
      - Allow public read access
      - Allow admin full access
      - Allow self-updates
*/

-- First disable RLS temporarily
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Create initial admin user if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM employees WHERE role = 'admin'
  ) THEN
    INSERT INTO employees (
      first_name,
      last_name,
      email,
      position,
      role,
      start_date
    ) VALUES (
      'Admin',
      'User',
      'admin@example.com',
      'Administrator',
      'admin',
      CURRENT_DATE
    );
  END IF;
END $$;

-- Re-enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
DECLARE
  policy_name text;
BEGIN
  FOR policy_name IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'employees'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON employees', policy_name);
  END LOOP;
END $$;

-- Create simplified policies

-- Allow all authenticated users to view employees
CREATE POLICY "employees_read_policy"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins full access
CREATE POLICY "employees_admin_policy"
  ON employees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow employees to update their own data
CREATE POLICY "employees_self_update_policy"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());