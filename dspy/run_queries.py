# Standard library imports
import os
import sys
import json
import time 
import traceback

# Third-party imports
import dspy
import pandas as pd # To display results easily
# Add project root to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

# Local application imports
from shared.secrets.aws_secret_mgt import AWSSecretManager
# from shared.config.aws_config import AWSConfig # Not used here currently
from src.backend.db.db_connect import DBConnection # Use the existing DB connection
from nlq_to_sql import NLQtoSQL # Import from the new dspy directory

# --- Configure DSPy settings (using GPT-4o for execution) ---
print("Configuring DSPy Language Model for Execution (GPT-4o)...")
openai_api_key = None
try:
    # Consistent AWS Secret Manager instantiation and key retrieval
    secret_manager = AWSSecretManager()
    openai_api_key = secret_manager.get_openai_api_key()
    if not openai_api_key:
         raise ValueError("Retrieved OpenAI API key is empty.")
    print("OpenAI API key retrieved successfully.")
except ImportError as e:
    # Match error message from optimize_nlq.py
    print(f"Error importing AWS modules: {e}. Ensure 'shared' directory is accessible and boto3 installed.")
    exit(1)
except Exception as e:
    # Match error message from optimize_nlq.py
    print(f"Error getting OpenAI key from AWS: {e}")
    print(f"Full traceback: {traceback.format_exc()}")
    print("Ensure AWS credentials are configured correctly and the secret exists.")
    exit(1)

try:
    # Consistent LM configuration block
    print("Configuring DSPy with GPT-4o...")
    llm = dspy.LM(
        model='gpt-4o', # Keeping GPT-4o for potentially better execution performance
        api_key=openai_api_key, 
        max_tokens=300, 
        temperature=0.5
        )
    dspy.configure(lm=llm)
    print("DSPy LM configured successfully for execution.")
except AttributeError as ae:
     # Match error message from optimize_nlq.py
     print(f"DSPy Configuration Error: {ae}")
     print("Ensure dspy-ai is up to date: pip install --upgrade dspy-ai")
     exit(1)
except Exception as e:
    # Match error message from optimize_nlq.py
    print(f"Error configuring DSPy LM for execution: {e}")
    print(f"Full traceback: {traceback.format_exc()}")
    exit(1)

# --- Instantiate and Load the Optimized NLQ Module --- 
# Path relative to the project root or where the script is run
optimized_module_path = "dspy/optimized_nlq_module.json" 

nlq_sql_translator = NLQtoSQL() # Instantiate the base module class (fetches schema)

if os.path.exists(optimized_module_path):
    print(f"Loading optimized module from {optimized_module_path}...")
    try:
        nlq_sql_translator.load(optimized_module_path)
        print("Optimized module loaded successfully.")
    except Exception as e:
        print(f"Warning: Failed to load optimized module from {optimized_module_path}. Error: {e}")
        print(f"Full traceback: {traceback.format_exc()}")
        print("Falling back to the unoptimized module.")
else:
    print(f"Optimized module not found at {optimized_module_path}. Using unoptimized module.")
    print("Run 'python dspy/optimize_nlq.py' to create the optimized module.")

# ==========================================================================================
# List of questions to test the NLQ->SQL system.
# These questions are derived from the training data examples.
# ==========================================================================================
queries_to_run = [
    "List all battle events in Ukraine's Donetsk oblast between February 24, 2022 and December 31, 2022.",
    "Count explosion events in Ukraine for 2023 by month.",
    "Find high‑confidence VIIRS thermal anomalies in Ukraine within 10 km of any battle event in the last 30 days.",
    "Get the top 5 Ukrainian oblasts by number of battles in 2024.",
    # "Retrieve battle events in Ukraine occurring within 5 km of the administrative boundary of Kyiv.", # Commented out due to DB performance issue
    # "Identify hotspots of battle events in Ukraine over the past 60 days using H3 resolution 6.", # Commented out - requires h3-pg extension
    "Compare number of battles before and after March 1, 2024 in Luhansk oblast.",
    "List explosion events in Ukraine that occurred within 20 km of any high‑confidence VIIRS anomaly.",
    # --- Additional generated questions ---
    "What was the total number of fatalities from explosions in Ukraine during 2022?",
    "List 'Government regains territory' battle events in Kherson oblast.",
    "Find VIIRS anomalies detected at night within 15 km of any explosion event in Kyiv oblast in the last 90 days.",
    "Show battles in Zaporizhzhia where fatalities were between 1 and 5 in 2023.",
    "Count the number of VIIRS detections per satellite in Ukraine for the last week.",
    "Which locations in Ukraine experienced explosion events with more than 3 fatalities since the start of 2024?",
    "Show the event date and source scale for battles reported by 'Reuters' in Lviv.",
    "What are the distinct disorder types recorded in the explosions table for Poland?",
]

print(f"\\n--- Running {len(queries_to_run)} Test Queries ---")

# --- Query Loop --- 
results_summary = {}
for i, natural_language_question in enumerate(queries_to_run):
    print(f"\\n================== Query {i+1}/{len(queries_to_run)} ==================")
    print(f"Processing question: '{natural_language_question}'")
    print(f"----------------------------------------------------")

    # 1. NLQ Translation
    start_translate_time = time.perf_counter()
    sql_template = None 
    sql_params = []
    try:
        # The forward method in NLQtoSQL now handles schema fetching
        predicted_result = nlq_sql_translator(natural_language_question)
        sql_template = predicted_result.sql_template 
        sql_params = predicted_result.sql_params
        
        # Basic check for valid output
        if not sql_template or not isinstance(sql_params, list):
             print("Error: NLQ module did not return a valid template or parameters.")
             sql_template = None # Ensure skipping execution

    except Exception as e:
        print(f"Error during NLQ-to-SQL translation: {e}")
        print(f"Full traceback: {traceback.format_exc()}")
        sql_template = None # Ensure skipping execution
        
    end_translate_time = time.perf_counter()
    translate_duration = end_translate_time - start_translate_time
    print(f"NLQ Translation Time: {translate_duration:.4f} seconds")

    if sql_template:
        print(f"Generated SQL Template: {sql_template}")
        print(f"Generated SQL Params:   {sql_params}")
        print(f"----------------------------------------------------")
    
        # 2. Execute Query using DBConnection and Parameter Substitution
        start_exec_time = time.perf_counter()
        query_results_df = pd.DataFrame() # Initialize empty DataFrame
        error_message = None
        try:
            with DBConnection() as conn:
                with conn.cursor() as cursor:
                    # Use psycopg2's safe parameter substitution
                    cursor.execute(sql_template, sql_params)
                    
                    if cursor.description: # Check if it was a SELECT query
                        rows = cursor.fetchall()
                        columns = [desc[0] for desc in cursor.description]
                        query_results_df = pd.DataFrame(rows, columns=columns)
                        print(f"Query Execution Successful ({len(rows)} rows returned).")
                    else:
                        conn.commit() # Commit if it was an INSERT/UPDATE/DELETE etc.
                        print("Query Execution Successful (non-SELECT).")
                        
        except Exception as e:
            error_message = f"Error executing SQL query: {e}"
            print(error_message)
            print(f"Full traceback: {traceback.format_exc()}")
            # Ensure connection rollback if necessary (handled by DBConnection __exit__)

        end_exec_time = time.perf_counter()
        exec_duration = end_exec_time - start_exec_time
        print(f"SQL Execution Time:   {exec_duration:.4f} seconds")
        print(f"----------------------------------------------------")

        # 3. Display Results or Error
        if error_message:
            print("Query Results: Execution Failed.")
            results_summary[natural_language_question] = {"status": "Execution Error", "error": error_message}
        elif not query_results_df.empty:
            print("Query Results:")
            # Display DataFrame (adjust display options if needed)
            with pd.option_context('display.max_rows', 10, 'display.max_columns', None, 'display.width', 1000):
                 print(query_results_df)
            results_summary[natural_language_question] = {"status": "Success", "rows": len(query_results_df)}
        else:
            print("Query Results: (No rows returned or non-SELECT query)")
            results_summary[natural_language_question] = {"status": "Success", "rows": 0}
            
    else:
        print("Skipping query execution because SQL generation failed or was skipped.")
        results_summary[natural_language_question] = {"status": "Generation Failed"}

    # --- Add delay before next query --- 
    if i < len(queries_to_run) - 1: # Don't sleep after the last query
        print(f"\\nPausing for 30 seconds before next query...")
        time.sleep(30)

# --- End of Loop --- 

print("\\n================== Summary ====================")
for q, result in results_summary.items():
    status = result['status']
    details = ""
    if status == "Success":
        details = f"({result['rows']} rows)"
    elif status == "Execution Error":
         details = f"(Error: {result['error']})"
    print(f"- {q}: {status} {details}")
print("==============================================")

print("\\n--- Finished processing all queries ---")

# Reminder about dependencies
print("\\nReminder: Ensure 'requests' and 'psycopg2-binary' are installed (`pip install requests psycopg2-binary`)")
print("          and your FastAPI server is running with the '/schema' endpoint.")
print("          Update 'dspy/training_data.py' and the 'queries_to_run' list in this script for your specific schema.") 