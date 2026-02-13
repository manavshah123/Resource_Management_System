-- Initialize RMP Database
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE rmp_db TO postgres;

-- Create schema (optional - Hibernate will handle table creation)
-- Tables will be auto-created by Spring Boot JPA with ddl-auto: update

-- You can add initial seed data here if needed
-- Example:
-- INSERT INTO skills (id, name, category, created_at, updated_at) VALUES 
--   (uuid_generate_v4(), 'Java', 'Backend', NOW(), NOW()),
--   (uuid_generate_v4(), 'React', 'Frontend', NOW(), NOW());

