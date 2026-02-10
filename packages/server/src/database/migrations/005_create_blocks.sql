-- Create user blocks table
CREATE TABLE IF NOT EXISTS user_blocks (
    blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id)
);

-- Create index for checking if user is blocked
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_id ON user_blocks(blocked_id);

-- Prevent self-blocking
ALTER TABLE user_blocks ADD CONSTRAINT no_self_block CHECK (blocker_id != blocked_id);
