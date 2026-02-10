-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add attachment reference to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_id UUID REFERENCES attachments(id);

-- Add attachment reference to direct_messages
ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS attachment_id UUID REFERENCES attachments(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_attachments_uploader ON attachments(uploader_id);
CREATE INDEX IF NOT EXISTS idx_messages_attachment ON messages(attachment_id);
CREATE INDEX IF NOT EXISTS idx_dm_attachment ON direct_messages(attachment_id);
