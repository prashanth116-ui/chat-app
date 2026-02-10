-- Create read receipts table for DMs
CREATE TABLE IF NOT EXISTS conversation_reads (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    last_read_message_id UUID REFERENCES direct_messages(id) ON DELETE SET NULL,
    read_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_conversation_reads_user ON conversation_reads(user_id);
