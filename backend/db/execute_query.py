# Third-party imports
import pandas as pd

# Local application imports
from .db_connect import DBConnection

def execute_query(query, log_bytes=False):
    """
    Executes a SQL query and returns the result as a Pandas DataFrame.

    Args:
        query (str): The SQL query to execute.
        log_bytes (bool): If True, logs query and results as binary files.

    Returns:
        pd.DataFrame or None: A DataFrame with query results, or None for non-SELECT queries.
    """
    if not isinstance(query, str):
        raise ValueError(f"Query must be a valid string. Received: {type(query)}: {query}")

    with DBConnection() as conn:
        cursor = conn.cursor()

        try:
            if log_bytes:
                with open("query_log.bin", "wb") as file:
                    file.write(query.encode("utf-8"))

            cursor.execute(query)

            if cursor.description:
                rows = cursor.fetchall()
                columns = [desc[0] for desc in cursor.description]

                if log_bytes and rows:
                    with open("rows_log.bin", "wb") as file:
                        for row in rows:
                            file.write(str(row).encode("utf-8") + b"\n")

                return pd.DataFrame(rows, columns=columns)

            conn.commit()
            return None

        except Exception as e:
            conn.rollback()
            raise RuntimeError(f"❌ Error executing query: {e}")
