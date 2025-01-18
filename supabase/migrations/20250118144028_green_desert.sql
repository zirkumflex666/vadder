/*
  # Final RLS Policy Fix

  1. Changes
    - Temporarily disable RLS to ensure clean state
    - Drop all existing policies
    - Create new, simplified policies with proper checks
    - Re-enable RLS
    - Add proper admin checks

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
    EXISTS (
      SELECT 1 FROM auth.users
      JOIN employees ON employees.auth_id = auth.users.id
      WHERE auth.users.id = auth.uid()
      AND employees.role = 'admin'
    )
  );

CREATE POLICY "customers_update"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      JOIN employees ON employees.auth_id = auth.users.id
      WHERE auth.users.id = auth.uid()
      AND employees.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      JOIN employees ON employees.auth_id = auth.users.id
      WHERE auth.users.id = auth.uid()
      AND employees.role = 'admin'
    )
  );

CREATE POLICY "customers_delete"
  ON customers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      JOIN employees ON employees.auth_id = auth.users.id
      WHERE auth.users.id = auth.uid()
      AND employees.role = 'admin'
    )
  );

-- Re-enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;