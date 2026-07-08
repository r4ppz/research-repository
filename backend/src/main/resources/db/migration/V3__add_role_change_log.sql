CREATE TABLE role_change_log (
    log_id SERIAL PRIMARY KEY,
    target_user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    changed_by_user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    old_role VARCHAR(50) NOT NULL,
    new_role VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT now()
);