import dspy
import json
import os
import requests
import traceback

# Function to fetch schema from FastAPI endpoint
def get_schema_from_api(api_url: str) -> str:
    """Fetches schema from the FastAPI endpoint and formats it as a string."""
    try:
        response = requests.get(api_url, timeout=10) # Added timeout
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        schema_json = response.json()
        
        # Format the schema JSON into a descriptive string for the LLM
        schema_description = []
        for table, columns in schema_json.items():
            schema_description.append(f"Table: {table}")
            col_lines = []
            for col, dtype in columns.items():
                col_lines.append(f"  - {col} ({dtype})")
            # Use literal newline character in the join
            schema_description.append("\n".join(col_lines)) 
        
        # Use literal newline characters between table descriptions
        return "\n\n".join(schema_description)
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching schema from {api_url}: {e}")
        print(f"Full traceback: {traceback.format_exc()}")
        # Fallback or raise error - returning empty schema for now
        return "Error: Could not fetch database schema."
    except json.JSONDecodeError as e:
         print(f"Error decoding schema JSON from {api_url}: {e}")
         print(f"Response text: {response.text[:500]}...") # Log part of the response
         return "Error: Invalid schema format received."
    except Exception as e:
        print(f"An unexpected error occurred while fetching schema: {e}")
        print(f"Full traceback: {traceback.format_exc()}")
        return "Error: Could not process schema."

class NLQtoSQL(dspy.Module):
    """A DSPy module that translates natural language questions to a parameterized SQL query,
       dynamically fetching the database schema from an API endpoint and using ChainOfThought.
    """
    def __init__(self, fastapi_schema_url: str = None):
        super().__init__()
        
        # Determine FastAPI schema URL (environment variable overrides default)
        self.fastapi_schema_url = os.environ.get('FASTAPI_URL', 'http://localhost:8000').rstrip('/') + '/schema'
        if fastapi_schema_url:
            self.fastapi_schema_url = fastapi_schema_url # Allow direct override
            
        print(f"NLQtoSQL Initialized. Schema will be fetched from: {self.fastapi_schema_url}")

        # Define the basic signature structure
        base_signature = "db_schema, question -> sql_template, sql_params"
        
        # Define the detailed instructions (using triple quotes for easier multiline handling)
        instructions = f"""
You are an expert PostgreSQL query writer.
Given the database schema below:
---------------------
{{db_schema}}
---------------------

Carefully write a valid PostgreSQL query template and its parameters (as a JSON list) to answer the question: {{question}}

**Instructions:**
1.  Use '%s' as placeholders for ALL literal values in the SQL template (required for psycopg2).
2.  Ensure you ONLY use table and column names EXACTLY as provided in the schema.
3.  If a table or column name is ambiguous in the question, use the most likely one based on the schema.
4.  Output the SQL template in the 'sql_template' field.
5.  Output the list of parameter values in the 'sql_params' field. 
    - **CRITICAL:** This field MUST contain ONLY a valid JSON list of strings.
    - Example format: ["value1", "value2"] or [] if no parameters.
    - DO NOT include any other text, numbering, or explanations in the 'sql_params' field.
6.  For filtering on text columns where the user input might be slightly different (e.g., typos, abbreviations), use the ILIKE operator (case-insensitive LIKE) and surround the parameter value with '%' wildcards (e.g., parameter value should be '%Libya%').
7.  Pay attention to data types when constructing the query logic, but ensure all values in the 'sql_params' list are strings.
8. Select only the columns explicitly asked for or columns commonly associated with the entity if not specified (e.g. event_id_cnty, event_date, location for battles). Avoid using SELECT * unless the question explicitly asks for "all data" or "all columns".
9. **VIIRS Default:** When querying the `viirs_data` table, assume the user wants high-confidence data. Include `v.confidence ILIKE %s` in the WHERE clause with `'%h%'` as the parameter, unless the question specifies a different confidence level (e.g., 'nominal', 'low').
10. **Year Filtering:** If the question asks for data within a specific year (e.g., "in 2024"), **STRICTLY** use a `BETWEEN %s AND %s` condition on the relevant date column (e.g., `event_date BETWEEN '2024-01-01' AND '2024-12-31'`). **ABSOLUTELY DO NOT** use functions like `EXTRACT(YEAR FROM ...)` or compare against a `year` column if an `event_date` column exists.
11. **Country Filter Restriction:** The data currently only contains events for Ukraine. **DO NOT ADD** a `country ILIKE %s` or similar filter unless the question explicitly asks for a different country (e.g., "battles in Poland").
12. **H3 Function Usage:** If generating SQL involving H3 hexagons, use the function signature `h3_geo_to_h3(ST_Y(geom), ST_X(geom), %s)`, using the geometry column (`geom`) and extracting Y/X coordinates. Do not use separate latitude/longitude columns as arguments.

**Examples:**
Example (Select specific columns, Exact Match on number): question="Show event ID and fatalities for battles with more than 10 fatalities" -> sql_template="SELECT event_id_cnty, fatalities FROM battles WHERE fatalities > %s", sql_params=['10']
Example (ILIKE Match on text): question="Find events in Libya" -> sql_template="SELECT event_id_cnty, event_date, location FROM battles WHERE country ILIKE %s", sql_params=['%Libya%']
# Note: Assuming a table like 'battles' exists; adapt based on actual schema.
Example (No Params): question="List all countries with explosions" -> sql_template="SELECT DISTINCT country FROM explosions", sql_params=[]
""" # End of triple-quoted string
        
        # Create the full signature by adding instructions to the base
        full_signature = dspy.Signature(base_signature).with_instructions(instructions)
        
        # Use ChainOfThought with the full signature object
        self.translator = dspy.ChainOfThought(full_signature)

    def forward(self, question):
        """Takes a natural language question, fetches the schema, and returns the 
           predicted SQL template and parameters.
        """
        # --- Fetch Schema Dynamically --- 
        print(f"Fetching schema from {self.fastapi_schema_url} for question: '{question[:50]}...'")
        db_schema = get_schema_from_api(self.fastapi_schema_url)
        
        if db_schema.startswith("Error:"):
             print(f"Schema fetch failed: {db_schema}")
             # Return an error prediction or raise an exception
             # For now, returning empty Prediction to indicate failure
             return dspy.Prediction(sql_template=None, sql_params=[])
        
        print("Schema fetched successfully.")
        # print(f"Schema received:\n{db_schema[:500]}...") # Optional: Log part of the schema

        # --- Get Prediction --- 
        prediction = self.translator(db_schema=db_schema, question=question)
        
        # --- Process Prediction --- 
        sql_template = getattr(prediction, 'sql_template', None)
        params_list = []

        # Attempt to parse the sql_params string as JSON list
        raw_params = getattr(prediction, 'sql_params', '[]') # Default to string '[]'
        try:
            params_str = raw_params.strip()
            # Remove potential markdown code blocks
            if params_str.startswith("```json"):
                # Correctly slice and strip trailing backticks/newlines
                params_str = params_str[7:].rstrip().rstrip("`") 
            elif params_str.startswith("```"):
                 # Correctly slice and strip trailing backticks/newlines
                 params_str = params_str[3:].rstrip().rstrip("`")
                
            params_list = json.loads(params_str.strip())
            if not isinstance(params_list, list):
                 print(f"Warning: Parsed sql_params is not a list: {params_list}. Defaulting to [].")
                 params_list = [] 
        except json.JSONDecodeError as e:
            print(f"Warning: Could not parse sql_params JSON: {raw_params}. Error: {e}. Defaulting to [].")
            params_list = [] 
        except Exception as e:
             print(f"Warning: Unexpected error parsing sql_params: {e}. Raw: {raw_params}. Defaulting to [].")
             params_list = []
             
        # Ensure template is a string or None
        if not isinstance(sql_template, str) and sql_template is not None:
            print(f"Warning: sql_template is not a string: {type(sql_template)}. Setting to None.")
            sql_template = None
            
        return dspy.Prediction(sql_template=sql_template, sql_params=params_list) 