-- Add a stable, filesystem-safe folder slug to departments.
-- Existing departments get a slug derived from their display name; new departments get a
-- derived slug (e.g. "computer_science") generated at creation time in DepartmentService.
-- The backfill below mirrors DepartmentService.generateSlug (trim, lowercase, collapse
-- non-alphanumeric runs to "_", strip leading/trailing "_") so migration and runtime logic
-- can never drift.
ALTER TABLE departments ADD COLUMN slug VARCHAR(64);

UPDATE departments
SET slug = btrim(regexp_replace(lower(trim(department_name)), '[^a-z0-9]+', '_', 'g'), '_');

ALTER TABLE departments ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX uq_departments_slug ON departments (slug);
