ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'super-secret-jwt-token-with-at-least-32-characters-long';

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

CREATE SCHEMA IF NOT EXISTS budget;
ALTER DATABASE postgres SET search_path TO budget, extensions, public;
