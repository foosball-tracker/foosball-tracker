CREATE TYPE public.sound_type AS ENUM ('goal', 'win');
CREATE TYPE public.sound_status AS ENUM ('ready', 'disabled');

CREATE TABLE public.sound_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  uploaded_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  type public.sound_type NOT NULL,
  status public.sound_status NOT NULL DEFAULT 'ready',
  name text NOT NULL,
  storage_bucket text NOT NULL DEFAULT 'sounds',
  storage_path text NOT NULL,
  content_type text NOT NULL DEFAULT 'audio/mpeg',
  size_bytes bigint NOT NULL,
  duration_ms integer NOT NULL,
  checksum text,
  is_default boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT sound_assets_name_check CHECK (char_length(btrim(name)) > 0),
  CONSTRAINT sound_assets_storage_path_key UNIQUE (storage_path),
  CONSTRAINT sound_assets_content_type_check CHECK (content_type = 'audio/mpeg'),
  CONSTRAINT sound_assets_size_check CHECK (size_bytes > 0 AND size_bytes <= 2097152),
  CONSTRAINT sound_assets_duration_check CHECK (
    is_default
    OR (type = 'goal' AND duration_ms <= 5000)
    OR (type = 'win' AND duration_ms <= 10000)
  )
);

CREATE INDEX sound_assets_type_status_idx ON public.sound_assets (type, status);
CREATE INDEX sound_assets_status_default_idx ON public.sound_assets (status, is_default);

ALTER TABLE public.sound_assets ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sound_assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sound_assets TO service_role;

CREATE POLICY "Authenticated users can view ready sounds" ON public.sound_assets
  FOR SELECT TO authenticated
  USING (status = 'ready');

CREATE POLICY "Admins can manage all sound assets" ON public.sound_assets
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('sounds', 'sounds', true, 2097152, ARRAY['audio/mpeg'])
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Authenticated users can read sound objects" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'sounds');

CREATE POLICY "Admins can upload sound objects" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'sounds' AND public.is_admin());

CREATE POLICY "Admins can update sound objects" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'sounds' AND public.is_admin())
  WITH CHECK (bucket_id = 'sounds' AND public.is_admin());

CREATE POLICY "Admins can delete sound objects" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'sounds' AND public.is_admin());
