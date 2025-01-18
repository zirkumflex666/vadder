/*
  # Fix Customer RLS Policies

  1. Changes
    - Drop existing policies
    - Create new simplified policies:
      - Allow public read access
      - Allow admin full access
*/

-- Drop all existing policies
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

-- Create simplified policies

-- Allow all authenticated users to view customers
CREATE POLICY "customers_read_policy"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins full access
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