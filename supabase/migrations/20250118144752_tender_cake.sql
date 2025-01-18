/*
  # Update Admin User Auth ID

  1. Changes
    - Update Kevin Sieg's employee record with auth_id
    - Ensure proper authentication link

  2. Security
    - Link employee record to Supabase Auth user
*/

-- Update the admin user's auth_id
UPDATE employees 
SET auth_id = 'a55b2231-9856-435e-a855-9bbdcf756131'
WHERE email = 'kevin@sieg.me';