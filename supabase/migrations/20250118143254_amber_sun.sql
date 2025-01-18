/*
  # Fix RLS policies with initial setup handling

  1. Changes
    - Temporarily disable RLS
    - Add initial admin user if none exists
    - Re-enable RLS
    - Drop existing policies
    - Create new policies for:
      - Initial setup
      - Admin access
      - Employee access
      - Public read access
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

-- Drop existing policies
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

-- Create new policies

-- Allow initial setup when no admin exists
CREATE POLICY "allow_initial_setup"
  ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM employees WHERE role = 'admin'
    )
  );

-- Allow admins to do everything
CREATE POLICY "admin_all"
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

-- Allow all authenticated users to view employees
CREATE POLICY "view_employees"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow employees to update their own basic info
CREATE POLICY "update_own_info"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (
    auth_id = auth.uid() 
    AND (
      SELECT role FROM employees 
      WHERE auth_id = auth.uid()
    ) = (
      SELECT role FROM employees 
      WHERE id = employees.id
    )
  );

-- Allow insert for admins (separate from admin_all for clarity)
CREATE POLICY "admin_insert"
  ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );