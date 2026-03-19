import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('backend/.env')

def fix_metadata(company_id):
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    supabase = create_client(url, key)

    print(f"--- Fixing embeddings for company_id: {company_id} ---")
    
    # 1. Update the company_id column where it's null
    res = supabase.table("embeddings").update({"company_id": company_id}).is_("company_id", "null").execute()
    print(f"Updated {len(res.data) if res.data else 0} records in the 'company_id' column.")

    # 2. Update the document records as well if needed
    doc_res = supabase.table("documents").update({"company_id": company_id}).is_("company_id", "null").execute()
    print(f"Updated {len(doc_res.data) if doc_res.data else 0} records in the 'documents' table.")

if __name__ == "__main__":
    # This ID was found in your frontend logs
    TARGET_COMPANY_ID = "a367fecb-76b8-42cf-aee6-d879975ab02a"
    fix_metadata(TARGET_COMPANY_ID)
