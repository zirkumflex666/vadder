/*
  # Final RLS Policy Fix

  1. Changes
    - Temporarily disable RLS
    - Drop all existing policies
    - Create new, simplified policies with proper auth checks
    - Re-enable RLS
    - Add proper admin checks using auth.uid()

  2. Security
    - Maintain data access control
    - Ensure proper admin privileges
    - Allow read access for authenticated users
    - Restrict write operations to admins
*/

-- Temporarily disable RLS
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
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

-- Create new simplified policies
CREATE POLICY "customers_select"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "customers_insert"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT auth_id 
      FROM employees 
      WHERE role = 'admin'
      AND auth_id IS NOT NULL
    )
  );

CREATE POLICY "customers_update"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT auth_id 
      FROM employees 
      WHERE role = 'admin'
      AND auth_id IS NOT NULL
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT auth_id 
      FROM employees 
      WHERE role = 'admin'
      AND auth_id IS NOT NULL
    )
  );

CREATE POLICY "customers_delete"
  ON customers
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT auth_id 
      FROM employees 
      WHERE role = 'admin'
      AND auth_id IS NOT NULL
    )
  );

-- Re-enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;