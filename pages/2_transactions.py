import streamlit as st
import pandas as pd
from database import insert_transaction, fetch_transactions, fetch_accounts
import datetime

st.set_page_config(page_title="Transactions", page_icon="💸")

# Auth check
if "user" not in st.session_state:
    st.warning("Please sign in first")
    st.stop()

st.title("💸 Transaction Management")

# Create two columns for layout
left_col, right_col = st.columns([1, 2])

# Form for adding new transactions
with left_col:
    with st.form("new_transaction_form"):
        st.subheader("Add New Transaction")
        
        # Get accounts for dropdown
        accounts_df = fetch_accounts(st.session_state["user_id"])
        if not accounts_df.empty:
            account_options = accounts_df[["id", "name"]].set_index("id")["name"].to_dict()
            account_id = st.selectbox("Account", options=list(account_options.keys()), format_func=lambda x: account_options[x])
        else:
            st.warning("Please create an account first")
            account_id = None
            
        date = st.date_input("Date", value=datetime.datetime.now())
        amount = st.number_input("Amount", step=0.01)
        
        transaction_type = st.radio("Transaction Type", ["Income", "Expense"], horizontal=True)
        if transaction_type == "Expense" and amount > 0:
            amount = -amount  # Make expenses negative
            
        category = st.selectbox(
            "Category",
            ["Salary", "Food", "Transport", "Housing", "Entertainment", "Shopping", "Health", "Education", "Other"]
        )
        description = st.text_input("Description")
        
        submit = st.form_submit_button("Add Transaction")
        
        if submit and account_id and amount and description:
            try:
                insert_transaction(
                    user_id=st.session_state["user_id"],
                    account_id=account_id,
                    date=date.strftime("%Y-%m-%d"),
                    amount=amount,
                    t_type=category,
                    desc=description
                )
                st.success("Transaction added successfully!")
            except Exception as e:
                st.error(f"Error adding transaction: {e}")

# Display transactions
with right_col:
    st.subheader("Recent Transactions")
    
    # Add filter and refresh options
    col1, col2, col3 = st.columns([1, 1, 1])
    with col1:
        if not accounts_df.empty:
            filter_account = st.selectbox(
                "Filter by Account", 
                ["All Accounts"] + accounts_df["name"].tolist(),
                key="filter_account"
            )
    
    with col2:
        filter_type = st.selectbox(
            "Filter by Type",
            ["All Types", "Income", "Expense"],
            key="filter_type"
        )
    
    with col3:
        if st.button("Refresh"):
            st.rerun()
    
    # Fetch and display transactions
    try:
        transactions_df = fetch_transactions(st.session_state["user_id"])
        
        if not transactions_df.empty:
            # Apply filters
            filtered_df = transactions_df.copy()
            
            if 'filter_account' in st.session_state and filter_account != "All Accounts" and not accounts_df.empty:
                account_id = accounts_df[accounts_df["name"] == filter_account]["id"].values[0]
                filtered_df = filtered_df[filtered_df["account_id"] == account_id]
            
            if 'filter_type' in st.session_state and filter_type != "All Types":
                if filter_type == "Income":
                    filtered_df = filtered_df[filtered_df["amount"] > 0]
                elif filter_type == "Expense":
                    filtered_df = filtered_df[filtered_df["amount"] < 0]
            
            # Add account name to display
            if not accounts_df.empty:
                account_map = accounts_df[["id", "name"]].set_index("id")["name"].to_dict()
                filtered_df["account_name"] = filtered_df["account_id"].map(account_map)
            
            # Display transactions in a clean table
            st.dataframe(
                filtered_df[["date", "account_name", "description", "type", "amount"]],
                column_config={
                    "date": "Date",
                    "account_name": "Account",
                    "description": "Description",
                    "type": "Category",
                    "amount": st.column_config.NumberColumn(
                        "Amount",
                        format="$%.2f",
                        help="Negative values are expenses, positive are income"
                    )
                },
                use_container_width=True
            )
        else:
            st.info("No transactions found. Add your first transaction to get started!")
    except Exception as e:
        st.error(f"Error loading transactions: {e}")