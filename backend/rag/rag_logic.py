from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_classic.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
from supabase import create_client
from langchain_core.retrievers import BaseRetriever
from langchain_core.documents import Document
from pydantic import Field
from typing import List, Any, Optional
import os

# ── Supported Models ────────────────────────────────────────────────────────
NO_ANSWER_MESSAGE = "I could not find this information in the knowledge base."

SUPPORTED_MODELS = {
    "google": [
        {"id": "gemini-2.0-flash-lite",       "name": "Gemini 2.0 Flash Lite (Fast & Free)"},
        {"id": "gemini-2.0-flash",             "name": "Gemini 2.0 Flash"},
        {"id": "gemini-2.5-flash",             "name": "Gemini 2.5 Flash (Latest)"},
        {"id": "gemini-2.5-pro",               "name": "Gemini 2.5 Pro (Most Capable)"},
        {"id": "gemini-flash-lite-latest",     "name": "Gemini Flash Lite Latest"},
    ],
    "openai": [
        {"id": "gpt-4o-mini",   "name": "GPT-4o Mini (Fast)"},
        {"id": "gpt-4o",        "name": "GPT-4o (Powerful)"},
        {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo (Budget)"},
    ],
    "anthropic": [
        {"id": "claude-3-haiku-20240307",  "name": "Claude 3 Haiku (Fast)"},
        {"id": "claude-3-sonnet-20240229", "name": "Claude 3 Sonnet"},
        {"id": "claude-3-opus-20240229",   "name": "Claude 3 Opus (Best)"},
    ],
    "groq": [
        {"id": "llama-3.1-8b-instant",      "name": "Llama 3.1 8B Instant"},
        {"id": "llama-3.3-70b-versatile",   "name": "Llama 3.3 70B Versatile"},
    ],
}

# Map deprecated Groq model IDs to current replacements to avoid hard failures.
GROQ_MODEL_ALIASES = {
    "llama3-8b-8192": "llama-3.1-8b-instant",
    "llama3-70b-8192": "llama-3.3-70b-versatile",
    "mixtral-8x7b-32768": "llama-3.3-70b-versatile",
    "gemma-7b-it": "llama-3.1-8b-instant",
}

def get_supported_models():
    return SUPPORTED_MODELS

def get_embeddings():
    return GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

def get_vector_store(company_id):
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    supabase_client = create_client(supabase_url, supabase_key)
    return SupabaseVectorStore(
        client=supabase_client,
        embedding=get_embeddings(),
        table_name="embeddings",
        query_name="match_embeddings",
    )

def build_llm(provider: str, model: str, api_key: Optional[str]):
    """Instantiate the correct LLM based on provider."""
    if provider == "google":
        key = api_key or os.getenv("GEMINI_API_KEY")
        return ChatGoogleGenerativeAI(
            model=model,
            temperature=0,
            google_api_key=key
        )
    elif provider == "openai":
        from langchain_openai import ChatOpenAI
        key = api_key or os.getenv("OPENAI_API_KEY")
        return ChatOpenAI(model=model, temperature=0, openai_api_key=key)
    elif provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        key = api_key or os.getenv("ANTHROPIC_API_KEY")
        return ChatAnthropic(model=model, temperature=0, anthropic_api_key=key)
    elif provider == "groq":
        from langchain_groq import ChatGroq
        key = api_key or os.getenv("GROQ_API_KEY")
        model_id = GROQ_MODEL_ALIASES.get(model, model)
        return ChatGroq(model=model_id, temperature=0, groq_api_key=key)
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")

class SupabaseRetriever(BaseRetriever):
    client: Any = Field(exclude=True)
    embeddings: Any = Field(exclude=True)
    company_id: str

    async def _aget_relevant_documents(self, query: str) -> List[Document]:
        return self._get_relevant_documents(query)

    def _get_relevant_documents(self, query: str) -> List[Document]:
        query_embedding = self.embeddings.embed_query(query)
        print(f"--- RAG Debug: Searching for company_id: {self.company_id} ---")
        params = {
            "query_embedding": query_embedding,
            "match_threshold": 0.1,
            "match_count": 5,
        }
        res = self.client.rpc("match_embeddings", params).execute()
        print(f"--- RAG Debug: Found {len(res.data) if res.data else 0} raw matches ---")

        docs = []
        for item in res.data:
            item_company_id = item.get("company_id")
            metadata = item.get("metadata") or {}
            metadata_company_id = metadata.get("company_id")



            if str(item_company_id) == self.company_id or str(metadata_company_id) == self.company_id:
                print(f"--- RAG Debug: Match found! Snippet: {item['content'][:100]}...")
                docs.append(Document(page_content=item["content"], metadata=metadata))

        if not docs:
            print(f"--- RAG Debug: No matches found for company_id {self.company_id} ---")
        return docs

def get_rag_chain(company_id: str, provider: str = "google", model: str = "gemini-2.0-flash-lite", api_key: Optional[str] = None, system_prompt: Optional[str] = None):
    """Build the RAG chain with a dynamically selected LLM."""
    llm = build_llm(provider, model, api_key)

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    client = create_client(supabase_url, supabase_key)

    retriever = SupabaseRetriever(
        client=client,
        embeddings=get_embeddings(),
        company_id=company_id
    )

    base_instruction = system_prompt or "You are a helpful company knowledge assistant."
    prompt_template = f"""{base_instruction}

Use the provided context to answer the question.

Context:
{{context}}

Question:
{{question}}

If the answer is not in the context say:
'{NO_ANSWER_MESSAGE}'"""

    PROMPT = PromptTemplate(template=prompt_template, input_variables=["context", "question"])

    chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        chain_type_kwargs={"prompt": PROMPT},
        return_source_documents=True
    )
    return chain
