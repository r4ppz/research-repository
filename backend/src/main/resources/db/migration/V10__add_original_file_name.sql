ALTER TABLE research_papers ADD COLUMN original_file_name VARCHAR(255);

UPDATE research_papers
SET original_file_name = split_part(file_path, '/', array_length(string_to_array(file_path, '/'), 1));
