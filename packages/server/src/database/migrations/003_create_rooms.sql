-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    country_id INTEGER REFERENCES countries(id),
    state_id INTEGER REFERENCES states(id),
    created_by UUID REFERENCES users(id),
    is_private BOOLEAN DEFAULT FALSE,
    max_users INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create room membership table
CREATE TABLE IF NOT EXISTS room_members (
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (room_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rooms_country ON rooms(country_id);
CREATE INDEX IF NOT EXISTS idx_rooms_state ON rooms(state_id);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_room_members_user ON room_members(user_id);
