/*
  # Setup Admin Users

  This script helps create admin users and organizations for the Renova platform.
  Run this after creating users in the Supabase Authentication dashboard.
*/

-- First, create a default organization
INSERT INTO public.organizations (name, slug, admin_email, settings) 
VALUES (
  'Renova',
  'renova',
  'admin@renova.com',
  '{"theme": "default", "features": ["all"]}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Function to easily add admin users
-- Usage: SELECT add_admin_user('user-uuid-here', 'super_admin');
CREATE OR REPLACE FUNCTION add_admin_user(
  user_id UUID,
  admin_role admin_role DEFAULT 'support_admin'::admin_role
) RETURNS VOID AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Get the Renova organization ID
  SELECT id INTO org_id FROM public.organizations WHERE slug = 'renova' LIMIT 1;
  
  -- Insert admin user
  INSERT INTO public.admin_users (
    id,
    organization_id,
    role,
    permissions,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    org_id,
    admin_role,
    '{}'::jsonb,
    true,
    now(),
    now()
  ) ON CONFLICT (id) DO UPDATE SET
    role = admin_role,
    organization_id = org_id,
    is_active = true,
    updated_at = now();
    
  RAISE NOTICE 'Admin user added with role: %', admin_role;
END;
$$ LANGUAGE plpgsql;

-- Example usage (replace with actual user IDs from auth.users):
-- SELECT add_admin_user('12345678-1234-1234-1234-123456789012', 'super_admin');

-- Query to see all auth users (run this to get user IDs)
-- Note: This requires RLS to be disabled or run as service role
CREATE OR REPLACE FUNCTION get_auth_users() 
RETURNS TABLE(id UUID, email TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY 
  SELECT au.id, au.email, au.created_at
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_auth_users() TO authenticated;
GRANT EXECUTE ON FUNCTION add_admin_user(UUID, admin_role) TO authenticated;