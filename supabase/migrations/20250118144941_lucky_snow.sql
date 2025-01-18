/*
  # Fix Customer RLS Policies

  1. Changes
    - Further simplify customer RLS policies
    - Fix admin access check
    - Ensure proper access control

  2. Security
    - Maintain read access for authenticated users
    - Restrict write operations to admins
*/

-- First disable RLS temporarily
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Drop all existing customer policies
DO $$ 
DECLARE
  policy_name text;
BEGIN
  FOR policy_name IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'customers'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON customers', policy_name);
  END LOOP;
END $$;

-- Create new simplified policies for customers
CREATE POLICY "customers_select"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "customers_modify"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM employees 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Re-enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;