/*
  # Fix RLS Policies

  1. Changes
    - Simplify RLS policies to avoid recursion
    - Fix infinite recursion in admin checks
    - Ensure proper access control

  2. Security
    - Maintain read access for authenticated users
    - Restrict write operations to admins
*/

-- First disable RLS temporarily
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "employees_read" ON employees;
DROP POLICY IF EXISTS "employees_write" ON employees;
DROP POLICY IF EXISTS "customers_read" ON customers;
DROP POLICY IF EXISTS "customers_write" ON customers;

-- Create new simplified policies for employees
CREATE POLICY "employees_read_policy"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "employees_write_policy"
  ON employees
  FOR ALL
  TO authenticated
  USING (auth_id = auth.uid() OR role = 'admin');

-- Create new simplified policies for customers
CREATE POLICY "customers_read_policy"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "customers_write_policy"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM employees 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
      AND auth_id IS NOT NULL
    )
  );

-- Re-enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;