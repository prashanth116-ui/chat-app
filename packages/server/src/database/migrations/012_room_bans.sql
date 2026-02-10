-- Create room bans table
CREATE TABLE IF NOT EXISTS room_bans (
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    banned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (room_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_room_bans_user ON room_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_room_bans_expires ON room_bans(expires_at);
