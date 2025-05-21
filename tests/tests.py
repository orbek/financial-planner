from test import test_extract_transactions_with_llm

# test_test.py

def test_run_test_extract_transactions_with_llm():
    """
    Executes the test_extract_transactions_with_llm function from test.py.

    This test serves as a wrapper. If test_extract_transactions_with_llm
    completes without raising an AssertionError (i.e., all its internal assertions pass),
    this test will pass. If test_extract_transactions_with_llm raises an
    AssertionError, this test will fail, correctly propagating the original test's failure.
    """
    # Call the original test function. Any exceptions, including AssertionError,
    # will propagate and be caught by the test runner (e.g., pytest).
    test_extract_transactions_with_llm()
