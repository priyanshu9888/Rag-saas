# RAG SaaS Chatbot

A multi-tenant SaaS chatbot that lets companies upload documents and chat with their private knowledge base using retrieval‑augmented generation (RAG).

## What This Tool Does
- Uploads company documents and stores embeddings in Supabase (pgvector).
- Retrieves relevant context for each question.
- Answers questions with an LLM (Gemini by default, with OpenAI/Anthropic/Groq support).
- Provides a dashboard, settings page, and chat UI.

## Project Structure
- `backend/` FastAPI API service (RAG, embeddings, chat, settings).
- `frontend/` Next.js UI (auth, upload, chat, settings).
- `database/` SQL migrations and schema.

## Requirements
- Python 3.10+
- Node.js 18+
- Supabase project with pgvector enabled

## Environment Variables
Backend (`backend/.env`):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- Optional: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `DATABASE_URL`

Frontend (`frontend/.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database Tables
Created by SQL migrations in `database/`:
- `companies`
- `documents`
- `embeddings`
- `token_usage`
- `chat_sessions`
- `chat_messages`
- `system_prompts`
- `company_settings`

## Quick Start
1. Run database migrations (Supabase SQL Editor recommended):
   - `database/schema.sql`
   - `database/phase1_migration.sql`
   - `database/company_settings_migration.sql`
2. Start backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```
3. Start frontend:
```bash
cd frontend
npm install
npm run dev
```
4. Open `http://localhost:3000`.

## Notes
- The vector search uses a Supabase RPC function named `match_embeddings`. If it’s missing, create it using Supabase pgvector examples.
- Backend API is expected at `http://localhost:8000` (hard‑coded in frontend; can be moved to an env var).

## More Docs
- Backend docs: `backend/README.md`
- Frontend docs: `frontend/README.md`
