/*
  # Admin and Organization System

  1. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text, unique)
      - `admin_email` (text)
      - `created_at` (timestamp)
    - `admin_users`
      - `id` (uuid, primary key, references auth.users)
      - `organization_id` (uuid, references organizations)
      - `role` (admin_role enum)
      - `permissions` (jsonb)
      - `created_at` (timestamp)
    - `admin_sessions`
      - `id` (uuid, primary key)
      - `admin_user_id` (uuid, references admin_users)
      - `session_token` (text, unique)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all admin tables
    - Add policies for admin access only
    - Create admin role enum
    - Add audit logging functions

  3. Functions
    - Admin authentication functions
    - Permission checking functions
    - Audit logging functions
*/

-- Create admin role enum
CREATE TYPE admin_role AS ENUM (
  'super_admin',
  'org_admin', 
  'developer',
  'database_admin',
  'support_admin'
);

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  admin_email text NOT NULL,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  role admin_role NOT NULL DEFAULT 'support_admin',
  permissions jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_sessions table for secure admin access
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  ip_address inet,
  user_agent text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create audit_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES admin_users(id),
  action text NOT NULL,
  resource_type text,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for organizations
CREATE POLICY "Super admins can manage all organizations"
  ON organizations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    )
  );

CREATE POLICY "Org admins can manage their organization"
  ON organizations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND organization_id = organizations.id 
      AND role IN ('org_admin', 'super_admin')
      AND is_active = true
    )
  );

-- Create policies for admin_users
CREATE POLICY "Admins can read admin users in their org"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.id = auth.uid() 
      AND (
        au.role = 'super_admin' OR 
        au.organization_id = admin_users.organization_id
      )
      AND au.is_active = true
    )
  );

CREATE POLICY "Super admins and org admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.id = auth.uid() 
      AND (
        au.role = 'super_admin' OR 
        (au.role = 'org_admin' AND au.organization_id = admin_users.organization_id)
      )
      AND au.is_active = true
    )
  );

-- Create policies for admin_sessions
CREATE POLICY "Users can manage their own sessions"
  ON admin_sessions
  FOR ALL
  TO authenticated
  USING (admin_user_id = auth.uid());

-- Create policies for audit_logs
CREATE POLICY "Admins can read audit logs for their org"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au1
      JOIN admin_users au2 ON au2.id = audit_logs.admin_user_id
      WHERE au1.id = auth.uid() 
      AND (
        au1.role = 'super_admin' OR 
        au1.organization_id = au2.organization_id
      )
      AND au1.is_active = true
    )
  );

-- Create function to check admin permissions
CREATE OR REPLACE FUNCTION check_admin_permission(
  required_permission text,
  resource_type text DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
  user_role admin_role;
  user_permissions jsonb;
  user_active boolean;
BEGIN
  -- Get user role and permissions
  SELECT role, permissions, is_active
  INTO user_role, user_permissions, user_active
  FROM admin_users
  WHERE id = auth.uid();
  
  -- Check if user exists and is active
  IF NOT FOUND OR NOT user_active THEN
    RETURN false;
  END IF;
  
  -- Super admins have all permissions
  IF user_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Check specific permissions
  IF user_permissions ? required_permission THEN
    RETURN (user_permissions->required_permission)::boolean;
  END IF;
  
  -- Default role-based permissions
  CASE user_role
    WHEN 'org_admin' THEN
      RETURN required_permission IN ('read_users', 'manage_users', 'read_projects', 'manage_settings');
    WHEN 'developer' THEN
      RETURN required_permission IN ('read_code', 'deploy_code', 'read_logs', 'manage_integrations');
    WHEN 'database_admin' THEN
      RETURN required_permission IN ('read_database', 'manage_database', 'run_migrations', 'read_logs');
    WHEN 'support_admin' THEN
      RETURN required_permission IN ('read_users', 'read_projects', 'manage_support_tickets');
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  action_name text,
  resource_type text DEFAULT NULL,
  resource_id text DEFAULT NULL,
  old_values jsonb DEFAULT NULL,
  new_values jsonb DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (
    admin_user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    action_name,
    resource_type,
    resource_id,
    old_values,
    new_values,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Insert default organization
INSERT INTO organizations (name, slug, admin_email) 
VALUES ('Renova', 'renova', 'admin@renova.com')
ON CONFLICT (slug) DO NOTHING;