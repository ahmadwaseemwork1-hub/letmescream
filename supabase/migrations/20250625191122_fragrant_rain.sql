/*
  # Create storage bucket for scream audio files

  1. Storage Setup
    - Create 'screams' bucket for audio files
    - Enable public access for audio playback
    - Set up RLS policies for user-specific access

  2. Security
    - Users can only upload files to their own folder (user_id/)
    - Users can only delete their own files
    - Public read access for audio playback
*/

-- Create the screams storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('screams', 'screams', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the storage bucket
CREATE POLICY "Users can upload their own screams"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'screams' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view all screams"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'screams');

CREATE POLICY "Users can update their own screams"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'screams' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own screams"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'screams' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );