import streamlit as st
import pandas as pd
import altair as alt
from database import fetch_transactions, fetch_accounts
import datetime

st.set_page_config(page_title="Dashboard", page_icon="📊", layout="wide")

# Auth check
if "user" not in st.session_state:
    st.warning("Please sign in first")
    st.stop()

st.title("📊 Financial Dashboard")

# Fetch data
try:
    accounts_df = fetch_accounts(st.session_state["user_id"])
    transactions_df = fetch_transactions(st.session_state["user_id"])
    
    if transactions_df.empty:
        st.info("No transaction data available. Add transactions to see your dashboard.")
        st.stop()
        
    # Add account names to transactions
    if not accounts_df.empty:
        account_map = accounts_df[["id", "name"]].set_index("id")["name"].to_dict()
        transactions_df["account_name"] = transactions_df["account_id"].map(account_map)
    
    # Dashboard filters
    st.sidebar.header("Dashboard Filters")
    
    # Date range filter
    today = datetime.datetime.now().date()
    thirty_days_ago = today - datetime.timedelta(days=30)
    
    date_options = ["Last 30 days", "Last 3 months", "Last 6 months", "Year to date", "All time", "Custom range"]
    date_filter = st.sidebar.selectbox("Time Period", date_options)
    
    if date_filter == "Custom range":
        start_date = st.sidebar.date_input("Start Date", thirty_days_ago)
        end_date = st.sidebar.date_input("End Date", today)
    else:
        if date_filter == "Last 30 days":
            start_date = today - datetime.timedelta(days=30)
        elif date_filter == "Last 3 months":
            start_date = today - datetime.timedelta(days=90)
        elif date_filter == "Last 6 months":
            start_date = today - datetime.timedelta(days=180)
        elif date_filter == "Year to date":
            start_date = datetime.date(today.year, 1, 1)
        else:  # All time
            start_date = transactions_df["date"].min()
        end_date = today
    
    # Ensure consistent date types
    transactions_df["date"] = pd.to_datetime(transactions_df["date"])
    start_date = pd.Timestamp(start_date)
    end_date = pd.Timestamp(end_date)

    # Apply date filter (using timestamps for both sides)
    filtered_df = transactions_df[(transactions_df["date"] >= start_date) & 
                                 (transactions_df["date"] <= end_date)]
    
    # Account filter
    if not accounts_df.empty:
        account_filter = st.sidebar.multiselect(
            "Accounts",
            options=["All Accounts"] + accounts_df["name"].tolist(),
            default="All Accounts"
        )
        
        if "All Accounts" not in account_filter and account_filter:
            account_ids = accounts_df[accounts_df["name"].isin(account_filter)]["id"].tolist()
            filtered_df = filtered_df[filtered_df["account_id"].isin(account_ids)]
    
    # Calculate summary metrics
    total_income = filtered_df[filtered_df["amount"] > 0]["amount"].sum()
    total_expense = abs(filtered_df[filtered_df["amount"] < 0]["amount"].sum())
    net_flow = total_income - total_expense
    
    # Display summary metrics
    st.subheader("Financial Summary")
    col1, col2, col3 = st.columns(3)
    col1.metric("Total Income", f"${total_income:,.2f}", delta=None)
    col2.metric("Total Expenses", f"${total_expense:,.2f}", delta=None)
    col3.metric("Net Cash Flow", f"${net_flow:,.2f}", 
                delta=f"{net_flow/total_income*100:.1f}%" if total_income > 0 else None)
    
    # Income vs Expenses chart
    st.subheader("Income vs Expenses")
    
    # Group by month and calculate income/expenses
    monthly_data = filtered_df.copy()
    monthly_data["month"] = monthly_data["date"].dt.to_period("M").astype(str)
    
    monthly_summary = monthly_data.groupby("month").apply(
        lambda x: pd.Series({
            "Income": x[x["amount"] > 0]["amount"].sum(),
            "Expenses": abs(x[x["amount"] < 0]["amount"].sum())
        })
    ).reset_index()
    
    # Reshape data for chart
    chart_data = pd.melt(
        monthly_summary, 
        id_vars=["month"], 
        value_vars=["Income", "Expenses"],
        var_name="Type", 
        value_name="Amount"
    )
    
    # Create chart
    bar_chart = alt.Chart(chart_data).mark_bar().encode(
        x=alt.X("month:N", title="Month"),
        y=alt.Y("Amount:Q", title="Amount ($)"),
        color=alt.Color("Type:N", scale=alt.Scale(domain=["Income", "Expenses"], 
                                               range=["#1f77b4", "#d62728"])),
        tooltip=["month", "Type", alt.Tooltip("Amount:Q", format="$,.2f")]
    ).properties(height=300)
    
    st.altair_chart(bar_chart, use_container_width=True)
    
    # Expense breakdown by category
    st.subheader("Expense Breakdown by Category")
    
    # Filter for expenses only and group by type/category
    expenses_df = filtered_df[filtered_df["amount"] < 0].copy()
    expenses_by_category = expenses_df.groupby("type")["amount"].sum().abs().reset_index()
    expenses_by_category = expenses_by_category.sort_values("amount", ascending=False)
    
    # Create donut chart for categories
    if not expenses_by_category.empty:
        pie_chart = alt.Chart(expenses_by_category).mark_arc().encode(
            theta=alt.Theta(field="amount", type="quantitative"),
            color=alt.Color(field="type", type="nominal"),
            tooltip=[
                alt.Tooltip("type:N", title="Category"),
                alt.Tooltip("amount:Q", title="Amount", format="$,.2f"),
                alt.Tooltip("amount:Q", title="Percentage", format=".1%", 
                           aggregate="sum", op="mean")
            ]
        ).properties(height=300)
        
        st.altair_chart(pie_chart, use_container_width=True)
        
    # Account balances
    if not accounts_df.empty:
        st.subheader("Account Balances")
        
        # Display account balances as a bar chart
        balance_chart = alt.Chart(accounts_df).mark_bar().encode(
            x=alt.X("name:N", title="Account"),
            y=alt.Y("balance:Q", title="Balance ($)"),
            color=alt.condition(
                alt.datum.balance > 0,
                alt.value("#1f77b4"),  # positive balance
                alt.value("#d62728")   # negative balance
            ),
            tooltip=[
                "name",
                alt.Tooltip("balance:Q", format="$,.2f")
            ]
        ).properties(height=300)
        
        st.altair_chart(balance_chart, use_container_width=True)
    
except Exception as e:
    st.error(f"Error generating dashboard: {e}")