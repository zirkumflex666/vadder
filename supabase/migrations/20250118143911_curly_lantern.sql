/*
  # Fix RLS Policies for Customers and Employees

  1. Changes
    - Simplify RLS policies for better access control
    - Fix policy conflicts
    - Ensure proper admin access
    - Allow authenticated users to read data
    - Enable proper customer management

  2. Security
    - Maintain strict access control
    - Allow proper customer operations
    - Keep data visibility appropriate
*/

-- First ensure RLS is enabled
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies using DO block with dynamic SQL
DO $$ 
DECLARE
  _sql text;
BEGIN
  -- Drop employee policies
  FOR _sql IN (
    SELECT format('DROP POLICY IF EXISTS %I ON employees', policyname)
    FROM pg_policies 
    WHERE tablename = 'employees'
  ) LOOP
    EXECUTE _sql;
  END LOOP;

  -- Drop customer policies
  FOR _sql IN (
    SELECT format('DROP POLICY IF EXISTS %I ON customers', policyname)
    FROM pg_policies 
    WHERE tablename = 'customers'
  ) LOOP
    EXECUTE _sql;
  END LOOP;
END $$;

-- Create new simplified policies for employees

-- Allow all authenticated users to view employees
CREATE POLICY "employees_read_policy"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins full access to employees
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

-- Create new simplified policies for customers

-- Allow all authenticated users to view customers
CREATE POLICY "customers_read_policy"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins full access to customers
CREATE POLICY "customers_admin_policy"
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

-- Ensure at least one admin exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM employees 
    WHERE role = 'admin'
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