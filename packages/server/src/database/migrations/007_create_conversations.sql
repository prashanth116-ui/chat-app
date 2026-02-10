-- Create conversations table for DMs
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user1_id, user2_id)
);

-- Ensure user1_id < user2_id to prevent duplicate conversations
CREATE OR REPLACE FUNCTION normalize_conversation_users()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user1_id > NEW.user2_id THEN
        -- Swap the users
        DECLARE temp UUID;
        BEGIN
            temp := NEW.user1_id;
            NEW.user1_id := NEW.user2_id;
            NEW.user2_id := temp;
        END;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER normalize_conversation_users_trigger
BEFORE INSERT ON conversations
FOR EACH ROW EXECUTE FUNCTION normalize_conversation_users();

-- Create direct messages table
CREATE TABLE IF NOT EXISTS direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
    created_at TIMESTAMP DEFAULT NOW(),
    edited_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_dm_conversation_created ON direct_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_sender ON direct_messages(sender_id);
