import streamlit as st
import pandas as pd
from database import create_account, fetch_accounts

st.set_page_config(page_title="Accounts", page_icon="🏦")

# Auth check
if "user" not in st.session_state:
    st.warning("Please sign in first")
    st.stop()

st.title("🏦 Account Management")

# Create two columns for layout
left_col, right_col = st.columns([1, 2])

# Form for creating accounts
with left_col:
    with st.form("new_account_form"):
        st.subheader("Add New Account")
        account_name = st.text_input("Account Name")
        account_type = st.selectbox(
            "Account Type", 
            ["checking", "savings", "credit", "investment", "loan", "cash", "other"]
        )
        initial_balance = st.number_input("Initial Balance", value=0.00, step=0.01)
        currency = st.selectbox("Currency", ["USD", "BRL", "EUR", "GBP", "CAD", "JPY", "AUD"])
        
        submit = st.form_submit_button("Create Account")
        
        if submit and account_name:
            try:
                create_account(
                    user_id=st.session_state["user_id"],
                    account_name=account_name,
                    account_type=account_type,
                    initial_balance=initial_balance,
                    currency=currency
                )
                st.success("Account created successfully!")
            except Exception as e:
                st.error(f"Error creating account: {e}")

# Display existing accounts
with right_col:
    st.subheader("Your Accounts")
    
    # Add refresh button
    if st.button("Refresh Accounts"):
        st.rerun()
    
    # Fetch accounts
    try:
        accounts = fetch_accounts(st.session_state["user_id"])
        if not accounts.empty:
            # Add edit and delete functionality
            accounts_with_actions = accounts.copy()
            
            # Format the balance with currency
            accounts_with_actions["display_balance"] = accounts_with_actions.apply(
                lambda row: f"{row['currency']} {row['balance']:,.2f}", axis=1
            )
            
            # Display accounts in a clean table
            st.dataframe(
                accounts_with_actions[["name", "type", "display_balance", "created_at"]],
                column_config={
                    "name": "Account Name",
                    "type": "Type",
                    "display_balance": "Balance",
                    "created_at": st.column_config.DatetimeColumn("Created On", format="MMM DD, YYYY")
                },
                use_container_width=True
            )
            
            # Account editing section
            st.subheader("Edit Account")
            account_to_edit = st.selectbox(
                "Select account to edit",
                accounts["name"].tolist(),
                index=None
            )
            
            if account_to_edit:
                account_data = accounts[accounts["name"] == account_to_edit].iloc[0]
                
                # This would be expanded with full edit capabilities
                st.info(f"Editing functionality would go here for account: {account_data['name']}")
                
        else:
            st.info("No accounts found. Create your first account to get started!")
    except Exception as e:
        st.error(f"Error loading accounts: {e}")

# Display donut chart of account balances
if "accounts" in locals() and not accounts.empty:
    st.subheader("Account Balance Distribution")
    
    # Calculate total assets vs. liabilities
    assets = accounts[accounts["balance"] > 0]["balance"].sum()
    liabilities = abs(accounts[accounts["balance"] < 0]["balance"].sum())
    
    import altair as alt
    
    # Create pie chart data
    chart_data = pd.DataFrame({
        'Category': ['Assets', 'Liabilities'],
        'Amount': [assets, liabilities]
    })
    
    st.altair_chart(
        alt.Chart(chart_data).mark_arc().encode(
            theta=alt.Theta(field="Amount", type="quantitative"),
            color=alt.Color(field="Category", type="nominal", scale=alt.Scale(range=['#1f77b4', '#d62728'])),
            tooltip=['Category', 'Amount']
        ).properties(width=350, height=350),
        use_container_width=False
    )