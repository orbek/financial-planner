import os
from supabase import create_client
from dotenv import load_dotenv
import pandas as pd

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def insert_transaction(user_id, date, amount, t_type, desc):
    data = {
        "user_id": user_id,
        "date": date,
        "amount": amount,
        "type": t_type,
        "description": desc
    }
    supabase.table("transactions").insert(data).execute()

def fetch_transactions(user_id):
    try:
        response = supabase.table("transactions").select("*").eq("user_id", user_id).execute()
        data = response.data
        
        # Convert to DataFrame and clean types
        if data:
            df = pd.DataFrame(data)
            
            # Ensure proper column types
            if 'amount' in df.columns:
                df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
            
            if 'date' in df.columns:
                df['date'] = pd.to_datetime(df['date'], errors='coerce').dt.date
                
            # Ensure string columns are actually strings (not None/NaN)
            for col in ['type', 'description']:
                if col in df.columns:
                    df[col] = df[col].fillna('').astype(str)
                    
            return df
        return pd.DataFrame()
    except Exception as e:
        print(f"Error fetching transactions: {e}")
        return pd.DataFrame()