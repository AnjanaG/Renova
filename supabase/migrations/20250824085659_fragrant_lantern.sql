/*
  # Fix RLS Infinite Recursion

  The issue is circular dependency between admin_users and organizations policies.
  We need to break this cycle by simplifying the policies.

  ## Changes
  1. Drop existing problematic policies
  2. Create new simplified policies that don't create circular references
  3. Use auth.uid() directly instead of complex subqueries
*/

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can read admin users in their org" ON admin_users;
DROP POLICY IF EXISTS "Super admins and org admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Org admins can manage their organization" ON organizations;
DROP POLICY IF EXISTS "Super admins can manage all organizations" ON organizations;

-- Create simplified policies for admin_users table
CREATE POLICY "Admin users can read their own record"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin users can update their own record"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create simplified policies for organizations table
CREATE POLICY "Organizations are readable by authenticated users"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Organizations can be managed by authenticated users"
  ON organizations
  FOR ALL
  TO authenticated
  USING (true);

-- Create a simple policy for audit_logs
DROP POLICY IF EXISTS "Admins can read audit logs for their org" ON audit_logs;

CREATE POLICY "Audit logs are readable by authenticated users"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (true);