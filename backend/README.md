# Backend (FastAPI) - Multi-Tenant RAG API

A FastAPI service that powers the SaaS chatbot. It ingests documents, creates embeddings, retrieves relevant context from Supabase/pgvector, and answers questions using an LLM (Google Gemini by default, with OpenAI/Anthropic/Groq support).

**What it does**
- Accepts document uploads, chunks text, and stores embeddings in Supabase.
- Serves chat endpoints (standard + streaming SSE) with retrieval-augmented generation (RAG).
- Stores per-company model settings + system prompts.
- Tracks token usage and exposes basic analytics.

## Components
- `backend/api/main.py`: FastAPI app, routes, CORS, rate limiting, file upload, chat, analytics.
- `backend/api/usage.py`: Supabase client + token tracking + settings/system prompt helpers.
- `backend/loaders/loaders.py`: File loaders and text chunking logic.
- `backend/rag/rag_logic.py`: RAG chain, retriever, supported models, LLM builders.

## Environment Variables
Create `backend/.env` (or use `.env.example`).

Required:
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for backend access.
- `GEMINI_API_KEY`: Used for embeddings and default LLM.

Optional (only needed if you pick those providers):
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GROQ_API_KEY`

Optional (for running migrations locally):
- `DATABASE_URL`: Postgres connection string for Supabase.

## Running the API
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

## Database Tables
Defined in `database/schema.sql`, `database/phase1_migration.sql`, and `database/company_settings_migration.sql`.

Core tables:
- `companies`: tenant records.
- `documents`: uploaded document metadata.
- `embeddings`: chunk content + vectors (pgvector).
- `token_usage`: per-company daily token usage.
- `chat_sessions`: conversation sessions.
- `chat_messages`: message history + sources + model used.
- `system_prompts`: per-company system prompt.
- `company_settings`: per-company provider, model, and optional API key.

## Migrations
Run the SQL files in this order (Supabase SQL Editor recommended):
1. `database/schema.sql`
2. `database/phase1_migration.sql`
3. `database/company_settings_migration.sql`

**Important**: The retriever expects a Supabase RPC function named `match_embeddings` for vector similarity search (used by `SupabaseVectorStore` and the custom retriever). If it is not present in your DB, create it following Supabase pgvector examples.

## API Endpoints
- `GET /` - Health check.
- `GET /models` - Supported model list.
- `POST /create-company` - Create a tenant.
- `GET /settings/{company_id}` - Get model settings for a company.
- `POST /settings` - Save model settings.
- `GET /settings/prompt/{company_id}` - Get system prompt.
- `POST /settings/prompt` - Save system prompt.
- `POST /sessions` - Create a chat session.
- `GET /sessions/{company_id}` - List sessions.
- `GET /sessions/{session_id}/messages` - List messages in a session.
- `POST /upload` - Upload and embed a document (multipart form).
- `DELETE /documents/{document_id}` - Delete a document and its embeddings.
- `POST /chat` - Standard chat (RAG).
- `POST /chat/stream` - Streaming chat (SSE).
- `GET /analytics/{company_id}` - Token usage + document/session counts.

## File Types Supported
- PDF (`.pdf`)
- CSV (`.csv`)
- Text (`.txt`)
- Excel (`.xlsx`, `.xls`)

## Notes
- Rate limiting is enabled via `slowapi`.
- The fallback response when no context matches is: `I could not find this information in the knowledge base.`
- Uploads are staged in `temp_uploads/` and removed after processing.
