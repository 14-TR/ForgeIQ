import sqlparse

def validate_query(query):
    """
    Validates an SQL query to ensure it is a SELECT-only statement.
    
    Args:
        query (str): The SQL query to validate.

    Raises:
        ValueError: If the query is invalid or attempts to modify the database.

    Returns:
        bool: True if the query is valid and safe.
    """
    if not isinstance(query, str):
        raise ValueError("Query must be a valid string.")

    parsed = sqlparse.parse(query)

    if not parsed:
        raise ValueError("Invalid SQL query.")

    # Extract the first SQL token (this determines the statement type)
    first_token = parsed[0].tokens[0].value.upper()

    # Allow only SELECT queries
    if first_token != "SELECT":
        raise ValueError(f"❌ Unauthorized query: '{first_token}'. Only SELECT queries are allowed.")

    # Block dangerous SQL keywords (modifying operations)
    forbidden_keywords = {"INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE", "CREATE", "EXEC", "MERGE", "EXPLAIN", "ANALYZE"}
    
    for token in parsed[0].tokens:
        if token.value.upper() in forbidden_keywords:
            raise ValueError(f"❌ Unauthorized keyword detected: '{token.value.upper()}'. Query rejected.")

    return True  # Query is safe and valid
