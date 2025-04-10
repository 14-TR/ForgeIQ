import dspy
import json

class NLQtoSQL(dspy.Module):
    """A DSPy module that translates natural language questions to a parameterized SQL query,
       aware of the 'transactions' table schema, using ChainOfThought.
    """
    def __init__(self):
        super().__init__()
        
        # Define the basic signature structure
        base_signature = "db_schema, question -> sql_template, sql_params"
        
        # Define the detailed instructions
        instructions = (
            "Given the database schema below:\n"
            "{db_schema}\n\n"
            "Write a valid SQLite query template and its parameters to answer the question: {question}\n"
            "Use '?' as placeholders for literal values.\n"
            "Ensure you only use table and column names exactly as provided in the schema.\n"
            "Output the SQL template in the 'sql_template' field.\n"
            "Output the list of parameter values (as strings) in the 'sql_params' field. Use JSON list format.\n"
            "IMPORTANT: For filtering on text columns like BRANDS where the user input might be slightly different from the database value (e.g., 'Dominos' vs 'Domino\'s Pizza'), use the LIKE operator and surround the parameter value with '%' wildcards.\n"
            "Example (Exact Match): question=\"Show brands with spend over 100\" -> sql_template=\"SELECT BRANDS FROM transactions WHERE RAW_TOTAL_SPEND > ?\", sql_params=['100']\n"
            "Example (LIKE Match): question=\"Show all data for Dominos\" -> sql_template=\"SELECT * FROM transactions WHERE BRANDS LIKE ?\", sql_params=['%Dominos%']\n"
            "Example (Exact Match): question=\"List all brands\" -> sql_template=\"SELECT DISTINCT BRANDS FROM transactions\", sql_params=[]"
            # The specific output format fields (sql_template, sql_params) are implied by the base signature
        )
        
        # Create the full signature by adding instructions to the base
        full_signature = dspy.Signature(base_signature).with_instructions(instructions)
        
        # Use ChainOfThought with the full signature object
        self.translator = dspy.ChainOfThought(full_signature)

    def forward(self, question):
        """Takes a natural language question and returns the predicted SQL template and parameters,
           providing the database schema as context.
        """
        # Define the schema string
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
        prediction = self.translator(db_schema=db_schema.strip(), question=question)
        
        # Initialize defaults
        sql_template = getattr(prediction, 'sql_template', None)
        params_list = []

        # Attempt to parse the sql_params string as JSON list
        raw_params = getattr(prediction, 'sql_params', '[]') # Default to string '[]'
        try:
            params_str = raw_params.strip()
            # Remove potential markdown code blocks
            if params_str.startswith("```json"):
                params_str = params_str[7:]
            if params_str.startswith("```"):
                 params_str = params_str[3:]
            if params_str.endswith("```"):
                params_str = params_str[:-3]
                
            params_list = json.loads(params_str.strip())
            if not isinstance(params_list, list):
                 print(f"Warning: Parsed sql_params is not a list: {params_list}")
                 params_list = [] 
        except json.JSONDecodeError as e:
            print(f"Warning: Could not parse sql_params: {raw_params}. Error: {e}")
            params_list = [] 
            
        return dspy.Prediction(sql_template=sql_template, sql_params=params_list) 