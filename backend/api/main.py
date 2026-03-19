from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import shutil
import traceback
import json
import asyncio
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional

try:
    from backend.api.usage import (track_tokens, get_supabase,
                                   get_company_settings, save_company_settings,
                                   get_system_prompt, save_system_prompt)
    from backend.loaders.loaders import process_document
    from backend.rag.rag_logic import get_vector_store, get_rag_chain, get_supported_models, NO_ANSWER_MESSAGE
except ImportError:
    from api.usage import (track_tokens, get_supabase,
                           get_company_settings, save_company_settings,
                           get_system_prompt, save_system_prompt)
    from loaders.loaders import process_document
    from rag.rag_logic import get_vector_store, get_rag_chain, get_supported_models, NO_ANSWER_MESSAGE

load_dotenv()

# ── Rate limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

app = FastAPI(title="Multi-Tenant RAG API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic models ───────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    company_id: str
    query: str
    session_id: Optional[str] = None

class CreateCompanyRequest(BaseModel):
    id: str
    name: str

class SettingsRequest(BaseModel):
    company_id: str
    llm_provider: str
    llm_model: str
    api_key: Optional[str] = None

class SystemPromptRequest(BaseModel):
    company_id: str
    prompt_text: str

class SessionRequest(BaseModel):
    company_id: str
    title: str = "New Chat"

# ── Helper: save message to DB ────────────────────────────────────────────────
def _save_message(session_id: str, role: str, content: str, sources=None, model_used=None):
    if not session_id:
        return
    try:
        get_supabase().table("chat_messages").insert({
            "session_id": session_id,
            "role": role,
            "content": content,
            "sources": sources or [],
            "model_used": model_used
        }).execute()
    except Exception as e:
        print(f"[warn] Failed to save message: {e}")

def _dedupe_sources(items):
    seen = set()
    cleaned = []
    for item in items:
        if not item:
            continue
        if item not in seen:
            seen.add(item)
            cleaned.append(item)
    return cleaned

# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "Welcome to the RAG Chatbot API"}

# ── Models ────────────────────────────────────────────────────────────────────
@app.get("/models")
async def list_models():
    return get_supported_models()

# ── Company creation ──────────────────────────────────────────────────────────
@app.post("/create-company")
async def create_company(request: CreateCompanyRequest):
    try:
        get_supabase().table("companies").insert({"id": request.id, "name": request.name}).execute()
        return {"message": f"Company '{request.name}' created", "id": request.id}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ── Settings ──────────────────────────────────────────────────────────────────
@app.get("/settings/{company_id}")
async def get_settings(company_id: str):
    settings = get_company_settings(company_id)
    return {
        "llm_provider": settings.get("llm_provider", "google"),
        "llm_model": settings.get("llm_model", "gemini-2.0-flash-lite"),
        "has_api_key": bool(settings.get("api_key")),
    }

@app.post("/settings")
async def update_settings(request: SettingsRequest):
    # If api_key is omitted, keep the existing key to avoid accidental clearing.
    api_key = request.api_key
    if api_key is None:
        existing = get_company_settings(request.company_id)
        api_key = existing.get("api_key", "")
    ok = save_company_settings(request.company_id, request.llm_provider, request.llm_model, api_key or "")
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to save settings")
    return {"message": "Settings saved"}

@app.get("/settings/prompt/{company_id}")
async def get_prompt(company_id: str):
    return {"prompt_text": get_system_prompt(company_id)}

@app.post("/settings/prompt")
async def update_prompt(request: SystemPromptRequest):
    save_system_prompt(request.company_id, request.prompt_text)
    return {"message": "System prompt saved"}

# ── Chat Sessions ─────────────────────────────────────────────────────────────
@app.post("/sessions")
async def create_session(request: SessionRequest):
    try:
        res = get_supabase().table("chat_sessions").insert({
            "company_id": request.company_id,
            "title": request.title
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sessions/{company_id}")
async def list_sessions(company_id: str):
    try:
        res = get_supabase().table("chat_sessions") \
            .select("*").eq("company_id", company_id) \
            .order("created_at", desc=True).limit(30).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sessions/{session_id}/messages")
async def get_messages(session_id: str):
    try:
        res = get_supabase().table("chat_messages") \
            .select("*").eq("session_id", session_id) \
            .order("created_at", desc=False).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Upload ────────────────────────────────────────────────────────────────────
@app.post("/upload")
@limiter.limit("10/minute")
async def upload_document(request: Request, company_id: str = Form(...), file: UploadFile = File(...)):
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        file_extension = file.filename.split(".")[-1].lower()
        chunks = process_document(file_path, file_extension)
        print(f"--- Document Processed: {len(chunks)} chunks created ---")

        supabase_client = get_supabase()
        doc_res = supabase_client.table("documents").insert({
            "company_id": company_id,
            "filename": file.filename,
            "file_type": file_extension,
            "storage_path": f"uploads/{company_id}/{file.filename}"
        }).execute()

        if not doc_res.data:
            raise Exception("Failed to create document record")

        document_id = doc_res.data[0]["id"]

        for chunk in chunks:
            chunk.metadata.update({
                "company_id": company_id,
                "document_id": document_id,
                "filename": file.filename
            })

        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        embeddings_model = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

        rows = []
        for chunk in chunks:
            embedding_vector = embeddings_model.embed_query(chunk.page_content)
            rows.append({
                "company_id": company_id,
                "document_id": document_id,
                "content": chunk.page_content,
                "metadata": chunk.metadata,
                "embedding": embedding_vector
            })

        supabase_client.table("embeddings").insert(rows).execute()
        return {"message": f"File {file.filename} processed and embedded", "document_id": document_id}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

# ── Delete Document ────────────────────────────────────────────────────────────
@app.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    try:
        supabase_client = get_supabase()
        # Embeddings delete first (FK constraint)
        supabase_client.table("embeddings").delete().eq("document_id", document_id).execute()
        supabase_client.table("documents").delete().eq("id", document_id).execute()
        return {"message": "Document and embeddings deleted"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ── Chat (standard) ────────────────────────────────────────────────────────────
@app.post("/chat")
@limiter.limit("30/minute")
async def chat(request: Request, payload: ChatRequest):
    try:
        company_id = payload.company_id
        query = payload.query
        session_id = payload.session_id

        settings = get_company_settings(company_id)
        provider = settings.get("llm_provider", "google")
        model = settings.get("llm_model", "gemini-2.0-flash-lite")
        api_key = settings.get("api_key") or None
        system_prompt = get_system_prompt(company_id)

        rag_chain = get_rag_chain(company_id, provider=provider, model=model,
                                  api_key=api_key, system_prompt=system_prompt)
        response = rag_chain.invoke({"query": query})

        answer = response["result"]
        raw_sources = []
        for doc in response["source_documents"]:
            source = doc.metadata.get("filename") or doc.metadata.get("source") or "unknown"
            raw_sources.append(os.path.basename(source))
        sources = _dedupe_sources(raw_sources)
        model_tag = f"{provider}/{model}"

        estimated_tokens = len(answer) // 4 + len(query) // 4
        track_tokens(company_id, estimated_tokens)

        normalized = answer.strip().strip('"').strip("'")
        if normalized == NO_ANSWER_MESSAGE:
            sources = []

        # Auto-create session + save messages if session_id provided
        if session_id:
            _save_message(session_id, "user", query)
            _save_message(session_id, "assistant", answer, sources=sources, model_used=model_tag)

        return {
            "answer": answer,
            "sources": sources,
            "tokens_estimated": estimated_tokens,
            "model_used": model_tag
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ── Chat Streaming (SSE) ───────────────────────────────────────────────────────
@app.post("/chat/stream")
@limiter.limit("30/minute")
async def chat_stream(request: Request, payload: ChatRequest):
    """Server-Sent Events streaming endpoint."""
    async def generate():
        try:
            company_id = payload.company_id
            query = payload.query
            session_id = payload.session_id

            settings = get_company_settings(company_id)
            provider = settings.get("llm_provider", "google")
            model_name = settings.get("llm_model", "gemini-2.0-flash-lite")
            api_key = settings.get("api_key") or None
            system_prompt = get_system_prompt(company_id)

            try:
                from backend.rag.rag_logic import build_llm, SupabaseRetriever, get_embeddings
            except ImportError:
                from rag.rag_logic import build_llm, SupabaseRetriever, get_embeddings

            supabase_client = get_supabase()
            retriever = SupabaseRetriever(
                client=supabase_client,
                embeddings=get_embeddings(),
                company_id=company_id
            )
            docs = retriever._get_relevant_documents(query)
            context = "\n\n".join([d.page_content for d in docs])
            raw_sources = []
            for d in docs:
                source = d.metadata.get("filename") or d.metadata.get("source") or "unknown"
                raw_sources.append(os.path.basename(source))
            sources = _dedupe_sources(raw_sources)

            prompt = f"""{system_prompt}

Context:
{context}

Question: {query}

Answer:"""

            llm = build_llm(provider, model_name, api_key)
            full_response = ""
            for chunk in llm.stream(prompt):
                token = chunk.content if hasattr(chunk, 'content') else str(chunk)
                full_response += token
                yield f"data: {json.dumps({'token': token})}\n\n"
                await asyncio.sleep(0)

            # Save to history
            normalized = full_response.strip().strip('"').strip("'")
            if normalized == NO_ANSWER_MESSAGE:
                sources = []

            if session_id:
                _save_message(session_id, "user", query)
                _save_message(session_id, "assistant", full_response, sources=sources, model_used=f"{provider}/{model_name}")

            yield f"data: {json.dumps({'done': True, 'sources': sources})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

# ── Analytics ──────────────────────────────────────────────────────────────────
@app.get("/analytics/{company_id}")
async def get_analytics(company_id: str):
    try:
        supabase_client = get_supabase()
        # Token usage last 30 days
        usage = supabase_client.table("token_usage").select("*") \
            .eq("company_id", company_id).order("date", desc=False).limit(30).execute()
        # Doc count
        docs = supabase_client.table("documents").select("id,filename,created_at") \
            .eq("company_id", company_id).execute()
        # Session count
        sessions = supabase_client.table("chat_sessions").select("id", count="exact") \
            .eq("company_id", company_id).execute()
        # Total messages
        msg_count = supabase_client.table("chat_messages").select("id", count="exact").execute()

        total_tokens = sum(r["tokens_used"] for r in usage.data)
        # Cost estimate: ~$0.00015 per 1k tokens (gemini flash lite price)
        cost_estimate = round(total_tokens / 1000 * 0.00015, 4)

        return {
            "token_usage_by_day": usage.data,
            "total_tokens": total_tokens,
            "cost_estimate_usd": cost_estimate,
            "document_count": len(docs.data),
            "documents": docs.data,
            "session_count": sessions.count or 0,
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
