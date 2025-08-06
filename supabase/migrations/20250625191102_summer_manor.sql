/*
  # Create users and screams tables for LetMeScream app

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches auth.users id
      - `email` (text, not null)
      - `display_name` (text, not null)
      - `avatar_url` (text, nullable)
      - `subscription_status` (enum: none, basic, premium, unlimited)
      - `subscription_id` (text, nullable) - Stripe subscription ID
      - `screams_this_month` (integer, default 0)
      - `subscription_end_date` (timestamptz, nullable)
      - `auto_renewal` (boolean, default false)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `screams`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, foreign key to users.id)
      - `name` (text, not null)
      - `audio_url` (text, not null) - Supabase Storage URL
      - `duration` (integer, not null) - duration in seconds
      - `max_pitch` (numeric, not null) - maximum pitch reached
      - `file_size` (bigint, not null) - file size in bytes
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - Users can only access their own data
    - Authenticated users can read/write their own records

  3. Storage
    - Create 'screams' bucket for audio files
    - Enable public access for audio playback
    - Users can only upload to their own folder
*/

-- Create subscription status enum
CREATE TYPE subscription_status AS ENUM ('none', 'basic', 'premium', 'unlimited');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  subscription_status subscription_status DEFAULT 'none',
  subscription_id text,
  screams_this_month integer DEFAULT 0,
  subscription_end_date timestamptz,
  auto_renewal boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create screams table
CREATE TABLE IF NOT EXISTS screams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  audio_url text NOT NULL,
  duration integer NOT NULL,
  max_pitch numeric NOT NULL,
  file_size bigint NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE screams ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policies for screams table
CREATE POLICY "Users can read own screams"
  ON screams
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own screams"
  ON screams
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own screams"
  ON screams
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own screams"
  ON screams
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_screams_user_id ON screams(user_id);
CREATE INDEX IF NOT EXISTS idx_screams_created_at ON screams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_screams_updated_at
  BEFORE UPDATE ON screams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();