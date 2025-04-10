import sqlite3
import json # Import json for potential pretty printing later
import time # Import time module

def run_query(conn: sqlite3.Connection, sql_template: str, params: list = []):
    """Executes a parameterized SQL query and measures execution time.

    Args:
        conn (sqlite3.Connection): The database connection object.
        sql_template (str): The SQL query template with placeholders (e.g., ?).
        params (list): A list of parameters to substitute into the template.

    Returns:
        tuple: A tuple containing:
            - list: A list of tuples representing the query results.
            - list: A list of column names for the results.
            - float: The execution time of the query in seconds.
    """
    # Create a cursor object to interact with the database
    cursor = conn.cursor()
    
    start_time = time.perf_counter() # Start timer
    
    # Execute the parameterized query
    cursor.execute(sql_template, params)
    
    # Fetch all the results of the query
    results = cursor.fetchall()
    
    end_time = time.perf_counter() # End timer
    duration = end_time - start_time # Calculate duration
    
    # Get column names from cursor description
    column_names = [description[0] for description in cursor.description] if cursor.description else []
    
    return results, column_names, duration # Return duration 