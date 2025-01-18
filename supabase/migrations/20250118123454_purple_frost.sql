/*
  # Initial Schema Setup for Craft Business Management System

  1. Tables
    - employees
      - Personal information
      - Work-related details
      - Authentication link
    - working_hours
      - Time tracking
      - Break duration
      - Project reference
    - customers
      - Contact information
      - Company details
      - Address information
    - projects
      - Project details
      - Location information
      - Status tracking
    - materials
      - Project materials
      - Pricing information
    - project_notes
      - Project-related notes
      - Timestamps
    - project_photos
      - Photo URLs
      - Upload information
    - qualifications
      - Employee qualifications
      - Certification dates

  2. Security
    - RLS enabled on all tables
    - Policies for authenticated access
    - Role-based access control
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Employees table
CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id uuid REFERENCES auth.users(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  position text NOT NULL,
  start_date date NOT NULL,
  hourly_rate decimal(10,2),
  role text NOT NULL DEFAULT 'employee',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their own data"
  ON employees
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid() OR role = 'admin');

CREATE POLICY "Admins can manage employee data"
  ON employees
  FOR ALL
  TO authenticated
  USING (role = 'admin');

-- Working hours table
CREATE TABLE working_hours (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time,
  break_duration int DEFAULT 0,
  project_id uuid,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can manage their own working hours"
  ON working_hours
  FOR ALL
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE auth_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM employees WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Customers table
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  street text NOT NULL,
  house_number text NOT NULL,
  postal_code text NOT NULL,
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Deutschland',
  custom_pricing jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text,
  status text NOT NULL CHECK (status IN ('new', 'planned', 'in_progress', 'completed', 'cancelled')),
  planned_date date,
  execution_date date,
  estimated_duration int, -- in minutes
  location_street text NOT NULL,
  location_house_number text NOT NULL,
  location_postal_code text NOT NULL,
  location_city text NOT NULL,
  location_country text NOT NULL DEFAULT 'Deutschland',
  location_coordinates point,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Materials table
CREATE TABLE materials (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity decimal(10,2) NOT NULL,
  unit text NOT NULL,
  price_per_unit decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view materials"
  ON materials
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage materials"
  ON materials
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Project notes table
CREATE TABLE project_notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_by uuid REFERENCES employees(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view project notes"
  ON project_notes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own notes"
  ON project_notes
  FOR ALL
  TO authenticated
  USING (
    created_by IN (
      SELECT id FROM employees WHERE auth_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM employees WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Project photos table
CREATE TABLE project_photos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  uploaded_by uuid REFERENCES employees(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view project photos"
  ON project_photos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own photos"
  ON project_photos
  FOR ALL
  TO authenticated
  USING (
    uploaded_by IN (
      SELECT id FROM employees WHERE auth_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM employees WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Qualifications table
CREATE TABLE qualifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  name text NOT NULL,
  certification_date date,
  expiry_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE qualifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view qualifications"
  ON qualifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage qualifications"
  ON qualifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_employees_auth_id ON employees(auth_id);
CREATE INDEX idx_working_hours_employee_id ON working_hours(employee_id);
CREATE INDEX idx_working_hours_date ON working_hours(date);
CREATE INDEX idx_projects_customer_id ON projects(customer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_materials_project_id ON materials(project_id);
CREATE INDEX idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX idx_project_photos_project_id ON project_photos(project_id);
CREATE INDEX idx_qualifications_employee_id ON qualifications(employee_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_working_hours_updated_at
    BEFORE UPDATE ON working_hours
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
    BEFORE UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_notes_updated_at
    BEFORE UPDATE ON project_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qualifications_updated_at
    BEFORE UPDATE ON qualifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();