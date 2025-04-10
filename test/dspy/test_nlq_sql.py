# Imports from the same directory
from database import load_csv_to_sqlite
from query_runner import run_query
from nlq_to_sql import NLQtoSQL
import dspy
import os
import sqlite3
import sys # Import sys to modify path
import json # Make sure json is imported here too
import time # Import time here as well

# Add project root to Python path to find the 'shared' directory
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, project_root)

# Import AWS Secret Manager and Config from the shared directory relative to project root
from shared.secrets.aws_secret_mgt import AWSSecretManager
from shared.config.aws_config import AWSConfig

# --- Configure DSPy settings ---
openai_api_key = None
secret_manager = None
try:
    secret_manager = AWSSecretManager()
    openai_api_key = secret_manager.get_openai_api_key()
    print("Attempting to retrieve OpenAI API key via AWS Secrets Manager.")
except ImportError as e:
    print(f"Error importing AWS modules: {e}")
    print("Please ensure 'shared' directory is in the Python path and boto3 is installed.")
    exit(1)
except Exception as e:
    print(f"Error initializing AWSSecretManager or getting secret: {e}")
    print("Ensure AWS credentials are configured correctly.")
    exit(1)

if not openai_api_key:
    print("Error: OpenAI API key not found via AWS Secrets Manager.")
    print("Exiting. Cannot proceed without a valid API key for DSPy configuration.")
    exit(1)
else:
    try:
        print("OpenAI API key found via AWS Secrets Manager. Configuring DSPy using dspy.LM.")
        # Configure DSPy using the dspy.LM approach
        # Note: Using model identifier directly, API key passed here.
        # The specific identifier format ('openai/model-name') might depend on the dspy version 
        # and underlying LLM provider abstraction.
        # Let's try with the model name directly first, as older OpenAI class did.
        # If this fails, we might need 'openai/gpt-3.5-turbo'
        llm = dspy.LM(
            model='gpt-4o', 
            api_key=openai_api_key, 
            max_tokens=150,
            temperature=0.5
            )
        dspy.configure(lm=llm)
        print("Successfully configured DSPy with OpenAI.")
    except AttributeError as ae:
         print(f"DSPy Configuration Error: {ae}")
         print("This often means an issue with your dspy-ai installation or version, or the LM configuration method.")
         print("Please ensure dspy-ai is up to date: pip install --upgrade dspy-ai")
         print("Exiting.")
         exit(1)
    except Exception as e:
        print(f"Could not configure DSPy using dspy.LM: {e}")
        print("Check the model identifier and API key validity.")
        print("Exiting.")
        exit(1)

# Define the path to the CSV file relative to the project root
csv_file_path = os.path.join(project_root, 'sample.csv')

# Check if the CSV file exists
if not os.path.exists(csv_file_path):
    print(f"Error: {csv_file_path} not found.")
    print("Please make sure the sample.csv file is in the project root directory.")
    exit(1) # Exit if the required CSV is not found

# Initialize conn outside the loop
conn = None 
try:
    conn = load_csv_to_sqlite(csv_file_path)
    print(f"Successfully loaded {csv_file_path} into SQLite table 'transactions'.")
except Exception as e:
    print(f"Error loading CSV into SQLite: {e}")
    exit(1)

# --- Instantiate and Load the Optimized NLQ Module --- 
optimized_module_path = "test/dspy/optimized_nlq_module.json"

nlq_sql_translator = NLQtoSQL() # Instantiate the base module class

if os.path.exists(optimized_module_path):
    print(f"Loading optimized module from {optimized_module_path}...")
    try:
        nlq_sql_translator.load(optimized_module_path)
        print("Optimized module loaded successfully.")
    except Exception as e:
        print(f"Warning: Failed to load optimized module from {optimized_module_path}. Error: {e}")
        print("Falling back to the unoptimized module.")
else:
    print("Optimized module not found. Using unoptimized module.")
    print("Run optimize_nlq.py to create the optimized module.")

# --- List of Queries to Run Sequentially --- 
queries_to_run = [
    "Show all data for the brand 'Wingstop'",
    "What is the total spend for Subway?",
    "List brands with more than 500 transactions.",
    "How many records are there for Walmart?",
    "Show the brand and number of customers for Domino's Pizza", # Will test LIKE
    "List all unique brands.",
    "Which 5 brands had the highest total spend?",
    "What is the average total spend per brand?",
    "List the top 3 brands by median spend per customer.",
    "Show brands with total spend between $1000 and $5000.",
    "Which named brand had the lowest total spend?",
    "Show data for brands containing the word 'Pizza'.",
]

print("\n--- Running Predefined Queries Sequentially ---")

# --- Sequential Query Loop --- 
for natural_language_question in queries_to_run:
    print(f"\n==================================================")
    print(f"Processing question: '{natural_language_question}'")
    print(f"==================================================")

    # Time NLQ Translation
    start_translate_time = time.perf_counter()
    sql_template = None 
    sql_params = []
    try:
        predicted_result = nlq_sql_translator(natural_language_question)
        sql_template = predicted_result.sql_template 
        sql_params = predicted_result.sql_params
    except Exception as e:
        print(f"Error during NLQ-to-SQL translation: {e}")
    end_translate_time = time.perf_counter()
    translate_duration = end_translate_time - start_translate_time
    print(f"NLQ Translation Time: {translate_duration:.4f} seconds")

    if sql_template:
        print(f"Generated SQL Template: {sql_template}")
        print(f"Generated SQL Params: {sql_params}")
    
        # Execute Query and Time It
        try:
            query_results, column_names, query_duration = run_query(conn, sql_template, sql_params)
            print(f"SQL Execution Time: {query_duration:.4f} seconds") 
            print(f"Query Results ({len(query_results)} rows):")
            
            if query_results:
                for i, row in enumerate(query_results):
                    print(f"\n--- Row {i+1} ---")
                    for col_name, value in zip(column_names, row):
                        print(f"  {col_name}: {value}") 
            else:
                print("(No results found)")
        except sqlite3.Error as sql_e:
            print(f"Error executing SQL query: {sql_e}")
        except Exception as e:
            print(f"An unexpected error occurred while processing query results: {e}")
    else:
        print("Skipping query execution because SQL generation failed or was skipped.")

# --- End of Sequential Loop --- 

print("\n==================================================")
print("--- Finished processing all queries ---           ")
print("==================================================")

# --- Interactive Loop (Commented Out) --- 
# print("\nEnter your natural language question about the data.")
# print("Type 'quit' or 'exit' to stop.")
# while True:
#     try:
#         # Get user input
#         natural_language_question = input("\nQuestion: ")
# 
#         # Check for exit condition
#         if natural_language_question.lower() in ['quit', 'exit']:
#             break
# 
#         if not natural_language_question:
#             continue
# 
#         print(f"\nProcessing question: '{natural_language_question}'")
# 
#         # --- Time NLQ Translation --- 
#         start_translate_time = time.perf_counter()
#         sql_template = None 
#         sql_params = []
#         try:
#             predicted_result = nlq_sql_translator(natural_language_question)
#             sql_template = predicted_result.sql_template 
#             sql_params = predicted_result.sql_params
#         except Exception as e:
#             print(f"Error during NLQ-to-SQL translation: {e}")
#         end_translate_time = time.perf_counter()
#         translate_duration = end_translate_time - start_translate_time
#         print(f"NLQ Translation Time: {translate_duration:.4f} seconds")
#         # --- End Time NLQ Translation ---
# 
#         if sql_template:
#             print(f"Generated SQL Template: {sql_template}")
#             print(f"Generated SQL Params: {sql_params}")
#         
#             # --- Execute Query and Time It --- 
#             try:
#                 # Get results, columns, and execution duration
#                 query_results, column_names, query_duration = run_query(conn, sql_template, sql_params)
#                 print(f"SQL Execution Time: {query_duration:.4f} seconds") # Display query time
#                 print(f"Query Results ({len(query_results)} rows):")
#                 
#                 if query_results:
#                     for i, row in enumerate(query_results):
#                         print(f"\n--- Row {i+1} ---")
#                         for col_name, value in zip(column_names, row):
#                             print(f"  {col_name}: {value}") 
#                 else:
#                     print("(No results found)")
#             except sqlite3.Error as sql_e:
#                 print(f"Error executing SQL query: {sql_e}")
#             except Exception as e:
#                 print(f"An unexpected error occurred while processing query results: {e}")
#         else:
#             print("Skipping query execution because SQL generation failed or was skipped.")
# 
#     # Handle loop exit conditions gracefully
#     except EOFError:
#         break
#     except KeyboardInterrupt:
#         print("\nExiting due to KeyboardInterrupt.")
#         break

# --- End of Interactive Loop --- 

# Close the database connection when done
if conn:
    conn.close()
    print("\nDatabase connection closed.") 