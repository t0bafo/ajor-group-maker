-- Move extensions from public schema to extensions schema
-- This follows Supabase best practices for security

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Move any extensions from public to extensions schema
-- Common extensions that might be in public: pgcrypto, uuid-ossp, etc.

-- Check and move pgcrypto if it exists in public
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'pgcrypto' 
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    ALTER EXTENSION pgcrypto SET SCHEMA extensions;
  END IF;
END $$;

-- Check and move uuid-ossp if it exists in public
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'uuid-ossp' 
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
  END IF;
END $$;