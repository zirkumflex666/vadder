/*
  # Add Project Relationship to Working Hours Table

  1. Changes
    - Add foreign key constraint from working_hours.project_id to projects.id
    - Add index on working_hours.project_id for better query performance

  2. Security
    - No changes to RLS policies needed
*/

-- Add foreign key constraint
ALTER TABLE working_hours
  ADD CONSTRAINT working_hours_project_id_fkey
  FOREIGN KEY (project_id)
  REFERENCES projects(id)
  ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_working_hours_project_id 
  ON working_hours(project_id);