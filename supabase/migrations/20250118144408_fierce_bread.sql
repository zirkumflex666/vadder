/*
  # Final RLS Policy Setup

  1. Changes
    - Completely reset and simplify RLS policies
    - Ensure proper admin access
    - Fix policy conflicts
    - Set up initial admin user

  2. Security
    - Maintain proper access control
    - Allow read access for authenticated users
    - Restrict write operations to admins
*/

-- First disable RLS temporarily
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "employees_select" ON employees;
DROP POLICY IF EXISTS "employees_all" ON employees;
DROP POLICY IF EXISTS "employees_read" ON employees;
DROP POLICY IF EXISTS "employees_write" ON employees;
DROP POLICY IF EXISTS "employees_admin" ON employees;
DROP POLICY IF EXISTS "employees_read_policy" ON employees;
DROP POLICY IF EXISTS "employees_admin_policy" ON employees;
DROP POLICY IF EXISTS "employees_select_policy" ON employees;
DROP POLICY IF EXISTS "employees_insert_policy" ON employees;
DROP POLICY IF EXISTS "employees_update_policy" ON employees;
DROP POLICY IF EXISTS "employees_delete_policy" ON employees;
DROP POLICY IF EXISTS "employees_self_update_policy" ON employees;
DROP POLICY IF EXISTS "allow_initial_setup" ON employees;
DROP POLICY IF EXISTS "admin_all" ON employees;
DROP POLICY IF EXISTS "view_employees" ON employees;
DROP POLICY IF EXISTS "update_own_info" ON employees;
DROP POLICY IF EXISTS "admin_insert" ON employees;

DROP POLICY IF EXISTS "customers_select" ON customers;
DROP POLICY IF EXISTS "customers_all" ON customers;
DROP POLICY IF EXISTS "customers_read" ON customers;
DROP POLICY IF EXISTS "customers_write" ON customers;
DROP POLICY IF EXISTS "customers_admin" ON customers;
DROP POLICY IF EXISTS "customers_read_policy" ON customers;
DROP POLICY IF EXISTS "customers_admin_policy" ON customers;
DROP POLICY IF EXISTS "customers_select_policy" ON customers;
DROP POLICY IF EXISTS "customers_insert_policy" ON customers;
DROP POLICY IF EXISTS "customers_update_policy" ON customers;
DROP POLICY IF EXISTS "customers_delete_policy" ON customers;

-- Create initial admin user if none exists
INSERT INTO employees (
  first_name,
  last_name,
  email,
  position,
  role,
  start_date
)
SELECT
  'Admin',
  'User',
  'admin@example.com',
  'Administrator',
  'admin',
  CURRENT_DATE
WHERE NOT EXISTS (
  SELECT 1 FROM employees WHERE role = 'admin'
);

-- Re-enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies for employees

-- Allow all authenticated users to view employees
CREATE POLICY "employees_read"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins full access to employees
CREATE POLICY "employees_write"
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

-- Create new simplified policies for customers

-- Allow all authenticated users to view customers
CREATE POLICY "customers_read"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins full access to customers
CREATE POLICY "customers_write"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );