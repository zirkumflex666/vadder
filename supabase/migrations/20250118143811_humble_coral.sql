/*
  # Fix RLS Policies

  1. Changes
    - Simplify and fix RLS policies for employees and customers tables
    - Ensure admin users have full access
    - Allow read access for authenticated users
    - Fix policy conflicts

  2. Security
    - Maintain strict access control
    - Prevent unauthorized modifications
    - Keep data visibility appropriate
*/

-- First ensure RLS is enabled
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies for employees
DO $$ 
BEGIN
  -- Drop employee policies
  FOR policy_name IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'employees'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON employees', policy_name);
  END LOOP;

  -- Drop customer policies
  FOR policy_name IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'customers'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON customers', policy_name);
  END LOOP;
END $$;

-- Create new simplified policies for employees

-- Allow all authenticated users to view employees
CREATE POLICY "employees_read"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins full access to employees
CREATE POLICY "employees_admin"
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
CREATE POLICY "customers_admin"
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