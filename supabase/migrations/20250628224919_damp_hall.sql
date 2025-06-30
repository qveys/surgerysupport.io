/*
  # Patient Images Table

  1. New Table
    - `patient_images` - Store patient image metadata and file references
    
  2. Security
    - Enable RLS on patient_images table
    - Add policies for patient and staff access
    
  3. Storage
    - Create patient-images bucket for file storage
*/

-- Create patient_images table
CREATE TABLE IF NOT EXISTS public.patient_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  image_type TEXT NOT NULL CHECK (image_type IN ('quotation', 'progress', 'medical', 'identification')),
  file_size BIGINT,
  mime_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.patient_images ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patient_images_patient_id ON public.patient_images(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_images_type ON public.patient_images(image_type);
CREATE INDEX IF NOT EXISTS idx_patient_images_created_at ON public.patient_images(created_at);
CREATE INDEX IF NOT EXISTS idx_patient_images_deleted_at ON public.patient_images(deleted_at);

-- Create trigger for updated_at
CREATE TRIGGER update_patient_images_updated_at
  BEFORE UPDATE ON public.patient_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
CREATE POLICY "Patients can manage their own images"
  ON public.patient_images FOR ALL
  TO authenticated
  USING (
    patient_id = auth.uid() AND deleted_at IS NULL
  );

CREATE POLICY "Staff can manage relevant patient images"
  ON public.patient_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('Recovery Coordinator', 'Nurse', 'Clinic Administrator')
    )
    AND deleted_at IS NULL
  );

-- Create storage bucket for patient images (this would be done via Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('patient-images', 'patient-images', false);

-- Storage policies would be created via Supabase dashboard:
-- Policy: "Authenticated users can upload patient images"
-- Policy: "Users can view images they have access to"
-- Policy: "Users can delete images they have access to"