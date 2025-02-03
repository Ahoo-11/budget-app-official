-- Initial schema migration
-- This represents the state of the database as of 2025-01-25

-- Base tables and schema are already created in the database
-- This migration is for tracking purposes only

-- Create budget schema and set search path
CREATE SCHEMA IF NOT EXISTS budget;
SET search_path TO budget, public;

SELECT 1;
