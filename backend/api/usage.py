from supabase import create_client, Client
import os
from datetime import date

def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    return create_client(url, key)

def track_tokens(company_id: str, tokens_used: int):
    supabase = get_supabase()
    today = date.today().isoformat()
    try:
        res = supabase.table("token_usage").select("*").eq("company_id", company_id).eq("date", today).execute()
        if len(res.data) > 0:
            current_tokens = res.data[0]["tokens_used"]
            supabase.table("token_usage").update({"tokens_used": current_tokens + tokens_used}).eq("id", res.data[0]["id"]).execute()
        else:
            supabase.table("token_usage").insert({
                "company_id": company_id,
                "tokens_used": tokens_used,
                "date": today
            }).execute()
    except Exception as e:
        print(f"Error tracking tokens: {e}")

def get_company_settings(company_id: str) -> dict:
    """Returns saved LLM settings for a company, or sensible defaults."""
    supabase = get_supabase()
    try:
        res = supabase.table("company_settings").select("*").eq("company_id", company_id).execute()
        if res.data:
            return res.data[0]
    except Exception as e:
        print(f"Error fetching settings: {e}")
    # Fallback defaults
    return {
        "llm_provider": "google",
        "llm_model": "gemini-2.0-flash-lite",
        "api_key": os.getenv("GEMINI_API_KEY", "")
    }

def save_company_settings(company_id: str, provider: str, model: str, api_key: str) -> bool:
    """Upserts the LLM settings for a company."""
    supabase = get_supabase()
    try:
        supabase.table("company_settings").upsert({
            "company_id": company_id,
            "llm_provider": provider,
            "llm_model": model,
            "api_key": api_key
        }, on_conflict="company_id").execute()
        return True
    except Exception as e:
        print(f"Error saving settings: {e}")
        return False

def get_system_prompt(company_id: str) -> str:
    """Fetches saved system prompt for a company, or returns the default."""
    supabase = get_supabase()
    default = "You are a helpful company knowledge assistant. Answer based only on the provided context."
    try:
        res = supabase.table("system_prompts").select("prompt_text").eq("company_id", company_id).execute()
        if res.data:
            return res.data[0]["prompt_text"]
    except Exception as e:
        print(f"Error fetching system prompt: {e}")
    return default

def save_system_prompt(company_id: str, prompt_text: str) -> bool:
    """Upserts the system prompt for a company."""
    supabase = get_supabase()
    try:
        supabase.table("system_prompts").upsert({
            "company_id": company_id,
            "prompt_text": prompt_text
        }, on_conflict="company_id").execute()
        return True
    except Exception as e:
        print(f"Error saving system prompt: {e}")
        return False
