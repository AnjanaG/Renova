/*
  # Setup Admin User

  This script creates an admin user and organization for the Renova system.
  Run this in the Supabase SQL Editor after running the main admin system migration.
*/

-- First, create an organization (if it doesn't exist)
INSERT INTO public.organizations (name, slug, admin_email, settings)
VALUES (
  'Renova',
  'renova',
  'admin@renova.com',
  '{
    "company_name": "Renova",
    "support_email": "support@renova.com",
    "website": "https://renova.com"
  }'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Create the admin user in auth.users (this requires admin privileges)
-- Note: This approach uses Supabase's auth.users table directly
-- You may need to use the Authentication dashboard instead

-- Alternative: Create a function to help with admin user creation
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email text,
  user_password text,
  user_role admin_role DEFAULT 'super_admin'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  org_id uuid;
BEGIN
  -- Get the Renova organization ID
  SELECT id INTO org_id FROM public.organizations WHERE slug = 'renova';
  
  -- This would typically be done through the Supabase Auth API
  -- For now, we'll return a placeholder that you can replace with the actual user ID
  -- after creating the user through the Authentication dashboard
  
  RAISE NOTICE 'Please create user with email % through the Supabase Authentication dashboard', user_email;
  RAISE NOTICE 'Then run: SELECT setup_admin_profile(''USER_ID_FROM_AUTH_DASHBOARD'', ''%'');', user_role;
  
  RETURN null;
END;
$$;

-- Function to set up admin profile after user is created in auth
CREATE OR REPLACE FUNCTION setup_admin_profile(
  auth_user_id uuid,
  user_role admin_role DEFAULT 'super_admin'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_id uuid;
BEGIN
  -- Get the Renova organization ID
  SELECT id INTO org_id FROM public.organizations WHERE slug = 'renova';
  
  -- Create the admin user profile
  INSERT INTO public.admin_users (
    id,
    organization_id,
    role,
    permissions,
    is_active
  )
  VALUES (
    auth_user_id,
    org_id,
    user_role,
    CASE 
      WHEN user_role = 'super_admin' THEN '{"all": true}'::jsonb
      WHEN user_role = 'org_admin' THEN '{"users": true, "settings": true}'::jsonb
      WHEN user_role = 'developer' THEN '{"code": true, "deploy": true}'::jsonb
      WHEN user_role = 'database_admin' THEN '{"database": true, "migrations": true}'::jsonb
      ELSE '{}'::jsonb
    END,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = now();
    
  RAISE NOTICE 'Admin user profile created successfully for user ID: %', auth_user_id;
END;
$$;

-- Example usage (after creating user in Authentication dashboard):
-- SELECT setup_admin_profile('USER_ID_FROM_AUTH_DASHBOARD', 'super_admin');

-- Create some sample admin verification codes for testing
COMMENT ON FUNCTION setup_admin_profile IS 'Use this function after creating a user in the Supabase Authentication dashboard. Example: SELECT setup_admin_profile(''uuid-from-auth-dashboard'', ''super_admin'');';