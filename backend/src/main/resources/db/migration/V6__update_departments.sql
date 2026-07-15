-- Remove papers referencing old departments (maintain FK integrity)
DELETE FROM research_papers
WHERE department_id IN (
  SELECT department_id FROM departments
  WHERE department_name IN ('Computer Science', 'Mechanical Engineering', 'Physics', 'Chemistry', 'Business Administration')
);

-- Remove old departments
DELETE FROM departments
WHERE department_name IN ('Computer Science', 'Mechanical Engineering', 'Physics', 'Chemistry', 'Business Administration');

-- Insert new departments
INSERT INTO departments (department_name) VALUES
  ('Information Technology'),
  ('Teacher Education'),
  ('Business Administration'),
  ('Hospitality Management'),
  ('Social Work');
