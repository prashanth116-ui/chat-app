-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(3) UNIQUE NOT NULL,
    flag_emoji VARCHAR(10)
);

-- Create states/regions table
CREATE TABLE IF NOT EXISTS states (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_states_country ON states(country_id);

-- Add foreign key constraints to users table
ALTER TABLE users
    ADD CONSTRAINT fk_users_country FOREIGN KEY (country_id) REFERENCES countries(id),
    ADD CONSTRAINT fk_users_state FOREIGN KEY (state_id) REFERENCES states(id);
