/*
  # Fix employees table RLS policies

  1. Changes
    - Drop existing RLS policies for employees table
    - Add new policies that allow:
      - All authenticated users to view employees
      - Admins to manage all employee data
      - Employees to update their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Employees can view their own data" ON employees;
DROP POLICY IF EXISTS "Admins can manage employee data" ON employees;

-- Create new policies
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
      SELECT 1 FROM employees AS e 
      WHERE e.auth_id = auth.uid() AND e.role = 'admin'
    )
  );

CREATE POLICY "Employees can update their own data"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());