-- Company Settings Table: stores per-company API keys and LLM model preferences
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
    llm_provider TEXT NOT NULL DEFAULT 'google',      -- 'google', 'openai', 'anthropic', 'groq'
    llm_model TEXT NOT NULL DEFAULT 'gemini-2.0-flash-lite', -- specific model name
    api_key TEXT,                                      -- user's own API key (stored encrypted in prod)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (via backend)
CREATE POLICY "Service role manages settings" ON company_settings
    FOR ALL USING (true) WITH CHECK (true);
