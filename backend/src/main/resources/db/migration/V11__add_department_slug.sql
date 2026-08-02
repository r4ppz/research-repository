-- Add a stable, filesystem-safe folder slug to departments.
-- Existing departments get a slug derived from their display name; new departments get a
-- derived slug (e.g. "computer_science") generated at creation time in DepartmentService.
ALTER TABLE departments ADD COLUMN slug VARCHAR(64);

UPDATE departments SET slug = department_name;

UPDATE departments
SET slug = CASE department_name
  WHEN 'Information Technology' THEN 'information_technology'
  WHEN 'Teacher Education' THEN 'teacher_education'
  WHEN 'Business Administration' THEN 'business_administration'
  WHEN 'Hospitality Management' THEN 'hospitality_management'
  WHEN 'Social Work' THEN 'social_work'
  ELSE slug
END;

ALTER TABLE departments ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX uq_departments_slug ON departments (slug);
