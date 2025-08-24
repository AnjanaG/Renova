/*
  # Create profiles table for user authentication

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `phone` (text, optional)
      - `zip_code` (text, optional)
      - `user_type` (enum: homeowner, business)
      - `business_type` (enum: contractor, cabinet_shop, designer, optional)
      - `business_name` (text, optional)
      - `business_address` (text, optional)
      - `business_phone` (text, optional)
      - `business_website` (text, optional)
      - `years_in_business` (integer, optional)
      - `license_number` (text, optional)
      - `service_areas` (text array, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for users to read/update their own profiles
    - Add policy for businesses to be publicly readable
*/

-- Create enum types
CREATE TYPE user_type AS ENUM ('homeowner', 'business');
CREATE TYPE business_type AS ENUM ('contractor', 'cabinet_shop', 'designer');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  zip_code text,
  user_type user_type NOT NULL DEFAULT 'homeowner',
  business_type business_type,
  business_name text,
  business_address text,
  business_phone text,
  business_website text,
  years_in_business integer,
  license_number text,
  service_areas text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Business profiles are publicly readable"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (user_type = 'business');

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();