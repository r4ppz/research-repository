ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_related_request_id_fkey;
ALTER TABLE notifications RENAME COLUMN related_request_id TO related_entity_id;
ALTER TABLE notifications ADD COLUMN related_entity_type VARCHAR(50);
UPDATE notifications SET related_entity_type = 'DOCUMENT_REQUEST' WHERE related_entity_id IS NOT NULL;
