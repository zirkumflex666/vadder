/*
  # Project Management Enhancement

  1. New Tables
    - `project_assignments` - Links employees to projects with roles and hours
    - `project_milestones` - Tracks key project milestones and deadlines
    - `project_categories` - Categorizes projects by type
    - `project_templates` - Stores reusable project templates

  2. Changes
    - Add category and template fields to projects table
    - Add priority and budget fields to projects table
    - Add progress tracking fields

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users and admins
*/

-- Project Categories
CREATE TABLE project_categories (
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
CREATE TABLE project_templates (
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
CREATE TABLE project_assignments (
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
CREATE TABLE project_milestones (
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

-- Add new columns to projects table
ALTER TABLE projects
  ADD COLUMN category_id uuid REFERENCES project_categories(id),
  ADD COLUMN template_id uuid REFERENCES project_templates(id),
  ADD COLUMN priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  ADD COLUMN budget decimal(10,2),
  ADD COLUMN progress int CHECK (progress >= 0 AND progress <= 100),
  ADD COLUMN checklist jsonb;

-- Create indexes
CREATE INDEX idx_project_assignments_project_id ON project_assignments(project_id);
CREATE INDEX idx_project_assignments_employee_id ON project_assignments(employee_id);
CREATE INDEX idx_project_milestones_project_id ON project_milestones(project_id);
CREATE INDEX idx_projects_category_id ON projects(category_id);
CREATE INDEX idx_projects_template_id ON projects(template_id);

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