-- Enable UUID extension in public schema first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Initialize schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS budget;

-- Set permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA budget TO postgres, anon, authenticated, service_role;

-- Set search path
ALTER DATABASE postgres SET search_path TO budget, auth, public;
