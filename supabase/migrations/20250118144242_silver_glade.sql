/*
  # Final RLS Policy Fix

  1. Changes
    - Temporarily disable RLS
    - Drop all existing policies
    - Create single, simple policy for read
    - Create single, simple policy for write operations
    - Re-enable RLS

  2. Security
    - Maintain data access control
    - Allow read access for authenticated users
    - Restrict write operations to admins
*/

-- Temporarily disable RLS
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
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

-- Create new simplified policies
CREATE POLICY "customers_read"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

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
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Re-enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;