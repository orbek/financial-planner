import streamlit as st
import pandas as pd
import altair as alt
from datetime import datetime, timedelta

def income_vs_expense_chart(transactions_df, period="monthly"):
    """Generate income vs expense chart"""
    if transactions_df.empty:
        return None
        
    # Ensure date column is datetime
    transactions_df = transactions_df.copy()
    if 'date' in transactions_df.columns:
        transactions_df['date'] = pd.to_datetime(transactions_df['date'])
    
    # Group by time period
    if period == "monthly":
        transactions_df['period'] = transactions_df['date'].dt.strftime('%Y-%m')
    elif period == "weekly":
        transactions_df['period'] = transactions_df['date'].dt.strftime('%Y-%U')
    elif period == "daily":
        transactions_df['period'] = transactions_df['date'].dt.strftime('%Y-%m-%d')
    
    # Calculate income and expenses per period
    summary = transactions_df.groupby('period').apply(
        lambda x: pd.Series({
            'Income': x[x['amount'] > 0]['amount'].sum(),
            'Expenses': abs(x[x['amount'] < 0]['amount'].sum())
        })
    ).reset_index()
    
    # Prepare data for chart
    chart_data = pd.melt(
        summary, 
        id_vars=['period'], 
        value_vars=['Income', 'Expenses'],
        var_name='Type', 
        value_name='Amount'
    )
    
    # Create chart
    chart = alt.Chart(chart_data).mark_bar().encode(
        x=alt.X('period:N', title='Period', sort=None),
        y=alt.Y('Amount:Q', title='Amount ($)'),
        color=alt.Color('Type:N', scale=alt.Scale(
            domain=['Income', 'Expenses'],
            range=['#1f77b4', '#d62728']
        )),
        tooltip=['period', 'Type', alt.Tooltip('Amount:Q', format='$,.2f')]
    ).properties(
        title='Income vs Expenses',
        height=300
    )
    
    return chart

def spending_by_category_chart(transactions_df):
    """Generate pie chart for spending by category"""
    if transactions_df.empty:
        return None
    
    # Filter for expenses only
    expenses = transactions_df[transactions_df['amount'] < 0].copy()
    if expenses.empty:
        return None
    
    # Group by category
    category_spending = expenses.groupby('type')['amount'].sum().abs().reset_index()
    category_spending = category_spending.sort_values('amount', ascending=False)
    
    # Create chart
    chart = alt.Chart(category_spending).mark_arc().encode(
        theta=alt.Theta(field="amount", type="quantitative"),
        color=alt.Color(field="type", type="nominal"),
        tooltip=[
            alt.Tooltip("type:N", title="Category"),
            alt.Tooltip("amount:Q", title="Amount", format="$,.2f"),
            alt.Tooltip("amount:Q", title="Percentage", format=".1%", 
                      aggregate="sum", op="mean")
        ]
    ).properties(
        title='Spending by Category',
        height=300
    )
    
    return chart

def account_balance_history(transactions_df, accounts_df):
    """Generate a line chart showing account balance over time"""
    if transactions_df.empty or accounts_df.empty:
        return None
    
    # Create account mapping
    account_map = accounts_df[['id', 'name']].set_index('id')['name'].to_dict()
    
    # Copy and prepare data
    df = transactions_df.copy()
    df['date'] = pd.to_datetime(df['date'])
    
    # Get all unique dates
    all_dates = pd.date_range(
        start=df['date'].min(), 
        end=df['date'].max()
    )
    
    # Create cumulative balances for each account
    balance_data = []
    
    for account_id in df['account_id'].unique():
        account_txns = df[df['account_id'] == account_id].sort_values('date')
        
        # Calculate cumulative sum by date
        running_balance = account_txns.groupby('date')['amount'].sum().cumsum()
        
        for date, balance in running_balance.items():
            balance_data.append({
                'Date': date,
                'Account': account_map.get(account_id, account_id),
                'Balance': balance
            })
    
    balance_df = pd.DataFrame(balance_data)
    
    if balance_df.empty:
        return None
        
    # Create the chart
    chart = alt.Chart(balance_df).mark_line().encode(
        x=alt.X('Date:T', title='Date'),
        y=alt.Y('Balance:Q', title='Balance ($)'),
        color=alt.Color('Account:N', title='Account'),
        tooltip=['Date', 'Account', alt.Tooltip('Balance:Q', format='$,.2f')]
    ).properties(
        title='Account Balance History',
        height=300
    )
    
    return chart

def display_chart(chart, use_container_width=True):
    """Display an Altair chart with proper styling"""
    if chart is None:
        st.info("Not enough data to generate chart")
        return
        
    st.altair_chart(chart, use_container_width=use_container_width)