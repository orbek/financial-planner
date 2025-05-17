import streamlit as st
from auth import get_sign_in_url, acquire_token_by_auth_code
from database import insert_transaction, fetch_transactions
from extractor import parse_pdf
import pandas as pd
from urllib.parse import urlparse, parse_qs
import uuid

def uuid_from_email(email: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, email))

st.set_page_config("Financial Planner", layout="wide")

# Handle Microsoft OAuth redirect
query_params = st.query_params  # Updated for Streamlit >=1.45
if "code" in query_params:
    code = query_params["code"][0] if isinstance(query_params["code"], list) else query_params["code"]
    token_response = acquire_token_by_auth_code(code)
    user_email = token_response.get("id_token_claims", {}).get("preferred_username")
    #st.write("Token response:", token_response)  # Debug: See what comes back
    if user_email:
        st.session_state["user"] = user_email
        st.rerun()  # Use st.rerun() for Streamlit >=1.45

# Login
if "user" not in st.session_state:
    sign_in_url = get_sign_in_url()
    st.markdown(f"[Sign in with Microsoft]({sign_in_url})")
    st.stop()

st.sidebar.success(f"Welcome, {st.session_state['user']}!")

# Upload PDF
uploaded_file = st.sidebar.file_uploader("Upload Bank Statement (PDF)", type=["pdf"])
if uploaded_file:
    transactions = parse_pdf(uploaded_file)
    st.write("Extracted transactions:", transactions)  # Debug: Show extracted DataFrame
    for _, row in transactions.iterrows():
        st.write("Inserting row:", row)  # Debug: Show each row being inserted
        insert_transaction(
            user_id=uuid_from_email(st.session_state["user"]),
            date=row["Date"],
            amount=row["Amount"],
            t_type=row["Type"],
            desc=row["Description"]
        )
    st.success("Transactions uploaded successfully!")

if st.sidebar.button("Insert Test Transaction"):
    insert_transaction(
        user_id=uuid_from_email(st.session_state["user"]),
        date="2025-05-17",
        amount=100.0,
        t_type="Income",
        desc="Test Salary"
    )
    st.success("Test transaction inserted!")

# Fetch and display
data = pd.DataFrame(fetch_transactions(uuid_from_email(st.session_state["user"])))
st.write("Fetched transactions from DB:", data)  # Debug: Show fetched DataFrame
if not data.empty:
    st.title("📊 Your Financial Dashboard")
    income = data[data["type"] == "Income"]["amount"].sum()
    expense = data[data["type"] == "Expense"]["amount"].sum()
    balance = income - expense

    st.metric("Total Income", f"${income:,.2f}")
    st.metric("Total Expense", f"${expense:,.2f}")
    st.metric("Current Balance", f"${balance:,.2f}")

    st.subheader("Transaction History")
    st.dataframe(data)
else:
    st.info("No transactions to display yet.")