# Frontend (Next.js) - SaaS RAG Chatbot UI

This is the web UI for the multi-tenant RAG chatbot. It handles authentication via Supabase, lets users upload documents, choose LLM settings, and chat with their company knowledge base.

## What it does
- Marketing landing page.
- Auth flows (signup/login) with Supabase.
- Knowledge base dashboard for document upload and listing.
- Chat UI with sources and streaming-ready layout.
- Settings page for model/provider selection and API keys.

## Pages
- `/` - Landing page.
- `/signup` - Create an account (creates a company ID in metadata).
- `/login` - Sign in.
- `/dashboard` - Knowledge base management + upload.
- `/chat` - Chat interface.
- `/settings` - Model/provider settings + API keys.

## Components
- `frontend/components/Navbar.js` - Top navigation.
- `frontend/components/FileUpload.js` - Uploads files to the backend `/upload` endpoint.

## Environment Variables
Create `frontend/.env.local`.

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Run the App
```bash
cd frontend
npm install
npm run dev
```

## API Base URL
The frontend currently calls the backend at `http://localhost:8000` (hard-coded in:
- `frontend/app/chat/page.js`
- `frontend/app/settings/page.js`
- `frontend/app/signup/page.js`
- `frontend/components/FileUpload.js`

If you want to deploy or run on a different host, replace those URLs or add a shared environment variable (recommended).

## Data Flow (High-Level)
- User uploads a file in `/dashboard`.
- Frontend sends the file to `POST /upload`.
- Backend chunks, embeds, and stores it in Supabase.
- In `/chat`, user queries are sent to `POST /chat`.
- Response includes `answer` + `sources` for display.

## Notes
- Supabase auth metadata must contain `company_id` for correct multi-tenant behavior.
- The UI expects the backend and Supabase to be running and configured.
