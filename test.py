import pandas as pd
from extractor import extract_transactions_with_llm

def test_extract_transactions_with_llm():
    sample_text = """
    2025-05-01 Salary 1000.00 Income
    2025-05-02 Grocery -50.00 Expense
    """
    df = extract_transactions_with_llm(sample_text)
    assert not df.empty
    assert "Date" in df.columns
    assert "Amount" in df.columns
    assert "Type" in df.columns
    assert "Description" in df.columns