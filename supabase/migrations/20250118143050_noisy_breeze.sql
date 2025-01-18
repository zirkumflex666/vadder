/*
  # Fix RLS policies and add initial admin user

  1. Changes
    - Drop existing RLS policies for employees table
    - Add new policies that allow:
      - All authenticated users to view employees
      - Initial admin creation without restrictions
      - Admins to manage all employee data
      - Employees to update their own data
    - Create initial admin user
*/

-- First disable RLS temporarily to allow initial admin creation
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
DROP POLICY IF EXISTS "Employees can view their own data" ON employees;
DROP POLICY IF EXISTS "Admins can manage employee data" ON employees;
DROP POLICY IF EXISTS "Authenticated users can view employees" ON employees;
DROP POLICY IF EXISTS "Admins can manage all employee data" ON employees;
DROP POLICY IF EXISTS "Employees can update their own data" ON employees;

-- Create new policies
CREATE POLICY "Anyone can create initial admin"
  ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM employees WHERE role = 'admin')
  );

CREATE POLICY "Authenticated users can view employees"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage all employee data"
  ON employees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Employees can update their own data"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());