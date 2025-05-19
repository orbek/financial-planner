import streamlit as st
import msal
import os
from dotenv import load_dotenv

load_dotenv()

# Load values from environment variables
CLIENT_ID = os.getenv("CLIENT_ID")
TENANT_ID = os.getenv("TENANT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

if not CLIENT_ID or not TENANT_ID or not CLIENT_SECRET:
    st.error("Missing Azure AD environment variables. Please set CLIENT_ID, TENANT_ID, and CLIENT_SECRET in your environment.")
    st.stop()

AUTHORITY = "https://login.microsoftonline.com/consumers"
SCOPE = ["User.Read"]
REDIRECT_PATH = "/auth"

def build_msal_app(cache=None):
    return msal.ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET,
        token_cache=cache,
    )

def get_sign_in_url():
    app = build_msal_app()
    return app.get_authorization_request_url(
        scopes=SCOPE,
        redirect_uri=f"http://localhost:8501{REDIRECT_PATH}"
    )

def acquire_token_by_auth_code(auth_code):
    app = build_msal_app()
    result = app.acquire_token_by_authorization_code(
        auth_code,
        scopes=SCOPE,
        redirect_uri=f"http://localhost:8501{REDIRECT_PATH}"
    )
    return result

# Add this function to get the actual user ID from token
def get_user_id_from_token(token_response):
    """Extract the actual Supabase user ID from token claims"""
    # Microsoft returns the oid or sub claim which contains the actual user ID
    user_id = token_response.get("id_token_claims", {}).get("sub")
    if not user_id:
        user_id = token_response.get("id_token_claims", {}).get("oid")
    return user_id