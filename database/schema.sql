-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Embeddings Table (using pgvector)
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(3072), -- Vector size for Gemini models/gemini-embedding-001
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token Usage Table
CREATE TABLE IF NOT EXISTS token_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    tokens_used INTEGER DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Companies
CREATE POLICY "Allow public insert for signup" ON companies
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (id::text = (auth.jwt() -> 'user_metadata' ->> 'company_id'));

-- RLS Policies for Documents
CREATE POLICY "Users can view their company documents" ON documents
    FOR SELECT USING (company_id::text = (auth.jwt() -> 'user_metadata' ->> 'company_id'));

CREATE POLICY "Users can insert their company documents" ON documents
    FOR INSERT WITH CHECK (company_id::text = (auth.jwt() -> 'user_metadata' ->> 'company_id'));

-- RLS Policies for Embeddings
CREATE POLICY "Users can view their company embeddings" ON embeddings
    FOR SELECT USING (company_id::text = (auth.jwt() -> 'user_metadata' ->> 'company_id'));

CREATE POLICY "Users can insert their company embeddings" ON embeddings
    FOR INSERT WITH CHECK (company_id::text = (auth.jwt() -> 'user_metadata' ->> 'company_id'));
