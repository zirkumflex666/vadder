/*
  # Fix Customer RLS Policies

  1. Changes
    - Simplify RLS policies for customers table
    - Enable proper access control
    - Fix policy conflicts
    - Ensure proper admin access
    - Allow authenticated users to read data

  2. Security
    - Maintain strict access control
    - Allow proper customer operations
    - Keep data visibility appropriate
*/

-- First ensure RLS is enabled
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$ 
DECLARE
  _sql text;
BEGIN
  FOR _sql IN (
    SELECT format('DROP POLICY IF EXISTS %I ON customers', policyname)
    FROM pg_policies 
    WHERE tablename = 'customers'
  ) LOOP
    EXECUTE _sql;
  END LOOP;
END $$;

-- Create new simplified policies for customers

-- Allow all authenticated users to view customers
CREATE POLICY "customers_select_policy"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to insert customers
CREATE POLICY "customers_insert_policy"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow admins to update customers
CREATE POLICY "customers_update_policy"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow admins to delete customers
CREATE POLICY "customers_delete_policy"
  ON customers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );