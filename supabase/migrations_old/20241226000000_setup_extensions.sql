-- Enable required extensions in public schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- Create budget schema and set up permissions
CREATE SCHEMA IF NOT EXISTS budget;
GRANT USAGE ON SCHEMA budget TO postgres, anon, authenticated, service_role;
