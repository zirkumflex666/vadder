/*
  # Fix Project Preview

  1. Changes
    - Add missing columns to projects table
    - Add missing tables for project management

  2. New Tables
    - project_assignments
    - project_milestones
    - project_categories
    - project_templates

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Add missing columns to projects table
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  ADD COLUMN IF NOT EXISTS budget decimal(10,2),
  ADD COLUMN IF NOT EXISTS progress int CHECK (progress >= 0 AND progress <= 100),
  ADD COLUMN IF NOT EXISTS checklist jsonb;

-- Project Categories
CREATE TABLE IF NOT EXISTS project_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view project categories"
  ON project_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage project categories"
  ON project_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Project Templates
CREATE TABLE IF NOT EXISTS project_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES project_categories(id),
  estimated_duration int,
  default_materials jsonb,
  checklist jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view project templates"
  ON project_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage project templates"
  ON project_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Project Assignments
CREATE TABLE IF NOT EXISTS project_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  role text NOT NULL,
  planned_hours int,
  actual_hours int DEFAULT 0,
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (project_id, employee_id)
);

ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view project assignments"
  ON project_assignments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage project assignments"
  ON project_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Project Milestones
CREATE TABLE IF NOT EXISTS project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view project milestones"
  ON project_milestones
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage project milestones"
  ON project_milestones
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Add foreign key columns to projects table
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES project_categories(id),
  ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES project_templates(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_assignments_project_id ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_employee_id ON project_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_template_id ON projects(template_id);

-- Update triggers
CREATE TRIGGER update_project_categories_updated_at
    BEFORE UPDATE ON project_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_templates_updated_at
    BEFORE UPDATE ON project_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_assignments_updated_at
    BEFORE UPDATE ON project_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_milestones_updated_at
    BEFORE UPDATE ON project_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();