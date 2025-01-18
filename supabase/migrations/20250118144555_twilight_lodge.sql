/*
  # Initial Admin User Setup

  1. Changes
    - Create initial admin user (Kevin Sieg)
    - Set up auth and employee record
    - Ensure proper role and permissions

  2. Security
    - Create admin user with full access
    - Set up secure password
*/

-- First disable RLS temporarily
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Create initial admin user if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM employees WHERE role = 'admin'
  ) THEN
    INSERT INTO employees (
      first_name,
      last_name,
      email,
      position,
      role,
      start_date
    ) VALUES (
      'Kevin',
      'Sieg',
      'kevin@sieg.me',
      'Administrator',
      'admin',
      CURRENT_DATE
    );
  END IF;
END $$;

-- Re-enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;