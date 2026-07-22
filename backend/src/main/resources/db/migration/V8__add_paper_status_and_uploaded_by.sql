ALTER TABLE research_papers
ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN uploaded_by INT NULL REFERENCES users(user_id) ON DELETE SET NULL;

CREATE INDEX idx_papers_status ON research_papers(status);
CREATE INDEX idx_papers_uploaded_by ON research_papers(uploaded_by);
