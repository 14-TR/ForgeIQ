import pandas as pd
import sqlite3

def load_csv_to_sqlite(csv_path='sample.csv', db_name=':memory:'):
    """Loads data from a CSV file into an in-memory SQLite database table.

    Args:
        csv_path (str): The path to the CSV file.
        db_name (str): The name of the SQLite database (defaults to in-memory).

    Returns:
        sqlite3.Connection: A connection object to the SQLite database.
    """
    # Read the CSV file into a pandas DataFrame
    df = pd.read_csv(csv_path)
    
    # Connect to the SQLite database (creates it if it doesn't exist)
    conn = sqlite3.connect(db_name)
    
    # Write the DataFrame to a SQL table named 'transactions'
    # if_exists='replace': drops the table first if it exists
    # index=False: doesn't write the DataFrame index as a column
    df.to_sql('transactions', conn, if_exists='replace', index=False)
    
    return conn 