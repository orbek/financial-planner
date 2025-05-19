import os
from supabase import create_client
from dotenv import load_dotenv
import pandas as pd

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def insert_transaction(user_id, account_id, date, amount, t_type, desc):
    data = {
        "user_id": user_id,
        "account_id": account_id,  # New field
        "date": date,
        "amount": amount,
        "type": t_type,
        "description": desc
    }
    
    # Update the account balance after transaction
    supabase.table("transactions").insert(data).execute()
    update_account_balance(account_id)

def update_account_balance(account_id):
    # Calculate new balance from transactions
    query = f"""
    UPDATE accounts 
    SET balance = (
        SELECT SUM(amount) 
        FROM transactions 
        WHERE account_id = '{account_id}'
    )
    WHERE id = '{account_id}'
    """
    supabase.rpc('execute_sql', {'query': query}).execute()

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

def create_account(user_id, account_name, account_type, initial_balance=0, currency="USD"):
    try:
        # Just create the account directly, profiles check removed
        data = {
            "user_id": str(user_id),  # Ensure it's a string
            "name": account_name,
            "type": account_type,
            "balance": initial_balance,
            "currency": currency
        }
        return supabase.table("accounts").insert(data).execute()
    except Exception as e:
        print(f"Error in create_account: {e}")
        raise e

def fetch_accounts(user_id):
    try:
        response = supabase.table("accounts").select("*").eq("user_id", user_id).execute()
        if response.data:
            df = pd.DataFrame(response.data)
            # Clean types as needed
            if 'balance' in df.columns:
                df['balance'] = pd.to_numeric(df['balance'], errors='coerce')
            return df
        return pd.DataFrame()
    except Exception as e:
        print(f"Error fetching accounts: {e}")
        return pd.DataFrame()