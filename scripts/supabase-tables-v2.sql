-- Drop existing user_sessions table if it exists to apply new constraints
-- This is crucial to ensure the UNIQUE constraint is applied correctly.
DROP TABLE IF EXISTS user_sessions;

-- Create user_sessions table to track active user sessions and device access
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address TEXT NOT NULL,
    session_token TEXT NOT NULL, -- This will store the current access token for this specific session
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure only one active session per user per IP address
    UNIQUE (user_id, ip_address)
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- Create an index on session_token for faster lookups during logout
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);

-- Add new columns to the 'users' table if they don't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS sector TEXT DEFAULT 'Technology',
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Europe',
ADD COLUMN IF NOT EXISTS company_size TEXT DEFAULT '1-10 employees',
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Per Month',
ADD COLUMN IF NOT EXISTS join_date DATE DEFAULT CURRENT_DATE;

-- Update existing users to have default values for new columns if they are NULL
UPDATE users
SET
    access_count = COALESCE(access_count, 1),
    sector = COALESCE(sector, 'Technology'),
    location = COALESCE(location, 'Europe'),
    company_size = COALESCE(company_size, '1-10 employees'),
    payment_method = COALESCE(payment_method, 'Per Month'),
    join_date = COALESCE(join_date, CURRENT_DATE)
WHERE
    access_count IS NULL OR sector IS NULL OR location IS NULL OR company_size IS NULL OR payment_method IS NULL OR join_date IS NULL;
