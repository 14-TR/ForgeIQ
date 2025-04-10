import dspy

# Define the database schema (consistent with nlq_to_sql.py)
# This helps ensure examples are created correctly, though it's the 
# nlq_to_sql module that passes it to the LM during prediction/compilation.
db_schema = """
Table Name: transactions
Columns:
  PLACEKEY (TEXT)
  SAFEGRAPH_BRAND_IDS (TEXT)
  BRANDS (TEXT)
  SPEND_DATE_RANGE_START (TEXT)
  SPEND_DATE_RANGE_END (TEXT)
  RAW_TOTAL_SPEND (REAL)
  RAW_NUM_TRANSACTIONS (INTEGER)
  RAW_NUM_CUSTOMERS (INTEGER)
  MEDIAN_SPEND_PER_TRANSACTION (REAL)
  MEDIAN_SPEND_PER_CUSTOMER (REAL)
  ONLINE_TRANSACTIONS (INTEGER)
  ONLINE_SPEND (REAL)
  CUSTOMER_HOME_CITY (TEXT)
"""

# Define training examples
# Each example provides a question and the expected SQL template + parameters
trainset = [
    dspy.Example(
        question="Show all data for the brand 'Wingstop'",
        sql_template="SELECT * FROM transactions WHERE BRANDS = ?",
        sql_params=['Wingstop']
    ).with_inputs("question"), # Specify only 'question' is the primary input for the module

    dspy.Example(
        question="What is the total spend for Subway?",
        sql_template="SELECT RAW_TOTAL_SPEND FROM transactions WHERE BRANDS = ?",
        sql_params=['Subway']
    ).with_inputs("question"),

    dspy.Example(
        question="List brands with more than 500 transactions.",
        sql_template="SELECT BRANDS FROM transactions WHERE RAW_NUM_TRANSACTIONS > ?",
        sql_params=['500']
    ).with_inputs("question"),
    
    dspy.Example(
        question="How many records are there for Walmart?",
        sql_template="SELECT COUNT(*) FROM transactions WHERE BRANDS LIKE ?", # Using LIKE based on previous findings
        sql_params=['%Walmart%'] 
    ).with_inputs("question"),

    dspy.Example(
        question="Show the brand and number of customers for Domino's Pizza",
        sql_template="SELECT BRANDS, RAW_NUM_CUSTOMERS FROM transactions WHERE BRANDS LIKE ?", # Using LIKE for potential variations
        sql_params=['%Domino\'s Pizza%'] # Escaped quote for Python string
    ).with_inputs("question"),
    
    dspy.Example(
        question="List all unique brands.",
        sql_template="SELECT DISTINCT BRANDS FROM transactions",
        sql_params=[] # No parameters for this query
    ).with_inputs("question"),

    dspy.Example(
        question="Which 5 brands had the highest total spend?",
        sql_template="SELECT BRANDS, RAW_TOTAL_SPEND FROM transactions ORDER BY RAW_TOTAL_SPEND DESC LIMIT ?",
        sql_params=['5']
    ).with_inputs("question"),
]

# For simplicity, we can use the same set as the dev set for BootstrapFewShot,
# although ideally, you'd have a separate, smaller dev set.
devset = trainset 