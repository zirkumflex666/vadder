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
DO $$ 
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