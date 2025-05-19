import streamlit as st
from auth import get_sign_in_url, acquire_token_by_auth_code, get_user_id_from_token
import uuid
import os

# Import components
from components.sidebar import render_sidebar
from components.charts import income_vs_expense_chart, display_chart

# Authentication setup
def initialize_auth():
    # Handle Microsoft OAuth redirect
    query_params = st.query_params
    if "code" in query_params:
        code = query_params["code"][0] if isinstance(query_params["code"], list) else query_params["code"]
        token_response = acquire_token_by_auth_code(code)
        user_email = token_response.get("id_token_claims", {}).get("preferred_username")
        # Get the actual user ID from token
        user_id = get_user_id_from_token(token_response)
        if user_email and user_id:
            st.session_state["user"] = user_email
            st.session_state["user_id"] = user_id
            st.rerun()

# Page configuration
st.set_page_config(
    page_title="Financial Planner",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize authentication
initialize_auth()

# Render sidebar using component
render_sidebar()

# Main content - Landing Page
if "user" not in st.session_state:
    st.title("💰 Financial Planner")
    
    st.markdown("""
    ## Take control of your financial journey
    
    Track your spending, manage your accounts, and visualize your financial progress
    all in one place.
    
    ### Key Features:
    - ✅ **Multi-account management** - Track checking, savings, credit cards and more
    - 📊 **Visual dashboard** - See where your money is going 
    - 📑 **Statement uploads** - Automatically import transactions
    - 📈 **Trend analysis** - Track your progress over time
    
    ### Get Started
    Sign in with your Microsoft account using the button in the sidebar to begin!
    """)
    
    # Feature showcase with columns
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.info("##### Account Management\nTrack all your financial accounts in one place")
    
    with col2:
        st.info("##### Transaction Tracking\nEasily categorize and monitor your spending")
    
    with col3:
        st.info("##### Financial Insights\nDiscover patterns in your spending habits")
        
else:
    st.title("💰 Financial Planner")
    st.markdown("## Welcome to your financial dashboard")
    st.info("Use the sidebar to navigate between pages")
    
    # Quick overview stats if user is logged in
    from database import fetch_transactions, fetch_accounts
    import pandas as pd
    
    try:
        accounts_df = fetch_accounts(st.session_state["user_id"])
        transactions_df = fetch_transactions(st.session_state["user_id"])
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.metric("Number of Accounts", len(accounts_df) if not accounts_df.empty else 0)
        
        with col2:
            st.metric("Total Transactions", len(transactions_df) if not transactions_df.empty else 0)
            
        if not accounts_df.empty:
            st.subheader("Your Accounts")
            st.dataframe(accounts_df[["name", "type", "balance", "currency"]], use_container_width=True)
            
        # Add a chart to the homepage using our component
        if not transactions_df.empty:
            st.subheader("Financial Overview")
            chart = income_vs_expense_chart(transactions_df)
            display_chart(chart)
            
    except Exception as e:
        st.error(f"Error loading dashboard data: {e}")