import streamlit as st
import pandas as pd

def show_dashboard(data: pd.DataFrame):
    st.title("📊 Your Financial Dashboard")

    if data.empty:
        st.info("No transactions available.")
        return

    # Ensure proper casing
    data.columns = [col.lower() for col in data.columns]

    income = data[data["type"] == "Income"]["amount"].sum()
    expense = data[data["type"] == "Expense"]["amount"].sum()
    balance = income + expense

    st.metric("Total Income", f"${income:,.2f}")
    st.metric("Total Expense", f"${expense:,.2f}")
    st.metric("Current Balance", f"${balance:,.2f}")

    # Show breakdown by date
    st.subheader("Monthly Summary")
    data["date"] = pd.to_datetime(data["date"])
    monthly = data.groupby(data["date"].dt.to_period("M")).agg({
        "amount": ["sum"],
        "type": lambda x: (x == "Income").sum()
    }).rename(columns={"sum": "Total", "<lambda_0>": "Income Count"})

    st.dataframe(monthly)

    # Show table of all transactions
    st.subheader("Transaction History")
    st.dataframe(data.sort_values(by="date", ascending=False))
