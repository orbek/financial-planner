import streamlit as st
from extractor import parse_pdf
from database import insert_transaction, fetch_accounts
import pandas as pd

st.set_page_config(page_title="Upload Statements", page_icon="📄")

# Auth check
if "user" not in st.session_state:
    st.warning("Please sign in first")
    st.stop()

st.title("📄 Statement Upload")

# Get accounts for selection
try:
    accounts_df = fetch_accounts(st.session_state["user_id"])
    
    if accounts_df.empty:
        st.warning("You need to create an account first before uploading statements")
        st.stop()
        
    account_options = accounts_df[["id", "name"]].set_index("id")["name"].to_dict()
    
    # Account selection
    account_id = st.selectbox(
        "Select account for this statement",
        options=list(account_options.keys()),
        format_func=lambda x: account_options[x]
    )
    
    # File uploader
    st.subheader("Upload Bank Statement")
    uploaded_file = st.file_uploader("Upload statement (PDF)", type=["pdf"])
    
    if uploaded_file:
        with st.spinner("Extracting transactions..."):
            transactions = parse_pdf(uploaded_file)
        
        if not transactions.empty:
            st.success(f"Found {len(transactions)} transactions!")
            
            # Display extracted transactions before importing
            st.subheader("Extracted Transactions")
            st.dataframe(transactions)
            
            # Option to edit before importing
            st.info("Review the extracted transactions above. If everything looks correct, click Import.")
            
            if st.button("Import Transactions"):
                imported_count = 0
                with st.spinner("Importing transactions..."):
                    for _, row in transactions.iterrows():
                        try:
                            # Ensure proper case for the columns
                            date = row.get("Date", row.get("date"))
                            amount = float(row.get("Amount", row.get("amount")))
                            t_type = row.get("Type", row.get("type"))
                            description = row.get("Description", row.get("description"))
                            
                            insert_transaction(
                                user_id=st.session_state["user_id"],
                                account_id=account_id,
                                date=date,
                                amount=amount,
                                t_type=t_type,
                                desc=description
                            )
                            imported_count += 1
                        except Exception as e:
                            st.error(f"Error importing transaction: {e}")
                
                st.success(f"Successfully imported {imported_count} transactions!")
        else:
            st.error("Could not extract any transactions from the uploaded file.")
    
    # Manual text input option
    st.subheader("Or paste statement text")
    st.info("If PDF upload doesn't work, you can copy-paste text from your statement below.")
    
    statement_text = st.text_area("Paste statement text here", height=200)
    
    if statement_text and st.button("Extract from Text"):
        from extractor import extract_transactions_with_llm
        
        with st.spinner("Extracting transactions from text..."):
            text_transactions = extract_transactions_with_llm(statement_text)
            
        if not text_transactions.empty:
            st.success(f"Found {len(text_transactions)} transactions!")
            st.dataframe(text_transactions)
            
            if st.button("Import Text Transactions"):
                imported_count = 0
                with st.spinner("Importing transactions..."):
                    for _, row in text_transactions.iterrows():
                        try:
                            insert_transaction(
                                user_id=st.session_state["user_id"],
                                account_id=account_id,
                                date=row["Date"],
                                amount=row["Amount"],
                                t_type=row["Type"],
                                desc=row["Description"]
                            )
                            imported_count += 1
                        except Exception as e:
                            st.error(f"Error importing transaction: {e}")
                
                st.success(f"Successfully imported {imported_count} transactions!")
        else:
            st.error("Could not extract any transactions from the pasted text.")
except Exception as e:
    st.error(f"Error: {e}")